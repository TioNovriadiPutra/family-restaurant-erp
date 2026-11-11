import { SectionTitle, PageTitle } from '@/components/shared/page-heading';
import { CurrencyField } from "@/components/shared/currency-field";
import { FormSelect } from "@/components/shared/form-select";
import { RequiredMark } from "@/components/shared/required-mark";
import { useFinanceReconcile } from "@/hooks/finance/use-finance-reconcile";
import {
  financeCurrency,
  financeDate,
  financeError,
} from "@/controller/finance/use-finance";
import { financeMoney } from "@/lib/finance-validation";
import type {
  FinanceFormProps,
  FinanceAllocationProps,
} from "@/interfaces/finance";
function Allocations({
  name,
  title,
  items,
  form,
  disabled,
}: FinanceAllocationProps) {
  return (
    <section className="min-w-0 space-y-3">
      <SectionTitle className="">{title}</SectionTitle>
      {!items.length ? (
        <p className="rounded-control border border-dashed border-border p-5 text-14 text-muted-foreground">
          Tidak ada transaksi tersisa pada sisi ini.
        </p>
      ) : (
        items.map((l, i) => (
          <div
            key={l.id}
            className="flex items-start gap-3 rounded-control border border-border p-3"
          >
            <input
              type="checkbox"
              aria-label={`Pilih ${title} ${i + 1}: ${l.reference || l.description}`}
              className="mt-1 size-4 accent-primary"
              disabled={disabled}
              {...form.register(`${name}.${i}.selected`)}
            />
            <span className="min-w-0 flex-1">
              <span className="block break-words text-14 font-medium">
                {l.reference || l.description}
              </span>
              <span className="mt-1 block text-13 text-muted-foreground">
                {financeDate(l.date)} / Sisa {financeCurrency(l.remaining)}
              </span>
              <span className="mt-2 block text-13">Jumlah alokasi (Rp)</span>
              <CurrencyField
                allowNegative
                fractionDigits={2}
                aria-label={`Alokasi ${title} ${i + 1}`}
                aria-invalid={Boolean(form.formState.errors[name]?.[i]?.amount)}
                disabled={disabled}
                name={`${name}.${i}.amount`}
                control={form.control}
                rules={{
                  validate: (v, values) =>
                    !values[name][i]?.selected ||
                    (financeMoney(v, true) &&
                      Math.sign(Number(v)) === Math.sign(Number(l.remaining)) &&
                      Math.abs(Number(v)) <= Math.abs(Number(l.remaining))) ||
                    "Alokasi harus searah dan tidak melebihi sisa transaksi.",
                }}
              />
            </span>
          </div>
        ))
      )}
    </section>
  );
}
export function FinanceReconcileForm(p: FinanceFormProps) {
  const s = useFinanceReconcile(p);
  return (
    <form
      noValidate
      aria-busy={s.command.pending}
      className="ui-card space-y-5 ui-form ui-form-panel"
      onSubmit={s.submit}
    >
      <div>
        <PageTitle className="">Cocokkan mutasi bank</PageTitle>
        <p className="mt-1 text-14 text-muted-foreground">
          Pilih transaksi buku dan bank dengan arah yang sama. Alokasi parsial
          diperbolehkan.
        </p>
      </div>
      <label className="ui-field max-w-md">
        <span className="ui-label">
          Rekening bank
          <RequiredMark />
        </span>
        <FormSelect
          control={s.form.control}
          name="accountId"
          required
          disabled={s.command.pending}
        >
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
      {s.form.watch("accountId") &&
        (s.query.isPending ? (
          <p role="status">Memuat transaksi tersisa...</p>
        ) : s.query.isError ? (
          <div className="ui-alert ui-alert-destructive">
            <p>{financeError(s.query.error)}</p>
            <button
              type="button"
              className="ui-button ui-button-secondary"
              onClick={() => s.query.refetch()}
            >
              Coba lagi
            </button>
          </div>
        ) : (
          s.query.data && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Allocations
                title="Mutasi bank"
                name="bank"
                items={s.query.data.bank}
                form={s.form}
                disabled={s.command.pending}
              />
              <Allocations
                title="Pembukuan"
                name="book"
                items={s.query.data.book}
                form={s.form}
                disabled={s.command.pending}
              />
            </div>
          )
        ))}
      <dl className="grid gap-3 rounded-control bg-secondary/50 p-4 sm:grid-cols-3">
        {[
          ["Alokasi bank", s.bank],
          ["Alokasi buku", s.book],
          ["Selisih", s.difference],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-14 text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-semibold tabular-nums">
              {financeCurrency(Number(value) / 100)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="ui-help">
        Biaya administrasi yang belum ada di pembukuan harus dicatat sebagai
        pengeluaran. Pencocokan ini tidak memverifikasi pembayaran pelanggan.
      </p>
      {s.command.error && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          {s.command.error}
        </p>
      )}
      {Object.keys(s.form.formState.errors).length > 0 && (
        <p role="alert" className="text-14 text-destructive">
          Periksa jumlah alokasi yang dipilih.
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={s.command.pending}
          className="ui-button ui-button-secondary"
          onClick={p.onCancel}
        >
          Batal
        </button>
        <button
          disabled={
            s.command.pending ||
            !s.bank ||
            s.difference !== 0 ||
            s.query.isFetching
          }
          className="ui-button ui-button-primary"
        >
          {s.command.pending ? "Mencocokkan..." : "Simpan pencocokan"}
        </button>
      </div>
    </form>
  );
}
