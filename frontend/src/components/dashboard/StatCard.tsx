import { cn } from '@/lib/utils/cn'

type StatCardProps = {
  title: string
  value: string | number
  hint?: string
  className?: string
}

export function StatCard({ title, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-6 shadow-card transition hover:border-accent/25 hover:shadow-glow',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/5 blur-2xl transition group-hover:bg-accent/10" />
      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-white tabular-nums">{value}</div>
      {hint ? <div className="mt-2 text-xs leading-relaxed text-zinc-500">{hint}</div> : null}
    </div>
  )
}
