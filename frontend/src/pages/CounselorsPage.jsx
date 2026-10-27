import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineCalendarDays, HiOutlineChatBubbleLeftRight, HiOutlineClock, HiOutlineLanguage } from 'react-icons/hi2';
import PageShell from '../components/common/PageShell';
import { getCounselors } from '../services/counselorService';

export function CounselorAvatar({ counselor, size = 'h-16 w-16', text = 'text-xl' }) {
  if (counselor.photoUrl) {
    return <img src={counselor.photoUrl} alt={counselor.name} className={`${size} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <div
      className={`flex ${size} ${text} shrink-0 items-center justify-center rounded-full font-semibold text-white`}
      style={{ backgroundColor: counselor.avatarColor || '#3d52a0' }}
    >
      {counselor.name?.charAt(0).toUpperCase()}
    </div>
  );
}

export default function CounselorsPage() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCounselors()
      .then(setCounselors)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell
      title="Talk to a counselor"
      subtitle="Send a private message, or book a free in-person slot. Counselors who have no open slots can still be messaged."
    >
      {loading && <p className="text-sm text-ink-soft">Loading counselors…</p>}

      {!loading && counselors.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-soft">
          <p className="font-display text-lg text-ink">No counselors are available yet</p>
          <p className="mt-1 text-sm text-ink-soft">Counselors appear here once an administrator approves their registration.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {counselors.map((c) => (
          <div key={c.id} className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lifted">
            <div className="flex items-center gap-4">
              <CounselorAvatar counselor={c} />
              <div className="min-w-0">
                <h2 className="truncate font-display text-lg font-semibold text-ink">{c.name}</h2>
                <p className="text-sm text-navy-600">{c.specialization}</p>
              </div>
            </div>

            {c.bio && <p className="mt-4 line-clamp-3 text-sm text-ink-soft">{c.bio}</p>}

            <dl className="mt-4 space-y-1.5 text-xs text-ink-soft">
              {c.experienceYears > 0 && (
                <div className="flex items-center gap-2"><HiOutlineClock className="h-4 w-4" />{c.experienceYears}+ years of experience</div>
              )}
              {c.languages?.length > 0 && (
                <div className="flex items-center gap-2"><HiOutlineLanguage className="h-4 w-4" />{c.languages.join(', ')}</div>
              )}
              <div className="flex items-center gap-2">
                <HiOutlineCalendarDays className="h-4 w-4" />
                {c.availableSlots > 0 ? (
                  <span className="font-medium text-success">{c.availableSlots} open slot{c.availableSlots > 1 ? 's' : ''}</span>
                ) : (
                  <span>No open slots right now</span>
                )}
              </div>
            </dl>

            {!c.isAcceptingStudents && (
              <p className="mt-3 rounded-lg bg-gold-100 px-3 py-1.5 text-xs font-medium text-navy-900">Not accepting new students at the moment</p>
            )}

            <Link
              to={`/counselors/${c.id}`}
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
            >
              <HiOutlineChatBubbleLeftRight className="h-4 w-4" />
              View profile
            </Link>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
