import type { AuthSession } from "@/interfaces/auth";
import { getAccessView } from "@/controller/auth/access-view";
import { useAuthSession } from "@/controller/auth/use-auth";
import { moduleMenus } from "@/lib/module-menu";
import { useErpUiState } from "@/stores/erp-ui-store";

export function useModuleMenu(moduleSlug: string, initialSession: AuthSession) {
  const auth = useAuthSession(initialSession);
  const outletId = useErpUiState(state => state.selectedOutletId);
  const { selected, permissions } = getAccessView(auth.data ?? initialSession, outletId);
  const definition = moduleMenus[moduleSlug];
  const sections = definition?.sections.filter(section => !section.permission || permissions.includes(section.permission)) ?? [];
  return { definition, sections, outletName: selected?.outlet_name ?? "" };
}
