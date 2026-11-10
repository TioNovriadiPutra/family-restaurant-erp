import { CurrencyField } from "@/components/shared/currency-field";
import { useSettingsForm } from "@/hooks/settings/use-settings-form";
import { TextField } from "@/components/shared/text-field";
import { PhoneField } from "@/components/shared/phone-field";
import {
  validIndonesianPhone,
  phoneValidationMessage,
} from "@/lib/phone-validation";
import { FormSelect } from "@/components/shared/form-select";
import { RequiredMark } from "@/components/shared/required-mark";
import type { SettingsGenericFormProps } from "@/interfaces/settings-ui";
export function SettingsForm(p: SettingsGenericFormProps) {
  const { form, command, submit } = useSettingsForm({
    ...p,
    action: p.spec.action,
    defaults: p.spec.values,
    map: (values) => ({
      ...values,
      ...(p.spec.action === "receipt"
        ? { paperWidth: Number(values.paperWidth) }
        : {}),
      ...(p.spec.action === "price"
        ? {
            effectiveFrom: values.effectiveFrom
              ? new Date(String(values.effectiveFrom)).toISOString()
              : "",
          }
        : {}),
    }),
  });
  return (
    <form
      onSubmit={submit}
      aria-busy={command.pending}
      className="ui-card space-y-5"
    >
      <div>
        <h1 className="text-xl font-semibold">{p.spec.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kolom bertanda bintang wajib diisi.
        </p>
      </div>
      <fieldset
        disabled={command.pending}
        className="grid items-start gap-4 sm:grid-cols-2"
      >
        {p.spec.fields.map((f) =>
          f.type === "currency" ? (
            <CurrencyField
              key={f.key}
              id={f.key}
              label={f.label}
              control={form.control}
              name={f.key}
              required={f.required}
              readOnly={f.disabled}
              fractionDigits={2}
              rules={{ required: f.required ? "Nominal wajib diisi." : false }}
            />
          ) : f.key === "phone" ? (
            <PhoneField
              key={f.key}
              id={f.key}
              label={f.label}
              type="tel"
              error={
                form.formState.errors[f.key]?.message as string | undefined
              }
              {...form.register(f.key, {
                validate: (value) =>
                  validIndonesianPhone(String(value)) || phoneValidationMessage,
              })}
            />
          ) : f.type === "checkbox" ? (
            <label
              key={f.key}
              className="flex min-h-11 items-center gap-3 rounded-lg border border-border px-3 text-sm"
            >
              <input type="checkbox" {...form.register(f.key)} />
              {f.label}
            </label>
          ) : f.choices ? (
            <div key={f.key} className="ui-field">
              <label className="ui-label" htmlFor={f.key}>
                {f.label}
                {f.required && <RequiredMark />}
              </label>
              <FormSelect
                control={form.control}
                name={f.key}
                id={f.key}
                required={f.required}
                disabled={f.disabled}
              >
                {f.choices.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </FormSelect>
            </div>
          ) : f.type === "textarea" ? (
            <div key={f.key} className="ui-field sm:col-span-2">
              <label className="ui-label" htmlFor={f.key}>
                {f.label}
              </label>
              <textarea
                id={f.key}
                className="ui-input min-h-24"
                maxLength={f.maxLength ?? 500}
                {...form.register(f.key)}
              />
            </div>
          ) : (
            <TextField
              key={f.key}
              id={f.key}
              label={f.label}
              type={f.type ?? "text"}
              required={f.required}
              readOnly={f.disabled}
              maxLength={f.maxLength ?? 120}
              error={
                form.formState.errors[f.key]?.message as string | undefined
              }
              {...form.register(f.key, {
                required: f.required ? "Kolom ini wajib diisi." : false,
                ...(f.type === "number" ? { valueAsNumber: true, min: 0 } : {}),
              })}
            />
          ),
        )}
      </fieldset>
      {command.error && (
        <p role="alert" className="ui-alert ui-alert-error">
          {command.error}
        </p>
      )}
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          className="ui-button ui-button-secondary"
          disabled={command.pending}
          onClick={p.onCancel}
        >
          Batal
        </button>
        <button
          className="ui-button ui-button-primary"
          disabled={command.pending}
        >
          {command.pending ? "Menyimpan..." : "Simpan pengaturan"}
        </button>
      </div>
    </form>
  );
}
