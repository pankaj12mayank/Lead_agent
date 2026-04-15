import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  CHART_AXIS,
  CHART_GRID,
  CHART_PIE,
  CHART_PURPLE,
  CHART_TICK,
  tooltipContentStyle,
  tooltipLabelStyle,
} from '@/lib/chartTheme'

type Datum = { name: string; value: number }

const chartClass = 'h-80 w-full rounded-2xl border border-surface-border bg-surface-card p-4 shadow-card lg:h-96'

export function PlatformBar({ data }: { data: Datum[] }) {
  return (
    <div className={chartClass}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
          <XAxis
            dataKey="name"
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
          <Bar dataKey="value" fill={CHART_PURPLE} radius={[8, 8, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function StatusPie({ data }: { data: Datum[] }) {
  return (
    <div className={chartClass}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={110}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_PIE[i % CHART_PIE.length]} stroke="transparent" />
            ))}
          </Pie>
          <Legend
            wrapperStyle={{ fontSize: 12, color: CHART_TICK }}
            formatter={(value) => <span className="text-zinc-400">{value}</span>}
          />
          <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
