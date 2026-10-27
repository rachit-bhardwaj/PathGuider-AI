import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { HiOutlineMapPin, HiOutlineCalendarDays } from 'react-icons/hi2';
import PageShell from '../components/common/PageShell';
import { useAuth } from '../context/AuthContext';
import { getAppointments, cancelAppointment, setAppointmentStatus } from '../services/counselorService';

const badge = {
  booked: 'bg-navy-50 text-navy-600',
  completed: 'bg-success-soft text-success',
  cancelled: 'bg-danger-soft text-danger',
  'no-show': 'bg-gold-100 text-gold-600'
};

// Shared by students (/appointments) and counselors (/counselor/appointments).
export default function AppointmentsPage() {
  const { user } = useAuth();
  const isCounselor = user.role === 'counselor';
  const [scope, setScope] = useState('upcoming');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getAppointments(scope));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (a) => {
    const who = isCounselor ? 'the student' : 'your counselor';
    if (!window.confirm(`Cancel this appointment? ${who.charAt(0).toUpperCase() + who.slice(1)} will see it as cancelled and the slot reopens.`)) return;
    try {
      await cancelAppointment(a._id);
      toast.success('Appointment cancelled.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMark = async (a, status) => {
    try {
      await setAppointmentStatus(a._id, status);
      toast.success('Appointment updated.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <PageShell
      title="Appointments"
      subtitle={isCounselor ? 'Students who booked one of your in-person slots.' : 'Your in-person meetings with counselors.'}
      actions={
        !isCounselor && (
          <Link to="/counselors" className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700">
            Book new
          </Link>
        )
      }
    >
      <div className="mb-5 inline-flex rounded-xl bg-surface p-1 shadow-soft">
        {['upcoming', 'past'].map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
              scope === s ? 'bg-navy-600 text-white' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-ink-soft">Loading…</p>}

      {!loading && items.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-soft">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-600">
            <HiOutlineCalendarDays className="h-6 w-6" />
          </div>
          <p className="font-display text-lg text-ink">No {scope} appointments</p>
          <p className="mt-1 text-sm text-ink-soft">
            {isCounselor ? 'Add slots under My slots so students can book you.' : 'Choose a counselor and pick a free slot.'}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((a) => {
          const other = isCounselor ? a.student : a.counselor;
          const started = new Date(a.startAt) <= new Date();
          const canCancel = a.status === 'booked' && !started;
          const canMark = isCounselor && a.status === 'booked' && started;
          return (
            <div key={a._id} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-soft sm:flex-row sm:items-center">
              <div className="flex w-full shrink-0 flex-col items-center justify-center rounded-xl bg-navy-50 py-3 text-navy-600 sm:w-24">
                <span className="text-xs font-semibold uppercase">{format(new Date(a.startAt), 'MMM')}</span>
                <span className="font-display text-3xl font-semibold leading-none">{format(new Date(a.startAt), 'dd')}</span>
                <span className="text-xs">{format(new Date(a.startAt), 'EEE')}</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">{other?.name}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badge[a.status]}`}>{a.status}</span>
                </div>
                <p className="mt-0.5 text-sm text-ink">
                  {format(new Date(a.startAt), 'h:mm a')} – {format(new Date(a.endAt), 'h:mm a')}
                </p>
                {a.location && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft">
                    <HiOutlineMapPin className="h-4 w-4" />
                    {a.location}
                  </p>
                )}
                {isCounselor && (
                  <p className="mt-1 text-xs text-ink-soft">
                    {a.student?.email}
                    {a.student?.studentId ? ` · ID ${a.student.studentId}` : ''}
                  </p>
                )}
                {a.reason && <p className="mt-2 rounded-lg bg-paper px-3 py-2 text-sm text-ink-soft">“{a.reason}”</p>}
              </div>

              <div className="flex shrink-0 gap-2">
                {canCancel && (
                  <button onClick={() => handleCancel(a)} className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-ink-soft transition hover:bg-danger-soft hover:text-danger">
                    Cancel
                  </button>
                )}
                {canMark && (
                  <>
                    <button onClick={() => handleMark(a, 'completed')} className="rounded-xl bg-success-soft px-3 py-2 text-xs font-semibold text-success transition hover:opacity-80">
                      Completed
                    </button>
                    <button onClick={() => handleMark(a, 'no-show')} className="rounded-xl bg-gold-100 px-3 py-2 text-xs font-semibold text-gold-600 transition hover:opacity-80">
                      No-show
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
