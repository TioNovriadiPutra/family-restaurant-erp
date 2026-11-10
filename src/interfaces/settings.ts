import type { AuthSession } from "./auth";
import type { DefaultValues, FieldValues } from "react-hook-form";
import type { RecipeCost } from "./recipes";
export type SettingsSection = "profile" | "menus" | "payments" | "access";
export type SettingsAction =
  | "profile"
  | "receipt"
  | "category"
  | "menu"
  | "price"
  | "payment"
  | "role"
  | "assignment";
export type SettingsModal =
  | "categories"
  | "category"
  | "price"
  | "history"
  | "payment"
  | "assignment";
export interface SettingsFilters {
  search: string;
  categoryId: string;
  status: string;
  page: number;
  id?: string;
}
export interface SettingsChoice {
  id: string;
  name: string;
}
export interface SettingsProfileForm {
  revision: number;
  restaurantName: string;
  outletName: string;
  address: string;
  phone: string;
  timezone: string;
  taxPercent: string;
  servicePercent: string;
  rounding: string;
}
export interface SettingsProfile extends SettingsProfileForm {
  currency: string;
  timezoneLocked: boolean;
  canRenameRestaurant: boolean;
  calculationOrder: string;
}
export interface SettingsReceiptForm {
  revision: number;
  header: string;
  footer: string;
  paperWidth: number;
  digitalEnabled: boolean;
  printerId: string;
}
export interface SettingsReceipt extends SettingsReceiptForm {
  printers: SettingsChoice[];
}
export interface SettingsCategoryForm {
  id?: string;
  revision?: number;
  name: string;
  kind: string;
  sortOrder: number;
  active: boolean;
  visible: boolean;
}
export interface SettingsCategory extends SettingsCategoryForm {
  id: string;
  revision: number;
}
export interface SettingsOptions {
  categories: SettingsCategory[];
  recipes: SettingsChoice[];
  canLinkRecipe: boolean;
  canReadCost: boolean;
}
export interface SettingsMenuForm {
  id?: string;
  revision?: number;
  name: string;
  categoryId: string;
  description: string;
  allergens: string;
  price: string;
  active: boolean;
  available: boolean;
  recipeId: string;
  portions: string;
  taxExempt: boolean;
  serviceExempt: boolean;
}
export interface SettingsPrice {
  id: string;
  amount: string;
  valid_from: string;
  valid_to: string | null;
  reason: string;
  cancelled_at: string | null;
}
export interface SettingsMenu
  extends Omit<SettingsMenuForm, "id" | "revision" | "price"> {
  id: string;
  revision: number;
  price: string | null;
  code: string;
  category: string;
  categoryStatus: string;
  categoryVisible: boolean;
  recipeName: string | null;
  outletMenuId: string;
  cost: RecipeCost | null;
  prices: SettingsPrice[];
}
export interface SettingsMenuList {
  items: SettingsMenu[];
  total: number;
}
export interface SettingsPriceForm {
  id: string;
  revision: number;
  amount: string;
  effectiveFrom: string;
  reason: string;
}
export interface SettingsPaymentForm {
  id?: string;
  revision?: number;
  name: string;
  kind: string;
  provider: string;
  merchantScope: string;
  accountId: string;
  active: boolean;
}
export interface SettingsPayment extends SettingsPaymentForm {
  id: string;
  revision: number;
  clearingAccount: string;
  approval: boolean;
  used: boolean;
}
export interface SettingsPayments {
  items: SettingsPayment[];
  accounts: SettingsChoice[];
}
export interface SettingsRole {
  id: string;
  name: string;
  revision: number;
  discountPercent: string;
  permissions: string[];
}
export interface SettingsPermission {
  code: string;
  description: string;
}
export interface SettingsEmployee {
  id: string;
  name: string;
  code: string;
  active: boolean;
  roleIds: string[];
}
export interface SettingsAccess {
  actorId: string;
  canReadStaff: boolean;
  roles: SettingsRole[];
  permissions: SettingsPermission[];
  employees: SettingsEmployee[];
}
export interface SettingsRoleForm {
  id: string;
  revision: number;
  discountPercent: string;
  permissions: string[];
}
export interface SettingsAssignmentForm {
  employeeId: string;
  roleId: string;
  expectedRoles: string[];
}
export interface SettingsCommand {
  outletId: string;
  action: SettingsAction;
  data: Record<string, unknown>;
  requestId: string;
}
export interface SettingsPageProps {
  session: AuthSession;
  view: SettingsSection;
}
export interface SettingsWorkspaceProps extends SettingsPageProps {
  outletId: string;
  canManage: boolean;
  canAssign: boolean;
}
export interface SettingsFormBase {
  outletId: string;
  onSaved: () => void;
  onCancel: () => void;
}
export interface SettingsFormHookProps<T extends FieldValues>
  extends SettingsFormBase {
  action: SettingsAction;
  defaults: DefaultValues<T>;
  map?: (values: T) => Record<string, unknown>;
}
export interface SettingsProfileProps extends SettingsFormBase {
  data: SettingsProfile;
}
export interface SettingsReceiptProps extends SettingsFormBase {
  data: SettingsReceipt;
}
export interface SettingsMenuProps extends SettingsFormBase {
  options: SettingsOptions;
  menu?: SettingsMenu;
}
export interface SettingsCategoryProps extends SettingsFormBase {
  category?: SettingsCategory;
}
export interface SettingsPaymentProps extends SettingsFormBase {
  options: SettingsPayments;
  method?: SettingsPayment;
}
export interface SettingsPriceProps extends SettingsFormBase {
  menu: SettingsMenu;
}
export interface SettingsRoleProps extends SettingsFormBase {
  role: SettingsRole;
  permissions: SettingsPermission[];
}
export interface SettingsAssignmentProps extends SettingsFormBase {
  employee: SettingsEmployee;
  roles: SettingsRole[];
}
export interface SettingsEditorProps extends SettingsPageProps {
  mode: "profile" | "menu" | "receipt" | "role";
}
export interface SettingsEditorWorkspaceProps extends SettingsEditorProps {
  outletId: string;
}
export interface SettingsCategoryListProps {
  items: SettingsCategory[];
  onEdit: (category?: SettingsCategory) => void;
  onClose: () => void;
  canManage: boolean;
}
export interface SettingsMenuTableProps {
  items: SettingsMenu[];
  canManage: boolean;
  onEdit: (id: string) => void;
  onPrice: (menu: SettingsMenu) => void;
  onHistory: (menu: SettingsMenu) => void;
}
