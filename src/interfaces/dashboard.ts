import type { AuthSession } from "./auth";

export interface SalesPoint { day: string; revenue: string }
export interface TopMenu { name: string; quantity: string; revenue: string }
export interface Activity { id: string; action: string; entity_type: string; occurred_at: string; number: string | null }
export interface DashboardData {
  day: string;
  timezone: string;
  generated_at: string;
  revenue: string;
  paid_orders: number;
  open_orders: number;
  average_order: string;
  cost: string | null;
  gross_profit: string | null;
  low_stock: number;
  pending_counts: number;
  pending_edc: number;
  has_refunds: boolean;
  sales: SalesPoint[];
  top_menu: TopMenu[];
  activities: Activity[];
}
export interface MetricCardProps { label: string; value: string; detail: string; tone: string }
export interface DashboardViewProps { data: DashboardData; outletName: string; permissions: string[] }
export interface SalesChartProps { points: SalesPoint[] }
export interface DashboardHomeProps { session: AuthSession }
