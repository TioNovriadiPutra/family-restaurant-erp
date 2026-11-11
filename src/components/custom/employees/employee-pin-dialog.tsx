import { SectionTitle } from '@/components/shared/page-heading';
import { InfoCircle } from "iconsax-reactjs";
import type { EmployeePinDialogProps } from "@/interfaces/employees";
import { useEmployeePin } from "@/hooks/employees/use-employee-pin";
import { validEmployeePin } from "@/lib/employee-pin-validation";
import { TextField } from "@/components/shared/text-field";

export function EmployeePinDialog(props: EmployeePinDialogProps) {
  const { employee } = props;
  const { form, dialogRef, close, submit, pending } = useEmployeePin(props);
  const { register, getValues, formState: { errors } } = form;
  const title = employee.pin_configured ? "Reset PIN kasir" : "Atur PIN kasir";
  return <dialog ref={dialogRef} className="ui-dialog !m-auto" aria-labelledby="employee-pin-title" aria-describedby="employee-pin-description"
    onCancel={event => { event.preventDefault(); close(); }}>
    <SectionTitle id="employee-pin-title" className="">{title}</SectionTitle>
    <p id="employee-pin-description" className="mt-2 text-muted-foreground">{employee.name} · {employee.employee_code}</p>
    <form method="post" onSubmit={submit} noValidate aria-busy={pending} className="mt-6 space-y-5 ui-form">
      <TextField required id="employee-pin" label="PIN baru (6 angka)" type="password" inputMode="numeric" autoComplete="new-password" maxLength={6} readOnly={pending}
        error={errors.pin?.message} {...register("pin", { required: "PIN wajib diisi.", validate: value => validEmployeePin(value) || "Gunakan 6 angka yang tidak berulang atau berurutan." })} />
      <TextField required id="employee-pin-confirmation" label="Konfirmasi PIN" type="password" inputMode="numeric" autoComplete="new-password" maxLength={6} readOnly={pending}
        error={errors.confirmation?.message} {...register("confirmation", { required: "Ulangi PIN baru.", validate: value => value === getValues("pin") || "Konfirmasi PIN tidak sama." })} />
      <p className="ui-help">Gunakan 6 angka; hindari angka berulang atau berurutan.</p>
      <div className={`ui-alert flex items-start gap-3 ${employee.pin_configured ? "ui-alert-warning" : "ui-alert-info"}`}><InfoCircle aria-hidden="true" size={20} className="shrink-0" /><p>{employee.pin_configured ? "PIN lama tidak dapat digunakan untuk login berikutnya setelah diganti. Sampaikan PIN baru langsung kepada karyawan." : "Sampaikan PIN langsung kepada karyawan. PIN yang disimpan tidak dapat dilihat kembali."}</p></div>
      {errors.root && <p role="alert" className="ui-alert ui-alert-destructive">{errors.root.message}</p>}
      <div className="flex justify-between gap-3"><button type="button" className="ui-button ui-button-secondary min-h-11" disabled={pending} onClick={close}>Batal</button><button type="submit" className="ui-button ui-button-primary min-h-11" disabled={pending}>{pending ? "Menyimpan PIN…" : employee.pin_configured ? "Ganti PIN" : "Simpan PIN"}</button></div>
      <p role="status" className="sr-only">{pending ? "Menyimpan PIN kasir…" : ""}</p>
    </form>
  </dialog>;
}
