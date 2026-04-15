import { cn } from '@/lib/utils/cn'

type Variant = 'default' | 'hot' | 'warm' | 'cold' | 'muted' | 'accent'

const variants: Record<Variant, string> = {
  default: 'border-surface-border bg-white/[0.04] text-zinc-300',
  hot: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
  warm: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  cold: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
  muted: 'border-surface-border bg-zinc-900 text-zinc-500',
  accent: 'border-accent/35 bg-accent-glow text-accent',
}

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode
  variant?: Variant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
