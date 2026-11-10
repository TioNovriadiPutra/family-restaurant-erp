import { PhoneField } from "@/components/shared/phone-field";
import { RequiredMark } from "@/components/shared/required-mark";
import { phoneValidationMessage } from "@/lib/phone-validation";
import type { EmployeeFieldsProps } from "@/interfaces/employees";
import { employeeEmailPattern, validEmployeePhone } from "@/lib/employees-validation";
import { TextField } from "@/components/shared/text-field";
import { FormSelect } from "@/components/shared/form-select";

export function EmployeeFields({ form, roles, disabled, roleDisabled, emailReadOnly = false }: EmployeeFieldsProps) {
  const { register, formState: { errors } } = form;
  return <div className="grid items-start gap-4 sm:grid-cols-2">
        <TextField required id="employee-name" label="Nama karyawan" autoComplete="name" maxLength={120} readOnly={disabled} error={errors.name?.message} {...register("name", { required: "Nama karyawan wajib diisi.", validate: value => value.trim().length >= 2 || "Nama minimal 2 karakter." })} />
        <TextField required id="employee-email" label="Email" type="email" autoComplete="email" maxLength={254} readOnly={disabled || emailReadOnly} error={errors.email?.message} {...register("email", { required: "Email wajib diisi.", setValueAs: value => String(value).trim(), pattern: { value: employeeEmailPattern, message: "Masukkan email yang valid." } })} />
        <PhoneField id="employee-phone" label="Nomor HP (opsional)" type="tel" autoComplete="tel" readOnly={disabled} error={errors.phone?.message} {...register("phone", { validate: value => validEmployeePhone(value.trim()) || phoneValidationMessage })} />
        <div className="ui-field"><label htmlFor="employee-role" className="ui-label">Role<RequiredMark /></label><FormSelect id="employee-role" className="max-sm:min-h-12" disabled={roleDisabled} aria-invalid={Boolean(errors.roleId)} aria-describedby={errors.roleId ? "employee-role-error" : undefined} control={form.control} name="roleId" required><option value="">Pilih role</option>{roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</FormSelect>{errors.roleId && <p id="employee-role-error" className="ui-field-error" role="alert">{errors.roleId.message}</p>}</div>
        <div className="ui-field"><label htmlFor="employee-active" className="ui-label">Status<RequiredMark /></label><FormSelect id="employee-active" className="max-sm:min-h-12" disabled={disabled} aria-invalid={Boolean(errors.status)} aria-describedby={errors.status ? "employee-active-error" : undefined} control={form.control} name="status" required><option value="active">Aktif</option><option value="inactive">Nonaktif</option></FormSelect>{errors.status && <p id="employee-active-error" className="ui-field-error" role="alert">{errors.status.message}</p>}</div>
        </div>;
}
