import { PageTitle } from "@/components/shared/page-heading";
import { authErrorMessage } from "@/controller/auth/use-auth";
import type { DashboardHomeProps } from "@/interfaces/dashboard";
import { useDashboardHome } from "@/hooks/dashboard/use-dashboard-home";
import { DashboardView } from "./dashboard-view";

export function DashboardHome({ session }: DashboardHomeProps) {
  const { query, outletName, permissions } = useDashboardHome(session);
  if (query.isError) return <div className="ui-card"><PageTitle>Ringkasan belum dapat dimuat</PageTitle><p className="ui-alert ui-alert-destructive mt-4" role="alert">{authErrorMessage(query.error)}</p><button type="button" className="ui-button ui-button-secondary mt-6" onClick={() => query.refetch()}>Coba lagi</button></div>;
  if (!query.data) return <div role="status" className="ui-card"><PageTitle>Ringkasan hari ini</PageTitle><p className="mt-4 text-muted-foreground">Memuat data outlet…</p></div>;
  return <DashboardView data={query.data} outletName={outletName} permissions={permissions} />;
}
