import { SectionTitle } from '@/components/shared/page-heading';
import { TextField } from "@/components/shared/text-field";
import { useDiningTableForm } from "@/hooks/settings/use-dining-tables";
import type { TableFormProps } from "@/interfaces/dining-tables";
export function DiningTableForm(p: TableFormProps) {
  const f = useDiningTableForm(p);
  return (
    <form
      className="ui-card space-y-5 ui-form ui-form-panel"
      onSubmit={f.submit}
      aria-busy={f.pending}
    >
      <div>
        <SectionTitle className="">
          {p.table ? "Edit meja" : "Tambah meja"}
        </SectionTitle>
        <p className="mt-1 text-14 text-muted-foreground">
          Atur identitas dan kapasitas meja untuk POS.
        </p>
      </div>
      <fieldset disabled={f.pending} className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="table-code"
          label="Kode meja"
          required
          maxLength={20}
          placeholder="M01"
          error={f.form.formState.errors.code?.message}
          {...f.form.register("code", {
            required: "Kode meja wajib diisi.",
            validate: (v) =>
              /^[A-Z0-9][A-Z0-9 _-]{0,19}$/.test(v.trim().toUpperCase()) ||
              "Gunakan huruf, angka, spasi, tanda - atau _ (maksimal 20 karakter).",
          })}
        />
        <TextField
          id="table-seats"
          label="Jumlah kursi"
          required
          type="number"
          min={1}
          max={100}
          step={1}
          error={f.form.formState.errors.seats?.message}
          {...f.form.register("seats", {
            valueAsNumber: true,
            required: "Jumlah kursi wajib diisi.",
            validate: (v) =>
              (Number.isInteger(v) && v >= 1 && v <= 100) ||
              "Isi jumlah kursi antara 1 dan 100.",
          })}
        />
        <label className="flex min-h-11 items-center gap-3 rounded-lg border border-border px-3 text-14 sm:col-span-2">
          <input type="checkbox" {...f.form.register("active")} />
          Aktif dan ditampilkan di POS
        </label>
      </fieldset>
      <p className="text-14 text-muted-foreground">
        Status tersedia atau terisi mengikuti pesanan. Meja dengan pesanan
        berjalan belum dapat diubah.
      </p>
      {f.error && (
        <p role="alert" className="ui-alert ui-alert-error">
          {f.error}
        </p>
      )}
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          className="ui-button ui-button-secondary"
          disabled={f.pending}
          onClick={p.onClose}
        >
          Batal
        </button>
        <button className="ui-button ui-button-primary" disabled={f.pending}>
          {f.pending ? "Menyimpan..." : "Simpan meja"}
        </button>
      </div>
    </form>
  );
}
