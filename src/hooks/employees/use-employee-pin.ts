import { useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";
import { useSetEmployeePin } from "@/controller/employees/use-employees";
import type { EmployeePinDialogProps, EmployeePinValues } from "@/interfaces/employees";

export function useEmployeePin({ employee, outletId, onClose, onSaved }: EmployeePinDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mounted = useRef(true);
  const form = useForm<EmployeePinValues>({ defaultValues: { pin: "", confirmation: "" } });
  const mutation = useSetEmployeePin();
  const { reset } = form;
  useEffect(() => {
    mounted.current = true;
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => { mounted.current = false; dialog?.close(); reset(); };
  }, [reset]);
  const close = () => { if (!form.formState.isSubmitting) { reset(); mutation.reset(); onClose(); } };
  const submit = (event: FormEvent<HTMLFormElement>) => form.handleSubmit(async values => {
    form.clearErrors("root");
    try {
      const response = await mutation.mutateAsync({ ...values, employeeId: employee.id, outletId, expectedConfigured: employee.pin_configured });
      reset();
      if (mounted.current) { onSaved(response.message); onClose(); }
    } catch (error) {
      reset();
      if (mounted.current) form.setError("root", { message: error instanceof Error ? error.message : "PIN belum dapat disimpan." });
    } finally {
      values.pin = ""; values.confirmation = ""; mutation.reset();
    }
  })(event);
  return { form, dialogRef, close, submit, pending: form.formState.isSubmitting };
}
