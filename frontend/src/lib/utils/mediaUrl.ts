import { getApiBaseURL } from '@/lib/api/client'

/** Turn API-relative paths (e.g. ``/branding/logo.png``) into a full URL for ``<img src>`` / favicon. */
export function resolveMediaUrl(pathOrUrl: string): string {
  const u = (pathOrUrl || '').trim()
  if (!u) return ''
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  const base = getApiBaseURL().replace(/\/$/, '')
  const path = u.startsWith('/') ? u : `/${u}`
  return `${base}${path}`
}
