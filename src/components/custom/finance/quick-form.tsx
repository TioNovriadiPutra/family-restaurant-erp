import { CurrencyField } from "@/components/shared/currency-field";
import { TextField } from "@/components/shared/text-field";
import { FormSelect } from "@/components/shared/form-select";
import { RequiredMark } from "@/components/shared/required-mark";
import { useFinanceQuickForm } from "@/hooks/finance/use-finance-quick-form";
import { financeMoney } from "@/lib/finance-validation";
import { financeToday } from "@/controller/finance/use-finance";
import type { FinanceQuickProps } from "@/interfaces/finance";
export const quickTitles = {
  account: "Rekening kas / bank",
  category: "Kategori beban",
  capital: "Setoran modal pemilik",
  transfer: "Transfer antar rekening",
};
export function FinanceQuickForm(p: FinanceQuickProps) {
  const s = useFinanceQuickForm(p);
  const {
    register,
    formState: { errors },
  } = s.form;
  const master = p.action === "account" || p.action === "category";
  return (
    <form
      noValidate
      aria-busy={s.command.pending}
      className="ui-card space-y-5"
      onSubmit={s.submit}
    >
      <div>
        <h2 className="text-lg font-semibold">
          {p.account ? "Edit rekening" : quickTitles[p.action]}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {master
            ? "Atur nama yang mudah dikenali saat mencatat transaksi."
            : p.action === "capital"
              ? "Menambah kas dan modal pemilik. Tidak dihitung sebagai pendapatan."
              : "Memindahkan saldo buku tanpa mencatat pendapatan atau beban."}
        </p>
      </div>
      <fieldset
        disabled={s.command.pending}
        className="grid gap-4 sm:grid-cols-2"
      >
        {master ? (
          <>
            <TextField
              id="finance-name"
              label={
                p.action === "category" ? "Nama kategori" : "Nama rekening"
              }
              autoFocus
              required
              maxLength={120}
              error={errors.name?.message}
              {...register("name", {
                required: "Nama wajib diisi.",
                validate: (v) =>
                  v.trim().length >= 2 || "Nama minimal 2 karakter.",
              })}
            />
            {p.action === "account" && (
              <>
                <label className="ui-field">
                  <span className="ui-label">
                    Jenis rekening
                    <RequiredMark />
                  </span>
                  <FormSelect
                    control={s.form.control}
                    name="kind"
                    disabled={!!p.account || s.command.pending}
                    required
                  >
                    <option value="cash">Kas</option>
                    <option value="bank">Bank</option>
                  </FormSelect>
                </label>
                <TextField
                  id="finance-mask"
                  label="Nomor rekening tersamar (opsional)"
                  placeholder="Contoh: **** 1234"
                  maxLength={40}
                  {...register("mask")}
                />
              </>
            )}
          </>
        ) : (
          <>
            <label className="ui-field">
              <span className="ui-label">
                {p.action === "transfer"
                  ? "Rekening asal"
                  : "Rekening penerima"}
                <RequiredMark />
              </span>
              <FormSelect
                control={s.form.control}
                name="accountId"
                required
                onValueChange={(value) => {
                  if (s.form.getValues("toAccountId") === value)
                    s.form.setValue("toAccountId", "", {
                      shouldValidate: true,
                    });
                }}
              >
                <option value="">Pilih rekening</option>
                {p.options.accounts
                  .filter((a) => a.active)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </FormSelect>
            </label>
            {p.action === "transfer" && (
              <label className="ui-field">
                <span className="ui-label">
                  Rekening tujuan
                  <RequiredMark />
                </span>
                <FormSelect
                  control={s.form.control}
                  name="toAccountId"
                  required
                >
                  <option value="">Pilih rekening berbeda</option>
                  {p.options.accounts
                    .filter((a) => a.active && a.id !== s.accountId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </FormSelect>
              </label>
            )}
            <CurrencyField
              fractionDigits={2}
              id="finance-amount"
              label="Jumlah (Rp)"
              required
              error={errors.amount?.message}
              name={"amount"}
              control={s.form.control}
              rules={{
                required: "Jumlah wajib diisi.",
                validate: (v) =>
                  financeMoney(v) ||
                  "Gunakan nominal positif, maksimal 2 desimal.",
              }}
            />
            <TextField
              id="finance-date"
              label="Tanggal"
              type="date"
              required
              max={financeToday(p.options.timezone)}
              {...register("date", { required: "Tanggal wajib diisi." })}
            />
            <TextField
              id="finance-description"
              label="Keterangan"
              required
              maxLength={500}
              {...register("description", {
                required: "Keterangan wajib diisi.",
                minLength: 2,
              })}
            />
          </>
        )}
      </fieldset>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="text-sm text-destructive">
          Lengkapi kolom wajib dan periksa nominal.
        </p>
      )}
      {s.command.error && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          {s.command.error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="ui-button ui-button-secondary"
          disabled={s.command.pending}
          onClick={p.onCancel}
        >
          Batal
        </button>
        <button
          className="ui-button ui-button-primary"
          disabled={s.command.pending}
        >
          {s.command.pending
            ? "Menyimpan..."
            : master
              ? "Simpan"
              : "Simpan & posting"}
        </button>
      </div>
    </form>
  );
}
