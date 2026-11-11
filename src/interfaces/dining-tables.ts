import type { AuthSession } from "./auth";
export interface DiningTable {
  id: string;
  code: string;
  seats: number;
  active: boolean;
  revision: number;
}
export interface TableValues {
  code: string;
  seats: number;
  active: boolean;
}
export interface TableWrite {
  outletId: string;
  requestId: string;
  data: TableValues & { id?: string; revision?: number };
}
export interface TablePageProps {
  session: AuthSession;
}
export interface TableWorkspaceProps {
  outletId: string;
  canManage: boolean;
}
export interface TableFormProps {
  outletId: string;
  table: DiningTable | null;
  onClose: () => void;
  onSaved: () => void;
}
export interface TableAttempt {
  signature: string;
  requestId: string;
}
