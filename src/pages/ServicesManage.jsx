const MOCK_SERVICES = [
  { id: 'svc_01', name: 'Express wash', price: '45 EGP', category: 'Wash' },
  { id: 'svc_02', name: 'Full detail', price: '220 EGP', category: 'Detail' },
  { id: 'svc_03', name: 'Interior only', price: '120 EGP', category: 'Interior' },
]

function ServiceCard({ row }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {row.category}
          </p>
          <h2 className="mt-1 text-base font-semibold text-zinc-900 dark:text-white">{row.name}</h2>
          <p className="mt-1 text-sm font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">{row.price}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="Edit service"
            disabled
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path
                strokeWidth="2"
                strokeLinecap="round"
                d="M12 20h9M4 13l8-8a2 2 0 0 1 3 3l-8 8-4 1 1-4Z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
            aria-label="Delete service"
            disabled
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V5h6v2" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}

export function ServicesManage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Catalog
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Services
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
            CRUD for service offerings: name, price, and category. Buttons are disabled until APIs are wired.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm sm:w-auto sm:self-start"
          disabled
        >
          Add service
        </button>
      </header>

      <div className="grid gap-3 md:hidden">
        {MOCK_SERVICES.map((row) => (
          <ServiceCard key={row.id} row={row} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                <th className="px-4 py-3 lg:px-5">Name</th>
                <th className="px-4 py-3 lg:px-5">Price</th>
                <th className="px-4 py-3 lg:px-5">Category</th>
                <th className="px-4 py-3 text-right lg:px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {MOCK_SERVICES.map((row) => (
                <tr key={row.id} className="text-zinc-800 dark:text-zinc-200">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white lg:px-5">{row.name}</td>
                  <td className="px-4 py-3 tabular-nums lg:px-5">{row.price}</td>
                  <td className="px-4 py-3 lg:px-5">{row.category}</td>
                  <td className="px-4 py-3 text-right lg:px-5">
                    <div className="inline-flex justify-end gap-1">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        aria-label="Edit"
                        disabled
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            d="M12 20h9M4 13l8-8a2 2 0 0 1 3 3l-8 8-4 1 1-4Z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                        aria-label="Delete"
                        disabled
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V5h6v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
