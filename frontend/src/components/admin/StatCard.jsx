export default function StatCard({ label, value, sublabel, accent = 'navy' }) {
  const accents = {
    navy: 'text-navy-600 bg-navy-50',
    gold: 'text-gold-600 bg-gold-100',
    success: 'text-success bg-success-soft',
    danger: 'text-danger bg-danger-soft'
  };
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
      {sublabel && (
        <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${accents[accent]}`}>
          {sublabel}
        </span>
      )}
    </div>
  );
}
