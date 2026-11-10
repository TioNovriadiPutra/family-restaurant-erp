import { useEffect } from "react";
import { useRouter } from "next/router";
import { useErpUiState, useErpUiActions, readRememberedOutlet, rememberOutlet } from "@/stores/erp-ui-store";
import { useAuthSession, useLogout, authErrorMessage } from "@/controller/auth/use-auth";
import { erpNavigation } from "@/lib/erp-navigation";
import type { AuthSession } from "@/interfaces/auth";
import { getAccessView } from "@/controller/auth/access-view";

export function useErpLayout(initialSession: AuthSession) {
  const router = useRouter();
  const query = useAuthSession(initialSession);
  const logout = useLogout();
  const actions = useErpUiActions();
  const state = useErpUiState(value => value);
  const session = query.isError ? null : query.data ?? initialSession;
  const { access, selected, permissions, roles, outlets } = getAccessView(session, state.selectedOutletId);
  const items = erpNavigation.filter(item => !item.permission || permissions.includes(item.permission));
  const moduleSlug = typeof router.query.module === "string" ? router.query.module : router.pathname.split("/")[1];
  const current = erpNavigation.find(item => item.slug === moduleSlug);

  useEffect(() => {
    const saved = readRememberedOutlet();
    const chosen = initialSession.access.find(row => row.outlet_id === saved) ?? initialSession.access[0];
    actions.selectOutlet(chosen.outlet_id);
  }, [initialSession, actions]);

  useEffect(() => {
    actions.closeMobile();
  }, [router.asPath, actions]);

  function changeOutlet(id: string) {
    if (!access.some(row => row.outlet_id === id)) return;
    rememberOutlet(id);
    actions.selectOutlet(id);
  }

  return {
    session, selected, permissions, roles, outlets, items, state,
    activePath: router.asPath.split("?")[0],
    title: current?.label ?? "ERP",
    allowed: !current?.permission || permissions.includes(current.permission),
    changeOutlet,
    toggleSidebar: actions.toggleSidebar,
    toggleMobile: actions.toggleMobile,
    closeMobile: actions.closeMobile,
    logout: () => logout.mutate(),
    loggingOut: logout.isPending,
    error: query.error ? authErrorMessage(query.error) : logout.error ? authErrorMessage(logout.error) : null,
  };
}
