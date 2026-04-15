import axios from 'axios'

import { useAuthStore } from '@/store/authStore'

/**
 * API origin: explicit ``VITE_API_URL``, else Vite dev proxy ``/api`` → FastAPI,
 * else production fallback (same host deployments can override at build time).
 */
function apiBaseURL(): string {
  const fromEnv = String(import.meta.env.VITE_API_URL ?? '')
    .trim()
    .replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (import.meta.env.DEV) return '/api'
  return 'http://127.0.0.1:8000'
}

export const api = axios.create({
  baseURL: apiBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 120_000,
})

api.interceptors.request.use((config) => {
  const t = useAuthStore.getState().token
  if (t) {
    config.headers.Authorization = `Bearer ${t}`
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      if (!window.location.pathname.startsWith('/login')) {
        try {
          sessionStorage.setItem(
            'leadpilot_auth_notice',
            'Session expired. Please sign in again to continue.',
          )
        } catch {
          /* ignore */
        }
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  },
)
