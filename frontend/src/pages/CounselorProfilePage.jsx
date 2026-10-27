import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageShell, { inputClass, primaryBtn } from '../components/common/PageShell';
import ApprovalBanner from '../components/counselor/ApprovalBanner';
import { useAuth } from '../context/AuthContext';
import { getMyCounselorProfile, updateMyCounselorProfile } from '../services/counselorService';

export default function CounselorProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyCounselorProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          name: p.name,
          specialization: p.specialization,
          qualifications: p.qualifications || '',
          experienceYears: p.experienceYears ?? 0,
          languages: (p.languages || []).join(', '),
          officeLocation: p.officeLocation || '',
          bio: p.bio || '',
          isAcceptingStudents: p.isAcceptingStudents
        });
      })
      .catch((err) => toast.error(err.message));
  }, []);

  if (!form) return <PageShell><p className="text-sm text-ink-soft">Loading…</p></PageShell>;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const label = 'mb-1.5 block text-sm font-medium text-ink';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMyCounselorProfile(form);
      setProfile(updated);
      setUser({ ...user, name: updated.name });
      toast.success('Profile saved.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="My profile" subtitle="This is what students see when they browse counselors." maxWidth="max-w-3xl">
      <ApprovalBanner profile={profile} />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="name">Full name</label>
            <input id="name" required value={form.name} onChange={set('name')} className={inputClass} />
          </div>
          <div>
            <label className={label} htmlFor="specialization">Specialization</label>
            <input id="specialization" required value={form.specialization} onChange={set('specialization')} className={inputClass} />
          </div>
          <div>
            <label className={label} htmlFor="qualifications">Qualifications</label>
            <input id="qualifications" value={form.qualifications} onChange={set('qualifications')} className={inputClass} />
          </div>
          <div>
            <label className={label} htmlFor="experienceYears">Years of experience</label>
            <input id="experienceYears" type="number" min="0" max="60" value={form.experienceYears} onChange={set('experienceYears')} className={inputClass} />
          </div>
          <div>
            <label className={label} htmlFor="languages">Languages</label>
            <input id="languages" value={form.languages} onChange={set('languages')} placeholder="English, Hindi" className={inputClass} />
          </div>
          <div>
            <label className={label} htmlFor="officeLocation">Office location</label>
            <input id="officeLocation" value={form.officeLocation} onChange={set('officeLocation')} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="bio">Bio</label>
          <textarea id="bio" rows={4} maxLength={1000} value={form.bio} onChange={set('bio')} className={`${inputClass} resize-none`} />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-paper p-4">
          <input
            type="checkbox"
            checked={form.isAcceptingStudents}
            onChange={(e) => setForm((f) => ({ ...f, isAcceptingStudents: e.target.checked }))}
            className="mt-0.5 h-4 w-4 accent-navy-600"
          />
          <span>
            <span className="block text-sm font-medium text-ink">Accepting new students</span>
            <span className="block text-xs text-ink-soft">Turn this off to pause new messages and bookings. Existing chats and appointments continue.</span>
          </span>
        </label>

        <button type="submit" disabled={saving} className={primaryBtn}>{saving ? 'Saving…' : 'Save profile'}</button>
      </form>
    </PageShell>
  );
}
