import type { EmployeeView } from "@/interfaces/employees";
import { useEffect, useState } from "react";
import { useEmployeeRoles, useEmployees } from "@/controller/employees/use-employees";

export function useEmployeeList(outletId: string) {
  const [editingEmployee, setEditingEmployee] = useState<EmployeeView | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeView | null>(null);
  const [pinEmployee, setPinEmployee] = useState<EmployeeView | null>(null);
  const [pinNotice, setPinNotice] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const query = useEmployees({ outletId, search: debouncedSearch, roleId, status, page });
  const roles = useEmployeeRoles(outletId);
  return {
    editingEmployee, deletingEmployee, openEdit(employee: EmployeeView) { setPinNotice(""); setEditingEmployee(employee); }, closeEdit() { setEditingEmployee(null); }, openDelete(employee: EmployeeView) { setPinNotice(""); setDeletingEmployee(employee); }, closeDelete() { setDeletingEmployee(null); },
    pinEmployee, pinNotice, openPin(employee: EmployeeView) { setPinNotice(""); setPinEmployee(employee); }, closePin() { setPinEmployee(null); }, pinSaved(message: string) { setPinNotice(message); },
    search, roleId, status, query, roles,
    searching: search !== debouncedSearch,
    changeSearch(value: string) { setSearch(value); setPage(1); },
    changeRole(value: string) { setRoleId(value); setPage(1); },
    changeStatus(value: string) { setStatus(value); setPage(1); },
    previous() { setPage(Math.max(1, (query.data?.page ?? page) - 1)); },
    next() { setPage((query.data?.page ?? page) + 1); },
    resetFilters() { setSearch(""); setRoleId(""); setStatus("all"); setPage(1); },
  };
}
