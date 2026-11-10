import { useForm } from "react-hook-form";
import { TextField } from "@/components/shared/text-field";
import { FormSelect } from "@/components/shared/form-select";
import { RequiredMark } from "@/components/shared/required-mark";
import { useInventoryCommand } from "@/hooks/inventory/use-inventory-command";
import type {
  InventoryAuxForm,
  InventoryAuxProps,
} from "@/interfaces/inventory";
export function InventoryAuxEditor({
  outletId,
  mode,
  onSaved,
  onCancel,
}: InventoryAuxProps) {
  const form = useForm<InventoryAuxForm>({
    defaultValues: { name: "", code: "", dimension: "count" },
  });
  const command = useInventoryCommand(outletId);
  return (
    <form
      aria-busy={command.pending}
      noValidate
      className="ui-card space-y-4"
      onSubmit={form.handleSubmit(async (v) => {
        try {
          onSaved(
            await command.run(
              mode,
              mode === "location"
                ? { name: v.name }
                : { code: v.code, dimension: v.dimension },
            ),
          );
        } catch {
          /* below */
        }
      })}
    >
      <h2 className="text-lg font-semibold">
        {mode === "location" ? "Tambah lokasi stok" : "Tambah satuan"}
      </h2>
      {mode === "location" ? (
        <TextField
          id="location-name"
          label="Nama lokasi"
          required
          maxLength={80}
          error={form.formState.errors.name?.message}
          {...form.register("name", {
            required: "Nama lokasi wajib diisi.",
            minLength: { value: 2, message: "Nama minimal 2 karakter." },
          })}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="unit-code"
            label="Kode satuan"
            required
            maxLength={12}
            placeholder="pack, dus, ikat"
            error={form.formState.errors.code?.message}
            {...form.register("code", {
              required: "Kode wajib diisi.",
              pattern: {
                value: /^[a-z][a-z0-9_]{0,11}$/,
                message:
                  "Gunakan huruf kecil, angka atau underscore, maksimal 12 karakter.",
              },
            })}
          />
          <div className="ui-field">
            <label htmlFor="unit-dimension" className="ui-label">
              Jenis ukuran
              <RequiredMark />
            </label>
            <FormSelect
              id="unit-dimension"
              name="dimension"
              control={form.control}
              required
            >
              <option value="count">Jumlah</option>
              <option value="mass">Berat</option>
              <option value="volume">Volume</option>
            </FormSelect>
          </div>
        </div>
      )}
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
          Simpan
        </button>
      </div>
    </form>
  );
}
