import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { authErrorMessage, useLogin } from "@/controller/auth/use-auth";
import type { AuthSession, LoginCredentials, OutletAccess } from "@/interfaces/auth";

export function useLoginForm() {
  const form = useForm<LoginCredentials>({ defaultValues: { email: "", password: "" } });
  const mutation = useLogin();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [outlets, setOutlets] = useState<OutletAccess[]>([]);
  const [outletId, setOutletId] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const outletSelectRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (session) outletSelectRef.current?.focus(); }, [session]);
  const submit = form.handleSubmit(async credentials => {
    setMessage("");
    try {
      const result = await mutation.mutateAsync(credentials);
      setSession(result.session);
      setOutlets(result.outlets);
      setOutletId(result.outlets[0].outlet_id);
    } catch (error) { setMessage(authErrorMessage(error)); }
    finally { form.resetField("password"); mutation.reset(); }
  });
  function enter() {
    if (!outlets.some(outlet => outlet.outlet_id === outletId)) return;
    // This is a UI preference only. Each API must still enforce database access.
    try { window.sessionStorage.setItem("erp.selectedOutletId", outletId); } catch { /* Storage is optional. */ }
    window.location.replace("/");
  }
  return { form, submit, session, outlets, outletId, setOutletId, message,
    pending: form.formState.isSubmitting, showPassword, togglePassword: () => setShowPassword(value => !value), enter, outletSelectRef };
}
