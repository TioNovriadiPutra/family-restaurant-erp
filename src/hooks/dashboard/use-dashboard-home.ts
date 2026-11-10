import type { AuthSession } from "@/interfaces/auth";
import { getAccessView } from "@/controller/auth/access-view";
import { useDashboard } from "@/controller/dashboard/use-dashboard";
import { useErpUiState } from "@/stores/erp-ui-store";

export function useDashboardHome(session: AuthSession) {
  const selectedId = useErpUiState(state => state.selectedOutletId);
  const { selected, permissions } = getAccessView(session, selectedId);
  const query = useDashboard(selected?.outlet_id ?? null);
  return { query, outletName: selected?.outlet_name ?? "", permissions };
}
