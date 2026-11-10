export interface ErpUiState {
  selectedOutletId: string | null;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
}

export interface ErpUiActions {
  selectOutlet: (id: string) => void;
  toggleSidebar: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}
