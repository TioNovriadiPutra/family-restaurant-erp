import { DataTable, DataTableHead } from '@/components/shared/data-table';
import { PageHeader, PageTitle } from '@/components/shared/page-heading';
import Link from "next/link";
import { Add, ArrowLeft2, Edit2 } from "iconsax-reactjs";
import { getAccessView } from "@/controller/auth/access-view";
import { useErpUiState } from "@/stores/erp-ui-store";
import { useDiningTablesUi } from "@/hooks/settings/use-dining-tables";
import { diningTableError } from "@/controller/settings/use-dining-tables";
import { FormModal } from "@/components/shared/form-modal";
import { PageState } from "@/components/shared/page-state";
import { DiningTableForm } from "./dining-table-form";
import type {
  TablePageProps,
  TableWorkspaceProps,
} from "@/interfaces/dining-tables";
export function DiningTablesPage(p: TablePageProps) {
  const selected = useErpUiState((s) => s.selectedOutletId);
  const access = getAccessView(p.session, selected);
  if (
    !access.selected ||
    !["menu.read", "organization.read"].every((v) =>
      access.permissions.includes(v),
    )
  )
    return <PageState forbidden />;
  return (
    <Workspace
      key={access.selected.outlet_id}
      outletId={access.selected.outlet_id}
      canManage={access.permissions.includes("organization.manage")}
    />
  );
}
function Workspace(p: TableWorkspaceProps) {
  const s = useDiningTablesUi(p.outletId);
  return (
    <div className="space-y-5">
      <Link
        href="/pengaturan"
        className="inline-flex min-h-11 items-center gap-2 text-14 text-muted-foreground"
      >
        <ArrowLeft2 size={16} />
        Pengaturan
      </Link>
      <PageHeader className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <PageTitle className="">Meja</PageTitle>
          <p className="mt-1 text-14 text-muted-foreground">
            Kelola kode dan kapasitas meja yang ditampilkan di POS.
          </p>
        </div>
        {p.canManage && (
          <button
            className="ui-button ui-button-primary"
            onClick={() => s.setModal(null)}
          >
            <Add size={18} />
            Tambah meja
          </button>
        )}
      </PageHeader>
      {s.notice && (
        <p role="status" className="ui-alert ui-alert-info">
          {s.notice}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          aria-label="Cari kode meja"
          placeholder="Cari kode meja..."
          className="ui-input max-w-sm"
          value={s.search}
          onChange={(e) => s.setSearch(e.target.value)}
        />
        <p className="text-14 text-muted-foreground">
          {s.query.data?.items.filter((t) => t.active).length ?? 0} meja aktif
        </p>
      </div>
      {s.query.isPending ? (
        <p role="status">Memuat meja...</p>
      ) : s.query.error ? (
        <div className="ui-card">
          <p role="alert">{diningTableError(s.query.error)}</p>
          <button
            className="ui-button ui-button-secondary mt-3"
            onClick={() => s.query.refetch()}
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <div className="ui-card overflow-x-auto">
          <DataTable className="w-full text-left text-14">
            <thead>
              <tr className="border-b border-border">
                {["Kode meja", "Kapasitas", "Status", "Tindakan"].map((v) => (
                  <DataTableHead className="" key={v}>
                    {v}
                  </DataTableHead>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.items.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border hover:bg-muted/40"
                >
                  <td className="font-semibold">{t.code}</td>
                  <td className="">{t.seats} kursi</td>
                  <td className="">
                    <span
                      className={
                        t.active ? "ui-badge ui-badge-success" : "ui-badge"
                      }
                    >
                      {t.active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="">
                    {p.canManage && (
                      <button
                        className="ui-button ui-button-secondary"
                        onClick={() => s.setModal(t)}
                        aria-label={`Edit meja ${t.code}`}
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!s.items.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    {s.search
                      ? "Tidak ada meja yang cocok."
                      : "Belum ada meja. Tambahkan meja untuk mulai menggunakannya di POS."}
                  </td>
                </tr>
              )}
            </tbody>
          </DataTable>
        </div>
      )}
      <p className="text-14 text-muted-foreground">
        Nonaktifkan meja yang tidak digunakan. Riwayat pesanan tetap tersimpan.
      </p>
      {s.modal !== undefined && (
        <FormModal
          label={s.modal ? "Edit meja" : "Tambah meja"}
          onClose={() => s.setModal(undefined)}
        >
          <DiningTableForm
            outletId={p.outletId}
            table={s.modal}
            onClose={() => s.setModal(undefined)}
            onSaved={s.saved}
          />
        </FormModal>
      )}
    </div>
  );
}
