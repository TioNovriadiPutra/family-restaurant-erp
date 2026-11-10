import { phoneDigits } from "@/lib/phone-validation";
import { useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";
import { employeeError, useEmployeeRoles, useManageEmployee } from "@/controller/employees/use-employees";
import type { EmployeeFormValues, EmployeeManagementDialogProps } from "@/interfaces/employees";

export function useEmployeeManagement({ employee, action, outletId, onClose, onSaved }: EmployeeManagementDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mounted = useRef(true);
  const roles = useEmployeeRoles(outletId);
  const mutation = useManageEmployee();
  const form = useForm<EmployeeFormValues>({ defaultValues: {
    name: employee.name, email: employee.email, phone: phoneDigits(employee.phone ?? ""), roleId: employee.roles[0]?.id ?? "", status: employee.active ? "active" : "inactive",
  } });
  useEffect(() => { mounted.current = true; const dialog = dialogRef.current; dialog?.showModal(); return () => { mounted.current = false; dialog?.close(); }; }, []);
  const { dirtyFields } = form.formState;
  const close = () => { if (!form.formState.isSubmitting && !mutation.isPending) onClose(); };
  const save = async (values?: EmployeeFormValues) => {
    form.clearErrors("root");
    try {
      const response = await mutation.mutateAsync(action === "delete" ? { action, employeeId: employee.id, outletId } : {
        action, employeeId: employee.id, outletId, name: values!.name, email: values!.email, phone: values!.phone,
        roleId: values!.roleId, active: values!.status === "active", changeRole: Boolean(dirtyFields.roleId),
      });
      if (mounted.current) { onSaved(response.message); onClose(); }
    } catch (error) {
      if (!mounted.current) return;
      const failure = employeeError(error);
      if (failure.fieldErrors?.email) form.setError("email", { message: failure.fieldErrors.email });
      form.setError("root", { message: failure.message });
    }
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    if (action === "delete") { event.preventDefault(); void save(); }
    else void form.handleSubmit(save)(event);
  };
  return { form, roles, dialogRef, close, submit, pending: form.formState.isSubmitting || mutation.isPending };
}
