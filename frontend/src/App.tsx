import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/layouts/AppShell'
import { useAuthStore } from '@/store/authStore'

const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const SearchLeadsPage = lazy(() => import('@/pages/SearchLeadsPage').then((m) => ({ default: m.SearchLeadsPage })))
const LeadsPage = lazy(() => import('@/pages/LeadsPage').then((m) => ({ default: m.LeadsPage })))
const PlatformsPage = lazy(() => import('@/pages/PlatformsPage').then((m) => ({ default: m.PlatformsPage })))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))

function PageFallback() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4">
      <div className="skeleton-shimmer h-12 max-w-md rounded-2xl" />
      <div className="skeleton-shimmer h-96 w-full rounded-2xl" />
    </div>
  )
}

function RequireAuth() {
  const token = useAuthStore((s) => s.token)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <AppShell />
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/search-leads" element={<SearchLeadsPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/platforms" element={<PlatformsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
