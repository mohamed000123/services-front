const variants = {
  pending: {
    label: 'Pending',
    className:
      'bg-amber-50 text-amber-900 ring-amber-200/80 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800/80',
  },
  'in-progress': {
    label: 'In progress',
    className:
      'bg-sky-50 text-sky-900 ring-sky-200/80 dark:bg-sky-950/50 dark:text-sky-100 dark:ring-sky-800/80',
  },
  cancelled: {
    label: 'Cancelled',
    className:
      'bg-zinc-100 text-zinc-900 ring-zinc-300/80 dark:bg-zinc-800/80 dark:text-zinc-100 dark:ring-zinc-600/80',
  },
}

export function StatusBadge({ variant = 'pending' }) {
  const config = variants[variant] ?? variants.pending
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  )
}
