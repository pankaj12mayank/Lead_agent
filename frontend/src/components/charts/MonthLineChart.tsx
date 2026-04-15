import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  CHART_AXIS,
  CHART_GRID,
  CHART_PURPLE,
  CHART_TICK,
  tooltipContentStyle,
  tooltipLabelStyle,
} from '@/lib/chartTheme'

export type MonthPoint = { month: string; count: number }

const wrap = 'h-80 w-full rounded-2xl border border-surface-border bg-surface-card p-4 shadow-card lg:h-96'

export function MonthLineChart({ data }: { data: MonthPoint[] }) {
  return (
    <div className={wrap}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
          <XAxis
            dataKey="month"
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
          <Line
            type="monotone"
            dataKey="count"
            stroke={CHART_PURPLE}
            strokeWidth={2.5}
            dot={{ fill: CHART_PURPLE, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: CHART_PURPLE }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
