import type { UseFormReturn } from "react-hook-form";
import type { AuthSession } from "./auth";

export interface EmployeeRole { id: string; name: string }
export interface EmployeeRecord {
  id: string;
  employee_code: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  login_linked: boolean;
  pin_configured: boolean;
  pin_eligible: boolean;
  created_at: string;
  roles: EmployeeRole[];
}
export interface EmployeeView extends EmployeeRecord { roleLabel: string; statusLabel: string; loginLabel: string }
export interface EmployeeDirectory {
  items: EmployeeRecord[];
  total: number;
  page: number;
  page_size: number;
  roles: EmployeeRole[];
  summary: { total: number; active: number; inactive: number };
}
export interface EmployeeDirectoryView extends Omit<EmployeeDirectory, "items"> { items: EmployeeView[]; pages: number }
export interface EmployeeFilters { outletId: string; search: string; roleId: string; status: string; page: number }
export interface EmployeeCreateInput {
  outletId: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  active: boolean;
}
export interface EmployeeFormValues extends Omit<EmployeeCreateInput, "outletId" | "active"> { status: "active" | "inactive" }
export type EmployeeFieldErrors = Partial<Record<keyof EmployeeCreateInput, string>>;
export interface EmployeeApiError { message: string; fieldErrors?: EmployeeFieldErrors }
export type EmployeeValidation = { value: EmployeeCreateInput; errors?: never } | { errors: EmployeeFieldErrors; value?: never };
export interface EmployeesPageProps { session: AuthSession }
export interface EmployeesListProps { outletId: string; outletName: string; canCreate: boolean }
export interface EmployeeFormProps { outletId: string; outletName: string }
export interface EmployeeActionsProps { employee: EmployeeView; onSetPin: (employee: EmployeeView) => void; onEdit: (employee: EmployeeView) => void; onDelete: (employee: EmployeeView) => void }
export interface EmployeeTableProps extends Omit<EmployeeActionsProps, "employee"> { employees: EmployeeView[]; canManagePin: boolean }
export interface EmployeeCreateResult { employee: { id: string }; message: string }
export interface EmployeeCreateVariables { outletId: string; values: EmployeeFormValues }
export interface EmployeePinValues { pin: string; confirmation: string }
export interface EmployeePinInput extends EmployeePinValues { outletId: string; employeeId: string; expectedConfigured: boolean }
export interface EmployeePinDialogProps { employee: EmployeeView; outletId: string; onClose: () => void; onSaved: (message: string) => void }

export interface EmployeeManagementInput extends EmployeeCreateInput { employeeId: string; action: "edit"; changeRole: boolean }
export interface EmployeeDeleteInput { employeeId: string; outletId: string; action: "delete" }
export interface EmployeeManagementDialogProps { employee: EmployeeView; action: "edit" | "delete"; outletId: string; onClose: () => void; onSaved: (message: string) => void }

export interface EmployeeFieldsProps { form: UseFormReturn<EmployeeFormValues>; roles: EmployeeRole[]; disabled: boolean; roleDisabled: boolean; emailReadOnly?: boolean }
