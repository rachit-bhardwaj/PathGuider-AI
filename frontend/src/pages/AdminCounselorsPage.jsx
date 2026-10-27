import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import PageShell from '../components/common/PageShell';
import { adminGetCounselors, adminSetCounselorApproval } from '../services/counselorService';

export default function AdminCounselorsPage() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setCounselors(await adminGetCounselors());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (c) => {
    try {
      await adminSetCounselorApproval(c.id, !c.isApproved);
      toast.success(c.isApproved ? 'Approval revoked.' : 'Counselor approved.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pending = counselors.filter((c) => !c.isApproved);

  return (
    <PageShell
      title="Counselor registrations"
      subtitle={`${pending.length} waiting for approval · ${counselors.length - pending.length} approved. Only approved counselors are visible to students.`}
    >
      {loading && <p className="text-sm text-ink-soft">Loading…</p>}
      {!loading && counselors.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-ink-soft shadow-soft">No counselors have registered yet.</div>
      )}

      <div className="space-y-3">
        {counselors.map((c) => (
          <div key={c.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-soft sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink">{c.name}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.isApproved ? 'bg-success-soft text-success' : 'bg-gold-100 text-gold-600'}`}>
                  {c.isApproved ? 'Approved' : 'Pending'}
                </span>
                {!c.isActive && <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-medium text-danger">Deactivated</span>}
              </div>
              <p className="text-sm text-navy-600">{c.specialization}</p>
              <p className="mt-1 text-xs text-ink-soft">
                {c.email} · registered {format(new Date(c.registeredAt), 'dd MMM yyyy')}
                {c.experienceYears ? ` · ${c.experienceYears} yrs` : ''}
                {c.qualifications ? ` · ${c.qualifications}` : ''}
              </p>
              {c.bio && <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{c.bio}</p>}
            </div>
            <button
              onClick={() => toggle(c)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                c.isApproved
                  ? 'border border-border text-ink-soft hover:bg-danger-soft hover:text-danger'
                  : 'bg-navy-600 text-white hover:bg-navy-700'
              }`}
            >
              {c.isApproved ? 'Revoke' : 'Approve'}
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
