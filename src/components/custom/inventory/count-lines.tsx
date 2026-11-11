import { CurrencyField } from "@/components/shared/currency-field";
import { TextField } from "@/components/shared/text-field";
import { RequiredMark } from "@/components/shared/required-mark";
import { inventoryDecimalRule } from "@/lib/inventory-form-rules";
import { inventoryQuantity } from "@/controller/inventory/use-inventory";
import { useCountLines } from "@/hooks/inventory/use-count-lines";
import type { InventoryCountEditorProps } from "@/interfaces/inventory";
export function InventoryCountLines(props: InventoryCountEditorProps) {
  const { form, command, submit } = useCountLines(props);
  return (
    <form
      aria-busy={command.pending}
      noValidate
      onSubmit={submit}
      className="space-y-4 ui-form"
    >
      <p className="text-14 text-muted-foreground">
        Masukkan hasil fisik dalam satuan stok. Kosong berarti belum dihitung;
        masukkan 0 bila habis. Alasan wajib untuk setiap selisih. Simpan
        sementara untuk melanjutkan nanti.
      </p>
      <fieldset disabled={command.pending} className="space-y-3">
        {props.detail.lines.map((l, i) => (
          <div
            key={l.id}
            className="grid items-start gap-3 rounded-xl border border-border bg-background/40 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(160px,1.3fr)_minmax(120px,1fr)_minmax(160px,1.3fr)_minmax(130px,1fr)]"
          >
            <div>
              <p className="font-medium">{l.name}</p>
              <p className="mt-1 text-13 text-muted-foreground">
                Saldo awal {inventoryQuantity(l.snapshot)} {l.unit}
              </p>
              <p className="mt-1 text-13 text-muted-foreground">
                Stok sistem terakhir {inventoryQuantity(l.expected)} {l.unit}
              </p>
              {l.variance != null && (
                <p className="mt-1 text-13 font-medium">
                  Selisih tersimpan {inventoryQuantity(l.variance)} {l.unit}
                </p>
              )}
            </div>
            <div className="ui-field">
              <label htmlFor={`count-quantity-${i}`} className="ui-label">
                Fisik ({l.unit})<RequiredMark />
              </label>
              <input
                id={`count-quantity-${i}`}
                className="ui-input"
                inputMode="decimal"
                aria-invalid={Boolean(
                  form.formState.errors.lines?.[i]?.countedQuantity,
                )}
                aria-describedby={
                  form.formState.errors.lines?.[i]?.countedQuantity
                    ? `count-quantity-${i}-error`
                    : undefined
                }
                {...form.register(
                  `lines.${i}.countedQuantity`,
                  inventoryDecimalRule,
                )}
              />
              {form.formState.errors.lines?.[i]?.countedQuantity && (
                <p
                  id={`count-quantity-${i}-error`}
                  role="alert"
                  className="ui-field-error"
                >
                  {form.formState.errors.lines[i]?.countedQuantity?.message}
                </p>
              )}
            </div>
            <TextField
              id={`count-reason-${i}`}
              label="Alasan bila selisih"
              maxLength={500}
              {...form.register(`lines.${i}.reason`)}
            />
            <CurrencyField
              id={`count-cost-${i}`}
              label="Biaya satuan bila belum ada"
              error={form.formState.errors.lines?.[i]?.unitCost?.message}
              name={`lines.${i}.unitCost`}
              control={form.control}
              rules={inventoryDecimalRule}
            />
            {l.counted != null && (
              <label className="flex min-h-11 items-center gap-3 text-13 text-muted-foreground sm:col-span-2 lg:col-span-4">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  {...form.register(`lines.${i}.recount`)}
                />
                Saya menghitung ulang bahan ini sekarang, termasuk jika hasil
                fisiknya sama.
              </label>
            )}
          </div>
        ))}
      </fieldset>
      <p className="ui-help">
        Stok sistem dan nilai selisih dihitung server saat hitungan disimpan.
        Untuk selisih positif tanpa biaya rata-rata, isi biaya satuan.
        Persetujuan dilakukan oleh akun Pemilik/Manajer lain. Simpan segera
        setelah menghitung. Jika ada barang masuk atau keluar sebelum disimpan,
        periksa ulang fisiknya.
      </p>
      {command.error && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          {command.error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        <button
          name="intent"
          value="save"
          className="ui-button ui-button-secondary"
          disabled={command.pending}
        >
          Simpan sementara
        </button>
        <button
          name="intent"
          value="submit"
          className="ui-button ui-button-primary"
          disabled={command.pending}
        >
          Simpan & ajukan
        </button>
      </div>
    </form>
  );
}
