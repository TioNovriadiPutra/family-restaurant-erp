import { PageTitle } from '@/components/shared/page-heading';
import { useForm } from "react-hook-form";
import { TextField } from "@/components/shared/text-field";
import { FormSelect } from "@/components/shared/form-select";
import { RequiredMark } from "@/components/shared/required-mark";
import { useInventoryCommand } from "@/hooks/inventory/use-inventory-command";
import { inventoryNonnegativeRule } from "@/lib/inventory-form-rules";
import type {
  InventoryMaterialForm,
  InventoryMaterialFormProps,
} from "@/interfaces/inventory";
export function InventoryMaterialEditor({
  outletId,
  options,
  material,
  onSaved,
  onCancel,
}: InventoryMaterialFormProps) {
  const form = useForm<InventoryMaterialForm>({
    defaultValues: {
      id: material?.id,
      name: material?.name ?? "",
      category: material?.category ?? "Bahan baku",
      kind: material?.kind ?? "raw",
      baseUnitId: material?.base_unit_id ?? "",
      active: material?.active ?? true,
      minimumQuantity: material?.policies[0]?.minimumQuantity ?? "0",
      locationId: material?.policies[0]?.locationId ?? "",
    },
  });
  const {
    register,
    formState: { errors },
  } = form;
  const command = useInventoryCommand(outletId);
  return (
    <form
      aria-busy={command.pending}
      noValidate
      className="ui-card space-y-5 ui-form ui-form-panel"
      onSubmit={form.handleSubmit(async (value) => {
        try {
          onSaved(await command.run("material", { ...value }));
        } catch {
          /* shown below */
        }
      })}
    >
      <div>
        <PageTitle className="">
          {material ? "Edit bahan" : "Tambah bahan"}
        </PageTitle>
        <p className="mt-1 text-14 text-muted-foreground">
          Master bahan tidak menambah stok. Catat barang diterima melalui
          Pembelian.
        </p>
      </div>
      <fieldset
        disabled={command.pending}
        className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <TextField
          id="inventory-name"
          label="Nama bahan"
          required
          maxLength={120}
          error={errors.name?.message}
          {...register("name", {
            required: "Nama bahan wajib diisi.",
            validate: (v) => v.trim().length >= 2 || "Nama minimal 2 karakter.",
          })}
        />
        <TextField
          id="inventory-category"
          label="Kategori"
          required
          maxLength={80}
          error={errors.category?.message}
          {...register("category", {
            required: "Kategori wajib diisi.",
            validate: (v) => Boolean(v.trim()) || "Kategori wajib diisi.",
          })}
        />
        <div className="ui-field">
          <label htmlFor="inventory-kind" className="ui-label">
            Jenis bahan
            <RequiredMark />
          </label>
          <FormSelect
            control={form.control}
            name="kind"
            id="inventory-kind"
            required
            disabled={Boolean(material) || command.pending}
          >
            <option value="raw">Bahan baku</option>
            <option value="semi_finished">Setengah jadi</option>
            <option value="finished">Barang jadi</option>
          </FormSelect>
        </div>
        <div className="ui-field">
          <label htmlFor="inventory-base-unit" className="ui-label">
            Satuan stok
            <RequiredMark />
          </label>
          <FormSelect
            control={form.control}
            name="baseUnitId"
            id="inventory-base-unit"
            required
            disabled={Boolean(material) || command.pending}
          >
            <option value="">Pilih satuan dasar</option>
            {options.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.code}
              </option>
            ))}
          </FormSelect>
        </div>
        <div className="ui-field">
          <label htmlFor="inventory-policy-location" className="ui-label">
            Lokasi batas minimum
          </label>
          <FormSelect
            control={form.control}
            name="locationId"
            id="inventory-policy-location"
            disabled={command.pending}
            onValueChange={(id) =>
              form.setValue(
                "minimumQuantity",
                material?.policies.find((p) => p.locationId === id)
                  ?.minimumQuantity ?? "0",
                { shouldValidate: true },
              )
            }
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
          id="inventory-minimum"
          label="Minimum stok (satuan dasar)"
          required
          inputMode="decimal"
          error={errors.minimumQuantity?.message}
          {...register("minimumQuantity", inventoryNonnegativeRule)}
        />
        <label className="flex min-h-11 items-center gap-3 rounded-lg border border-border px-3 text-14">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            {...register("active")}
          />
          Bahan aktif
        </label>
      </fieldset>
      {material && (
        <p className="ui-help">
          Satuan dasar dan jenis bahan tetap. Gunakan konversi untuk satuan
          pembelian; perubahan minimum hanya berlaku pada lokasi yang dipilih.
        </p>
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
          {command.pending ? "Menyimpan…" : "Simpan bahan"}
        </button>
      </div>
    </form>
  );
}
