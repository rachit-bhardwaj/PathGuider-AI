const statusStyles = {
  open: 'bg-navy-50 text-navy-600',
  'in-progress': 'bg-gold-100 text-gold-600',
  resolved: 'bg-success-soft text-success',
  closed: 'bg-border/70 text-ink-soft'
};

const priorityStyles = {
  low: 'bg-border/60 text-ink-soft',
  medium: 'bg-navy-50 text-navy-600',
  high: 'bg-gold-100 text-gold-600',
  urgent: 'bg-danger-soft text-danger'
};

export function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[status] || ''}`}>
      {status?.replace('-', ' ')}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${priorityStyles[priority] || ''}`}>
      {priority}
    </span>
  );
}
