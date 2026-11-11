import { SectionTitle } from '@/components/shared/page-heading';
import { useForm } from "react-hook-form";
import { TextField } from "@/components/shared/text-field";
import { FormSelect } from "@/components/shared/form-select";
import { useInventoryCommand } from "@/hooks/inventory/use-inventory-command";
import type {
  InventoryCountForm,
  InventoryFormProps,
} from "@/interfaces/inventory";
export function InventoryCountEditor({
  outletId,
  options,
  onSaved,
  onCancel,
}: InventoryFormProps) {
  const form = useForm<InventoryCountForm>({
    defaultValues: { locationId: "", scheduledAt: "", notes: "" },
  });
  const command = useInventoryCommand(outletId);
  return (
    <form
      aria-busy={command.pending}
      noValidate
      className="ui-card space-y-5 ui-form ui-form-panel"
      onSubmit={form.handleSubmit(async (data) => {
        try {
          onSaved(
            await command.run("count_create", {
              ...data,
              scheduledAt: data.scheduledAt
                ? new Date(data.scheduledAt).toISOString()
                : "",
            }),
          );
        } catch {
          /* below */
        }
      })}
    >
      <div>
        <SectionTitle className="">Jadwalkan stock opname</SectionTitle>
        <p className="mt-1 text-14 text-muted-foreground">
          Semua bahan aktif di lokasi ini diambil saat mulai hitung. Saldo awal
          belum dibuat ketika menyimpan jadwal.
        </p>
      </div>
      <fieldset
        disabled={command.pending}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="ui-field">
          <label htmlFor="count-location" className="ui-label">
            Lokasi
          </label>
          <FormSelect
            id="count-location"
            name="locationId"
            control={form.control}
            disabled={command.pending}
          >
            <option value="">Gudang utama (otomatis)</option>
            {options.locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </FormSelect>
        </div>
        <TextField
          id="count-schedule"
          label="Jadwal (opsional, waktu perangkat)"
          type="datetime-local"
          {...form.register("scheduledAt")}
        />
      </fieldset>
      <label className="ui-field">
        <span className="ui-label">Catatan (opsional)</span>
        <textarea
          className="ui-input"
          maxLength={1000}
          {...form.register("notes")}
        />
      </label>
      {command.error && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          {command.error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="ui-button ui-button-secondary"
          disabled={command.pending}
          onClick={onCancel}
        >
          Batal
        </button>
        <button
          className="ui-button ui-button-primary"
          disabled={command.pending}
        >
          Simpan jadwal
        </button>
      </div>
    </form>
  );
}
