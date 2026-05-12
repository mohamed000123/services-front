import { useRealtime } from '@/realtime/RealtimeProvider.jsx'

const styles = {
  connecting: {
    wrap: 'border-amber-200/80 bg-amber-50/90 text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-50',
    dot: 'bg-amber-500',
    ping: 'bg-amber-400',
    label: 'Connecting',
    hint: 'Negotiating socket',
  },
  live: {
    wrap: 'border-emerald-200/80 bg-emerald-50/90 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-50',
    dot: 'bg-emerald-500',
    ping: 'bg-emerald-400',
    label: 'Live',
    hint: 'Real-time feed active',
  },
  offline: {
    wrap: 'border-zinc-200 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
    dot: 'bg-zinc-400',
    ping: 'bg-zinc-300',
    label: 'Offline',
    hint: 'Socket disconnected',
  },
}

export function SocketStatusIndicator({ compact = false }) {
  const { adminSocketStatus } = useRealtime()
  const status = adminSocketStatus ?? 'offline'
  const cfg = styles[status] ?? styles.offline

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Real-time connection: ${cfg.label}`}
      className={`inline-flex items-center gap-2 rounded-full border shadow-sm ${cfg.wrap} ${
        compact ? 'px-2.5 py-1' : 'px-3 py-1.5'
      }`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {status === 'connecting' ? (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${cfg.ping} opacity-40`} />
        ) : null}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.dot}`} />
      </span>
      <span
        className={`font-semibold tracking-tight ${compact ? 'text-xs' : 'text-sm'} ${
          status === 'offline' ? 'text-zinc-800 dark:text-zinc-100' : ''
        }`}
      >
        {cfg.label}
      </span>
      {!compact ? (
        <span
          className={`hidden text-xs font-normal sm:inline ${
            status === 'live'
              ? 'text-emerald-800/80 dark:text-emerald-200/80'
              : status === 'connecting'
                ? 'text-amber-800/80 dark:text-amber-200/80'
                : 'text-zinc-600 dark:text-zinc-300'
          }`}
        >
          {cfg.hint}
        </span>
      ) : null}
    </div>
  )
}
