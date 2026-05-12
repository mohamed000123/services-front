/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {import('react').MouseEventHandler<HTMLButtonElement>} [props.onClick]
 * @param {'neutral' | 'danger' | 'primary'} [props.tone]
 * @param {boolean} [props.disabled]
 * @param {'button' | 'submit' | 'reset'} [props.type]
 */
export function CatalogTextBtn({
  children,
  onClick = undefined,
  tone = 'neutral',
  disabled = false,
  type = 'button',
}) {
  const tones = {
    neutral:
      'border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
    danger:
      'border-red-200 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200',
    primary:
      'border-violet-200 bg-violet-600 text-white hover:bg-violet-700 dark:border-violet-700 dark:bg-violet-600',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  )
}
