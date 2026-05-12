import { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { LogoutButton } from '@/components/layout/LogoutButton'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { SocketStatusIndicator } from '@/components/layout/SocketStatusIndicator'
import { getAdminSessionProfile } from '@/services/api.js'

const PAGE_TITLES = [
  { prefix: '/monitor', title: 'Live monitor' },
  { prefix: '/services', title: 'Services' },
  { prefix: '/users', title: 'Users' },
]

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const adminProfile = useMemo(() => getAdminSessionProfile(), [])

  const mobilePageTitle = useMemo(() => {
    const hit = PAGE_TITLES.find((p) => location.pathname.startsWith(p.prefix))
    return hit?.title ?? 'Dashboard'
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  return (
    <div className="flex min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Mobile backdrop */}
      <button
        type="button"
        className={`fixed bottom-0 left-0 right-0 top-14 z-30 bg-black/50 transition-opacity md:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-label="Close navigation"
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        className={[
          'fixed bottom-0 left-0 top-14 z-40 flex w-[min(17.5rem,88vw)] max-w-full flex-col border-r border-zinc-200 bg-white shadow-xl transition-transform duration-200 ease-out dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none',
          'md:static md:top-0 md:z-0 md:h-auto md:min-h-dvh md:w-56 md:min-w-56 md:max-w-none md:translate-x-0 md:shadow-none lg:w-64 lg:min-w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-14 shrink-0 flex-col justify-center gap-0.5 border-b border-zinc-200 px-4 py-2 dark:border-zinc-800 md:h-16 md:px-5">
          <Link
            to="/monitor"
            className="truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-white"
            onClick={() => setMobileOpen(false)}
          >
            Service admin
          </Link>
          {adminProfile?.fullName ? (
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {adminProfile.fullName}
              {adminProfile.role ? ` · ${adminProfile.role}` : ''}
            </p>
          ) : null}
        </div>
        <SidebarNav onNavigate={() => setMobileOpen(false)} />
        <div className="mt-auto border-t border-zinc-200 p-3 dark:border-zinc-800">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Account
          </p>
          <div className="mb-3 px-1">
            <LogoutButton />
          </div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Real-time
          </p>
          <div className="px-1">
            <SocketStatusIndicator compact />
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white/95 px-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            aria-expanded={mobileOpen}
            aria-controls="app-sidebar"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900 dark:text-white">
            {mobilePageTitle}
          </span>
          <SocketStatusIndicator compact />
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
