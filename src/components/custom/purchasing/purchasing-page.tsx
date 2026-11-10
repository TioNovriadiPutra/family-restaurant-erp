import { useRouter } from "next/router";
import { FormModal } from "@/components/shared/form-modal";
import Link from "next/link";
import {
  Add,
  ArrowLeft2,
  SearchNormal1,
  People,
  ShoppingCart,
  Box,
} from "iconsax-reactjs";
import {
  purchaseMoney,
  purchasingError,
} from "@/controller/purchasing/use-purchasing";
import { usePurchasingPage } from "@/hooks/purchasing/use-purchasing-page";
import type { PurchasingPageProps } from "@/interfaces/purchasing";
import { SupplierEditor } from "./supplier-form";
import { PurchaseDetail } from "./purchase-detail";
import { getAccessView } from "@/controller/auth/access-view";
import { useErpUiState } from "@/stores/erp-ui-store";
import { PageState } from "@/components/shared/page-state";
export function PurchasingPage(props: PurchasingPageProps) {
  const selected = useErpUiState((state) => state.selectedOutletId);
  const access = getAccessView(props.session, selected);
  const permission =
    props.view === "stock" ? "inventory.read" : "purchasing.read";
  if (!access.selected || !access.permissions.includes(permission))
    return <PageState forbidden />;
  return <PurchasingWorkspace key={access.selected.outlet_id} {...props} />;
}
function PurchasingWorkspace(props: PurchasingPageProps) {
  const router = useRouter();
  const s = usePurchasingPage(props);
  const { view } = props;
  const Icon =
    view === "suppliers" ? People : view === "stock" ? Box : ShoppingCart;
  const title =
    view === "suppliers"
      ? "Data supplier"
      : view === "stock"
        ? "Stok bahan baku"
        : "Pembelian bahan baku";
  const description =
    view === "suppliers"
      ? "Pemasok bahan baku dan kontak yang bisa dihubungi."
      : view === "stock"
        ? "Stok bertambah otomatis dari pembelian yang sudah diterima."
        : "Catat invoice barang yang diterima dan pantau pembayarannya.";
  return (
    <div className="space-y-5">
      <Link
        href={view === "stock" ? "/persediaan" : "/pembelian"}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft2 size={16} aria-hidden />
        {view === "stock" ? "Persediaan" : "Pembelian"}
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-primary/10 p-3 text-primary">
            <Icon size={23} aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {view !== "stock" && s.canManage && (
          <button
            className="ui-button ui-button-primary"
            onClick={() => {
              s.setDetail(undefined);
              s.setNotice("");
              if (view === "suppliers") s.setCreating(true);
              else void router.push("/pembelian/pembelian-bahan/form");
            }}
          >
            <Add size={18} aria-hidden />
            {view === "suppliers" ? "Tambah supplier" : "Catat pembelian"}
          </button>
        )}
      </div>
      {(s.notice || router.query.saved === "1") && (
        <p className="ui-alert ui-alert-success" role="status">
          {s.notice || "Pembelian tercatat. Stok bahan sudah bertambah."}
        </p>
      )}
      {view === "suppliers" && (s.creating || s.supplier) && (
        <FormModal
          label={s.supplier ? "Edit supplier" : "Tambah supplier"}
          onClose={s.close}
        >
          <SupplierEditor
            key={s.supplier?.id ?? "new"}
            outletId={s.outletId}
            supplier={s.supplier}
            onCancel={s.close}
            onSaved={() => {
              s.close();
              s.setNotice("Data supplier berhasil disimpan.");
            }}
          />
        </FormModal>
      )}
      {s.detail && (
        <PurchaseDetail
          key={s.detail.id}
          outletId={s.outletId}
          purchase={s.detail}
          canManage={s.canManage}
          onClose={() => s.setDetail(undefined)}
        />
      )}
      <section
        className="ui-card overflow-hidden"
        aria-label={`Daftar ${title.toLowerCase()}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <h2 className="font-semibold">
            {view === "suppliers"
              ? "Daftar supplier"
              : view === "stock"
                ? "Saldo stok"
                : "Riwayat pembelian"}
          </h2>
          {view !== "stock" && (
            <label className="relative w-full sm:w-72">
              <SearchNormal1
                size={17}
                className="pointer-events-none absolute left-3 top-3.5 text-muted-foreground"
                aria-hidden
              />
              <span className="sr-only">Cari {title.toLowerCase()}</span>
              <input
                className="ui-input !pl-10"
                placeholder={
                  view === "suppliers"
                    ? "Cari nama supplier…"
                    : "Cari supplier atau invoice…"
                }
                value={s.search}
                onChange={(e) => s.setSearch(e.target.value)}
              />
            </label>
          )}
        </div>
        {s.query.isPending ? (
          <p className="p-6 text-sm text-muted-foreground" role="status">
            Memuat data…
          </p>
        ) : s.query.isError ? (
          <div className="space-y-3 p-5">
            <p role="alert" className="text-sm text-destructive">
              {purchasingError(s.query.error)}
            </p>
            <button
              className="ui-button ui-button-secondary"
              onClick={() => s.query.refetch()}
            >
              Coba lagi
            </button>
          </div>
        ) : !s.query.data?.items.length ? (
          <div className="p-8 text-center">
            <p className="font-medium">
              {s.search
                ? "Data tidak ditemukan"
                : view === "stock"
                  ? "Belum ada stok bahan"
                  : view === "suppliers"
                    ? "Belum ada supplier"
                    : "Belum ada pembelian"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {view === "stock"
                ? "Catat pembelian bahan yang sudah diterima untuk menambah stok."
                : s.search
                  ? "Coba kata pencarian lain."
                  : view === "suppliers"
                    ? "Tambahkan pemasok pertama untuk mulai mencatat pembelian."
                    : "Tambahkan supplier, lalu catat invoice pembelian pertama."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ui-table min-w-[650px]">
              <thead>
                <tr>
                  {(view === "suppliers"
                    ? ["Supplier", "Kontak", "Tempo", "Status", "Aksi"]
                    : view === "stock"
                      ? ["Bahan", "Lokasi", "Jumlah", "Nilai stok"]
                      : [
                          "Invoice",
                          "Supplier",
                          "Tanggal",
                          "Total",
                          "Pembayaran",
                          "Aksi",
                        ]
                  ).map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.query.data.items.map((item) =>
                  "active" in item ? (
                    <tr key={item.id}>
                      <th scope="row">
                        <span className="block">{item.name}</span>
                        <span className="mt-1 block text-xs font-normal text-muted-foreground">
                          {item.code}
                        </span>
                      </th>
                      <td>
                        <span className="block">{item.contact || "—"}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.phone || item.email || "Belum diisi"}
                        </span>
                      </td>
                      <td>{item.payment_terms_days} hari</td>
                      <td>
                        <span
                          className={
                            item.active
                              ? "ui-badge ui-badge-success"
                              : "ui-badge"
                          }
                        >
                          {item.active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td>
                        {s.canManage ? (
                          <button
                            className="ui-button ui-button-secondary"
                            onClick={() => {
                              s.setCreating(false);
                              s.setSupplier(item);
                            }}
                          >
                            Edit
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ) : "quantity" in item ? (
                    <tr key={`${item.id}-${item.location}`}>
                      <th scope="row">
                        {item.name}
                        <span className="mt-1 block text-xs font-normal text-muted-foreground">
                          {item.code}
                        </span>
                      </th>
                      <td>{item.location}</td>
                      <td>
                        {Number(item.quantity).toLocaleString("id-ID")}{" "}
                        {item.unit}
                      </td>
                      <td>{purchaseMoney(item.inventory_value)}</td>
                    </tr>
                  ) : (
                    <tr key={item.id}>
                      <th scope="row">
                        {item.invoice_number}
                        <span className="mt-1 block text-xs font-normal text-muted-foreground">
                          {item.number}
                        </span>
                      </th>
                      <td>{item.supplier_name}</td>
                      <td>{item.invoice_date}</td>
                      <td className="whitespace-nowrap tabular-nums">
                        {purchaseMoney(item.total)}
                      </td>
                      <td>
                        <span
                          className={
                            item.payment_status === "paid"
                              ? "ui-badge ui-badge-success"
                              : "ui-badge ui-badge-warning"
                          }
                        >
                          {item.payment_status === "paid"
                            ? "Lunas"
                            : "Belum dibayar"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="ui-button ui-button-secondary"
                          onClick={() => {
                            s.close();
                            s.setDetail(item);
                          }}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
        {view === "purchases" && Number(s.query.data?.total) > 20 && (
          <div className="flex items-center justify-between border-t border-border p-4 text-sm">
            <span>
              Halaman {s.page} dari {Math.ceil((s.query.data?.total ?? 0) / 20)}
            </span>
            <div className="flex gap-2">
              <button
                className="ui-button ui-button-secondary"
                disabled={s.page === 1}
                onClick={() => s.setPage(s.page - 1)}
              >
                Sebelumnya
              </button>
              <button
                className="ui-button ui-button-secondary"
                disabled={s.page * 20 >= (s.query.data?.total ?? 0)}
                onClick={() => s.setPage(s.page + 1)}
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
