import { FormSelect } from "@/components/shared/form-select";
import { RequiredMark } from "@/components/shared/required-mark";
import { useFinanceImport } from "@/hooks/finance/use-finance-import";
import type { FinanceFormProps } from "@/interfaces/finance";
const template =
  "id,tanggal,jumlah,referensi,keterangan\nBANK-001,2026-11-09,1500000,SETORAN-001,Setoran ke rekening\nBANK-002,2026-11-09,-6500,ADM-001,Biaya administrasi\n";
export function FinanceImportForm(p: FinanceFormProps) {
  const s = useFinanceImport(p);
  return (
    <form
      noValidate
      aria-busy={s.command.pending}
      className="ui-card space-y-5"
      onSubmit={s.submit}
    >
      <div>
        <h1 className="text-xl font-semibold">Impor mutasi bank</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Impor menjadi pembanding rekonsiliasi. Saldo buku tidak berubah.
        </p>
      </div>
      <fieldset disabled={s.command.pending} className="space-y-4">
        <label className="ui-field max-w-md">
          <span className="ui-label">
            Rekening bank
            <RequiredMark />
          </span>
          <FormSelect control={s.form.control} name="accountId" required>
            <option value="">Pilih rekening bank</option>
            {p.options.accounts
              .filter((a) => a.active && a.kind === "bank")
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </FormSelect>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="ui-field">
            <span className="ui-label">Berkas CSV (opsional)</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="ui-input !h-auto py-2.5"
              onChange={(e) => void s.readFile(e.target.files?.[0])}
            />
          </label>
          <a
            download="template-mutasi-bank.csv"
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(template)}`}
            className="ui-button ui-button-secondary"
          >
            Unduh format CSV
          </a>
        </div>
        <label className="ui-field">
          <span className="ui-label">
            Isi CSV
            <RequiredMark />
          </span>
          <textarea
            aria-invalid={Boolean(s.form.formState.errors.csv)}
            rows={10}
            className="ui-input !h-auto font-mono text-xs"
            {...s.form.register("csv", { required: "Isi CSV wajib diisi." })}
            placeholder={template}
          />
          {s.form.formState.errors.csv && (
            <span role="alert" className="text-xs text-destructive">
              {s.form.formState.errors.csv.message}
            </span>
          )}
        </label>
        <p className="ui-help">
          Gunakan ID transaksi bank yang tetap agar impor ulang tidak
          menggandakan data. Jumlah masuk positif, keluar negatif, tanpa pemisah
          ribuan. Maksimal 100 transaksi per impor.
        </p>
      </fieldset>
      {(s.error || s.command.error) && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          {s.error || s.command.error}
        </p>
      )}
      {s.result && (
        <p role="status" className="ui-alert ui-alert-success">
          {s.result}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={s.command.pending}
          className="ui-button ui-button-secondary"
          onClick={p.onCancel}
        >
          Kembali
        </button>
        <button
          disabled={s.command.pending}
          className="ui-button ui-button-primary"
        >
          {s.command.pending ? "Mengimpor..." : "Impor mutasi"}
        </button>
      </div>
    </form>
  );
}
