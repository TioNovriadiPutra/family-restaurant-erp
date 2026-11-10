import { useRouter } from "next/router";
import { FormModal } from "@/components/shared/form-modal";
import Link from "next/link";
import {
  Add,
  ArrowLeft2,
  SearchNormal1,
  Box1,
  Setting2,
  ClipboardTick,
  Trash,
  BoxAdd,
  ShieldTick,
  Edit2,
  ArrangeHorizontal,
} from "iconsax-reactjs";
import { getAccessView } from "@/controller/auth/access-view";
import {
  inventoryDate,
  inventoryError,
  inventoryKind,
  inventoryMoney,
  inventoryQuantity,
  inventoryStatus,
  useInventoryList,
  useInventoryOptions,
} from "@/controller/inventory/use-inventory";
import { useErpUiState } from "@/stores/erp-ui-store";
import { useInventoryWorkspace } from "@/hooks/inventory/use-inventory-workspace";
import { PageState } from "@/components/shared/page-state";
import { SelectInput } from "@/components/shared/select-input";
import { ActionMenu } from "@/components/shared/action-menu";
import { InventoryConversionEditor } from "./conversion-form";
import { InventoryCountEditor } from "./count-form";
import { InventoryHistory } from "./history";
import { InventoryAuxEditor } from "./aux-form";
import type {
  InventoryDocument,
  InventoryMaterial,
  InventoryPageProps,
  InventoryStock,
  InventoryWorkspaceProps,
} from "@/interfaces/inventory";
const screens = {
  stock: {
    title: "Stok bahan",
    description:
      "Saldo bahan per lokasi, nilai persediaan dan batas minimum stok.",
    icon: Box1,
  },
  materials: {
    title: "Master bahan & konversi",
    description:
      "Kelola bahan, satuan pembelian dan batas minimum tanpa mengubah saldo stok.",
    icon: Setting2,
  },
  counts: {
    title: "Stock opname",
    description:
      "Jadwalkan hitung fisik, simpan hasil, lalu ajukan selisih untuk ditinjau.",
    icon: ClipboardTick,
  },
  waste: {
    title: "Bahan terbuang",
    description:
      "Catat bahan rusak, kedaluwarsa, susut atau konsumsi staf sebelum direview.",
    icon: Trash,
  },
  adjustments: {
    title: "Penyesuaian stok",
    description:
      "Telusuri hasil opname dan koreksi manual dengan alasan yang tercatat.",
    icon: BoxAdd,
  },
  approvals: {
    title: "Persetujuan opname",
    description:
      "Review opname, bahan terbuang dan koreksi. Stok berubah setelah disetujui.",
    icon: ShieldTick,
  },
};
export function InventoryPage(props: InventoryPageProps) {
  const selected = useErpUiState((s) => s.selectedOutletId);
  const access = getAccessView(props.session, selected);
  const required = [
    "inventory.read",
    ...(props.view === "materials"
      ? ["inventory.manage"]
      : props.view === "approvals"
        ? ["approvals.review"]
        : []),
  ];
  if (
    !access.selected ||
    !required.every((p) => access.permissions.includes(p))
  )
    return <PageState forbidden />;
  return (
    <InventoryWorkspace
      key={`${access.selected.outlet_id}-${props.view}`}
      {...props}
      outletId={access.selected.outlet_id}
      canManage={access.permissions.includes("inventory.manage")}
      canReview={access.permissions.includes("approvals.review")}
      canPost={
        access.permissions.includes("finance.manage") &&
        access.permissions.includes("inventory.manage")
      }
    />
  );
}
function InventoryWorkspace(props: InventoryWorkspaceProps) {
  const router = useRouter();
  const base = router.asPath.split("?")[0];
  const { view, outletId, canManage } = props;
  const s = useInventoryWorkspace(view);
  const options = useInventoryOptions(outletId);
  const query = useInventoryList<
    InventoryStock | InventoryMaterial | InventoryDocument
  >(outletId, view, s.filters);
  const screen = screens[view];
  const Icon = screen.icon;
  const common = options.data
    ? {
        outletId,
        options: options.data,
        onSaved: (id: string) => {
          s.saved();
          if (view === "counts") void router.push(`${base}/detail?id=${id}`);
        },
        onCancel: s.close,
      }
    : undefined;
  const statuses =
    view === "stock"
      ? [
          ["all", "Semua stok"],
          ["low", "Di bawah minimum"],
        ]
      : view === "materials"
        ? [
            ["all", "Semua status"],
            ["active", "Aktif"],
            ["inactive", "Nonaktif"],
          ]
        : [
            ["all", "Semua status"],
            ["draft", "Draf"],
            ...(view === "counts" ? [["counting", "Sedang dihitung"]] : []),
            ["pending", "Menunggu persetujuan"],
            ["posted", "Diposting"],
            ["rejected", "Ditolak"],
            ["cancelled", "Dibatalkan"],
          ];
  const titles =
    view === "stock"
      ? ["Bahan", "Lokasi", "Saldo", "Minimum", "Nilai stok", "Status", "Aksi"]
      : view === "materials"
        ? [
            "Bahan",
            "Satuan stok",
            "Minimum per lokasi",
            "Konversi",
            "Status",
            "Aksi",
          ]
        : [
            "Dokumen",
            "Lokasi / pembuat",
            "Tanggal",
            "Nilai koreksi",
            "Status",
            "Aksi",
          ];
  const create = () => {
    s.close();
    s.setNotice("");
    if (view === "counts") s.setCreating(true);
    else void router.push(`${base}/form`);
  };
  return (
    <div className="space-y-5">
      <Link
        href="/persediaan"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft2 size={16} aria-hidden />
        Persediaan
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-primary/10 p-3 text-primary">
            <Icon size={23} aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {screen.title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {screen.description}
            </p>
          </div>
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-2">
            {view === "materials" && (
              <>
                <button
                  className="ui-button ui-button-secondary"
                  disabled={!common}
                  onClick={() => {
                    s.close();
                    s.setAux("unit");
                  }}
                >
                  Satuan baru
                </button>
                <button
                  className="ui-button ui-button-secondary"
                  disabled={!common}
                  onClick={() => {
                    s.close();
                    s.setAux("location");
                  }}
                >
                  Lokasi baru
                </button>
              </>
            )}
            {view !== "stock" && view !== "approvals" && (
              <button
                className="ui-button ui-button-primary"
                disabled={!common}
                onClick={create}
              >
                <Add size={18} aria-hidden />
                {view === "materials"
                  ? "Tambah bahan"
                  : view === "counts"
                    ? "Jadwalkan opname"
                    : view === "waste"
                      ? "Catat bahan terbuang"
                      : "Buat koreksi"}
              </button>
            )}
          </div>
        )}
      </div>
      {(s.notice || router.query.saved === "1") && (
        <p role="status" className="ui-alert ui-alert-success">
          {s.notice || "Data persediaan berhasil disimpan."}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="ui-card !p-4">
          <p className="text-sm text-muted-foreground">
            {view === "stock"
              ? "Bahan / lokasi"
              : view === "materials"
                ? "Master bahan"
                : "Dokumen"}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {query.isPending ? "—" : (query.data?.total ?? 0)}
          </p>
        </div>
        <div className="ui-card !p-4">
          <p className="text-sm text-muted-foreground">
            {view === "stock"
              ? "Di bawah minimum"
              : view === "materials"
                ? "Satuan tersedia"
                : "Menunggu persetujuan"}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {query.isPending
              ? "—"
              : view === "stock"
                ? (query.data?.summary?.low ?? 0)
                : view === "materials"
                  ? (options.data?.units.length ?? 0)
                  : (query.data?.summary?.pending ?? 0)}
          </p>
        </div>
        <div className="ui-card col-span-2 !p-4 sm:col-span-1">
          <p className="text-sm text-muted-foreground">
            {view === "stock"
              ? "Nilai persediaan"
              : view === "materials"
                ? "Lokasi stok"
                : "Dokumen diposting"}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {query.isPending
              ? "—"
              : view === "stock"
                ? inventoryMoney(query.data?.summary?.value ?? 0)
                : view === "materials"
                  ? (options.data?.locations.length ?? 0)
                  : (query.data?.summary?.posted ?? 0)}
          </p>
        </div>
      </div>
      {options.isError && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          {inventoryError(options.error)}
        </p>
      )}
      {common && (
        <>
          {s.aux && (
            <FormModal
              label={s.aux === "unit" ? "Tambah satuan" : "Tambah lokasi stok"}
              onClose={s.close}
            >
              <InventoryAuxEditor key={s.aux} {...common} mode={s.aux} />
            </FormModal>
          )}
          {s.conversion && (
            <FormModal label="Konversi satuan" onClose={s.close}>
              <InventoryConversionEditor
                key={s.conversion.id}
                {...common}
                material={s.conversion}
              />
            </FormModal>
          )}
          {s.creating && view === "counts" && (
            <FormModal label="Jadwalkan stock opname" onClose={s.close}>
              <InventoryCountEditor {...common} />
            </FormModal>
          )}
        </>
      )}
      {s.movement && (
        <InventoryHistory
          key={`${s.movement.id}-${s.movement.location_id}`}
          outletId={outletId}
          stock={s.movement}
          onClose={() => s.setMovement(undefined)}
        />
      )}
      <section
        className="ui-card !p-0 overflow-hidden"
        aria-label={`Daftar ${screen.title.toLowerCase()}`}
      >
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-[minmax(200px,1fr)_220px_220px]">
          <label className="relative">
            <SearchNormal1
              size={17}
              className="pointer-events-none absolute left-3 top-3 text-muted-foreground"
              aria-hidden
            />
            <span className="sr-only">Cari bahan atau dokumen</span>
            <input
              type="search"
              className="ui-input !pl-10"
              placeholder={
                view === "stock" || view === "materials"
                  ? "Cari nama atau kode bahan…"
                  : "Cari nomor, alasan atau pembuat…"
              }
              maxLength={120}
              value={s.filters.search}
              onChange={(e) => s.change("search", e.target.value)}
            />
          </label>
          <SelectInput
            aria-label="Filter status persediaan"
            value={s.filters.status}
            onValueChange={(v) => s.change("status", v)}
          >
            {statuses.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
          {view !== "materials" && (
            <SelectInput
              aria-label="Filter lokasi persediaan"
              value={s.filters.locationId}
              onValueChange={(v) => s.change("locationId", v)}
            >
              <option value="">Semua lokasi</option>
              {options.data?.locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </SelectInput>
          )}
        </div>
        {query.isPending ? (
          <p className="p-6 text-sm text-muted-foreground" role="status">
            Memuat persediaan…
          </p>
        ) : query.isError ? (
          <div className="space-y-3 p-5">
            <p role="alert" className="text-sm text-destructive">
              {inventoryError(query.error)}
            </p>
            <button
              className="ui-button ui-button-secondary"
              onClick={() => {
                query.refetch();
                options.refetch();
              }}
            >
              Coba lagi
            </button>
          </div>
        ) : !query.data.items.length ? (
          <div className="space-y-2 px-5 py-10 text-center">
            <p className="font-medium">
              {s.filters.search
                ? "Data tidak ditemukan"
                : view === "stock"
                  ? "Belum ada saldo bahan"
                  : view === "approvals"
                    ? "Tidak ada dokumen untuk direview"
                    : "Belum ada data pada daftar ini"}
            </p>
            <p className="text-sm text-muted-foreground">
              {view === "stock"
                ? "Tambahkan master bahan dan catat pembelian barang yang sudah diterima."
                : view === "approvals"
                  ? "Dokumen yang sudah diajukan akan muncul di sini."
                  : "Gunakan aksi di atas untuk membuat data baru atau ubah filter pencarian."}
            </p>
            {view === "stock" && (
              <Link
                href="/pembelian/pembelian-bahan"
                className="ui-button ui-button-secondary mt-3"
              >
                Buka pembelian bahan
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ui-table min-w-[800px]">
              <thead>
                <tr>
                  {titles.map((t) => (
                    <th key={t}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((item) =>
                  "low_stock" in item ? (
                    <tr key={`${item.id}-${item.location_id}`}>
                      <th scope="row">
                        {item.name}
                        <span className="mt-1 block text-xs font-normal text-muted-foreground">
                          {item.code}
                        </span>
                      </th>
                      <td>{item.location}</td>
                      <td className="whitespace-nowrap tabular-nums">
                        {inventoryQuantity(item.quantity)} {item.unit}
                      </td>
                      <td>
                        {inventoryQuantity(item.minimum_quantity)} {item.unit}
                      </td>
                      <td className="whitespace-nowrap tabular-nums">
                        {inventoryMoney(item.inventory_value)}
                        <span className="mt-1 block text-xs text-muted-foreground">
                          Rata-rata {inventoryMoney(item.average_unit_cost)} /{" "}
                          {item.unit}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`ui-badge ${item.low_stock ? "ui-badge-warning" : "ui-badge-success"}`}
                        >
                          {item.low_stock ? "Stok rendah" : "Cukup"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="ui-button ui-button-secondary"
                          onClick={() => s.setMovement(item)}
                        >
                          Mutasi
                        </button>
                      </td>
                    </tr>
                  ) : "conversions" in item ? (
                    <tr key={item.id}>
                      <th scope="row">
                        {item.name}
                        <span className="mt-1 block text-xs font-normal text-muted-foreground">
                          {item.code} · {item.category}
                        </span>
                      </th>
                      <td>
                        {item.unit}
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {inventoryKind[item.kind] ?? item.kind}
                        </span>
                      </td>
                      <td>
                        {item.policies.length
                          ? item.policies.map((p) => (
                              <p key={p.locationId} className="text-xs">
                                {p.location}:{" "}
                                {inventoryQuantity(p.minimumQuantity)}{" "}
                                {item.unit}
                              </p>
                            ))
                          : "Belum diatur"}
                      </td>
                      <td>
                        {item.conversions.length
                          ? item.conversions.map((c) => (
                              <p key={c.id} className="text-xs">
                                1 {c.unit} ={" "}
                                {inventoryQuantity(c.base_quantity)} {item.unit}
                              </p>
                            ))
                          : "Satuan dasar"}
                      </td>
                      <td>
                        <span
                          className={`ui-badge ${item.active ? "ui-badge-success" : "ui-badge-neutral"}`}
                        >
                          {item.active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td>
                        {canManage && (
                          <ActionMenu
                            label={`Aksi ${item.name}`}
                            items={[
                              {
                                label: "Edit bahan",
                                icon: <Edit2 size={18} aria-hidden />,
                                onSelect: () => {
                                  s.close();
                                  void router.push({
                                    pathname: `${base}/form`,
                                    query: { id: item.id, code: item.code },
                                  });
                                },
                              },
                              {
                                label: "Atur konversi",
                                icon: (
                                  <ArrangeHorizontal size={18} aria-hidden />
                                ),
                                disabled: !item.active,
                                onSelect: () => {
                                  s.close();
                                  s.setConversion(item);
                                },
                              },
                            ]}
                          />
                        )}
                      </td>
                    </tr>
                  ) : (
                    <tr key={item.id}>
                      <th scope="row">
                        {item.number}
                        <span className="mt-1 block text-xs font-normal text-muted-foreground">
                          {inventoryKind[item.kind] ?? item.kind} ·{" "}
                          {item.line_count} bahan
                        </span>
                      </th>
                      <td>
                        {item.location_name}
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {item.created_by_name}
                        </span>
                      </td>
                      <td className="whitespace-nowrap text-xs">
                        {inventoryDate(
                          view === "counts"
                            ? item.scheduled_at
                            : item.created_at,
                        )}
                      </td>
                      <td className="whitespace-nowrap tabular-nums">
                        {inventoryMoney(item.total)}
                      </td>
                      <td>
                        <span
                          className={`ui-badge ${item.status === "posted" ? "ui-badge-success" : item.status === "pending" ? "ui-badge-warning" : item.status === "rejected" ? "ui-badge-destructive" : "ui-badge-neutral"}`}
                        >
                          {inventoryStatus[item.status] ?? item.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="ui-button ui-button-secondary"
                          onClick={() => {
                            s.close();
                            void router.push(`${base}/detail?id=${item.id}`);
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
        {query.data && query.data.total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-sm text-muted-foreground">
            <span>
              {(s.filters.page - 1) * 20 + 1}–
              {Math.min(s.filters.page * 20, query.data.total)} dari{" "}
              {query.data.total} hasil
            </span>
            <div className="flex gap-2">
              <button
                className="ui-button ui-button-secondary"
                disabled={s.filters.page === 1 || query.isFetching}
                onClick={() => s.setPage(s.filters.page - 1)}
              >
                Sebelumnya
              </button>
              <button
                className="ui-button ui-button-secondary"
                disabled={
                  s.filters.page * 20 >= query.data.total || query.isFetching
                }
                onClick={() => s.setPage(s.filters.page + 1)}
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
