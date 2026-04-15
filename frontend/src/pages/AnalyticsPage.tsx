import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { StatCard } from '@/components/dashboard/StatCard'
import { fetchDashboard } from '@/lib/api/analytics'
import { tooltipLabelStyle, tooltipStyles, useChartPalette } from '@/lib/chartTheme'
import type { DashboardData } from '@/types/models'

const chartBox =
  'h-80 w-full rounded-2xl border border-surface-border bg-premium-card-light p-4 shadow-card transition-colors dark:bg-premium-card-dark lg:h-96'

export function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const p = useChartPalette()
  const tip = tooltipStyles(p)
  const tipLabel = tooltipLabelStyle(p)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const d = await fetchDashboard()
        if (!cancelled) setData(d)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const funnel = useMemo(() => {
    if (!data) return []
    const total = data.total_leads ?? data.total ?? 0
    return [
      { stage: 'Total', value: total },
      { stage: 'Hot', value: data.hot_leads ?? 0 },
      { stage: 'Warm', value: data.warm_leads ?? 0 },
      { stage: 'Cold', value: data.cold_leads ?? 0 },
      { stage: 'Contacted', value: data.contacted_leads ?? 0 },
      { stage: 'Converted', value: data.converted_leads ?? 0 },
    ]
  }, [data])

  const conversionSeries = useMemo(() => {
    if (!data) return []
    const total = data.total_leads ?? data.total ?? 0
    const conv = data.conversion_rate_percent ?? 0
    const hotRate = total ? ((data.hot_leads ?? 0) / total) * 100 : 0
    const contactedRate = total ? ((data.contacted_leads ?? 0) / total) * 100 : 0
    return [
      { name: 'Hot %', value: Math.round(hotRate * 10) / 10 },
      { name: 'Contacted %', value: Math.round(contactedRate * 10) / 10 },
      { name: 'Converted %', value: conv },
    ]
  }, [data])

  const outreach = useMemo(() => {
    if (!data) return []
    const st = data.status_distribution || data.by_status || {}
    const newC = Number(st.new ?? st.New ?? 0) || 0
    const ready = Number(st.ready ?? st.Ready ?? 0) || 0
    const contacted = data.contacted_leads ?? 0
    const converted = data.converted_leads ?? 0
    return [
      { name: 'New', value: newC },
      { name: 'Ready', value: ready },
      { name: 'Contacted', value: contacted },
      { name: 'Converted', value: converted },
    ]
  }, [data])

  const bestPlatform = useMemo(() => {
    if (!data) return []
    const raw = data.platform_distribution || data.by_platform || {}
    return Object.entries(raw)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [data])

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-shimmer h-28 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton-shimmer h-96 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-10">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Conversion rate analysis"
          value={`${data.conversion_rate_percent ?? 0}%`}
          hint="Share of leads marked converted for conversion optimization reporting."
        />
        <StatCard
          title="Prospect database volume"
          value={data.total_leads ?? data.total ?? 0}
          hint="Total records available for lead tracking and sales pipeline review."
        />
        <StatCard
          title="Qualified high-intent leads"
          value={data.hot_leads ?? 0}
          hint="Top lead scoring tier for prioritized sales outreach."
        />
        <StatCard
          title="Recent workspace events"
          value={data.recent_history_events ?? 0}
          hint="Seven-day audit volume across lead management activity."
        />
      </section>

      <section>
        <h2 className="type-section-heading">Conversion funnel</h2>
        <p className="mb-3 text-xs text-ink-muted">
          Stage counts from total pipeline through contacted and converted for sales workflow visibility.
        </p>
        <div className={chartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
              <XAxis
                dataKey="stage"
                tick={{ fill: p.tick, fontSize: 11 }}
                axisLine={{ stroke: p.axis }}
                tickLine={false}
              />
              <YAxis tick={{ fill: p.tick, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tip} labelStyle={tipLabel} />
              <Bar dataKey="value" fill={p.barPrimary} radius={[8, 8, 0, 0]} maxBarSize={52} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="type-section-heading">Conversion rate analysis</h2>
          <p className="mb-3 text-xs text-ink-muted">
            Indexed conversion signals as a percentage of the prospect database for executive reporting.
          </p>
          <div className={chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversionSeries} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: p.tick, fontSize: 11 }} axisLine={{ stroke: p.axis }} tickLine={false} />
                <YAxis tick={{ fill: p.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tip} labelStyle={tipLabel} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={p.emerald}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: p.emerald }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h2 className="type-section-heading">Outreach performance trends</h2>
          <p className="mb-3 text-xs text-ink-muted">
            Prospect engagement metrics by pipeline stage to align outreach automation with outcomes.
          </p>
          <div className={chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outreach} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: p.tick, fontSize: 11 }} axisLine={{ stroke: p.axis }} tickLine={false} />
                <YAxis tick={{ fill: p.tick, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tip} labelStyle={tipLabel} />
                <Legend wrapperStyle={{ fontSize: 12, color: p.tick }} />
                <Bar dataKey="value" fill={p.linePrimary} name="Lead count" radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section>
        <h2 className="type-section-heading">Source platform effectiveness</h2>
        <p className="mb-3 text-xs text-ink-muted">
          Lead volume by source platform to compare prospecting yield and contact management inputs.
        </p>
        <div className={chartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={bestPlatform.length ? bestPlatform : [{ name: '—', value: 0 }]}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={p.grid} horizontal={false} />
              <XAxis type="number" tick={{ fill: p.tick, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fill: p.tick, fontSize: 11 }}
                axisLine={{ stroke: p.axis }}
                tickLine={false}
              />
              <Tooltip contentStyle={tip} labelStyle={tipLabel} />
              <Bar dataKey="value" fill={p.barPrimary} radius={[0, 8, 8, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
