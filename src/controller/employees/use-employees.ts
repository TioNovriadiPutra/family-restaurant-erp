import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { createEmployee, getEmployeeRoles, getEmployees } from "@/services/employees.service";
import { getAccessView } from "@/controller/auth/access-view";
import type { AuthSession } from "@/interfaces/auth";
import type { EmployeeApiError, EmployeeCreateVariables, EmployeeDirectoryView, EmployeeFilters } from "@/interfaces/employees";
import type { EmployeePinInput } from "@/interfaces/employees";
import { setEmployeePin } from "@/services/employees.service";
import { manageEmployee } from "@/services/employees.service";
import type { EmployeeManagementInput, EmployeeDeleteInput } from "@/interfaces/employees";

export function employeeAccess(session: AuthSession, outletId: string | null) {
  const view = getAccessView(session, outletId);
  const canRead = ["staff.read", "rbac.read"].every(code => view.permissions.includes(code));
  const canCreate = canRead && ["staff.manage", "rbac.manage"].every(code => view.permissions.includes(code));
  return { ...view, canRead, canCreate };
}

export function employeeError(error: unknown): EmployeeApiError {
  if (isAxiosError<EmployeeApiError>(error)) {
    return { message: error.response?.data?.message ?? "Koneksi terputus. Periksa jaringan lalu coba lagi.", fieldErrors: error.response?.data?.fieldErrors };
  }
  return { message: "Data karyawan belum dapat diproses. Silakan coba lagi." };
}

export function useEmployees(filters: EmployeeFilters) {
  return useQuery({
    queryKey: ["employees", filters.outletId, filters.search, filters.roleId, filters.status, filters.page],
    queryFn: () => getEmployees(filters),
    select: ({ directory }): EmployeeDirectoryView => ({
      ...directory,
      pages: Math.max(1, Math.ceil(directory.total / directory.page_size)),
      items: directory.items.map(item => ({ ...item, roleLabel: item.roles.map(role => role.name).join(", "), statusLabel: item.active ? "Aktif" : "Nonaktif", loginLabel: item.login_linked ? "Terhubung" : "Belum terhubung" })),
    }),
    enabled: Boolean(filters.outletId), staleTime: 30_000, retry: false,
  });
}
export function useEmployeeRoles(outletId: string) {
  return useQuery({ queryKey: ["employeeRoles", outletId], queryFn: () => getEmployeeRoles(outletId), select: response => response.roles, enabled: Boolean(outletId), staleTime: 60_000, retry: false });
}
export function useCreateEmployee() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({ outletId, values }: EmployeeCreateVariables) => createEmployee({
      outletId, name: values.name.trim(),
      email: values.email.trim().toLowerCase(), phone: values.phone.trim(), roleId: values.roleId, active: values.status === "active",
    }),
    retry: false,
    async onSuccess(_, variables) {
      await Promise.all([
        cache.invalidateQueries({ queryKey: ["employees", variables.outletId] }),
        cache.invalidateQueries({ queryKey: ["dashboard", variables.outletId] }),
      ]);
    },
  });
}

export function useSetEmployeePin() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: EmployeePinInput) => setEmployeePin(input), retry: false, gcTime: 0,
    onSuccess(_, input) { void cache.invalidateQueries({ queryKey: ["employees", input.outletId] }); },
  });
}

export function useManageEmployee() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: EmployeeManagementInput | EmployeeDeleteInput) => manageEmployee(input), retry: false,
    onSuccess(_, input) { void cache.invalidateQueries({ queryKey: ["employees", input.outletId] }); void cache.invalidateQueries({ queryKey: ["auth", "session"] }); },
  });
}
