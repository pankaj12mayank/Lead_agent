import { memo } from 'react'

import { cn } from '@/lib/utils/cn'

type StatCardProps = {
  title: string
  value: string | number
  hint?: string
  className?: string
}

export const StatCard = memo(function StatCard({ title, value, hint, className }: StatCardProps) {  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-surface-border bg-premium-card-light p-6 shadow-card transition-all duration-300 dark:bg-premium-card-dark',
        'hover:border-amber-500/25 hover:shadow-glow-gold dark:hover:border-amber-400/20 dark:hover:shadow-glow',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl transition duration-500 group-hover:bg-emerald-500/10 dark:bg-amber-400/10" />
      <div className="pointer-events-none absolute -bottom-8 left-1/3 h-20 w-20 rounded-full bg-emerald-500/5 blur-2xl dark:bg-emerald-400/10" />
      <div className="relative text-sm font-medium uppercase tracking-wide text-ink-subtle">{title}</div>
      <div className="relative mt-2 text-3xl font-bold tabular-nums leading-tight tracking-tight text-ink">{value}</div>
      {hint ? <div className="relative mt-2 text-sm leading-relaxed text-ink-muted">{hint}</div> : null}
    </div>
  )
})