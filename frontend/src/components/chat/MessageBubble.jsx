import { HiOutlineHandThumbUp, HiOutlineHandThumbDown, HiOutlineSparkles, HiOutlineExclamationTriangle } from 'react-icons/hi2';

const categoryLabel = {
  'ai-service-error': 'Service issue'
};

export default function MessageBubble({ message, onFeedback }) {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-600">{message.content}</span>
      </div>
    );
  }

  return (
    <div className={`flex animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] gap-3 sm:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-600 text-white">
            <HiOutlineSparkles className="h-4 w-4" />
          </div>
        )}
        <div>
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft ${
              isUser
                ? 'rounded-tr-sm bg-navy-600 text-white'
                : 'rounded-tl-sm border-l-2 border-gold-400 bg-surface text-ink'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>

            {message.flaggedForEscalation && (
              <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-gold-100 px-2.5 py-1.5 text-xs font-medium text-navy-900">
                <HiOutlineExclamationTriangle className="h-4 w-4 shrink-0 text-gold-600" />
                This may need extra help &mdash; consider reaching out to a counselor directly.
              </div>
            )}

            {message.sources?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border/60 pt-2">
                {message.sources.map((s, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-navy-50 px-2 py-0.5 font-mono text-[11px] text-navy-600"
                    title={s.title}
                  >
                    src:{idx + 1}
                  </span>
                ))}
              </div>
            )}
          </div>

          {!isUser && (
            <div className="mt-1.5 flex items-center gap-2 px-1">
              {message.intent && (
                <span className="font-mono text-[11px] text-ink-soft">
                  {categoryLabel[message.intent] || message.intent}
                </span>
              )}
              {typeof message.confidence === 'number' && (
                <span className="font-mono text-[11px] text-ink-soft">· {Math.round(message.confidence * 100)}%</span>
              )}
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => onFeedback?.(message._id, 'helpful')}
                  className={`rounded-md p-1 transition hover:bg-success-soft hover:text-success ${
                    message.feedback === 'helpful' ? 'bg-success-soft text-success' : 'text-ink-soft'
                  }`}
                  aria-label="Mark as helpful"
                >
                  <HiOutlineHandThumbUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onFeedback?.(message._id, 'not-helpful')}
                  className={`rounded-md p-1 transition hover:bg-danger-soft hover:text-danger ${
                    message.feedback === 'not-helpful' ? 'bg-danger-soft text-danger' : 'text-ink-soft'
                  }`}
                  aria-label="Mark as not helpful"
                >
                  <HiOutlineHandThumbDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
