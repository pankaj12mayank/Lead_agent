import { useState } from 'react'
import { Navigate } from 'react-router-dom'

import { fetchMe, login, register } from '@/lib/api/auth'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const { token, setAuth } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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
      setError(mode === 'login' ? 'Invalid email or password.' : 'Could not register.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-violet-900/30 blur-[100px]" />

      <div className="relative w-full max-w-md rounded-2xl border border-surface-border bg-surface-card/90 p-10 shadow-glow backdrop-blur-md">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Lead Intelligence</div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-500">Sign in to your dark workspace.</p>

        <div className="mt-8 flex gap-1 rounded-xl border border-surface-border bg-black/40 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
              mode === 'login' ? 'bg-accent text-black shadow-glow' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            onClick={() => setMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
              mode === 'register' ? 'bg-accent text-black shadow-glow' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-surface-border bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor="password">
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
              className="mt-2 w-full rounded-xl border border-surface-border bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/50"
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-black shadow-glow transition hover:bg-accent-muted disabled:opacity-50"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
