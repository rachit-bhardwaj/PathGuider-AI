import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format, isToday, isYesterday } from 'date-fns';
import {
  HiOutlineArrowLeft,
  HiOutlineInboxStack,
  HiOutlinePaperAirplane,
  HiOutlineLockClosed,
  HiOutlineArrowPath,
  HiOutlinePlus
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import {
  getCounselorTickets,
  getCounselorTicket,
  pollTicketMessages,
  sendTicketMessage,
  setCounselorTicketStatus
} from '../../services/counselorService';

const LIST_POLL_MS = 15000;
const CHAT_POLL_MS = 5000;

const statusStyle = {
  pending: 'bg-gold-100 text-gold-600',
  active: 'bg-success-soft text-success',
  closed: 'bg-border/70 text-ink-soft'
};
const statusLabel = { pending: 'Awaiting reply', active: 'Active', closed: 'Closed' };

const formatListTime = (iso) => {
  const d = new Date(iso);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'dd MMM');
};

const dayLabel = (iso) => {
  const d = new Date(iso);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEEE, dd MMM yyyy');
};

function Avatar({ name, color, size = 'h-10 w-10' }) {
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white`}
      style={{ backgroundColor: color || '#3d52a0' }}
    >
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

const otherParty = (ticket) => (ticket.viewerRole === 'student' ? ticket.counselor : ticket.student);

export default function TicketMessenger() {
  const { user } = useAuth();
  const isStudent = user.role === 'student';
  const [params, setParams] = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [filter, setFilter] = useState('all');

  const [activeId, setActiveId] = useState(params.get('ticket'));
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const lastStampRef = useRef(null);
  const blockedRef = useRef(false);
  const pausedUntilRef = useRef(0); // back-off after a 429

  // ---- ticket list ----
  const loadList = useCallback(async (silent = false) => {
    try {
      const { tickets: list } = await getCounselorTickets();
      setTickets(list);
    } catch (err) {
      if (err.status === 401 || err.status === 403) blockedRef.current = true;
      else if (err.status === 429) pausedUntilRef.current = Date.now() + 30000;
      else if (!silent) toast.error(err.message);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadList(false);
    const id = setInterval(() => {
      if (!document.hidden && !blockedRef.current && Date.now() >= pausedUntilRef.current) loadList(true);
    }, LIST_POLL_MS);
    return () => clearInterval(id);
  }, [loadList]);

  // ---- open a ticket ----
  const mergeMessages = useCallback((incoming) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m._id));
      const fresh = incoming.filter((m) => !seen.has(m._id));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
    lastStampRef.current = incoming[incoming.length - 1].createdAt;
  }, []);

  useEffect(() => {
    if (!activeId) {
      setActive(null);
      setMessages([]);
      lastStampRef.current = null;
      return undefined;
    }
    let cancelled = false;
    setLoadingChat(true);
    setMessages([]);
    lastStampRef.current = null;
    getCounselorTicket(activeId)
      .then(({ ticket, messages: msgs }) => {
        if (cancelled) return;
        setActive(ticket);
        setMessages(msgs);
        lastStampRef.current = msgs.length ? msgs[msgs.length - 1].createdAt : null;
        loadList();
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(err.message);
        setActiveId(null);
      })
      .finally(() => !cancelled && setLoadingChat(false));
    return () => {
      cancelled = true;
    };
  }, [activeId, loadList]);

  // ---- live-ish updates for the open chat ----
  useEffect(() => {
    if (!activeId) return undefined;
    const id = setInterval(async () => {
      if (document.hidden || blockedRef.current || Date.now() < pausedUntilRef.current) return;
      try {
        const { ticket, messages: msgs } = await pollTicketMessages(activeId, lastStampRef.current);
        setActive(ticket);
        mergeMessages(msgs);
      } catch (err) {
        if (err.status === 401 || err.status === 403) blockedRef.current = true;
        else if (err.status === 429) pausedUntilRef.current = Date.now() + 30000;
        /* otherwise a transient network error: try again next tick */
      }
    }, CHAT_POLL_MS);
    return () => clearInterval(id);
  }, [activeId, mergeMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, activeId]);

  const selectTicket = (id) => {
    setActiveId(id);
    setParams(id ? { ticket: id } : {}, { replace: true });
  };

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || sending || !active?.canSend) return;
    setSending(true);
    try {
      const { message, ticket } = await sendTicketMessage(activeId, content);
      setDraft('');
      setActive(ticket);
      mergeMessages([message]);
      loadList();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleStatus = async (status) => {
    if (status === 'closed' && !window.confirm('Close this ticket? Neither of you can send messages until it is reopened.')) return;
    try {
      const updated = await setCounselorTicketStatus(activeId, status);
      setActive(updated);
      toast.success(status === 'closed' ? 'Ticket closed.' : 'Ticket reopened.');
      loadList();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const visible = useMemo(() => (filter === 'all' ? tickets : tickets.filter((t) => t.status === filter)), [tickets, filter]);

  // Group messages by day for separators.
  const grouped = useMemo(() => {
    const out = [];
    let lastDay = '';
    messages.forEach((m) => {
      const day = format(new Date(m.createdAt), 'yyyy-MM-dd');
      if (day !== lastDay) {
        out.push({ type: 'day', key: `d-${day}`, label: dayLabel(m.createdAt) });
        lastDay = day;
      }
      out.push({ type: 'msg', key: m._id, message: m });
    });
    return out;
  }, [messages]);

  const other = active ? otherParty(active) : null;
  const myRole = user.role;

  return (
    <div className="flex h-full overflow-hidden bg-paper">
      {/* ---------- Ticket list ---------- */}
      <aside className={`${activeId ? 'hidden md:flex' : 'flex'} w-full shrink-0 flex-col border-r border-border bg-surface md:w-80 lg:w-96`}>
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h1 className="font-display text-lg font-semibold text-ink">{isStudent ? 'My tickets' : 'Student messages'}</h1>
          {isStudent && (
            <Link
              to="/counselors"
              className="flex items-center gap-1 rounded-lg bg-navy-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-700"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" />
              New query
            </Link>
          )}
        </div>

        <div className="flex gap-1 border-b border-border px-3 py-2 text-xs font-medium">
          {['all', 'pending', 'active', 'closed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 capitalize transition ${
                filter === f ? 'bg-navy-600 text-white' : 'text-ink-soft hover:bg-paper'
              }`}
            >
              {f === 'pending' ? (isStudent ? 'Waiting' : 'Needs reply') : f}
            </button>
          ))}
        </div>

        <div className="scroll-thin flex-1 overflow-y-auto">
          {loadingList && <p className="p-6 text-center text-sm text-ink-soft">Loading…</p>}

          {!loadingList && visible.length === 0 && (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-600">
                <HiOutlineInboxStack className="h-6 w-6" />
              </div>
              <p className="font-medium text-ink">{tickets.length ? 'Nothing in this view' : 'No tickets yet'}</p>
              <p className="mt-1 text-sm text-ink-soft">
                {isStudent ? 'Pick a counselor and send your first query.' : 'Messages from students will show up here.'}
              </p>
              {isStudent && !tickets.length && (
                <Link to="/counselors" className="mt-4 text-sm font-semibold text-navy-600 hover:text-navy-700">
                  Browse counselors
                </Link>
              )}
            </div>
          )}

          {visible.map((t) => {
            const o = otherParty(t);
            const isActive = t._id === activeId;
            return (
              <button
                key={t._id}
                onClick={() => selectTicket(t._id)}
                className={`flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition ${
                  isActive ? 'bg-navy-50' : 'hover:bg-paper'
                }`}
              >
                <Avatar name={o?.name} color={o?.avatarColor} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{o?.name}</p>
                    <span className="shrink-0 text-[11px] text-ink-soft">{formatListTime(t.lastMessageAt)}</span>
                  </div>
                  <p className="truncate text-xs font-medium text-navy-600">{t.subject}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className={`min-w-0 flex-1 truncate text-xs ${t.unread ? 'font-semibold text-ink' : 'text-ink-soft'}`}>
                      {t.lastMessageBy === t.viewerRole ? 'You: ' : ''}
                      {t.lastMessagePreview}
                    </p>
                    {t.unread > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-navy-600 px-1.5 text-[10px] font-semibold text-white">
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyle[t.status]}`}>
                    {t.status === 'pending' && !isStudent ? 'Needs your reply' : statusLabel[t.status]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ---------- Chat ---------- */}
      <section className={`${activeId ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col`}>
        {!activeId && (
          <div className="flex flex-1 flex-col items-center justify-center bg-chat-bg px-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-600">
              <HiOutlineInboxStack className="h-7 w-7" />
            </div>
            <p className="font-display text-xl text-ink">Select a ticket to open the chat</p>
            <p className="mt-1 max-w-sm text-sm text-ink-soft">
              {isStudent
                ? 'Once your counselor replies, you can keep chatting right here, like a messenger.'
                : 'Reply to a student’s query to open the chat with them.'}
            </p>
          </div>
        )}

        {activeId && (
          <>
            <header className="flex items-center gap-3 border-b border-border bg-surface px-3 py-3 sm:px-4">
              <button
                onClick={() => selectTicket(null)}
                className="rounded-lg p-1.5 text-ink-soft hover:bg-paper hover:text-ink md:hidden"
                aria-label="Back to tickets"
              >
                <HiOutlineArrowLeft className="h-5 w-5" />
              </button>
              {other && <Avatar name={other.name} color={other.avatarColor} />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{other?.name || '…'}</p>
                <p className="truncate text-xs text-ink-soft">
                  {active ? `${active.subject} · ${active.ticketNumber}` : 'Loading…'}
                </p>
              </div>
              {active && (
                <>
                  <span className={`hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline ${statusStyle[active.status]}`}>
                    {statusLabel[active.status]}
                  </span>
                  {active.status === 'closed' ? (
                    <button
                      onClick={() => handleStatus('reopen')}
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-paper hover:text-ink"
                    >
                      <HiOutlineArrowPath className="h-3.5 w-3.5" />
                      Reopen
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatus('closed')}
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-danger-soft hover:text-danger"
                    >
                      <HiOutlineLockClosed className="h-3.5 w-3.5" />
                      Close
                    </button>
                  )}
                </>
              )}
            </header>

            <div ref={scrollRef} className="scroll-thin flex-1 overflow-y-auto bg-chat-bg">
              <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end space-y-3 px-4 py-6 sm:px-6">
                {loadingChat && <p className="text-center text-sm text-ink-soft">Loading messages…</p>}

                {grouped.map((item) =>
                  item.type === 'day' ? (
                    <div key={item.key} className="flex justify-center py-1">
                      <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-600">{item.label}</span>
                    </div>
                  ) : (
                    <div
                      key={item.key}
                      className={`flex animate-fade-in-up ${item.message.senderRole === myRole ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-[85%] sm:max-w-[70%]">
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-soft ${
                            item.message.senderRole === myRole
                              ? 'rounded-tr-sm bg-navy-600 text-white'
                              : 'rounded-tl-sm border-l-2 border-gold-400 bg-surface text-ink'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{item.message.content}</p>
                        </div>
                        <p
                          className={`mt-1 px-1 text-[11px] text-ink-soft ${
                            item.message.senderRole === myRole ? 'text-right' : 'text-left'
                          }`}
                        >
                          {format(new Date(item.message.createdAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  )
                )}

                {active?.status === 'pending' && (
                  <div className="flex justify-center py-2">
                    <span className="max-w-sm rounded-xl bg-gold-100 px-4 py-2 text-center text-xs font-medium text-navy-900">
                      {isStudent
                        ? 'Query sent. You’ll be able to continue the chat as soon as your counselor replies.'
                        : 'Reply to open the chat — the student can then message you back.'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border bg-surface px-4 py-3">
              {active && !active.canSend ? (
                <p className="mx-auto max-w-3xl rounded-xl bg-paper px-4 py-3 text-center text-sm text-ink-soft">
                  {active.sendBlockedReason}
                </p>
              ) : (
                <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-3xl border border-border bg-paper px-4 py-2.5 shadow-soft transition focus-within:border-navy-600 focus-within:ring-2 focus-within:ring-navy-100">
                  <textarea
                    rows={1}
                    value={draft}
                    maxLength={2000}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={isStudent ? 'Message your counselor…' : 'Reply to the student…'}
                    className="max-h-40 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-ink-soft/70"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !draft.trim()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-600 text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-ink-soft"
                    aria-label="Send message"
                  >
                    <HiOutlinePaperAirplane className="h-4 w-4" />
                  </button>
                </div>
              )}
              <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-ink-soft/70">
                Counselors are not an emergency service. In immediate danger call 112; for 24x7 support call Tele-MANAS 14416.
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
