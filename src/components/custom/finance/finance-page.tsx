import { PageHeader, PageTitle } from '@/components/shared/page-heading';
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Add,
  ArrowLeft2,
  Wallet2,
  SearchNormal1,
  Edit2,
} from "iconsax-reactjs";
import { getAccessView } from "@/controller/auth/access-view";
import { useErpUiState } from "@/stores/erp-ui-store";
import {
  useFinanceRead,
  useFinanceProof,
  financeCurrency,
  financeError,
} from "@/controller/finance/use-finance";
import { useFinanceWorkspace } from "@/hooks/finance/use-finance-workspace";
import { financeLabels } from "@/lib/finance-navigation";
import { PageState } from "@/components/shared/page-state";
import { FormModal } from "@/components/shared/form-modal";
import { SelectInput } from "@/components/shared/select-input";
import { FinanceQuickForm, quickTitles } from "./quick-form";
import { FinanceJournalDetail } from "./journal-detail";
import { FinanceTable } from "./finance-table";
import { FinanceSupplierTable } from "./supplier-table";
import type {
  FinancePageProps,
  FinanceWorkspaceProps,
  FinanceList,
  FinanceOptions,
} from "@/interfaces/finance";
export function FinancePage(p: FinancePageProps) {
  const selected = useErpUiState((s) => s.selectedOutletId);
  const access = getAccessView(p.session, selected);
  if (
    !access.selected ||
    !access.permissions.includes("finance.read") ||
    (p.view === "suppliers" && !access.permissions.includes("purchasing.read"))
  )
    return <PageState forbidden />;
  return (
    <Workspace
      key={`${access.selected.outlet_id}-${p.view}`}
      {...p}
      outletId={access.selected.outlet_id}
      canManage={access.permissions.includes("finance.manage")}
      canPay={
        access.permissions.includes("finance.manage") &&
        access.permissions.includes("purchasing.manage")
      }
    />
  );
}
function Workspace(p: FinanceWorkspaceProps) {
  const router = useRouter();
  const s = useFinanceWorkspace();
  const options = useFinanceRead<FinanceOptions>(p.outletId, "options");
  const q = useFinanceRead<FinanceList>(
    p.outletId,
    p.view,
    s.filters,
    p.view !== "suppliers",
  );
  const proof = useFinanceProof();
  const base = router.asPath.split("?")[0];
  const title = financeLabels[p.view];
  const active = options.data?.accounts.filter((a) => a.active) ?? [];
  const common = options.data
    ? {
        outletId: p.outletId,
        options: options.data,
        onSaved: s.saved,
        onCancel: s.close,
      }
    : undefined;
  const totalBalance =
    options.data?.accounts.reduce((sum, a) => sum + Number(a.balance), 0) ?? 0;
  return (
    <div className="space-y-5">
      <Link
        href="/keuangan"
        className="inline-flex min-h-11 items-center gap-2 text-14 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft2 size={16} aria-hidden />
        Keuangan
      </Link>
      <PageHeader className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <PageTitle className="">{title}</PageTitle>
          <p className="mt-1 text-14 text-muted-foreground">
            {p.view === "movements"
              ? "Saldo pembukuan dan aliran dana dari transaksi yang sudah diposting."
              : p.view === "expenses"
                ? "Catat biaya operasional beserta sumber dana dan notanya."
                : p.view === "journals"
                  ? "Telusuri debit dan kredit hingga dokumen sumbernya."
                  : p.view === "suppliers"
                    ? "Pantau invoice pembelian dan pelunasannya tanpa menambah stok kembali."
                    : "Cocokkan mutasi rekening bank dengan pencatatan buku."}
          </p>
        </div>
        {p.canManage && (
          <div className="flex flex-wrap gap-2">
            {p.view === "movements" ? (
              <>
                <button
                  className="ui-button ui-button-secondary"
                  disabled={!common}
                  onClick={() => s.setQuick("capital")}
                >
                  Setoran modal
                </button>
                <button
                  className="ui-button ui-button-secondary"
                  disabled={!common || active.length < 2}
                  onClick={() => s.setQuick("transfer")}
                >
                  Transfer dana
                </button>
                <button
                  className="ui-button ui-button-primary"
                  disabled={!common}
                  onClick={() => s.setQuick("account")}
                >
                  <Add size={17} aria-hidden />
                  Tambah rekening
                </button>
              </>
            ) : p.view === "expenses" ? (
              <>
                <button
                  className="ui-button ui-button-secondary"
                  disabled={!common}
                  onClick={() => s.setQuick("category")}
                >
                  Tambah kategori
                </button>
                <Link
                  href={`${base}/form`}
                  className="ui-button ui-button-primary"
                >
                  <Add size={17} aria-hidden />
                  Catat pengeluaran
                </Link>
              </>
            ) : p.view === "reconciliations" ? (
              <>
                <Link
                  href={`${base}/impor`}
                  className="ui-button ui-button-secondary"
                >
                  Impor mutasi bank
                </Link>
                <Link
                  href={`${base}/cocokkan`}
                  className="ui-button ui-button-primary"
                >
                  Cocokkan transaksi
                </Link>
              </>
            ) : null}
          </div>
        )}
      </PageHeader>
      {(s.notice || router.query.saved === "1") && (
        <p role="status" className="ui-alert ui-alert-success">
          {s.notice || "Data keuangan berhasil disimpan."}
        </p>
      )}
      {options.isError && (
        <div className="ui-alert ui-alert-destructive">
          <p>{financeError(options.error)}</p>
          <button
            className="ui-button ui-button-secondary w-fit"
            onClick={() => options.refetch()}
          >
            Muat rekening kembali
          </button>
        </div>
      )}
      {p.view === "movements" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {options.isPending ? (
              <p role="status">Memuat rekening...</p>
            ) : !options.data?.accounts.length ? (
              <div className="ui-card text-14 text-muted-foreground">
                Belum ada rekening. Tambahkan kas atau bank untuk mulai mencatat
                dana.
              </div>
            ) : (
              options.data.accounts.map((a) => (
                <article key={a.id} className="ui-card !p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-14 font-medium">
                      <Wallet2 size={18} aria-hidden />
                      {a.name}
                    </span>
                    {p.canManage && ["cash", "bank"].includes(a.kind) && (
                      <button
                        className="ui-button ui-button-ghost !p-2"
                        aria-label={`Edit rekening ${a.name}`}
                        onClick={() => {
                          s.setAccount(a);
                          s.setQuick("account");
                        }}
                      >
                        <Edit2 size={16} aria-hidden />
                      </button>
                    )}
                  </div>
                  <p
                    className={`mt-3 text-2xl font-semibold tabular-nums ${Number(a.balance) < 0 ? "text-destructive" : ""}`}
                  >
                    {financeCurrency(a.balance)}
                  </p>
                  <p className="mt-1 text-13 text-muted-foreground">
                    {a.kind === "bank" ? "Bank" : "Kas"}
                    {a.mask ? ` / ${a.mask}` : ""} / Saldo buku
                  </p>
                </article>
              ))
            )}
          </div>
          {totalBalance < 0 && (
            <p className="ui-alert ui-alert-warning">
              Saldo buku masih negatif. Periksa pencatatan setoran modal atau
              pemasukan yang belum dicatat sesuai transaksi sebenarnya.
            </p>
          )}
        </>
      )}
      {p.view !== "suppliers" && p.view !== "movements" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="ui-card !p-4">
            <p className="text-14 text-muted-foreground">
              {p.view === "journals"
                ? "Total debit sesuai filter"
                : p.view === "expenses"
                  ? "Total pengeluaran sesuai filter"
                  : "Pencocokan sesuai filter"}
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {!q.data
                ? "-"
                : p.view === "journals"
                  ? financeCurrency(q.data?.summary?.debit ?? 0)
                  : p.view === "expenses"
                    ? financeCurrency(q.data?.summary?.amount ?? 0)
                    : (q.data?.total ?? 0)}
            </p>
          </div>
          <div className="ui-card !p-4">
            <p className="text-14 text-muted-foreground">
              {p.view === "journals"
                ? "Total kredit sesuai filter"
                : "Pencatatan"}
            </p>
            <p className="mt-2 font-semibold">
              {p.view === "journals"
                ? financeCurrency(q.data?.summary?.credit ?? 0)
                : p.view === "expenses"
                  ? "Beban dan mutasi keluar tercatat bersama"
                  : "Alokasi bank sama dengan buku"}
            </p>
          </div>
        </div>
      )}
      {s.quick && common && (
        <FormModal label={quickTitles[s.quick]} onClose={s.close}>
          <FinanceQuickForm
            key={`${s.quick}-${s.account?.id ?? "new"}`}
            {...common}
            action={s.quick}
            account={s.account}
          />
        </FormModal>
      )}
      {s.journal && (
        <FormModal
          label="Detail jurnal"
          onClose={() => s.setJournal(undefined)}
        >
          <FinanceJournalDetail
            outletId={p.outletId}
            id={s.journal}
            onClose={() => s.setJournal(undefined)}
          />
        </FormModal>
      )}
      <section
        className="ui-table-container"
        aria-label={`Daftar ${title.toLowerCase()}`}
      >
        <div className="ui-filter-bar grid sm:grid-cols-2 lg:grid-cols-4">
          <label className="ui-field">
            <span className="ui-label">Cari transaksi</span>
            <span className="relative">
              <SearchNormal1
                size={17}
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                className="ui-input !pl-10"
                placeholder="Referensi atau keterangan..."
                value={s.filters.search}
                onChange={(e) => s.change("search", e.target.value)}
              />
            </span>
          </label>
          {p.view === "suppliers" ? (
            <label className="ui-field">
              <span className="ui-label">Pembayaran</span>
              <SelectInput
                value={s.filters.status}
                onValueChange={(v) => s.change("status", v)}
              >
                <option value="all">Semua invoice</option>
                <option value="unpaid">Belum dibayar</option>
                <option value="paid">Lunas</option>
              </SelectInput>
            </label>
          ) : (
            <label className="ui-field">
              <span className="ui-label">Rekening</span>
              <SelectInput
                value={s.filters.accountId}
                onValueChange={(v) => s.change("accountId", v)}
                disabled={p.view === "journals"}
              >
                <option value="">Semua rekening</option>
                {options.data?.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </SelectInput>
            </label>
          )}
          {["movements", "expenses", "journals"].includes(p.view) && (
            <>
              <label className="ui-field">
                <span className="ui-label">Dari tanggal</span>
                <input
                  type="date"
                  className="ui-input"
                  value={s.filters.from}
                  max={s.filters.to || undefined}
                  onChange={(e) => s.change("from", e.target.value)}
                />
              </label>
              <label className="ui-field">
                <span className="ui-label">Sampai tanggal</span>
                <input
                  type="date"
                  className="ui-input"
                  value={s.filters.to}
                  min={s.filters.from || undefined}
                  onChange={(e) => s.change("to", e.target.value)}
                />
              </label>
            </>
          )}
        </div>
        {p.view === "suppliers" ? (
          <FinanceSupplierTable
            outletId={p.outletId}
            canPay={p.canPay}
            filters={s.filters}
            onPage={(page) => s.change("page", page)}
          />
        ) : q.isPending ? (
          <p role="status" className="p-6 text-14 text-muted-foreground">
            Memuat transaksi...
          </p>
        ) : q.isError ? (
          <div className="space-y-3 p-5">
            <p role="alert" className="text-destructive">
              {financeError(q.error)}
            </p>
            <button
              className="ui-button ui-button-secondary"
              onClick={() => q.refetch()}
            >
              Coba lagi
            </button>
          </div>
        ) : !q.data?.items.length ? (
          <div className="p-8 text-center">
            <p className="font-medium">Belum ada transaksi sesuai filter</p>
            <p className="mt-2 text-14 text-muted-foreground">
              Data tampil setelah dokumen terkait dicatat dan diposting.
            </p>
          </div>
        ) : (
          <>
            <FinanceTable
              view={p.view}
              items={q.data.items}
              onJournal={s.setJournal}
              onProof={async (id) => {
                try {
                  const result = await proof.mutateAsync({
                    outletId: p.outletId,
                    id,
                  });
                  window.location.assign(result.url);
                } catch {
                  /* shown below */
                }
              }}
              proofPending={proof.isPending}
            />
            <div className="flex items-center justify-between gap-3 border-t border-border p-4 text-14">
              <span>
                {q.data.total} transaksi / Halaman {s.filters.page}
              </span>
              <div className="flex gap-2">
                <button
                  className="ui-button ui-button-secondary"
                  disabled={s.filters.page === 1}
                  onClick={() => s.change("page", s.filters.page - 1)}
                >
                  Sebelumnya
                </button>
                <button
                  className="ui-button ui-button-secondary"
                  disabled={s.filters.page * 20 >= q.data.total}
                  onClick={() => s.change("page", s.filters.page + 1)}
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      {proof.isError && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          {financeError(proof.error)}
        </p>
      )}
    </div>
  );
}
