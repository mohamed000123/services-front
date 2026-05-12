import { useEffect, useState } from 'react'
import { api } from '@/services/api.js'
import { getApiErrorMessages } from '@/utils/getApiErrorMessages.js'

const OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export function RequestStatusUpdater({ requestId, currentStatus, onUpdated }) {
  const [value, setValue] = useState(currentStatus ?? 'PENDING')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    setValue(currentStatus ?? 'PENDING')
  }, [currentStatus, requestId])

  const submit = async () => {
    setMsg(null)
    setSaving(true)
    try {
      await api.patch(`/admin/requests/${requestId}/status`, { status: value })
      onUpdated?.()
    } catch (err) {
      setMsg(getApiErrorMessages(err).join(' · ') || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={`st-${requestId}`} className="sr-only">
        New status
      </label>
      <select
        id={`st-${requestId}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-semibold text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => void submit()}
        disabled={saving}
        className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-900 disabled:opacity-50 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-100"
      >
        {saving ? 'Saving…' : 'Apply'}
      </button>
      {msg ? (
        <p className="w-full text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {msg}
        </p>
      ) : null}
    </div>
  )
}
