// Scrollable content wrapper for pages rendered inside AppLayout (whose <main> does not scroll).
export default function PageShell({ title, subtitle, actions, children, maxWidth = 'max-w-5xl' }) {
  return (
    <div className="scroll-thin h-full overflow-y-auto bg-paper">
      <div className={`mx-auto w-full ${maxWidth} px-4 py-6 sm:px-6`}>
        {(title || actions) && (
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              {title && <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>}
              {subtitle && <p className="mt-1 max-w-2xl text-sm text-ink-soft">{subtitle}</p>}
            </div>
            {actions}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export const inputClass =
  'w-full rounded-xl border border-border bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-navy-600 focus:bg-surface focus:ring-2 focus:ring-navy-100';

export const primaryBtn =
  'rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-navy-700 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

export const ghostBtn =
  'rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-paper hover:text-ink disabled:opacity-60';
