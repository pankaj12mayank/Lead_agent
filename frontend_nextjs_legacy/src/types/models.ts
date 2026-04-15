export type Lead = {
  lead_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  platform: string;
  profile_url: string;
  location: string;
  notes: string;
  subject: string;
  message: string;
  score: number;
  tier: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user?: User;
};

export type DashboardData = {
  total?: number;
  by_status?: Record<string, number>;
  by_platform?: Record<string, number>;
  total_leads?: number;
  hot_leads?: number;
  contacted_leads?: number;
  converted_leads?: number;
  conversion_rate_percent?: number;
  platform_distribution?: Record<string, number>;
  status_distribution?: Record<string, number>;
  recent_history_events?: number;
};

export type PlatformRow = {
  platform_id: number | null;
  slug: string;
  label: string;
  active: boolean;
  builtin: boolean;
  created_at: string | null;
};

export type PlatformIntegration = {
  authType: string;
  apiKey: string;
};
