import { TextField } from "@/components/shared/text-field";
import { FormSelect } from "@/components/shared/form-select";
import { RequiredMark } from "@/components/shared/required-mark";
import { useFinanceExpense } from "@/hooks/finance/use-finance-expense";
import { financeMoney } from "@/lib/finance-validation";
import { financeToday } from "@/controller/finance/use-finance";
import type { FinanceFormProps } from "@/interfaces/finance";
export function FinanceExpenseForm(p: FinanceFormProps) {
  const s = useFinanceExpense(p);
  const {
    register,
    formState: { errors },
  } = s.form;
  return (
    <form
      noValidate
      aria-busy={s.pending}
      className="ui-card space-y-5"
      onSubmit={s.submit}
    >
      <div>
        <h1 className="text-xl font-semibold">Catat pengeluaran</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Simpan nota biaya operasional. Kas berkurang dan beban tercatat
          setelah disimpan.
        </p>
      </div>
      <fieldset disabled={s.pending} className="grid items-start gap-4 sm:grid-cols-2">
        <label className="ui-field">
          <span className="ui-label">
            Kategori beban
            <RequiredMark />
          </span>
          <FormSelect control={s.form.control} name="categoryId" required>
            <option value="">Pilih kategori</option>
            {p.options.categories.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </FormSelect>
        </label>
        <label className="ui-field">
          <span className="ui-label">
            Sumber dana
            <RequiredMark />
          </span>
          <FormSelect control={s.form.control} name="accountId" required>
            <option value="">Pilih kas / bank</option>
            {p.options.accounts
              .filter((a) => a.active)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </FormSelect>
        </label>
        <TextField
          id="expense-amount"
          label="Jumlah (Rp)"
          inputMode="decimal"
          required
          error={errors.amount?.message}
          {...register("amount", {
            required: "Jumlah wajib diisi.",
            validate: (v) =>
              financeMoney(v) || "Nominal harus positif, maksimal 2 desimal.",
          })}
        />
        <TextField
          id="expense-date"
          label="Tanggal pengeluaran"
          type="date"
          required
          max={financeToday(p.options.timezone)}
          {...register("date", { required: "Tanggal wajib diisi." })}
        />
        <TextField
          id="expense-description"
          label="Keterangan pengeluaran"
          required
          maxLength={500}
          error={errors.description?.message}
          {...register("description", {
            required: "Keterangan wajib diisi.",
            validate: (v) =>
              v.trim().length >= 2 || "Keterangan minimal 2 karakter.",
          })}
        />
        <label className="ui-field">
          <span className="ui-label">
            Bukti pengeluaran
            <RequiredMark />
          </span>
          <input
            type="file"
            required
            accept="application/pdf,image/png,image/jpeg"
            className="ui-input !h-auto py-2.5"
            onChange={(e) => s.setFile(e.target.files?.[0])}
          />
          <span className="ui-help">PDF, JPG atau PNG, maksimal 8 MB.</span>
        </label>
      </fieldset>
      {s.error && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          {s.error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          Pembelian bahan dicatat melalui menu Pembelian.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={s.pending}
            className="ui-button ui-button-secondary"
            onClick={p.onCancel}
          >
            Batal
          </button>
          <button disabled={s.pending} className="ui-button ui-button-primary">
            {s.pending ? "Menyimpan..." : "Simpan pengeluaran"}
          </button>
        </div>
      </div>
    </form>
  );
}
