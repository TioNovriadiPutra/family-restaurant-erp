import type { EmployeeFieldErrors, EmployeeValidation } from "@/interfaces/employees";
import { validIndonesianPhone, phoneValidationMessage } from "@/lib/phone-validation";

export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const employeeEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validEmployeePhone(value: string) {
  return validIndonesianPhone(value);
}
export function validateEmployeeCreate(body: unknown): EmployeeValidation {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { errors: { name: "Isi data karyawan dengan benar." } };
  const row = body as Record<string, unknown>;
  const allowed = ["outletId", "name", "email", "phone", "roleId", "active"];
  if (Object.keys(row).some(key => !allowed.includes(key))) return { errors: { name: "Permintaan berisi kolom yang tidak didukung." } };
  const text = (key: string) => typeof row[key] === "string" ? row[key].trim() : "";
  const value = { outletId: text("outletId"), name: text("name"), email: text("email").toLowerCase(), phone: text("phone"), roleId: text("roleId"), active: row.active as boolean };
  const errors: EmployeeFieldErrors = {};
  if (!uuidPattern.test(value.outletId)) errors.outletId = "Outlet tidak valid.";
  if (value.name.length < 2 || value.name.length > 120 || /[\u0000-\u001f\u007f]/.test(value.name)) errors.name = "Nama harus berisi 2–120 karakter yang valid.";
  if (value.email.length > 254 || !employeeEmailPattern.test(value.email)) errors.email = "Masukkan email yang valid.";
  if (typeof row.phone !== "string" || !validEmployeePhone(value.phone)) errors.phone = phoneValidationMessage;
  if (!uuidPattern.test(value.roleId)) errors.roleId = "Pilih role karyawan.";
  if (typeof row.active !== "boolean") errors.active = "Pilih status karyawan.";
  return Object.keys(errors).length ? { errors } : { value };
}
