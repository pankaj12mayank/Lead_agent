import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  CHART_AXIS,
  CHART_COLD,
  CHART_GRID,
  CHART_HOT,
  CHART_TICK,
  CHART_WARM,
  tooltipContentStyle,
  tooltipLabelStyle,
} from '@/lib/chartTheme'

export type TierStackRow = { platform: string; hot: number; warm: number; cold: number }

const wrap = 'h-80 w-full rounded-2xl border border-surface-border bg-surface-card p-4 shadow-card lg:h-96'

export function StackedTierByPlatform({ data }: { data: TierStackRow[] }) {
  return (
    <div className={wrap}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
          <XAxis
            dataKey="platform"
            tick={{ fill: CHART_TICK, fontSize: 11 }}
            axisLine={{ stroke: CHART_AXIS }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: CHART_TICK, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => <span className="text-zinc-400 capitalize">{v}</span>} />
          <Bar dataKey="hot" stackId="t" fill={CHART_HOT} radius={[0, 0, 0, 0]} maxBarSize={44} />
          <Bar dataKey="warm" stackId="t" fill={CHART_WARM} maxBarSize={44} />
          <Bar dataKey="cold" stackId="t" fill={CHART_COLD} radius={[8, 8, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
