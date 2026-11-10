import type { DashboardData } from "@/interfaces/dashboard";
import { httpClient } from "@/lib/http";

export async function getDashboard(outletId: string) {
  return (await httpClient.get<{ dashboard: DashboardData }>("/dashboard", { params: { outletId } })).data;
}
