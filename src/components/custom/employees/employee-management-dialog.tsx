import type { EmployeeManagementDialogProps } from "@/interfaces/employees";
import { useEmployeeManagement } from "@/hooks/employees/use-employee-management";
import { employeeError } from "@/controller/employees/use-employees";
import { EmployeeFields } from "./employee-fields";

export function EmployeeManagementDialog(props: EmployeeManagementDialogProps) {
  const { employee, action } = props;
  const { form, roles, dialogRef, close, submit, pending } = useEmployeeManagement(props);
  const deleting = action === "delete";
  return <dialog ref={dialogRef} className="ui-dialog !m-auto" aria-labelledby="employee-manage-title" aria-describedby="employee-manage-description" onCancel={event => { event.preventDefault(); close(); }}>
    <h2 id="employee-manage-title" className="type-24-semibold">{deleting ? "Hapus karyawan?" : "Edit karyawan"}</h2>
    <p id="employee-manage-description" className="mt-2 text-muted-foreground">{employee.name} · {employee.employee_code}</p>
    <form method="post" noValidate onSubmit={submit} aria-busy={pending} className="mt-6 space-y-5">
      {deleting ? <p className="ui-alert ui-alert-warning">Profil, penugasan role, dan PIN karyawan akan dihapus. Profil yang sudah terhubung akun login atau memiliki riwayat terkait tidak dapat dihapus; gunakan status Nonaktif.</p> : <>
        <EmployeeFields form={form} roles={roles.data ?? []} disabled={pending} roleDisabled={pending || roles.isPending || roles.isError} emailReadOnly={employee.login_linked} />
        <p className="ui-help">ID karyawan tetap. Perubahan status berlaku untuk seluruh outlet karyawan ini. {employee.login_linked ? "Email akun login tidak diubah melalui form ini." : ""}</p>
        {employee.roles.length > 1 && <p className="ui-alert ui-alert-warning">Karyawan memiliki beberapa role. Jika pilihan role diganti, semua role pada outlet ini akan diganti dengan pilihan baru.</p>}
        {roles.isError && <p role="alert" className="ui-alert ui-alert-destructive">{employeeError(roles.error).message}</p>}
      </>}
      {form.formState.errors.root && <p role="alert" className="ui-alert ui-alert-destructive">{form.formState.errors.root.message}</p>}
      <div className="flex justify-between gap-3"><button type="button" disabled={pending} className="ui-button ui-button-secondary min-h-11" onClick={close}>Batal</button><button type="submit" disabled={pending || !deleting && (roles.isPending || roles.isError)} className={`ui-button ui-button-primary min-h-11 ${deleting ? "!bg-destructive !text-white" : ""}`}>{pending ? "Menyimpan…" : deleting ? "Hapus karyawan" : "Simpan perubahan"}</button></div>
    </form>
  </dialog>;
}
