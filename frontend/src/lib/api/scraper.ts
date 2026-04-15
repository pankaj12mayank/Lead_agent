import { api } from './client'

export type ScraperStatus = {
  ok: boolean
  engine: string
  platforms: string[]
  delay_seconds_range: [number, number]
  max_leads_default: number
  max_leads_cap: number
}

export type SessionInfo = {
  platform: string
  has_session: boolean
  path: string
}

export type ScraperRunBody = {
  platform: string
  keyword: string
  country?: string
  industry?: string
  company_size?: string
  max_leads?: number
  headless?: boolean
  delay_min_seconds?: number
  delay_max_seconds?: number
  max_scroll_rounds?: number
}

export async function fetchScraperStatus() {
  const { data } = await api.get<ScraperStatus>('/scraper/status')
  return data
}

export async function fetchSession(platform: string) {
  const slug = encodeURIComponent(platform)
  const { data } = await api.get<SessionInfo>(`/scraper/sessions/${slug}`)
  return data
}

export async function runScraper(body: ScraperRunBody) {
  const { data } = await api.post<Record<string, unknown>>('/scraper/run', body)
  return data
}

export async function openManualLogin(platform: string, waitSeconds = 180) {
  const slug = encodeURIComponent(platform)
  const { data } = await api.post<{ ok: boolean }>(`/scraper/sessions/${slug}/manual-login`, {
    wait_seconds: waitSeconds,
  })
  return data
}
