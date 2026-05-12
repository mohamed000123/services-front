import { NavLink } from 'react-router-dom'

const linkBase =
  'flex flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900'

const items = [
  { to: '/monitor', label: 'Live monitor', kicker: '' },
  { to: '/categories', label: 'Categories', kicker: '' },
  { to: '/services', label: 'Services', kicker: '' },
  { to: '/users', label: 'Users', kicker: '' },
]

export function SidebarNav({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Menu
      </p>
      <ul className="space-y-0.5">
        {items.map(({ to, label, kicker }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  linkBase,
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm dark:bg-violet-600 dark:text-white'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/80',
                ].join(' ')
              }
            >
              {kicker ? (
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{kicker}</span>
              ) : null}
              <span className="truncate">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
