/**
 * Server-backed list footer: range text, page size, prev/next.
 * Expects 1-based `page` and API-style `meta.total` across all rows for the current filters.
 */
export function ListPagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  disabled = false,
  limitOptions = [10, 20, 50],
  className = '',
}) {
  const nTotal = Number(total) || 0
  const nLimit = Math.max(1, Number(limit) || 20)
  const nPage = Math.max(1, Number(page) || 1)
  const totalPages = Math.max(1, Math.ceil(nTotal / nLimit) || 1)
  const safePage = Math.min(nPage, totalPages)
  const start = nTotal === 0 ? 0 : (safePage - 1) * nLimit + 1
  const end = nTotal === 0 ? 0 : Math.min(safePage * nLimit, nTotal)

  const canPrev = safePage > 1 && !disabled
  const canNext = safePage < totalPages && !disabled

  const btn =
    'rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'

  return (
    <div
      className={`flex flex-col gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      <p className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
        {nTotal === 0 ? (
          'No results'
        ) : (
          <>
            Showing <span className="font-medium text-zinc-800 dark:text-zinc-200">{start}</span>–
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{end}</span> of{' '}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{nTotal}</span>
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {typeof onLimitChange === 'function' ? (
          <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Per page
            <select
              className="rounded-lg border border-zinc-200 bg-white py-1.5 pl-2 pr-8 text-xs font-semibold text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={nLimit}
              disabled={disabled}
              onChange={(e) => onLimitChange(Number(e.target.value))}
            >
              {limitOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="flex items-center gap-1">
          <button type="button" className={btn} disabled={!canPrev} onClick={() => onPageChange(safePage - 1)}>
            Previous
          </button>
          <span className="min-w-[5rem] px-2 text-center text-xs font-semibold tabular-nums text-zinc-600 dark:text-zinc-400">
            Page {safePage} / {totalPages}
          </span>
          <button type="button" className={btn} disabled={!canNext} onClick={() => onPageChange(safePage + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
