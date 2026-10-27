import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import RoleSwitch from '../components/common/RoleSwitch';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', studentId: '' });
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
      const user = await register(form);
      toast.success(`Welcome to PathGuider AI, ${user.name.split(' ')[0]}!`);
      navigate('/chat', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-transparent bg-paper px-3.5 py-2.5 text-sm outline-none transition focus:border-navy-600 focus:bg-surface focus:ring-2 focus:ring-navy-100';

  return (
    <div>
      <RoleSwitch active="student" />
      <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Get instant answers and a direct line to campus support staff.</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Jordan Rivera"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@university.edu"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="studentId" className="mb-1.5 block text-sm font-medium text-ink">
            Student ID <span className="font-normal text-ink-soft">(optional)</span>
          </label>
          <input
            id="studentId"
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
            placeholder="S00123456"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-navy-600 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-navy-700 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-navy-600 hover:text-navy-700">
          Sign in
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-ink-soft">
        Are you a counselor?{' '}
        <Link to="/counselor/register" className="font-semibold text-navy-600 hover:text-navy-700">
          Register here
        </Link>
      </p>
    </div>
  );
}
