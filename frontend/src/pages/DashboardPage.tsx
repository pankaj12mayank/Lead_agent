import { useEffect, useMemo, useState } from 'react'

import { PlatformBar, StatusPie } from '@/components/charts/DistributionCharts'
import { MonthLineChart, type MonthPoint } from '@/components/charts/MonthLineChart'
import { StackedTierByPlatform, type TierStackRow } from '@/components/charts/StackedTierByPlatform'
import { StatCard } from '@/components/dashboard/StatCard'
import { fetchDashboard } from '@/lib/api/analytics'
import { fetchAllLeads } from '@/lib/api/leads'
import type { DashboardData, Lead } from '@/types/models'

function aggregateFromLeads(leads: Lead[]) {
  const byMonth = new Map<string, number>()
  const stacked: Record<string, { hot: number; warm: number; cold: number }> = {}

  for (const l of leads) {
    const raw = l.created_at || ''
    const month = raw.length >= 7 ? raw.slice(0, 7) : 'unknown'
    byMonth.set(month, (byMonth.get(month) || 0) + 1)

    const p = (l.source_platform || 'unknown').trim() || 'unknown'
    if (!stacked[p]) stacked[p] = { hot: 0, warm: 0, cold: 0 }
    const t = (l.tier || '').toLowerCase()
    if (t === 'hot') stacked[p].hot += 1
    else if (t === 'warm') stacked[p].warm += 1
    else stacked[p].cold += 1
  }

  const monthData: MonthPoint[] = Array.from(byMonth.entries())
    .filter(([m]) => m !== 'unknown')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }))

  const stackData: TierStackRow[] = Object.entries(stacked).map(([platform, v]) => ({
    platform,
    ...v,
  }))

  return { monthData, stackData }
}

export function DashboardPage() {
  const [dash, setDash] = useState<DashboardData | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [d, ls] = await Promise.all([fetchDashboard(), fetchAllLeads()])
        if (!cancelled) {
          setDash(d)
          setLeads(ls)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const { monthData, stackData } = useMemo(() => aggregateFromLeads(leads), [leads])

  const plat = useMemo(() => {
    const raw = dash?.platform_distribution || dash?.by_platform || {}
    return Object.entries(raw).map(([name, value]) => ({ name, value: Number(value) }))
  }, [dash])

  const stat = useMemo(() => {
    const raw = dash?.status_distribution || dash?.by_status || {}
    return Object.entries(raw).map(([name, value]) => ({ name, value: Number(value) }))
  }, [dash])

  if (loading || !dash) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">
        Loading dashboard…
      </div>
    )
  }

  const total = dash.total_leads ?? dash.total ?? 0
  const conv = dash.conversion_rate_percent ?? 0

  return (
    <div className="mx-auto max-w-[1600px] space-y-10">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total leads" value={total} hint="All records in workspace" />
        <StatCard title="Hot leads" value={dash.hot_leads ?? 0} hint="Tier: hot" />
        <StatCard title="Contacted" value={dash.contacted_leads ?? 0} hint="Outreach logged" />
        <StatCard title="Converted" value={dash.converted_leads ?? 0} hint="Won / converted status" />
        <StatCard title="Conversion rate" value={`${conv}%`} hint="Converted ÷ total" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Leads by platform
          </h2>
          <PlatformBar data={plat.length ? plat : [{ name: '—', value: 0 }]} />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Leads by status
          </h2>
          <StatusPie data={stat.length ? stat : [{ name: '—', value: 1 }]} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Leads by month
          </h2>
          <MonthLineChart
            data={
              monthData.length
                ? monthData
                : [{ month: new Date().toISOString().slice(0, 7), count: 0 }]
            }
          />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Hot vs warm vs cold by platform
          </h2>
          <StackedTierByPlatform
            data={
              stackData.length
                ? stackData
                : [{ platform: '—', hot: 0, warm: 0, cold: 0 }]
            }
          />
        </div>
      </section>
    </div>
  )
}
