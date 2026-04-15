export type Lead = {
  id: string
  full_name: string
  title: string
  company_name: string
  company_website: string
  linkedin_url: string
  email: string
  phone: string
  company_size: string
  industry: string
  location: string
  source_platform: string
  notes: string
  score: number
  tier: string
  status: string
  personalized_message: string
  followup_message: string
  last_contacted_at: string
  follow_up_reminder_at: string
  created_at: string
  updated_at: string
}

export type User = {
  id: string
  email: string
  created_at: string
}

export type AuthResponse = {
  access_token: string
  token_type: string
  user?: User
}

export type DashboardData = {
  total?: number
  by_status?: Record<string, number>
  by_platform?: Record<string, number>
  total_leads?: number
  hot_leads?: number
  warm_leads?: number
  cold_leads?: number
  tier_distribution?: Record<string, number>
  contacted_leads?: number
  converted_leads?: number
  conversion_rate_percent?: number
  platform_distribution?: Record<string, number>
  status_distribution?: Record<string, number>
  recent_history_events?: number
}

export type PlatformRow = {
  platform_id: number | null
  slug: string
  label: string
  active: boolean
  builtin: boolean
  created_at: string | null
}

export type AppSettings = Record<string, unknown>
