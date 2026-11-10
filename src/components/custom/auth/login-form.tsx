import { TextField } from "@/components/shared/text-field";
import { Eye, EyeSlash } from "iconsax-reactjs";
import { SelectInput } from "@/components/shared/select-input";
import { useLoginForm } from "@/hooks/auth/use-login-form";

export function LoginForm() {
  const { form, submit, session, outlets, outletId, setOutletId, message, pending, showPassword, togglePassword, enter, outletSelectRef } = useLoginForm();
  const { register, formState: { errors } } = form;
  return <>
    <h1 className="type-28-semibold mt-6">Masuk ke ERP</h1>
    <p className="mt-2 text-pretty text-muted-foreground">Gunakan akun petugas yang memiliki akses ERP.</p>
    {session ? <div className="mt-8 space-y-6">
      <p className="ui-alert ui-alert-success" role="status">Akun terverifikasi: {session.user.email}</p>
      <div className="ui-field">
        <label htmlFor="outlet" className="ui-label">Outlet</label>
        <SelectInput ref={outletSelectRef} id="outlet" className="max-sm:min-h-12" value={outletId} onValueChange={setOutletId}>
          {outlets.map(outlet => <option key={outlet.outlet_id} value={outlet.outlet_id}>{outlet.outlet_name}</option>)}
        </SelectInput>
        <p className="ui-help">Hanya outlet yang dapat diakses akun Anda yang ditampilkan.</p>
      </div>
      <button type="button" onClick={enter} className="ui-button ui-button-primary w-full max-sm:min-h-12">Lanjut ke ERP</button>
    </div> : <form onSubmit={submit} method="post" noValidate className="mt-8 space-y-6" aria-busy={pending}>
      <TextField required id="email" label="Email" type="email" autoComplete="username" inputMode="email" placeholder="nama@restoran.com" maxLength={254} readOnly={pending}
        error={errors.email?.message} {...register("email", { required: "Email wajib diisi.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Masukkan email yang valid." } })} />
      <div>
        <TextField required id="password" label="Kata sandi" type={showPassword ? "text" : "password"} autoComplete="current-password" maxLength={1024} readOnly={pending}
          error={errors.password?.message} {...register("password", { required: "Kata sandi wajib diisi." })} />
        <button type="button" aria-controls="password" aria-pressed={showPassword} onClick={togglePassword} className="mt-1 inline-flex min-h-11 items-center gap-2 text-13 text-primary underline-offset-4 hover:underline">{showPassword ? <EyeSlash aria-hidden="true" size={18} variant="Linear" /> : <Eye aria-hidden="true" size={18} variant="Linear" />}{showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}</button>
      </div>
      {message && <p className="ui-alert ui-alert-destructive" role="alert">{message}</p>}
      <p role="status" className="sr-only">{pending ? "Memverifikasi akun…" : ""}</p>
      <button className="ui-button ui-button-primary w-full max-sm:min-h-12" type="submit" disabled={pending}>{pending ? "Memverifikasi akun…" : "Masuk ke ERP"}</button>
    </form>}
    <p className="mt-6 type-13-regular text-muted-foreground">Tidak dapat masuk? Hubungi administrator restoran.</p>
  </>;
}
