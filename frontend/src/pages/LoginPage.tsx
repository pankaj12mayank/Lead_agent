import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { APP_NAME } from '@/lib/copy/appCopy'
import { fetchMe, login, register } from '@/lib/api/auth'
import { useAuthStore } from '@/store/authStore'

const LOGIN_DESC =
  'Sign in to manage leads, track outreach activity, review sales analytics, and organize your sales pipeline from one lead management workspace.'
const REGISTER_DESC =
  'Create your workspace to manage prospecting, lead scoring, outreach tracking, and sales performance in a single CRM platform.'

export function LoginPage() {
  const { token, setAuth } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    try {
      const n = sessionStorage.getItem('leadpilot_auth_notice')
      if (n) {
        setError(n)
        sessionStorage.removeItem('leadpilot_auth_notice')
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const pageTitle = mode === 'login' ? 'Sign In' : 'Create Account'
    document.title = `${pageTitle} | ${APP_NAME}`
    const el = document.querySelector('meta[name="description"]')
    if (el) {
      el.setAttribute('content', mode === 'login' ? LOGIN_DESC : REGISTER_DESC)
    }
  }, [mode])

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const data =
        mode === 'login'
          ? await login(email.trim(), password)
          : await register(email.trim(), password)
      const user = data.user ?? (await fetchMe())
      setAuth(data.access_token, user)
    } catch {
      setError(
        mode === 'login'
          ? 'Sign-in failed. Check your email and password, then try again.'
          : 'Registration could not be completed. Verify your details or contact your administrator.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4">
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-amber-500/15 blur-[120px] dark:bg-amber-400/10" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-600/10 blur-[100px] dark:bg-emerald-500/10" />

      <div className="absolute right-4 top-4 z-10 md:right-8 md:top-8">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-surface-border bg-premium-card-light/95 p-10 shadow-glow backdrop-blur-xl dark:bg-premium-card-dark/95">
        <div className="mb-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
          {APP_NAME}
        </div>
        <h1 className="font-display text-3xl font-bold tracking-display-tight text-ink sm:text-4xl">
          {mode === 'login' ? 'Access your lead management workspace' : 'Create your account'}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">
          {mode === 'login' ? LOGIN_DESC : REGISTER_DESC}
        </p>

        <div className="mt-8 flex gap-1 rounded-xl border border-surface-border bg-field/80 p-1 dark:bg-zinc-900/50">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white shadow-md ring-1 ring-amber-500/35 dark:from-amber-500 dark:via-amber-400 dark:to-amber-600 dark:shadow-glow-gold'
                : 'text-ink-muted hover:text-ink'
            }`}
            onClick={() => {
              setMode('login')
              setError(null)
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
              mode === 'register'
                ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white shadow-md ring-1 ring-amber-500/35 dark:from-amber-500 dark:via-amber-400 dark:to-amber-600 dark:shadow-glow-gold'
                : 'text-ink-muted hover:text-ink'
            }`}
            onClick={() => {
              setMode('register')
              setError(null)
            }}
          >
            Create Account
          </button>
        </div>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input mt-2"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input mt-2"
            />
            {mode === 'login' ? (
              <p className="mt-2 text-xs text-ink-subtle">
                Forgot your password? Contact your workspace administrator or use your organization reset workflow.
              </p>
            ) : null}
          </div>
          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Please wait' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          {mode === 'login' ? (
            <>
              Need an account?{' '}
              <button
                type="button"
                className="font-medium text-amber-800 underline-offset-4 hover:underline dark:text-amber-300"
                onClick={() => {
                  setMode('register')
                  setError(null)
                }}
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="font-medium text-amber-800 underline-offset-4 hover:underline dark:text-amber-300"
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
              >
                Sign In
              </button>
            </>
          )}
        </p>

      </div>
    </div>
  )
}
