import { createStore, useSelector } from "@tanstack/react-store";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ErpUiActions, ErpUiState } from "@/interfaces/erp-ui";

function createErpUiStore() {
  return createStore<ErpUiState>({
    selectedOutletId: null,
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
  });
}

export function rememberOutlet(outletId: string) {
  try { window.sessionStorage.setItem("erp.selectedOutletId", outletId); } catch { /* Optional preference. */ }
}

export function readRememberedOutlet() {
  try { return window.sessionStorage.getItem("erp.selectedOutletId"); } catch { return null; }
}

const ErpUiStoreContext = createContext<ReturnType<
  typeof createErpUiStore
> | null>(null);

export function ErpUiStoreProvider({ children }: { children: ReactNode }) {
  // Instance ownership prevents selected outlet/UI state leaking across SSR users.
  const [store] = useState(createErpUiStore);

  return (
    <ErpUiStoreContext.Provider value={store}>
      {children}
    </ErpUiStoreContext.Provider>
  );
}

export function useErpUiStore() {
  const store = useContext(ErpUiStoreContext);

  if (!store) {
    throw new Error("useErpUiStore harus dipakai di dalam ErpUiStoreProvider.");
  }

  return store;
}

export function useErpUiState<T>(selector: (state: ErpUiState) => T) {
  return useSelector(useErpUiStore(), selector);
}

export function useErpUiActions(): ErpUiActions {
  const store = useErpUiStore();
  return useMemo(() => ({
    selectOutlet: (id: string) => store.setState(state => ({ ...state, selectedOutletId: id })),
    toggleSidebar: () => store.setState(state => ({ ...state, sidebarCollapsed: !state.sidebarCollapsed })),
    toggleMobile: () => store.setState(state => ({ ...state, mobileSidebarOpen: !state.mobileSidebarOpen })),
    closeMobile: () => store.setState(state => ({ ...state, mobileSidebarOpen: false })),
  }), [store]);
}
