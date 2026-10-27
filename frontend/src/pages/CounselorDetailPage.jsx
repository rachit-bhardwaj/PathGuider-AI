import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { HiOutlineArrowLeft, HiOutlineMapPin, HiOutlineCheckCircle } from 'react-icons/hi2';
import PageShell, { inputClass, primaryBtn, ghostBtn } from '../components/common/PageShell';
import { CounselorAvatar } from './CounselorsPage';
import {
  getCounselor,
  getCounselorSlots,
  bookAppointment,
  createCounselorTicket
} from '../services/counselorService';

const categories = [
  { value: 'academic', label: 'Academic' },
  { value: 'career', label: 'Career' },
  { value: 'personal', label: 'Personal' },
  { value: 'mental-health', label: 'Mental health' },
  { value: 'other', label: 'Other' }
];

export default function CounselorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [counselor, setCounselor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('book');

  // booking
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [booking, setBooking] = useState(false);

  // messaging
  const [msg, setMsg] = useState({ subject: '', category: 'other', message: '' });
  const [sending, setSending] = useState(false);

  const loadSlots = useCallback(async () => {
    const data = await getCounselorSlots(id);
    setSlots(data.slots);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCounselor(id), getCounselorSlots(id)])
      .then(([c, s]) => {
        if (cancelled) return;
        setCounselor(c);
        setSlots(s.slots);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(err.message);
        navigate('/counselors', { replace: true });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const byDay = useMemo(() => {
    const map = new Map();
    slots.forEach((s) => {
      const key = format(new Date(s.startAt), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, { label: format(new Date(s.startAt), 'EEEE, dd MMM yyyy'), items: [] });
      map.get(key).items.push(s);
    });
    return [...map.values()];
  }, [slots]);

  const confirmBooking = async () => {
    if (!selected) return;
    setBooking(true);
    try {
      await bookAppointment({ slotId: selected._id, reason });
      toast.success('Appointment booked! You can see it under Appointments.');
      setSelected(null);
      setReason('');
      await loadSlots();
    } catch (err) {
      toast.error(err.message);
      setSelected(null);
      loadSlots().catch(() => {}); // slot may have just filled up — refresh the list
    } finally {
      setBooking(false);
    }
  };

  const sendQuery = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const ticket = await createCounselorTicket({ counselorId: id, ...msg });
      toast.success('Query sent to the counselor.');
      navigate(`/tickets?ticket=${ticket._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading || !counselor) {
    return <PageShell><p className="text-sm text-ink-soft">Loading…</p></PageShell>;
  }

  const closed = !counselor.isAcceptingStudents;

  return (
    <PageShell maxWidth="max-w-5xl">
      <Link to="/counselors" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <HiOutlineArrowLeft className="h-4 w-4" /> All counselors
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile */}
        <aside className="h-fit rounded-2xl border border-border bg-surface p-6 shadow-soft">
          <div className="flex flex-col items-center text-center">
            <CounselorAvatar counselor={counselor} size="h-24 w-24" text="text-3xl" />
            <h1 className="mt-4 font-display text-xl font-semibold text-ink">{counselor.name}</h1>
            <p className="text-sm text-navy-600">{counselor.specialization}</p>
          </div>
          {counselor.bio && <p className="mt-5 text-sm leading-relaxed text-ink-soft">{counselor.bio}</p>}
          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            {counselor.qualifications && (
              <div className="flex justify-between gap-3"><dt className="text-ink-soft">Qualifications</dt><dd className="text-right font-medium text-ink">{counselor.qualifications}</dd></div>
            )}
            {counselor.experienceYears > 0 && (
              <div className="flex justify-between gap-3"><dt className="text-ink-soft">Experience</dt><dd className="font-medium text-ink">{counselor.experienceYears}+ years</dd></div>
            )}
            {counselor.languages?.length > 0 && (
              <div className="flex justify-between gap-3"><dt className="text-ink-soft">Languages</dt><dd className="text-right font-medium text-ink">{counselor.languages.join(', ')}</dd></div>
            )}
            {counselor.officeLocation && (
              <div className="flex justify-between gap-3"><dt className="text-ink-soft">Office</dt><dd className="text-right font-medium text-ink">{counselor.officeLocation}</dd></div>
            )}
          </dl>
        </aside>

        {/* Actions */}
        <div className="lg:col-span-2">
          {closed && (
            <div className="mb-4 rounded-xl bg-gold-100 px-4 py-3 text-sm font-medium text-navy-900">
              This counselor is not accepting new students or bookings right now. Please check back later or choose another counselor.
            </div>
          )}

          <div className="mb-4 inline-flex rounded-xl bg-surface p-1 shadow-soft">
            {[
              { key: 'book', label: 'Book an appointment' },
              { key: 'message', label: 'Send a message' }
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  tab === t.key ? 'bg-navy-600 text-white' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'book' && (
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
              <p className="text-sm text-ink-soft">In-person meeting. Pick any open time — slots that are already full are not shown.</p>

              {byDay.length === 0 ? (
                <div className="mt-6 rounded-xl bg-paper p-8 text-center">
                  <p className="font-medium text-ink">No open slots right now</p>
                  <p className="mt-1 text-sm text-ink-soft">You can still send a message and the counselor will reply.</p>
                  <button onClick={() => setTab('message')} className={`${primaryBtn} mt-4`}>Send a message</button>
                </div>
              ) : (
                <div className="mt-5 space-y-5">
                  {byDay.map((day) => (
                    <div key={day.label}>
                      <h3 className="mb-2 text-sm font-semibold text-ink">{day.label}</h3>
                      <div className="flex flex-wrap gap-2">
                        {day.items.map((s) => {
                          const isSel = selected?._id === s._id;
                          return (
                            <button
                              key={s._id}
                              disabled={closed}
                              onClick={() => setSelected(isSel ? null : s)}
                              className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                isSel
                                  ? 'border-navy-600 bg-navy-600 text-white'
                                  : 'border-border bg-paper text-ink hover:border-navy-600 hover:bg-navy-50'
                              }`}
                            >
                              {format(new Date(s.startAt), 'h:mm a')} – {format(new Date(s.endAt), 'h:mm a')}
                              {s.capacity > 1 && <span className="ml-1.5 text-xs opacity-80">({s.spotsLeft} left)</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selected && (
                <div className="animate-fade-in-up mt-6 rounded-xl border border-navy-600/30 bg-navy-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <HiOutlineCheckCircle className="h-5 w-5 text-navy-600" />
                    {format(new Date(selected.startAt), 'EEE, dd MMM · h:mm a')} – {format(new Date(selected.endAt), 'h:mm a')}
                  </p>
                  {(selected.location || counselor.officeLocation) && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
                      <HiOutlineMapPin className="h-4 w-4" />
                      {selected.location || counselor.officeLocation}
                    </p>
                  )}
                  {selected.notes && <p className="mt-1 text-xs text-ink-soft">{selected.notes}</p>}
                  <textarea
                    rows={2}
                    maxLength={500}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="What would you like to talk about? (optional)"
                    className={`${inputClass} mt-3 resize-none bg-surface`}
                  />
                  <div className="mt-3 flex gap-2">
                    <button onClick={confirmBooking} disabled={booking} className={primaryBtn}>
                      {booking ? 'Booking…' : 'Confirm booking'}
                    </button>
                    <button onClick={() => setSelected(null)} className={ghostBtn}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'message' && (
            <form onSubmit={sendQuery} className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-soft">
              <p className="text-sm text-ink-soft">
                Your query opens a private ticket. Once {counselor.name.split(' ')[0]} replies, you can keep chatting with them
                in <span className="font-medium text-ink">My tickets</span>.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="subject">Subject</label>
                  <input id="subject" required maxLength={150} value={msg.subject} onChange={(e) => setMsg((m) => ({ ...m, subject: e.target.value }))} placeholder="e.g. Feeling overwhelmed before exams" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="category">Topic</label>
                  <select id="category" value={msg.category} onChange={(e) => setMsg((m) => ({ ...m, category: e.target.value }))} className={inputClass}>
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="message">Your message</label>
                <textarea id="message" required rows={6} maxLength={2000} value={msg.message} onChange={(e) => setMsg((m) => ({ ...m, message: e.target.value }))} placeholder="Tell the counselor what's on your mind…" className={`${inputClass} resize-none`} />
                <p className="mt-1 text-right text-[11px] text-ink-soft">{msg.message.length}/2000</p>
              </div>
              <button type="submit" disabled={sending || closed} className={primaryBtn}>
                {sending ? 'Sending…' : 'Send query'}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}
