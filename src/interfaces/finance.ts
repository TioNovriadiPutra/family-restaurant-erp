import type { AuthSession } from "./auth";
import type { PurchaseRecord } from "./purchasing";
export type FinanceView =
  | "movements"
  | "suppliers"
  | "reconciliations"
  | "journals"
  | "expenses";
export type FinanceAction =
  | "account"
  | "category"
  | "capital"
  | "transfer"
  | "expense"
  | "import"
  | "reconcile"
  | "pay";
export interface FinanceFilters {
  search: string;
  page: number;
  accountId: string;
  from: string;
  to: string;
  status: string;
}
export interface FinanceAccount {
  id: string;
  name: string;
  kind: string;
  mask: string | null;
  active: boolean;
  balance: string;
}
export interface FinanceOptions {
  accounts: FinanceAccount[];
  categories: { id: string; name: string }[];
  timezone: string;
}
export interface FinanceRecord {
  id: string;
  date: string;
  number: string;
  source?: string;
  account?: string;
  description?: string;
  reference?: string;
  amount?: string;
  debit?: string;
  credit?: string;
  category?: string;
  proof?: boolean;
  status?: string;
  bankCount?: number;
  bookCount?: number;
  difference?: string;
}
export interface FinanceList {
  items: FinanceRecord[];
  total: number;
  summary?: Record<string, string>;
}
export interface FinanceSupplierList {
  items: PurchaseRecord[];
  total: number;
  summary?: Record<string, string>;
}
export interface FinanceJournal extends FinanceRecord {
  lines: {
    id: string;
    code: string;
    name: string;
    debit: string;
    credit: string;
    memo: string | null;
  }[];
}
export interface FinanceMatchLine {
  id: string;
  date: string;
  reference: string;
  description: string;
  amount: string;
  remaining: string;
}
export interface FinanceMatchOptions {
  bank: FinanceMatchLine[];
  book: FinanceMatchLine[];
}
export interface FinanceImportLine {
  key: string;
  date: string;
  amount: string;
  reference: string;
  description: string;
}
export interface FinanceResult {
  id: string;
  added: number;
  skipped: number;
}
export interface FinanceCommand {
  outletId: string;
  action: FinanceAction;
  data: Record<string, unknown>;
  requestId: string;
}
export interface FinancePageProps {
  session: AuthSession;
  view: FinanceView;
}
export interface FinanceWorkspaceProps extends FinancePageProps {
  outletId: string;
  canManage: boolean;
  canPay: boolean;
}
export interface FinanceFormProps {
  outletId: string;
  options: FinanceOptions;
  onSaved: () => void;
  onCancel: () => void;
}
export interface FinanceQuickProps extends FinanceFormProps {
  action: "account" | "category" | "capital" | "transfer";
  account?: FinanceAccount;
}
export interface FinanceQuickValues {
  id?: string;
  name: string;
  kind: string;
  mask: string;
  accountId: string;
  toAccountId: string;
  amount: string;
  date: string;
  description: string;
}
export interface FinanceExpenseValues {
  accountId: string;
  categoryId: string;
  amount: string;
  date: string;
  description: string;
}
export interface FinanceReconcileValues {
  accountId: string;
  bank: { id: string; amount: string; selected: boolean }[];
  book: { id: string; amount: string; selected: boolean }[];
}
export interface FinanceImportValues {
  accountId: string;
  csv: string;
}
export interface FinanceEditorPageProps extends FinancePageProps {
  mode: "expense" | "import" | "reconcile";
}
export interface FinanceJournalProps {
  outletId: string;
  id: string;
  onClose: () => void;
}
export interface FinanceTableProps {
  view: FinanceView;
  items: FinanceRecord[];
  onJournal: (id: string) => void;
  onProof: (id: string) => void;
  proofPending: boolean;
}
export interface FinanceAllocationProps {
  name: "bank" | "book";
  title: string;
  items: FinanceMatchLine[];
  form: import("react-hook-form").UseFormReturn<FinanceReconcileValues>;
  disabled: boolean;
}

export type FinanceQuickMode = FinanceQuickProps["action"];
export interface FinanceSupplierProps {
  outletId: string;
  canPay: boolean;
  filters: FinanceFilters;
  onPage: (page: number) => void;
}

export interface FinanceEditorWorkspaceProps extends FinanceEditorPageProps {
  outletId: string;
}
