import { useForm } from "react-hook-form";
import {
  purchasingError,
  usePurchasingMutation,
} from "@/controller/purchasing/use-purchasing";
import type { SupplierForm, SupplierFormProps } from "@/interfaces/purchasing";
import { TextField } from "@/components/shared/text-field";
import { PhoneField } from "@/components/shared/phone-field";
import {
  phoneDigits,
  validIndonesianPhone,
  phoneValidationMessage,
} from "@/lib/phone-validation";
export function SupplierEditor({
  outletId,
  supplier,
  onSaved,
  onCancel,
}: SupplierFormProps) {
  const form = useForm<SupplierForm>({
    defaultValues: {
      id: supplier?.id,
      name: supplier?.name ?? "",
      email: supplier?.email ?? "",
      phone: phoneDigits(supplier?.phone ?? ""),
      contact: supplier?.contact ?? "",
      payment_terms_days: supplier?.payment_terms_days ?? 0,
      active: supplier?.active ?? true,
    },
  });
  const { errors } = form.formState;
  const mutation = usePurchasingMutation();
  return (
    <form
      aria-busy={mutation.isPending}
      noValidate
      className="ui-card space-y-5 p-5 sm:p-6"
      onSubmit={form.handleSubmit(async (data) => {
        try {
          await mutation.mutateAsync({
            outletId,
            action: "supplier",
            data: { ...data },
          });
          onSaved();
        } catch {
          /* Presented below. */
        }
      })}
    >
      <div>
        <h2 className="text-lg font-semibold">
          {supplier ? "Edit supplier" : "Tambah supplier"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kontak pemasok dan tempo pembayaran bahan baku.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="supplier-name"
          label="Nama supplier"
          autoFocus
          required
          maxLength={120}
          error={errors.name?.message}
          {...form.register("name", {
            required: "Nama supplier wajib diisi.",
            validate: (value) =>
              value.trim().length >= 2 || "Nama minimal 2 karakter.",
            maxLength: 120,
          })}
        />
        <TextField
          id="supplier-contact"
          label="Nama kontak (opsional)"
          maxLength={120}
          {...form.register("contact")}
        />
        <PhoneField
          id="supplier-phone"
          label="Nomor HP (opsional)"
          error={errors.phone?.message}
          {...form.register("phone", {
            validate: (value) =>
              validIndonesianPhone(value) || phoneValidationMessage,
          })}
        />
        <TextField
          id="supplier-email"
          label="Email (opsional)"
          type="email"
          maxLength={254}
          error={errors.email?.message}
          {...form.register("email", {
            validate: (value) =>
              !value ||
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
              "Masukkan email yang valid.",
          })}
        />
        <TextField
          id="supplier-terms"
          label="Tempo pembayaran (hari)"
          type="number"
          min="0"
          max="365"
          required
          error={errors.payment_terms_days?.message}
          {...form.register("payment_terms_days", {
            valueAsNumber: true,
            required: "Tempo pembayaran wajib diisi.",
            min: { value: 0, message: "Tempo minimal 0 hari." },
            max: { value: 365, message: "Tempo maksimal 365 hari." },
            validate: (value) =>
              Number.isInteger(value) || "Gunakan jumlah hari bulat.",
          })}
        />
        <label className="flex min-h-11 items-center gap-3 self-end rounded-lg border border-border px-3 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            {...form.register("active")}
          />
          Supplier aktif
        </label>
      </div>
      {mutation.isError && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          {purchasingError(mutation.error)}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="ui-button ui-button-secondary"
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Batal
        </button>
        <button
          className="ui-button ui-button-primary"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Menyimpan…" : "Simpan supplier"}
        </button>
      </div>
    </form>
  );
}
