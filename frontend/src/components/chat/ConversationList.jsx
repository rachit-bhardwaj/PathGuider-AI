import { useMemo, useState } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineChatBubbleLeftEllipsis, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { isToday, isYesterday, subDays, isAfter } from 'date-fns';

function groupConversations(conversations) {
  const groups = { Today: [], Yesterday: [], 'Previous 7 days': [], Older: [] };
  const sevenDaysAgo = subDays(new Date(), 7);

  for (const conv of conversations) {
    const date = new Date(conv.updatedAt);
    if (isToday(date)) groups.Today.push(conv);
    else if (isYesterday(date)) groups.Yesterday.push(conv);
    else if (isAfter(date, sevenDaysAgo)) groups['Previous 7 days'].push(conv);
    else groups.Older.push(conv);
  }

  return Object.entries(groups).filter(([, items]) => items.length > 0);
}

export default function ConversationList({ conversations, activeId, onSelect, onNew, onDelete, loading }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter(
      (c) => c.title?.toLowerCase().includes(q) || c.lastMessagePreview?.toLowerCase().includes(q)
    );
  }, [conversations, query]);

  const grouped = useMemo(() => groupConversations(filtered), [filtered]);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2 p-3">
        <button
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-2.5 text-sm font-semibold text-ink shadow-soft transition hover:border-navy-600 hover:text-navy-600"
        >
          <HiOutlinePlus className="h-4 w-4" />
          New chat
        </button>

        <div className="relative">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            className="w-full rounded-lg border border-transparent bg-paper py-2 pl-9 pr-3 text-sm outline-none transition focus:border-navy-600"
          />
        </div>
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto px-2 pb-3">
        {loading && <p className="p-3 text-sm text-ink-soft">Loading conversations…</p>}

        {!loading && filtered.length === 0 && (
          <div className="p-4 text-center text-sm text-ink-soft">
            <HiOutlineChatBubbleLeftEllipsis className="mx-auto mb-2 h-8 w-8 text-border-strong" />
            {query ? 'No chats match your search.' : 'No conversations yet. Start one above.'}
          </div>
        )}

        {grouped.map(([label, items]) => (
          <div key={label} className="mb-2">
            <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-ink-soft/70">
              {label}
            </p>
            {items.map((conv) => (
              <button
                key={conv._id}
                onClick={() => onSelect(conv._id)}
                className={`group relative mb-0.5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                  activeId === conv._id ? 'bg-navy-50 text-navy-900' : 'text-ink hover:bg-paper'
                }`}
              >
                <span className="min-w-0 flex-1 truncate text-sm">{conv.title}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv._id);
                  }}
                  role="button"
                  tabIndex={-1}
                  className="shrink-0 rounded-md p-1 text-ink-soft opacity-0 transition hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
                  aria-label="Delete conversation"
                >
                  <HiOutlineTrash className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
