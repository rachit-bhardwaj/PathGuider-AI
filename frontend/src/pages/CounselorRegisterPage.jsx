import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { registerCounselor } from '../services/counselorService';
import RoleSwitch from '../components/common/RoleSwitch';

export default function CounselorRegisterPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    qualifications: '',
    experienceYears: '',
    languages: '',
    officeLocation: '',
    bio: '',
    inviteCode: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const { user, token } = await registerCounselor(form);
      localStorage.setItem('ssk_token', token);
      setUser(user);
      toast.success('Registered! An admin will approve your account shortly.');
      navigate('/counselor/profile', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-transparent bg-paper px-3.5 py-2.5 text-sm outline-none transition focus:border-navy-600 focus:bg-surface focus:ring-2 focus:ring-navy-100';
  const label = 'mb-1.5 block text-sm font-medium text-ink';
  const optional = <span className="font-normal text-ink-soft"> (optional)</span>;

  return (
    <div>
      <RoleSwitch active="counselor" />
      <h1 className="font-display text-2xl font-semibold text-ink">Counselor registration</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        Join as a counselor to chat with students and offer in-person appointment slots. New accounts are reviewed by an
        administrator before they appear to students.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className={label}>Full name</label>
          <input id="name" name="name" required value={form.name} onChange={handleChange} placeholder="Dr. Asha Verma" className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@university.edu" className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className={label}>Password</label>
          <input id="password" name="password" type="password" required minLength={8} value={form.password} onChange={handleChange} placeholder="At least 8 characters" className={inputClass} />
        </div>
        <div>
          <label htmlFor="specialization" className={label}>Specialization</label>
          <input id="specialization" name="specialization" required value={form.specialization} onChange={handleChange} placeholder="e.g. Academic & Career Counselor" className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="experienceYears" className={label}>Experience (yrs){optional}</label>
            <input id="experienceYears" name="experienceYears" type="number" min="0" max="60" value={form.experienceYears} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="languages" className={label}>Languages{optional}</label>
            <input id="languages" name="languages" value={form.languages} onChange={handleChange} placeholder="English, Hindi" className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="qualifications" className={label}>Qualifications{optional}</label>
          <input id="qualifications" name="qualifications" value={form.qualifications} onChange={handleChange} placeholder="M.A. Psychology" className={inputClass} />
        </div>
        <div>
          <label htmlFor="officeLocation" className={label}>Office / meeting location{optional}</label>
          <input id="officeLocation" name="officeLocation" value={form.officeLocation} onChange={handleChange} placeholder="Counseling Centre, Room 12" className={inputClass} />
        </div>
        <div>
          <label htmlFor="bio" className={label}>Short bio{optional}</label>
          <textarea id="bio" name="bio" rows={3} maxLength={1000} value={form.bio} onChange={handleChange} placeholder="How can you help students?" className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label htmlFor="inviteCode" className={label}>Invite code{optional}</label>
          <input id="inviteCode" name="inviteCode" value={form.inviteCode} onChange={handleChange} placeholder="Only if your college gave you one" className={inputClass} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-navy-600 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-navy-700 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {submitting ? 'Registering…' : 'Register as counselor'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-navy-600 hover:text-navy-700">Sign in</Link>
        {' · '}
        <Link to="/register" className="font-semibold text-navy-600 hover:text-navy-700">I'm a student</Link>
      </p>
    </div>
  );
}
