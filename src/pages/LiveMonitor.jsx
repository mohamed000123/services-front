import { useEffect, useState } from 'react'
import { SocketStatusIndicator } from '@/components/layout/SocketStatusIndicator'
import { ListPagination } from '@/components/ui/ListPagination.jsx'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { RequestStatusUpdater } from '@/features/requests/RequestStatusUpdater.jsx'
import { useRequestsFeed } from '@/realtime/useRequestsFeed.js'
import { api } from '@/services/api.js'

function RequestCard({ row, onReload }) {
  const st = row.raw?.status ?? 'PENDING'
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {row.id}
          </p>
          <h2 className="mt-1 text-base font-semibold text-zinc-900 dark:text-white">{row.service}</h2>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{row.requester}</p>
        </div>
        <StatusBadge variant={row.status} />
      </div>
      <p className="mt-3 text-xs font-medium text-zinc-500 dark:text-zinc-500">{row.created}</p>
      <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <RequestStatusUpdater requestId={row.id} currentStatus={st} onUpdated={onReload} />
      </div>
    </article>
  )
}

export function LiveMonitor() {
  const { rows, loading, refreshing, error, reload, meta, page, setPage, limit, setLimit } = useRequestsFeed()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const { data } = await api.get('/admin/requests/stats')
        if (!cancelled) setStats(data?.data ?? null)
      } catch {
        if (!cancelled) setStats(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Operations
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Live monitor
          </h1>
        </div>
        <div className="shrink-0">
          <SocketStatusIndicator />
        </div>
      </header>

      {stats ? (
        <section className="flex flex-wrap gap-2" aria-label="Queue summary">
          {Object.entries(stats).map(([k, v]) => (
            <span
              key={k}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              {k.replaceAll('_', ' ')} <span className="tabular-nums text-zinc-900 dark:text-white">{v}</span>
            </span>
          ))}
        </section>
      ) : null}

      <section className="space-y-3" aria-labelledby="requests-heading" aria-busy={refreshing}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="requests-heading" className="text-lg font-semibold text-zinc-900 dark:text-white">
            Request queue
          </h2>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {loading ? 'Loading…' : refreshing ? 'Updating…' : `${meta.total} total`}
          </p>
        </div>

        {error ? (
          <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
            Could not load requests.
          </p>
        ) : null}

        <div className="grid gap-3 md:hidden">
          {rows.map((row) => (
            <RequestCard key={row.id} row={row} onReload={() => void reload({ silent: true })} />
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                  <th className="whitespace-nowrap px-4 py-3 lg:px-5">Request</th>
                  <th className="whitespace-nowrap px-4 py-3 lg:px-5">Service</th>
                  <th className="whitespace-nowrap px-4 py-3 lg:px-5">Requester</th>
                  <th className="whitespace-nowrap px-4 py-3 lg:px-5">Created</th>
                  <th className="whitespace-nowrap px-4 py-3 lg:px-5">Status</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right lg:px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {rows.map((row) => (
                  <tr key={row.id} className="text-zinc-800 dark:text-zinc-200">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-zinc-600 dark:text-zinc-400 lg:px-5">
                      {row.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-900 dark:text-white lg:px-5">
                      {row.service}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 lg:px-5">{row.requester}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400 lg:px-5">
                      {row.created}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 lg:px-5">
                      <StatusBadge variant={row.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right lg:px-5">
                      <div className="inline-flex justify-end">
                        <RequestStatusUpdater
                          requestId={row.id}
                          currentStatus={row.raw?.status ?? 'PENDING'}
                          onUpdated={() => void reload({ silent: true })}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ListPagination
          page={page}
          limit={limit}
          total={meta.total}
          onPageChange={setPage}
          onLimitChange={setLimit}
          disabled={loading || refreshing}
        />
      </section>
    </div>
  )
}
