"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/lib/api/analytics";
import { StatCard } from "@/components/dashboard/StatCard";
import { PlatformBar, StatusPie } from "@/components/charts/DistributionCharts";

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboard });

  if (isLoading || !data) {
    return <div className="text-sm text-zinc-500">Loading analytics…</div>;
  }

  const plat = Object.entries(data.platform_distribution || data.by_platform || {}).map(
    ([name, value]) => ({ name, value: Number(value) })
  );
  const stat = Object.entries(data.status_distribution || data.by_status || {}).map(
    ([name, value]) => ({ name, value: Number(value) })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500">Distributions and funnel metrics.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={data.total_leads ?? data.total ?? 0} />
        <StatCard title="Hot" value={data.hot_leads ?? 0} />
        <StatCard title="Contacted" value={data.contacted_leads ?? 0} />
        <StatCard title="Converted" value={data.converted_leads ?? 0} />
      </div>
      <StatCard
        title="Conversion rate"
        value={`${data.conversion_rate_percent ?? 0}%`}
        hint="Converted leads ÷ total leads"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-400">Platform distribution</h2>
          <PlatformBar data={plat.length ? plat : [{ name: "—", value: 0 }]} />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-400">Status distribution</h2>
          <StatusPie data={stat.length ? stat : [{ name: "—", value: 1 }]} />
        </div>
      </div>
    </div>
  );
}
