import { Link, Outlet } from 'react-router-dom'

export function MainLayout() {
  return (
    <div className="min-h-dvh bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="border-b border-gray-200 bg-gray-50/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
        <nav className="mx-auto flex max-w-3xl items-center gap-6 px-4 py-3 text-sm font-medium">
          <Link className="text-violet-600 hover:underline dark:text-violet-400" to="/">
            Services
          </Link>
          <Link className="text-violet-600 hover:underline dark:text-violet-400" to="/users">
            Users
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
