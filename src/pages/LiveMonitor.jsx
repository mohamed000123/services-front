import { SocketStatusIndicator } from '@/components/layout/SocketStatusIndicator'
import { StatusBadge } from '@/components/ui/StatusBadge'

const MOCK_REQUESTS = [
  {
    id: 'REQ-1042',
    service: 'Express wash',
    requester: 'A. Hassan',
    created: 'Today · 09:14',
    status: 'pending',
  },
  {
    id: 'REQ-1041',
    service: 'Full detail',
    requester: 'M. Ali',
    created: 'Today · 08:02',
    status: 'in-progress',
  },
  {
    id: 'REQ-1038',
    service: 'Interior only',
    requester: 'S. Noor',
    created: 'Yesterday · 17:41',
    status: 'completed',
  },
]

function RequestCard({ row }) {
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
      <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <button
          type="button"
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          disabled
        >
          Update status
        </button>
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-xs font-semibold text-violet-700 dark:text-violet-300"
          disabled
        >
          View
        </button>
      </div>
    </article>
  )
}

export function LiveMonitor() {
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
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
            Incoming service requests appear here in real time once Socket.io is connected. Static layout
            preview only.
          </p>
        </div>
        <div className="shrink-0">
          <SocketStatusIndicator />
        </div>
      </header>

      <section className="space-y-3" aria-labelledby="requests-heading">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="requests-heading" className="text-lg font-semibold text-zinc-900 dark:text-white">
            Request queue
          </h2>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Mock rows · UI only
          </p>
        </div>

        <div className="grid gap-3 md:hidden">
          {MOCK_REQUESTS.map((row) => (
            <RequestCard key={row.id} row={row} />
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
                {MOCK_REQUESTS.map((row) => (
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
                      <button
                        type="button"
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:border-zinc-600 dark:text-zinc-100"
                        disabled
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
