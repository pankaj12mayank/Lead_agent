import { LogOut, Shield } from 'lucide-react'
import { Navigate, NavLink, Outlet } from 'react-router-dom'

import { useAdminStore } from '@/store/adminStore'
import { cn } from '@/lib/utils/cn'

export function AdminLayout() {
  const token = useAdminStore((s) => s.token)
  const logout = useAdminStore((s) => s.logout)

  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-surface-border bg-premium-card-light px-4 py-4 dark:bg-premium-card-dark">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-700 dark:text-amber-300" />
            <span className="font-display text-sm font-semibold tracking-tight">LeadPilot admin</span>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-1.5 font-medium transition',
                  isActive ? 'bg-amber-500/15 text-ink' : 'text-ink-muted hover:text-ink',
                )
              }
            >
              Overview
            </NavLink>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1 rounded-lg border border-surface-border px-3 py-1.5 text-ink-muted transition hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
