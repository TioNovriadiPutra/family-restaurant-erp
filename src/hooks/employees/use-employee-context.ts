import type { AuthSession } from "@/interfaces/auth";
import { useAuthSession } from "@/controller/auth/use-auth";
import { employeeAccess } from "@/controller/employees/use-employees";
import { useErpUiState } from "@/stores/erp-ui-store";

export function useEmployeeContext(initialSession: AuthSession) {
  const auth = useAuthSession(initialSession);
  const outletId = useErpUiState(state => state.selectedOutletId);
  return employeeAccess(auth.data ?? initialSession, outletId);
}
