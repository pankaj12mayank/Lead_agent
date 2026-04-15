import { leadStatusLabel } from '@/lib/copy/appCopy'
import { cn } from '@/lib/utils/cn'

/** Lead tier + platform chip */
export type TierVariant = 'hot' | 'warm' | 'cold' | 'muted' | 'default' | 'accent' | 'platform'

const tierVariants: Record<string, string> = {
  default: 'border-surface-border bg-field/80 text-ink-muted',
  hot: 'border-red-500/35 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-950/45 dark:text-red-200',
  warm: 'border-amber-500/35 bg-amber-50 text-amber-900 dark:border-amber-500/25 dark:bg-amber-950/40 dark:text-amber-200',
  cold: 'border-slate-400/35 bg-slate-100 text-slate-800 dark:border-slate-600 dark:bg-slate-900/55 dark:text-slate-300',
  muted: 'border-surface-border bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-500',
  accent: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-200',
  platform:
    'border-amber-600/25 bg-stone-100/90 font-mono text-xs uppercase text-stone-700 ring-1 ring-amber-500/15 dark:border-amber-500/20 dark:bg-zinc-900/80 dark:text-amber-100/90 dark:ring-amber-400/10',
}

/** CRM status badge colors */
const statusStyles: Record<string, string> = {
  new: 'border-zinc-400/35 bg-zinc-100 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300',
  contacted: 'border-amber-500/35 bg-amber-50 text-amber-900 dark:bg-amber-950/45 dark:text-amber-200',
  replied: 'border-cyan-500/35 bg-cyan-50 text-cyan-900 dark:border-cyan-500/25 dark:bg-cyan-950/40 dark:text-cyan-200',
  follow_up_sent:
    'border-orange-500/35 bg-orange-50 text-orange-900 dark:border-orange-500/25 dark:bg-orange-950/40 dark:text-orange-200',
  meeting_scheduled:
    'border-emerald-500/35 bg-emerald-50 text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-950/40 dark:text-emerald-200',
  deal_discussion:
    'border-amber-600/40 bg-amber-100/90 text-amber-950 dark:border-amber-400/30 dark:bg-amber-950/35 dark:text-amber-100',
  closed: 'border-green-600/35 bg-green-50 text-green-900 dark:border-green-500/25 dark:bg-green-950/40 dark:text-green-200',
  rejected: 'border-red-500/35 bg-red-50 text-red-900 dark:border-red-500/25 dark:bg-red-950/40 dark:text-red-200',
  ready: 'border-slate-400/35 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  converted: 'border-emerald-600/40 bg-emerald-100 text-emerald-950 dark:bg-emerald-900/50 dark:text-emerald-100',
}

export function statusBadgeClass(status: string): string {
  const k = (status || 'new').toLowerCase().replace(/\s+/g, '_')
  return statusStyles[k] ?? statusStyles.new
}

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode
  variant?: TierVariant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors duration-200',
        tierVariants[variant] ?? tierVariants.default,
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const label = status ? leadStatusLabel(status) : '—'
  return (
    <span
      className={cn(
        'inline-flex max-w-full rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide',
        statusBadgeClass(status),
      )}
      title={label}
    >
      {label}
    </span>
  )
}
