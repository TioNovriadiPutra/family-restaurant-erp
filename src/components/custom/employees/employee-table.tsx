import { DataTable, DataTableHead } from '@/components/shared/data-table';
import { SectionTitle } from '@/components/shared/page-heading';
import { EmployeeActions } from "./employee-actions";
import { People } from "iconsax-reactjs";
import type { EmployeeTableProps } from "@/interfaces/employees";

export function EmployeeTable({ employees, canManagePin, onSetPin, onEdit, onDelete }: EmployeeTableProps) {
  return <>
    <div className="ui-table-container hidden md:block">
      <DataTable className="min-w-[760px]">
        <caption className="sr-only">Daftar profil karyawan pada outlet aktif</caption>
        <thead><tr><DataTableHead scope="col">ID</DataTableHead><DataTableHead scope="col">Nama karyawan</DataTableHead><DataTableHead scope="col">Email</DataTableHead><DataTableHead scope="col">Role</DataTableHead><DataTableHead scope="col">Status</DataTableHead><DataTableHead scope="col">Akun ERP</DataTableHead>{canManagePin && <DataTableHead scope="col" className="text-right">Aksi</DataTableHead>}</tr></thead>
        <tbody>{employees.map(employee => <tr key={employee.id}>
          <td className="whitespace-nowrap font-medium">{employee.employee_code}</td>
          <th scope="row" className="!text-foreground">{employee.name}{employee.roles.some(role => role.name === "Kasir") && <p className="mt-1 type-13-regular font-normal text-muted-foreground">{employee.pin_configured ? "PIN sudah diatur" : "PIN belum diatur"}</p>}</th>
          <td className="break-all">{employee.email}</td><td>{employee.roleLabel}</td>
          <td><span className={`ui-badge ${employee.active ? "ui-badge-success" : "ui-badge-neutral"}`}>{employee.statusLabel}</span></td>
          <td className="type-13-regular text-muted-foreground">{employee.loginLabel}</td>
          {canManagePin && <td className="text-right"><EmployeeActions employee={employee} onSetPin={onSetPin} onEdit={onEdit} onDelete={onDelete} /></td>}
        </tr>)}</tbody>
      </DataTable>
    </div>
    <div className="grid gap-4 md:hidden">
      {employees.map(employee => <article className="ui-card" key={employee.id}>
        <div className="flex items-start justify-between gap-4"><SectionTitle className="">{employee.name}</SectionTitle><span className={`ui-badge shrink-0 ${employee.active ? "ui-badge-success" : "ui-badge-neutral"}`}>{employee.statusLabel}</span></div>
        <p className="mt-2 type-13-regular text-muted-foreground">{employee.employee_code}</p>
        <p className="mt-4 flex items-center gap-2 type-14-regular"><People size={18} aria-hidden="true" />{employee.roleLabel}</p>
        <p className="mt-2 break-all type-14-regular">{employee.email}</p>
        {employee.phone && <p className="mt-2 type-14-regular text-muted-foreground">{employee.phone}</p>}
        <p className="mt-4 border-t border-border pt-3 type-13-regular text-muted-foreground">Akun ERP: {employee.loginLabel}</p>
        {employee.roles.some(role => role.name === "Kasir") && <p className="mt-2 type-13-regular text-muted-foreground">PIN POS: {employee.pin_configured ? "Sudah diatur" : "Belum diatur"}</p>}
        {canManagePin && <div className="mt-3 flex justify-end"><EmployeeActions employee={employee} onSetPin={onSetPin} onEdit={onEdit} onDelete={onDelete} /></div>}
      </article>)}
    </div>
  </>;
}
