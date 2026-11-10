import { httpClient } from "@/lib/http";
import { isAxiosError } from "axios";
import type { EmployeePinInput } from "@/interfaces/employees";
import type { EmployeeManagementInput, EmployeeDeleteInput } from "@/interfaces/employees";
import type { EmployeeCreateInput, EmployeeCreateResult, EmployeeDirectory, EmployeeFilters, EmployeeRole } from "@/interfaces/employees";

export async function getEmployees(filters: EmployeeFilters) {
  return (await httpClient.get<{ directory: EmployeeDirectory }>("/employees", { params: filters })).data;
}
export async function getEmployeeRoles(outletId: string) {
  return (await httpClient.get<{ roles: EmployeeRole[] }>("/employees", { params: { outletId, options: "1" } })).data;
}
export async function createEmployee(input: EmployeeCreateInput) {
  return (await httpClient.post<EmployeeCreateResult>("/employees", input)).data;
}

export async function setEmployeePin(input: EmployeePinInput) {
  try {
    return (await httpClient.post<{ message: string }>(`/employees/${input.employeeId}/pin`, {
      outletId: input.outletId, pin: input.pin, confirmation: input.confirmation, expectedConfigured: input.expectedConfigured,
    })).data;
  } catch (error) {
    // Do not retain Axios request config (which contains the PIN) in query error state.
    throw new Error(isAxiosError(error) ? error.response?.data?.message ?? "Koneksi terputus. Silakan coba lagi." : "PIN belum dapat disimpan.");
  } finally {
    input.pin = ""; input.confirmation = "";
  }
}

export async function manageEmployee({ employeeId, ...body }: EmployeeManagementInput | EmployeeDeleteInput) {
  return (await httpClient.post<{ message: string }>(`/employees/${employeeId}/manage`, body)).data;
}
