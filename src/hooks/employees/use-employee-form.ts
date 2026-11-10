import { useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import {
  employeeError,
  useCreateEmployee,
  useEmployeeRoles,
} from "@/controller/employees/use-employees";
import type { EmployeeFormValues } from "@/interfaces/employees";

export function useEmployeeForm(outletId: string) {
  const router = useRouter();
  const roles = useEmployeeRoles(outletId);
  const mutation = useCreateEmployee();
  const mounted = useRef(true);
  const form = useForm<EmployeeFormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      roleId: "",
      status: "active",
    },
  });
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const { getValues, setValue } = form;
  useEffect(() => {
    if (!getValues("roleId") && roles.data?.length) {
      setValue(
        "roleId",
        (roles.data.find((role) => role.name === "Kasir") ?? roles.data[0]).id,
        { shouldValidate: true },
      );
    }
  }, [roles.data, getValues, setValue]);
  const submit = (event: FormEvent<HTMLFormElement>) =>
    form.handleSubmit(async (values) => {
      form.clearErrors("root");
      try {
        await mutation.mutateAsync({ outletId, values });
        if (mounted.current) await router.push("/karyawan");
      } catch (error) {
        if (!mounted.current) return;
        const failure = employeeError(error);
        const errors = failure.fieldErrors;
        if (errors?.email)
          form.setError(
            "email",
            { message: errors.email },
            { shouldFocus: true },
          );
        if (errors?.name) form.setError("name", { message: errors.name });
        if (errors?.phone) form.setError("phone", { message: errors.phone });
        if (errors?.roleId) form.setError("roleId", { message: errors.roleId });
        if (errors?.active) form.setError("status", { message: errors.active });
        form.setError("root", { message: failure.message });
      }
    })(event);
  return { form, roles, submit, pending: form.formState.isSubmitting };
}
