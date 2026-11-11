import { SectionTitle } from '@/components/shared/page-heading';
import { useForm } from "react-hook-form";
import { TextField } from "@/components/shared/text-field";
import { FormSelect } from "@/components/shared/form-select";
import { RequiredMark } from "@/components/shared/required-mark";
import { useInventoryCommand } from "@/hooks/inventory/use-inventory-command";
import { inventoryPositiveRule } from "@/lib/inventory-form-rules";
import { inventoryQuantity } from "@/controller/inventory/use-inventory";
import type {
  InventoryConversionForm,
  InventoryConversionProps,
} from "@/interfaces/inventory";
export function InventoryConversionEditor({
  outletId,
  options,
  material,
  onSaved,
  onCancel,
}: InventoryConversionProps) {
  const form = useForm<InventoryConversionForm>({
    defaultValues: { unitId: "", baseQuantity: "" },
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
            await command.run("conversion", { ...data, itemId: material.id }),
          );
        } catch {
          /* presented below */
        }
      })}
    >
      <div>
        <SectionTitle className="">
          Konversi satuan · {material.name}
        </SectionTitle>
        <p className="mt-1 text-14 text-muted-foreground">
          1 satuan pembelian sama dengan berapa {material.unit}? Versi baru
          berlaku untuk transaksi berikutnya.
        </p>
      </div>
      {material.conversions.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {material.conversions.map((c) => (
            <li key={c.id} className="ui-badge ui-badge-neutral">
              1 {c.unit} = {inventoryQuantity(c.base_quantity)} {material.unit}
            </li>
          ))}
        </ul>
      )}
      <fieldset
        disabled={command.pending}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="ui-field">
          <label htmlFor="conversion-unit" className="ui-label">
            Satuan beli
            <RequiredMark />
          </label>
          <FormSelect
            id="conversion-unit"
            name="unitId"
            control={form.control}
            required
            disabled={command.pending}
            onValueChange={(id) =>
              form.setValue(
                "baseQuantity",
                material.conversions.find((c) => c.unit_id === id)
                  ?.base_quantity ?? "",
                { shouldValidate: true },
              )
            }
          >
            <option value="">Pilih satuan</option>
            {options.units
              .filter((u) => u.id !== material.base_unit_id)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.code}
                </option>
              ))}
          </FormSelect>
        </div>
        <TextField
          id="conversion-quantity"
          label={`Jumlah dalam ${material.unit}`}
          inputMode="decimal"
          required
          error={form.formState.errors.baseQuantity?.message}
          {...form.register("baseQuantity", inventoryPositiveRule)}
        />
      </fieldset>
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
          Simpan konversi
        </button>
      </div>
    </form>
  );
}
