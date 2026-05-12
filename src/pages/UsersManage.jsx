const MOCK_USERS = [
  { id: 'usr_01', name: 'Amina Hassan', email: 'amina@example.com', role: 'Customer' },
  { id: 'usr_02', name: 'Omar Ali', email: 'omar@example.com', role: 'Customer' },
  { id: 'usr_03', name: 'Layla Noor', email: 'layla@example.com', role: 'Admin' },
]

function UserCard({ row }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-zinc-900 dark:text-white">{row.name}</h2>
          <p className="mt-0.5 truncate text-sm text-zinc-600 dark:text-zinc-400">{row.email}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
            {row.role}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Edit user"
            disabled
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" d="M12 20h9M4 13l8-8a2 2 0 0 1 3 3l-8 8-4 1 1-4Z" />
            </svg>
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
            aria-label="Delete user"
            disabled
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V5h6v2" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}

export function UsersManage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Directory
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Users
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
            Full user CRUD for the admin panel. Search and forms will plug in when the backend is ready.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm sm:w-auto sm:self-start"
          disabled
        >
          Add user
        </button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="users-search-ui" className="sr-only">
          Search users
        </label>
        <input
          id="users-search-ui"
          type="search"
          placeholder="Search users…"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:max-w-xs"
          disabled
        />
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500">Disabled until wired</p>
      </div>

      <div className="grid gap-3 md:hidden">
        {MOCK_USERS.map((row) => (
          <UserCard key={row.id} row={row} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                <th className="px-4 py-3 lg:px-5">Name</th>
                <th className="px-4 py-3 lg:px-5">Email</th>
                <th className="px-4 py-3 lg:px-5">Role</th>
                <th className="px-4 py-3 text-right lg:px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {MOCK_USERS.map((row) => (
                <tr key={row.id} className="text-zinc-800 dark:text-zinc-200">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white lg:px-5">{row.name}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 lg:px-5">{row.email}</td>
                  <td className="px-4 py-3 lg:px-5">{row.role}</td>
                  <td className="px-4 py-3 text-right lg:px-5">
                    <div className="inline-flex justify-end gap-1">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        aria-label="Edit"
                        disabled
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="2" strokeLinecap="round" d="M12 20h9M4 13l8-8a2 2 0 0 1 3 3l-8 8-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 dark:hover:bg-red-950/40"
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
