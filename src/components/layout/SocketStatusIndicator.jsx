export function SocketStatusIndicator({ compact = false }) {
  return (
    <div
      role="status"
      aria-label="Real-time connection (placeholder)"
      className={`inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 text-emerald-950 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-50 ${
        compact ? 'px-2.5 py-1' : 'px-3 py-1.5'
      }`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className={`font-semibold tracking-tight text-emerald-900 dark:text-emerald-100 ${compact ? 'text-xs' : 'text-sm'}`}>
        Live
      </span>
      {!compact ? (
        <span className="hidden text-xs font-normal text-emerald-800/80 sm:inline dark:text-emerald-200/80">
          Socket ready
        </span>
      ) : null}
    </div>
  )
}
