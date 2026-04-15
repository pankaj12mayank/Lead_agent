import {
  LayoutDashboard,
  Layers,
  LineChart,
  LogOut,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

import { TopNav } from '@/components/layout/TopNav'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/store/authStore'
import { useSidebarStore } from '@/store/sidebarStore'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/platforms', label: 'Platforms', icon: Layers },
  { to: '/analytics', label: 'Analytics', icon: LineChart },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const meta: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Pipeline health, acquisition sources, and tier mix at a glance.',
  },
  '/leads': {
    title: 'Leads',
    subtitle: 'Search, filter, and move deals forward without leaving this view.',
  },
  '/platforms': {
    title: 'Platforms',
    subtitle: 'Sessions, logins, and scraper runs across connected sources.',
  },
  '/analytics': {
    title: 'Analytics',
    subtitle: 'Funnel, conversion, and channel performance for revenue teams.',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Models, scraper defaults, and export preferences for this workspace.',
  },
}

function pathKey(pathname: string) {
  const p = pathname.replace(/\/$/, '') || '/dashboard'
  return meta[p] ? p : '/dashboard'
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {nav.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border border-accent/30 bg-accent-glow text-accent shadow-glow'
                : 'border border-transparent text-zinc-400 hover:border-surface-border hover:bg-white/[0.03] hover:text-zinc-100',
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0 opacity-90" />
          {label}
        </NavLink>
      ))}
    </>
  )
}

export function AppShell() {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const mobileOpen = useSidebarStore((s) => s.mobileOpen)
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen)
  const key = pathKey(pathname)
  const { title, subtitle } = meta[key] ?? meta['/dashboard']

  return (
    <div className="flex min-h-screen bg-black text-zinc-100">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-surface-border bg-black px-4 py-6 transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-glow ring-1 ring-accent/30">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-white">Lead Intelligence</div>
            <div className="text-xs text-zinc-500">SaaS workspace</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          <NavItems onNavigate={() => setMobileOpen(false)} />
        </nav>
        <div className="mt-auto border-t border-surface-border pt-4">
          <div className="truncate px-2 text-xs text-zinc-500">{user?.email}</div>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-2 flex w-full items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-sm text-zinc-400 transition hover:border-surface-border hover:bg-white/[0.03] hover:text-zinc-100"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
        <TopNav title={title} subtitle={subtitle} />
        <div className="flex-1 overflow-auto px-4 py-8 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
