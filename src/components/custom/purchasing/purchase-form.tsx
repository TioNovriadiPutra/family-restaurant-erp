import { CurrencyField } from "@/components/shared/currency-field";
import { FormModal } from "@/components/shared/form-modal";
import { RequiredMark } from "@/components/shared/required-mark";
import { FormSelect } from "@/components/shared/form-select";
import { Add, Trash } from "iconsax-reactjs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  purchaseMoney,
  purchasingError,
  usePurchasingMutation,
} from "@/controller/purchasing/use-purchasing";
import { usePurchaseForm } from "@/hooks/purchasing/use-purchase-form";
import type { PurchaseFormProps, MaterialForm } from "@/interfaces/purchasing";
export function PurchaseEditor(props: PurchaseFormProps) {
  const { options } = props;
  const state = usePurchaseForm(props);
  const { register, setValue } = state.form;
  const [adding, setAdding] = useState(false);
  const material = useForm<MaterialForm>();
  const create = usePurchasingMutation();
  return (
    <section className="space-y-4">
      {adding && (
        <FormModal label="Bahan baku baru" onClose={() => setAdding(false)}>
          <form
            aria-busy={create.isPending}
            className="ui-card space-y-3 p-5"
            onSubmit={material.handleSubmit(async (data) => {
              try {
                await create.mutateAsync({
                  outletId: props.outletId,
                  action: "material",
                  data: { ...data },
                });
                material.reset();
                setAdding(false);
              } catch {
                /* Displayed below. */
              }
            })}
          >
            <h3 className="font-semibold">Bahan baku baru</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Nama bahan
                <RequiredMark />
                <input
                  className="ui-input mt-1"
                  {...material.register("name", {
                    required: "Nama bahan wajib diisi.",
                    validate: (value) =>
                      value.trim().length >= 2 || "Nama minimal 2 karakter.",
                    maxLength: 120,
                  })}
                  minLength={2}
                  maxLength={120}
                  required
                />
              </label>
              <label className="text-sm">
                Satuan stok
                <RequiredMark />
                <FormSelect
                  className="ui-input mt-1"
                  control={material.control}
                  name="unitId"
                  required
                >
                  <option value="">Pilih satuan</option>
                  {options.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.code}
                    </option>
                  ))}
                </FormSelect>
              </label>
              <div className="flex items-end justify-end gap-2 sm:col-span-2">
                <button
                  type="button"
                  className="ui-button ui-button-secondary"
                  disabled={create.isPending}
                  onClick={() => setAdding(false)}
                >
                  Batal
                </button>
                <button
                  className="ui-button ui-button-primary"
                  disabled={create.isPending}
                >
                  Simpan bahan
                </button>
              </div>
            </div>
            {Object.keys(material.formState.errors).length > 0 && (
              <p role="alert" className="text-sm text-destructive">
                Isi nama bahan minimal 2 karakter dan pilih satuan stok.
              </p>
            )}
            {create.isError && (
              <p role="alert" className="text-sm text-destructive">
                {purchasingError(create.error)}
              </p>
            )}
          </form>
        </FormModal>
      )}
      <form
        aria-busy={state.pending}
        className="ui-card space-y-6 p-5 sm:p-6"
        onSubmit={state.submit}
      >
        <div>
          <h1 className="text-lg font-semibold">Catat pembelian bahan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Untuk barang yang sudah diterima. Stok bertambah setelah pembelian
            disimpan.
          </p>
        </div>
        <fieldset
          disabled={state.pending}
          className="space-y-6 disabled:opacity-70"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1.5 text-sm font-medium">
              Supplier
              <RequiredMark />
              <FormSelect
                className="ui-input"
                control={state.form.control}
                name="supplierId"
                disabled={state.pending}
                onValueChange={(value) =>
                  state.updateDueDate(
                    value,
                    state.form.getValues("invoiceDate"),
                  )
                }
                required
              >
                <option value="">Pilih supplier</option>
                {options.suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </FormSelect>
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Nomor invoice
              <RequiredMark />
              <input
                className="ui-input"
                {...register("invoiceNumber", {
                  required: "Nomor invoice wajib diisi.",
                  validate: (value) =>
                    Boolean(value.trim()) || "Nomor invoice wajib diisi.",
                  maxLength: 100,
                })}
                required
                maxLength={100}
                placeholder="Sesuai invoice supplier"
              />
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Tanggal invoice
              <RequiredMark />
              <input
                className="ui-input"
                type="date"
                {...register("invoiceDate", {
                  required: "Tanggal invoice wajib diisi.",
                  onChange: (e) =>
                    state.updateDueDate(
                      state.form.getValues("supplierId"),
                      e.target.value,
                    ),
                })}
                required
              />
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Jatuh tempo
              <RequiredMark />
              <input
                className="ui-input"
                type="date"
                {...register("dueDate", {
                  required: "Jatuh tempo wajib diisi.",
                  validate: (value) =>
                    value >= state.form.getValues("invoiceDate") ||
                    "Jatuh tempo tidak boleh sebelum tanggal invoice.",
                })}
                min={state.values.invoiceDate}
                required
              />
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Lokasi stok
              <FormSelect
                className="ui-input"
                control={state.form.control}
                name="locationId"
                disabled={state.pending}
              >
                <option value="">Gudang utama (otomatis)</option>
                {options.locations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </FormSelect>
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Status pembayaran
              <RequiredMark />
              <FormSelect
                className="ui-input"
                control={state.form.control}
                name="paymentStatus"
                disabled={state.pending}
                required
              >
                <option value="unpaid">Belum dibayar</option>
                <option value="paid">Lunas</option>
              </FormSelect>
            </label>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Bahan yang diterima</h3>
              <button
                type="button"
                className="ui-button ui-button-secondary"
                onClick={() => setAdding(true)}
              >
                <Add size={17} aria-hidden />
                Bahan baru
              </button>
            </div>
            {state.lines.fields.map((field, index) => {
              const item = options.items.find(
                (i) => i.id === state.values.lines?.[index]?.stockItemId,
              );
              return (
                <div
                  key={field.id}
                  className="grid items-end gap-3 rounded-xl border border-border bg-background/50 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(150px,2fr)_90px_110px_minmax(110px,1fr)_44px]"
                >
                  <label className="text-sm font-medium">
                    Bahan
                    <RequiredMark />
                    <FormSelect
                      className="ui-input mt-1.5"
                      control={state.form.control}
                      name={`lines.${index}.stockItemId`}
                      disabled={state.pending}
                      onValueChange={(value) => {
                        const next = options.items.find((i) => i.id === value);
                        setValue(
                          `lines.${index}.unitId`,
                          next?.base_unit_id ?? "",
                          { shouldValidate: true },
                        );
                      }}
                      required
                    >
                      <option value="">Pilih bahan</option>
                      {options.items.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </FormSelect>
                  </label>
                  <label className="text-sm font-medium">
                    Satuan
                    <RequiredMark />
                    <FormSelect
                      className="ui-input mt-1.5"
                      control={state.form.control}
                      name={`lines.${index}.unitId`}
                      disabled={state.pending}
                      required
                    >
                      <option value="">Pilih</option>
                      {item?.units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.code}
                        </option>
                      ))}
                    </FormSelect>
                  </label>
                  <label className="text-sm font-medium">
                    Jumlah
                    <RequiredMark />
                    <input
                      className="ui-input mt-1.5"
                      type="number"
                      inputMode="decimal"
                      min="0.001"
                      max="1000000"
                      step="0.001"
                      {...register(`lines.${index}.quantity`, {
                        required: "Jumlah wajib diisi.",
                        min: 0.001,
                        max: 1000000,
                      })}
                      required
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Harga per satuan
                    <RequiredMark />
                    <CurrencyField
                      fractionDigits={2}
                      min="0.01"
                      max="1000000000"
                      name={`lines.${index}.unitPrice`}
                      control={state.form.control}
                      rules={{
                        required: "Harga satuan wajib diisi.",
                        min: 0.01,
                        max: 1000000000,
                      }}
                      required
                    />
                  </label>
                  <button
                    type="button"
                    className="ui-button ui-button-secondary !px-0"
                    aria-label={`Hapus bahan ${index + 1}`}
                    disabled={state.lines.fields.length === 1}
                    onClick={() => state.lines.remove(index)}
                  >
                    <Trash size={18} aria-hidden />
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              className="ui-button ui-button-secondary"
              disabled={state.lines.fields.length >= 100}
              onClick={() =>
                state.lines.append({
                  stockItemId: "",
                  unitId: "",
                  quantity: "",
                  unitPrice: "",
                })
              }
            >
              <Add size={17} aria-hidden />
              Tambah baris
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Bukti invoice
              <RequiredMark />
              <input
                className="ui-input mt-1.5 !h-auto py-2.5 file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1"
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                required
                onChange={(e) => state.setFile(e.target.files?.[0])}
              />
              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                PDF, JPG atau PNG, maksimal 8 MB.
              </span>
            </label>
            {state.values.paymentStatus === "paid" && (
              <label className="text-sm font-medium">
                Dibayar melalui
                <FormSelect
                  className="ui-input mt-1.5"
                  control={state.form.control}
                  name="accountId"
                  disabled={state.pending}
                >
                  <option value="">Kas restoran (otomatis)</option>
                  {options.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </FormSelect>
              </label>
            )}
          </div>
        </fieldset>
        {Object.keys(state.form.formState.errors).length > 0 && (
          <p role="alert" className="ui-alert ui-alert-destructive">
            Lengkapi kolom wajib dan periksa kembali tanggal, jumlah serta harga
            bahan.
          </p>
        )}
        {state.error && (
          <p role="alert" className="ui-alert ui-alert-destructive">
            {state.error}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <div>
            <p className="text-sm text-muted-foreground">Total pembelian</p>
            <p className="text-xl font-semibold tabular-nums">
              {purchaseMoney(state.total)}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="ui-button ui-button-secondary"
              disabled={state.pending}
              onClick={props.onCancel}
            >
              Batal
            </button>
            <button
              className="ui-button ui-button-primary"
              disabled={state.pending}
            >
              {state.pending ? "Menyimpan…" : "Simpan & tambah stok"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
