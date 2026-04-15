import { Menu } from 'lucide-react'

import { cn } from '@/lib/utils/cn'
import { useSidebarStore } from '@/store/sidebarStore'

type TopNavProps = {
  title: string
  subtitle?: string
}

export function TopNav({ title, subtitle }: TopNavProps) {
  const toggleMobile = useSidebarStore((s) => s.toggleMobile)

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-surface-border bg-black/80 px-4 py-4 backdrop-blur-md lg:px-8">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border bg-surface-raised text-zinc-300 lg:hidden"
        onClick={toggleMobile}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className={cn('text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl')}>
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 max-w-3xl text-sm text-zinc-500 lg:text-base">{subtitle}</p>
        ) : null}
      </div>
    </header>
  )
}
