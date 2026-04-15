import type { DashboardData } from "@/types/models";
import { api } from "./client";

export async function fetchDashboard() {
  const { data } = await api.get<DashboardData>("/analytics/dashboard");
  return data;
}
