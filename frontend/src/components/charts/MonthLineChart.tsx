import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { tooltipLabelStyle as tooltipLabelStyleFn, tooltipStyles, useChartPalette } from '@/lib/chartTheme'

export type MonthPoint = { month: string; count: number }

const wrap =
  'h-80 w-full rounded-2xl border border-surface-border bg-premium-card-light p-4 shadow-card transition-colors dark:bg-premium-card-dark lg:h-96'

export function MonthLineChart({ data }: { data: MonthPoint[] }) {
  const p = useChartPalette()
  const tip = tooltipStyles(p)
  const tipLabel = tooltipLabelStyleFn(p)

  return (
    <div className={wrap}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: p.tick, fontSize: 11 }}
            axisLine={{ stroke: p.axis }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: p.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip contentStyle={tip} labelStyle={tipLabel} />
          <Line
            type="monotone"
            dataKey="count"
            stroke={p.linePrimary}
            strokeWidth={2.5}
            dot={{ fill: p.linePrimary, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: p.emerald }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
