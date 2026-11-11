import { PageTitle } from '@/components/shared/page-heading';
import { useSettingsForm } from "@/hooks/settings/use-settings-form";
import { TextField } from "@/components/shared/text-field";
import type { SettingsRoleUiProps } from "@/interfaces/settings-role-ui";
export function SettingsRoleForm(p: SettingsRoleUiProps) {
  const { form, command, submit } = useSettingsForm({
    ...p,
    action: "role",
    defaults: p.spec.values,
  });
  return (
    <form
      className="ui-card space-y-5 ui-form ui-form-panel"
      aria-busy={command.pending}
      onSubmit={submit}
    >
      <PageTitle className="">{p.spec.title}</PageTitle>
      <fieldset disabled={command.pending} className="space-y-5">
        <TextField
          id="discountPercent"
          label="Batas diskon (%)"
          required
          {...form.register("discountPercent", { required: true })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {p.permissions.map((permission) => (
            <label
              key={permission.code}
              className="flex items-start gap-3 rounded-lg border border-border p-3 text-14"
            >
              <input
                type="checkbox"
                value={permission.code}
                disabled={permission.code === "rbac.manage"}
                {...form.register("permissions")}
              />
              <span>
                <span className="block font-medium">{permission.code}</span>
                <span className="text-muted-foreground">
                  {permission.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {command.error && (
        <p role="alert" className="ui-alert ui-alert-error">
          {command.error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={command.pending}
          onClick={p.onCancel}
          className="ui-button ui-button-secondary"
        >
          Batal
        </button>
        <button
          disabled={command.pending}
          className="ui-button ui-button-primary"
        >
          {command.pending ? "Menyimpan..." : "Simpan hak akses"}
        </button>
      </div>
    </form>
  );
}
