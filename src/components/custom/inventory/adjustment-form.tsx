import { PageTitle } from '@/components/shared/page-heading';
import { CurrencyField } from "@/components/shared/currency-field";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Add, Trash } from "iconsax-reactjs";
import { TextField } from "@/components/shared/text-field";
import { FormSelect } from "@/components/shared/form-select";
import { RequiredMark } from "@/components/shared/required-mark";
import { useInventoryCommand } from "@/hooks/inventory/use-inventory-command";
import {
  inventoryPositiveRule,
  inventoryDecimalRule,
} from "@/lib/inventory-form-rules";
import type {
  InventoryAdjustmentForm,
  InventoryAdjustmentProps,
} from "@/interfaces/inventory";
export function InventoryAdjustmentEditor({
  outletId,
  options,
  waste,
  detail,
  onSaved,
  onCancel,
}: InventoryAdjustmentProps) {
  const form = useForm<InventoryAdjustmentForm>({
    defaultValues: {
      kind: detail?.document.kind ?? (waste ? "waste" : "manual"),
      reason: detail?.document.reason ?? "",
      locationId: detail?.document.location_id ?? "",
      lines: detail?.lines.map((l) => ({
        itemId: l.itemId,
        quantity: String(Math.abs(Number(l.quantity))),
        unitCost: l.unitCost ?? "",
        direction: Number(l.quantity) > 0 ? "add" : "remove",
      })) ?? [{ itemId: "", quantity: "", unitCost: "", direction: "remove" }],
    },
  });
  const fields = useFieldArray({ control: form.control, name: "lines" });
  const values = useWatch({ control: form.control });
  const command = useInventoryCommand(outletId);
  return (
    <form
      aria-busy={command.pending}
      noValidate
      className="ui-card space-y-5 ui-form ui-form-panel"
      onSubmit={form.handleSubmit(async (v) => {
        try {
          const data = {
            kind: v.kind,
            reason: v.reason,
            locationId: v.locationId,
            lines: v.lines.map((l) => ({
              itemId: l.itemId,
              quantity:
                !waste && l.direction === "remove"
                  ? `-${l.quantity}`
                  : l.quantity,
              unitCost: l.unitCost,
            })),
            ...(detail
              ? { id: detail.document.id, version: detail.document.version }
              : {}),
          };
          onSaved(await command.run("adjustment", data));
        } catch {
          /* below */
        }
      })}
    >
      <div>
        <PageTitle className="">
          {detail
            ? "Edit draf"
            : waste
              ? "Catat bahan terbuang"
              : "Buat koreksi stok"}
        </PageTitle>
        <p className="mt-1 text-14 text-muted-foreground">
          Draf belum mengubah stok. Dokumen harus diajukan dan disetujui petugas
          lain.{!waste && " Pembelian barang tetap dicatat di menu Pembelian."}
        </p>
      </div>
      <fieldset disabled={command.pending} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="ui-field">
            <label htmlFor="adjustment-location" className="ui-label">
              Lokasi stok
            </label>
            <FormSelect
              id="adjustment-location"
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
          {waste && (
            <div className="ui-field">
              <label htmlFor="adjustment-kind" className="ui-label">
                Jenis pencatatan
                <RequiredMark />
              </label>
              <FormSelect
                id="adjustment-kind"
                name="kind"
                control={form.control}
                required
                disabled={Boolean(detail) || command.pending}
              >
                <option value="waste">Bahan terbuang</option>
                <option value="spoilage">Rusak / kedaluwarsa</option>
                <option value="shrinkage">Susut</option>
                <option value="staff_consumption">Konsumsi staf</option>
              </FormSelect>
            </div>
          )}
        </div>
        <TextField
          id="adjustment-reason"
          label="Alasan pencatatan"
          required
          maxLength={1000}
          error={form.formState.errors.reason?.message}
          {...form.register("reason", {
            required: "Alasan wajib diisi.",
            validate: (v) =>
              v.trim().length >= 3 || "Alasan minimal 3 karakter.",
          })}
        />
        <div className="space-y-3">
          {fields.fields.map((f, index) => {
            const item = options.items.find(
              (i) => i.id === values.lines?.[index]?.itemId,
            );
            return (
              <div
                key={f.id}
                className="grid items-start gap-3 rounded-xl border border-border bg-background/50 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(180px,2fr)_minmax(110px,1fr)_minmax(110px,1fr)_minmax(140px,1fr)_44px]"
              >
                <div className="ui-field">
                  <label
                    htmlFor={`adjustment-item-${index}`}
                    className="ui-label"
                  >
                    Bahan
                    <RequiredMark />
                  </label>
                  <FormSelect
                    id={`adjustment-item-${index}`}
                    control={form.control}
                    name={`lines.${index}.itemId`}
                    required
                    disabled={command.pending}
                  >
                    <option value="">Pilih bahan</option>
                    {options.items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </FormSelect>
                </div>
                <TextField
                  id={`adjustment-qty-${index}`}
                  label={`Jumlah (${item?.unit ?? "satuan stok"})`}
                  required
                  inputMode="decimal"
                  error={
                    form.formState.errors.lines?.[index]?.quantity?.message
                  }
                  {...form.register(
                    `lines.${index}.quantity`,
                    inventoryPositiveRule,
                  )}
                />
                {!waste ? (
                  <div className="ui-field">
                    <label
                      htmlFor={`adjustment-direction-${index}`}
                      className="ui-label"
                    >
                      Arah koreksi
                      <RequiredMark />
                    </label>
                    <FormSelect
                      id={`adjustment-direction-${index}`}
                      control={form.control}
                      name={`lines.${index}.direction`}
                      required
                      disabled={command.pending}
                    >
                      <option value="remove">Kurangi stok</option>
                      <option value="add">Tambah stok</option>
                    </FormSelect>
                  </div>
                ) : (
                  <div className="self-center text-14 text-muted-foreground">
                    Stok akan berkurang setelah disetujui.
                  </div>
                )}
                <CurrencyField
                  id={`adjustment-cost-${index}`}
                  label="Biaya satuan (opsional)"
                  readOnly={waste}
                  placeholder="Biaya rata-rata"
                  error={
                    form.formState.errors.lines?.[index]?.unitCost?.message
                  }
                  name={`lines.${index}.unitCost`}
                  control={form.control}
                  rules={inventoryDecimalRule}
                />
                <button
                  type="button"
                  className="ui-button ui-button-secondary mt-6 !px-0"
                  aria-label={`Hapus bahan ${index + 1}`}
                  disabled={fields.fields.length === 1 || command.pending}
                  onClick={() => fields.remove(index)}
                >
                  <Trash size={18} aria-hidden />
                </button>
              </div>
            );
          })}
          <button
            type="button"
            className="ui-button ui-button-secondary"
            disabled={command.pending || fields.fields.length >= 100}
            onClick={() =>
              fields.append({
                itemId: "",
                quantity: "",
                unitCost: "",
                direction: "remove",
              })
            }
          >
            <Add size={17} aria-hidden />
            Tambah bahan
          </button>
        </div>
        {!waste && (
          <p className="ui-help">
            Biaya rata-rata dipakai saat posting. Isi biaya satuan bila koreksi
            menambah bahan yang belum mempunyai biaya rata-rata.
          </p>
        )}
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
          {command.pending ? "Menyimpan…" : "Simpan draf"}
        </button>
      </div>
    </form>
  );
}
