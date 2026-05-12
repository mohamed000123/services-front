import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutAdmin } from '@/services/auth.js'

export function LogoutButton() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    if (busy) return
    setBusy(true)
    try {
      await logoutAdmin()
    } catch {
      // Server or network error; client auth was still cleared in logoutAdmin
    } finally {
      setBusy(false)
      navigate('/login', { replace: true })
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm font-medium text-zinc-700 shadow-sm transition-colors duration-150 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md active:bg-zinc-100 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-700 dark:hover:shadow-md dark:active:bg-zinc-600/80"
    >
      {busy ? 'Signing out…' : 'Log out'}
    </button>
  )
}
