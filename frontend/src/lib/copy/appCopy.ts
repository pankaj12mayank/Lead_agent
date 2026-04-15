/**
 * Application copy: professional B2B SaaS tone, consistent terminology, SEO-oriented labels.
 * Do not import from API modules to avoid circular dependencies.
 */

export const APP_NAME = 'LeadPilot'

export const DEFAULT_META_DESCRIPTION =
  'LeadPilot is a lead management and sales CRM platform for prospecting, lead scoring, outreach tracking, sales analytics, and pipeline visibility. Built for sales teams, agencies, and growing businesses.'

export const ROUTE_META: Record<
  string,
  { title: string; subtitle: string; documentDescription?: string }
> = {
  '/dashboard': {
    title: 'Sales Performance Overview',
    subtitle:
      'Lead activity, pipeline health, and conversion signals across lead sources, lead scoring tiers, and sales outreach stages.',
    documentDescription:
      'CRM dashboard for sales performance, lead tracking, and sales pipeline visibility. Monitor customer acquisition metrics and lead management KPIs.',
  },
  '/search-leads': {
    title: 'Search Configuration',
    subtitle:
      'Run prospecting jobs against connected sources with delay and safety controls. Qualified rows appear in your prospect database for lead scoring and outreach.',
    documentDescription:
      'Lead generation software workflow for prospect database search, outreach automation preparation, and live scraping activity status.',
  },
  '/leads': {
    title: 'Contact and Lead Management',
    subtitle:
      'Filter your prospect database, update CRM pipeline status, capture notes, and export for sales analytics or sales outreach sequences.',
    documentDescription:
      'Lead tracking software and contact management for sales teams. Lead scoring, status updates, and conversion optimization in one table.',
  },
  '/platforms': {
    title: 'Connected Lead Sources',
    subtitle:
      'Session management per channel, platform access for scraping activity, and alignment with delay and safety defaults from workspace settings.',
    documentDescription:
      'Platform access and session management for lead sources, scraping activity, and secure prospecting connectors.',
  },
  '/analytics': {
    title: 'Sales Analytics',
    subtitle:
      'Conversion rate analysis, outreach performance trends, and source effectiveness for pipeline decisions and business intelligence.',
    documentDescription:
      'Sales analytics tools for conversion optimization, prospect engagement metrics, and closed deal performance reporting.',
  },
  '/settings': {
    title: 'Workspace Settings',
    subtitle:
      'AI message configuration, delay and safety defaults, export preferences, and workspace notes for administrators.',
    documentDescription:
      'Account settings and platform preferences for outreach automation, lead scoring context, and export pipeline configuration.',
  },
}

/** API status value to professional label (values unchanged for API compatibility) */
export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  replied: 'Replied',
  follow_up_sent: 'Follow-up sent',
  meeting_scheduled: 'Meeting scheduled',
  deal_discussion: 'Deal discussion',
  closed: 'Closed',
  rejected: 'Rejected',
  ready: 'Ready',
  converted: 'Converted',
}

export function leadStatusLabel(status: string): string {
  const k = (status || 'new').toLowerCase()
  return LEAD_STATUS_LABELS[k] ?? status.replace(/_/g, ' ')
}

/** Footer keyword links for internal discovery (same app routes) */
export const SEO_FOOTER_LINKS: ReadonlyArray<{ to: string; label: string }> = [
  { to: '/search-leads', label: 'Lead generation software' },
  { to: '/leads', label: 'Sales outreach platform' },
  { to: '/dashboard', label: 'CRM dashboard' },
  { to: '/leads', label: 'Lead tracking software' },
  { to: '/leads', label: 'Prospect database management' },
  { to: '/analytics', label: 'Sales analytics tools' },
  { to: '/dashboard', label: 'Customer acquisition platform' },
  { to: '/dashboard', label: 'Lead scoring system' },
  { to: '/search-leads', label: 'Sales workflow automation' },
  { to: '/analytics', label: 'Business growth tools' },
]
