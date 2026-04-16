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
  /** True when login verified (not only profile files on disk). */
  has_session: boolean
  has_profile?: boolean
  connected?: boolean
  path: string
}

/** POST /scraper/run body (sync or async). */
export type ScraperRunPayload = {
  platform: string
  keyword: string
  country?: string
  industry?: string
  company_size?: string
  max_leads?: number
  /** Alias for max_leads (backend merges via model_validator). */
  lead_limit?: number
  headless?: boolean
  delay_min_seconds?: number
  delay_max_seconds?: number
  max_scroll_rounds?: number
  async_job?: boolean
  /** LinkedIn: open profiles to read public mailto/tel (slower; capped by server). */
  profile_contact_enrich?: boolean
}

export type ScraperRunSyncResult = {
  success: boolean
  platform: string
  total_found: number
  saved: number
  duplicates_removed: number
  csv_file: string | null
  run_id?: string
  errors?: string[]
}

export type AsyncJobAccepted = {
  accepted: boolean
  job_id: string
  poll_url: string
  platform: string
  keyword: string
}

export type ScraperJobStatus = {
  job_id: string
  platform: string
  phase: string
  message: string
  page: number
  leads_found: number
  leads_target: number
  duplicates_removed: number
  max_scroll_rounds?: number
  delay_avg_seconds?: number
  started_at: number
  updated_at: number
  messages: string[]
  preview: Array<Record<string, unknown>>
  completed: boolean
  error: string | null
  result: Record<string, unknown> | null
  eta_seconds: number | null
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

/** Synchronous scrape (blocks until finished). */
export async function runScraper(body: ScraperRunPayload) {
  const { data } = await api.post<ScraperRunSyncResult | AsyncJobAccepted>('/scraper/run', {
    ...body,
    async_job: false,
  })
  return data
}

/** Starts background job; poll with ``fetchScraperJob``. */
export async function startScraperJob(body: ScraperRunPayload) {
  const res = await api.post<AsyncJobAccepted>('/scraper/run', { ...body, async_job: true }, {
    validateStatus: (status) => status === 202 || status === 400 || status === 404 || status === 422,
  })
  if (res.status !== 202) {
    const raw = res.data as { detail?: unknown }
    const detail = raw?.detail
    const msg =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => (typeof d === 'object' && d && 'msg' in d ? String((d as { msg: string }).msg) : String(d))).join('; ')
          : 'Request failed'
    throw new Error(msg)
  }
  return res.data
}

export async function fetchScraperJob(jobId: string) {
  const { data } = await api.get<ScraperJobStatus>(`/scraper/jobs/${encodeURIComponent(jobId)}`)
  return data
}

export async function openManualLogin(platform: string, waitSeconds = 180) {
  const slug = encodeURIComponent(platform)
  const { data } = await api.post<{ ok: boolean }>(`/scraper/sessions/${slug}/manual-login`, {
    wait_seconds: waitSeconds,
  })
  return data
}

export async function verifyAllSessions() {
  const { data } = await api.post<{
    ok: boolean
    results: Record<string, { connected: boolean; has_profile: boolean }>
  }>('/scraper/sessions/verify-all')
  return data
}
