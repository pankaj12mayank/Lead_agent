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
import {
  CHART_AXIS,
  CHART_GRID,
  CHART_GREEN,
  CHART_PURPLE,
  CHART_TICK,
  tooltipContentStyle,
  tooltipLabelStyle,
} from '@/lib/chartTheme'
import type { DashboardData } from '@/types/models'

const chartBox = 'h-80 w-full rounded-2xl border border-surface-border bg-surface-card p-4 shadow-card lg:h-96'

export function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

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
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">
        Loading analytics…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-10">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Conversion rate" value={`${data.conversion_rate_percent ?? 0}%`} hint="Converted ÷ total" />
        <StatCard title="Total leads" value={data.total_leads ?? data.total ?? 0} />
        <StatCard title="Hot leads" value={data.hot_leads ?? 0} />
        <StatCard title="Recent events (7d)" value={data.recent_history_events ?? 0} hint="History audit volume" />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Pipeline funnel</h2>
        <div className={chartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="stage" tick={{ fill: CHART_TICK, fontSize: 11 }} axisLine={{ stroke: CHART_AXIS }} tickLine={false} />
              <YAxis tick={{ fill: CHART_TICK, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
              <Bar dataKey="value" fill={CHART_PURPLE} radius={[8, 8, 0, 0]} maxBarSize={52} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Conversion signals</h2>
          <div className={chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversionSeries} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: CHART_TICK, fontSize: 11 }} axisLine={{ stroke: CHART_AXIS }} tickLine={false} />
                <YAxis tick={{ fill: CHART_TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
                <Line type="monotone" dataKey="value" stroke={CHART_GREEN} strokeWidth={2.5} dot={{ r: 4, fill: CHART_GREEN }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Outreach performance</h2>
          <div className={chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outreach} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: CHART_TICK, fontSize: 11 }} axisLine={{ stroke: CHART_AXIS }} tickLine={false} />
                <YAxis tick={{ fill: CHART_TICK, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="value" fill={CHART_PURPLE} name="Leads" radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Best platforms (volume)</h2>
        <div className={chartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={bestPlatform.length ? bestPlatform : [{ name: '—', value: 0 }]}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" tick={{ fill: CHART_TICK, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fill: CHART_TICK, fontSize: 11 }}
                axisLine={{ stroke: CHART_AXIS }}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
              <Bar dataKey="value" fill={CHART_PURPLE} radius={[0, 8, 8, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
