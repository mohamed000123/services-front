import { NavLink } from 'react-router-dom'
import { MonitorIcon } from '@/icons/MonitorIcon'
import { ServicesIcon } from '@/icons/ServicesIcon'
import { UsersIcon } from '@/icons/UsersIcon'

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900'

const items = [
  { to: '/monitor', label: 'Live monitor', Icon: MonitorIcon },
  { to: '/services', label: 'Services', Icon: ServicesIcon },
  { to: '/users', label: 'Users', Icon: UsersIcon },
]

export function SidebarNav({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Menu
      </p>
      <ul className="space-y-0.5">
        {items.map(({ to, label, Icon }) => (
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
              <Icon className="shrink-0 opacity-90" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
