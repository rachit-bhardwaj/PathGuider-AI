import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { HiOutlineTrash, HiOutlineMapPin, HiOutlineUser } from 'react-icons/hi2';
import PageShell, { inputClass, primaryBtn } from '../components/common/PageShell';
import ApprovalBanner from '../components/counselor/ApprovalBanner';
import { getMySlots, createSlots, deleteSlot, getMyCounselorProfile } from '../services/counselorService';

const MAX_PER_REQUEST = 60;
const toLocalDateInput = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Turns the form into concrete slot start/end times (in the counselor's local timezone).
function buildSlots({ date, from, to, length, weeks }) {
  if (!date || !from || !to) return [];
  const out = [];
  const lengthMin = Number(length);
  for (let w = 0; w < Number(weeks); w += 1) {
    const base = new Date(`${date}T00:00:00`);
    base.setDate(base.getDate() + w * 7);
    const day = toLocalDateInput(base);
    const windowStart = new Date(`${day}T${from}`);
    const windowEnd = new Date(`${day}T${to}`);
    if (Number.isNaN(windowStart.getTime()) || Number.isNaN(windowEnd.getTime()) || windowEnd <= windowStart) return [];
    if (lengthMin === 0) {
      out.push({ startAt: windowStart, endAt: windowEnd });
    } else {
      for (let t = windowStart.getTime(); t + lengthMin * 60000 <= windowEnd.getTime(); t += lengthMin * 60000) {
        out.push({ startAt: new Date(t), endAt: new Date(t + lengthMin * 60000) });
      }
    }
  }
  return out;
}

export default function CounselorSlotsPage() {
  const [profile, setProfile] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: toLocalDateInput(new Date(Date.now() + 86400000)),
    from: '11:00',
    to: '13:00',
    length: '30',
    weeks: '1',
    capacity: '1',
    location: '',
    notes: ''
  });

  const load = useCallback(async () => {
    try {
      const [s, p] = await Promise.all([getMySlots(), getMyCounselorProfile()]);
      setSlots(s);
      setProfile(p);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const preview = useMemo(() => buildSlots(form), [form]);
  const tooMany = preview.length > MAX_PER_REQUEST;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!preview.length) {
      toast.error('Check the date and times — the end time must be after the start time.');
      return;
    }
    if (tooMany) {
      toast.error(`That would create ${preview.length} slots. Please keep it to ${MAX_PER_REQUEST} or fewer.`);
      return;
    }
    setSaving(true);
    try {
      await createSlots({
        slots: preview.map((s) => ({ startAt: s.startAt.toISOString(), endAt: s.endAt.toISOString() })),
        capacity: Number(form.capacity),
        location: form.location,
        notes: form.notes
      });
      toast.success(`${preview.length} slot${preview.length > 1 ? 's' : ''} added.`);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slot) => {
    if (!window.confirm('Remove this slot?')) return;
    try {
      await deleteSlot(slot._id);
      setSlots((prev) => prev.filter((s) => s._id !== slot._id));
      toast.success('Slot removed.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const byDay = useMemo(() => {
    const map = new Map();
    slots.forEach((s) => {
      const key = format(new Date(s.startAt), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, { label: format(new Date(s.startAt), 'EEEE, dd MMM yyyy'), items: [] });
      map.get(key).items.push(s);
    });
    return [...map.values()];
  }, [slots]);

  const label = 'mb-1.5 block text-sm font-medium text-ink';
  const approved = profile?.isApproved;

  return (
    <PageShell title="My free slots" subtitle="Add the times you're free for students to visit you in person. A slot disappears from the student view once it is fully booked.">
      <ApprovalBanner profile={profile} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <form onSubmit={handleAdd} className="h-fit space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-soft lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-ink">Add availability</h2>

          <div>
            <label className={label} htmlFor="date">Date</label>
            <input id="date" type="date" required min={toLocalDateInput(new Date())} value={form.date} onChange={set('date')} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="from">From</label>
              <input id="from" type="time" required value={form.from} onChange={set('from')} className={inputClass} />
            </div>
            <div>
              <label className={label} htmlFor="to">To</label>
              <input id="to" type="time" required value={form.to} onChange={set('to')} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="length">Split into</label>
              <select id="length" value={form.length} onChange={set('length')} className={inputClass}>
                <option value="0">One single slot</option>
                <option value="15">15-min slots</option>
                <option value="30">30-min slots</option>
                <option value="45">45-min slots</option>
                <option value="60">60-min slots</option>
              </select>
            </div>
            <div>
              <label className={label} htmlFor="weeks">Repeat weekly</label>
              <select id="weeks" value={form.weeks} onChange={set('weeks')} className={inputClass}>
                {[1, 2, 3, 4, 6, 8].map((w) => (
                  <option key={w} value={w}>{w === 1 ? 'Just this day' : `For ${w} weeks`}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="capacity">Students per slot</label>
              <input id="capacity" type="number" min="1" max="20" value={form.capacity} onChange={set('capacity')} className={inputClass} />
            </div>
            <div>
              <label className={label} htmlFor="location">Location</label>
              <input id="location" value={form.location} onChange={set('location')} placeholder={profile?.officeLocation || 'Room / building'} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={label} htmlFor="notes">Note for students <span className="font-normal text-ink-soft">(optional)</span></label>
            <input id="notes" maxLength={200} value={form.notes} onChange={set('notes')} className={inputClass} />
          </div>

          <p className={`rounded-lg px-3 py-2 text-xs ${tooMany ? 'bg-danger-soft text-danger' : 'bg-navy-50 text-navy-600'}`}>
            {preview.length
              ? `This will create ${preview.length} slot${preview.length > 1 ? 's' : ''}${tooMany ? ` — over the limit of ${MAX_PER_REQUEST}` : ''}.`
              : 'Enter a valid date and time range.'}
          </p>

          <button type="submit" disabled={saving || !approved || !preview.length || tooMany} className={`${primaryBtn} w-full`}>
            {saving ? 'Adding…' : 'Add slots'}
          </button>
          {!approved && profile && <p className="text-center text-xs text-ink-soft">Available after admin approval.</p>}
        </form>

        <div className="lg:col-span-3">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Upcoming slots</h2>
          {loading && <p className="text-sm text-ink-soft">Loading…</p>}
          {!loading && byDay.length === 0 && (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-ink-soft shadow-soft">
              You haven't added any upcoming slots yet.
            </div>
          )}
          <div className="space-y-5">
            {byDay.map((day) => (
              <div key={day.label}>
                <h3 className="mb-2 text-sm font-semibold text-ink">{day.label}</h3>
                <div className="space-y-2">
                  {day.items.map((s) => {
                    const full = s.bookedCount >= s.capacity;
                    return (
                      <div key={s._id} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-soft">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink">
                            {format(new Date(s.startAt), 'h:mm a')} – {format(new Date(s.endAt), 'h:mm a')}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-soft">
                            {s.location && (
                              <span className="flex items-center gap-1"><HiOutlineMapPin className="h-3.5 w-3.5" />{s.location}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <HiOutlineUser className="h-3.5 w-3.5" />
                              {s.bookedCount}/{s.capacity} booked
                            </span>
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${full ? 'bg-border/70 text-ink-soft' : 'bg-success-soft text-success'}`}>
                          {full ? 'Full — hidden from students' : 'Open'}
                        </span>
                        <button
                          onClick={() => handleDelete(s)}
                          disabled={s.bookedCount > 0}
                          title={s.bookedCount > 0 ? 'Cancel the appointment first' : 'Remove slot'}
                          className="rounded-lg p-2 text-ink-soft transition hover:bg-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-soft"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
