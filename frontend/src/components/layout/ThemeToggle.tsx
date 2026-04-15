import { Monitor, Moon, Sun } from 'lucide-react'

import { cn } from '@/lib/utils/cn'
import { type ThemePreference, useThemeStore } from '@/store/themeStore'

const options: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function ThemeToggle({ className }: { className?: string }) {
  const preference = useThemeStore((s) => s.preference)
  const setPreference = useThemeStore((s) => s.setPreference)

  return (
    <div
      className={cn(
        'inline-flex rounded-xl border border-surface-border bg-surface-raised/80 p-1 shadow-sm backdrop-blur-sm dark:bg-zinc-900/60',
        className,
      )}
      role="group"
      aria-label="Theme"
    >
      {options.map(({ value, label, icon: Icon }) => {
        const active = preference === value
        return (
          <button
            key={value}
            type="button"
            title={label}
            aria-pressed={active}
            aria-label={`${label} theme`}
            onClick={() => setPreference(value)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200',
              active
                ? 'bg-gradient-to-br from-amber-500/25 to-amber-600/15 text-amber-700 shadow-sm ring-1 ring-amber-500/30 dark:from-amber-400/20 dark:to-amber-600/10 dark:text-amber-300 dark:ring-amber-400/25'
                : 'text-ink-muted hover:bg-white/60 hover:text-ink dark:hover:bg-white/5 dark:hover:text-zinc-200',
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )
      })}
    </div>
  )
}
