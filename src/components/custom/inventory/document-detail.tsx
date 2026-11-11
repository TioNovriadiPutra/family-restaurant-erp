import { DataTable, DataTableHead } from '@/components/shared/data-table';
import { SectionTitle } from '@/components/shared/page-heading';
import {
  ArrowRight2,
  TickCircle,
  CloseCircle,
  ClipboardTick,
} from "iconsax-reactjs";
import {
  inventoryDate,
  inventoryError,
  inventoryKind,
  inventoryMoney,
  inventoryQuantity,
  inventoryStatus,
  useInventoryDetail,
} from "@/controller/inventory/use-inventory";
import { TextField } from "@/components/shared/text-field";
import { useInventoryDetailActions } from "@/hooks/inventory/use-inventory-detail-actions";
import { InventoryCountLines } from "./count-lines";
import type { InventoryDetailProps } from "@/interfaces/inventory";
export function InventoryDocumentDetail(props: InventoryDetailProps) {
  const query = useInventoryDetail(props.outletId, props.id);
  const detail = query.data;
  const doc = detail?.document;
  const a = useInventoryDetailActions(props.outletId, doc);
  if (query.isPending)
    return (
      <section className="ui-card" role="status">
        Memuat detail dokumen…
      </section>
    );
  if (query.isError || !detail || !doc)
    return (
      <section className="ui-card space-y-3">
        <p role="alert" className="text-destructive">
          {inventoryError(query.error)}
        </p>
        <button
          className="ui-button ui-button-secondary"
          onClick={() => query.refetch()}
        >
          Coba lagi
        </button>
        <button className="ui-button ui-button-ghost" onClick={props.onClose}>
          Tutup
        </button>
      </section>
    );
  const editable = detail.canEdit && props.canManage;
  const count = doc.kind === "count" && doc.count_id == null;
  return (
    <section className="ui-card space-y-5" aria-label="Detail persediaan">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-14 text-muted-foreground">
            {inventoryKind[doc.kind] ?? doc.kind}
          </p>
          <SectionTitle className="mt-1">{doc.number}</SectionTitle>
          <span
            className={`ui-badge mt-2 ${doc.status === "posted" ? "ui-badge-success" : doc.status === "pending" ? "ui-badge-warning" : "ui-badge-neutral"}`}
          >
            {inventoryStatus[doc.status] ?? doc.status}
          </span>
        </div>
        <button
          className="ui-button ui-button-secondary"
          disabled={a.command.pending}
          onClick={props.onClose}
        >
          Tutup detail
        </button>
      </div>
      <dl className="grid gap-4 rounded-xl bg-secondary/50 p-4 text-14 sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Lokasi</dt>
          <dd className="mt-1 font-medium">{doc.location_name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Pembuat</dt>
          <dd className="mt-1 font-medium">{doc.created_by_name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">
            {count ? "Jadwal hitung" : "Dibuat"}
          </dt>
          <dd className="mt-1 font-medium">
            {inventoryDate(count ? doc.scheduled_at : doc.created_at)}
          </dd>
        </div>
      </dl>
      {doc.reason && (
        <p className="whitespace-pre-wrap break-words text-14">{doc.reason}</p>
      )}
      {count && doc.status === "draft" && (
        <p className="ui-alert ui-alert-info">
          Mulai opname untuk mencatat saldo sistem saat ini. Setelah dimulai,
          hitung setiap bahan lalu ajukan untuk direview akun lain.
        </p>
      )}
      {editable && count && doc.status === "counting" ? (
        <InventoryCountLines
          key={`${doc.id}-${doc.version}`}
          outletId={props.outletId}
          detail={detail}
        />
      ) : (
        detail.lines.length > 0 && (
          <div className="overflow-x-auto">
            <DataTable className="min-w-[680px]">
              <thead>
                <tr>
                  <DataTableHead>Bahan</DataTableHead>
                  {count ? (
                    <>
                      <DataTableHead>Saldo awal</DataTableHead>
                      <DataTableHead>Stok sistem saat hitung</DataTableHead>
                      <DataTableHead>Fisik</DataTableHead>
                      <DataTableHead>Selisih</DataTableHead>
                      <DataTableHead>Alasan</DataTableHead>
                    </>
                  ) : (
                    <>
                      <DataTableHead>Perubahan stok</DataTableHead>
                      <DataTableHead>Biaya satuan</DataTableHead>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {detail.lines.map((l) => (
                  <tr key={l.id}>
                    <th scope="row">
                      {l.name}
                      <span className="mt-1 block text-13 font-normal text-muted-foreground">
                        {l.unit}
                      </span>
                    </th>
                    {count ? (
                      <>
                        <td>{inventoryQuantity(l.snapshot)}</td>
                        <td>{inventoryQuantity(l.expected)}</td>
                        <td>{inventoryQuantity(l.counted)}</td>
                        <td
                          className={
                            Number(l.variance) < 0 ? "text-destructive" : ""
                          }
                        >
                          {inventoryQuantity(l.variance)}
                        </td>
                        <td className="max-w-56 whitespace-normal">
                          {l.reason || "—"}
                        </td>
                      </>
                    ) : (
                      <>
                        <td
                          className={
                            Number(l.quantity) < 0
                              ? "text-destructive"
                              : "text-primary"
                          }
                        >
                          {Number(l.quantity) > 0 ? "+" : ""}
                          {inventoryQuantity(l.quantity)} {l.unit}
                        </td>
                        <td>{inventoryMoney(l.unitCost ?? 0)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </div>
        )
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
        <p className="text-14 text-muted-foreground">
          {doc.status === "posted"
            ? "Nilai koreksi aktual"
            : "Estimasi nilai koreksi"}
        </p>
        <p className="text-lg font-semibold tabular-nums">
          {inventoryMoney(doc.total)}
        </p>
      </div>
      {doc.status !== "posted" && (
        <p className="ui-help">
          Nilai akhir mengikuti biaya persediaan saat disetujui. Transaksi yang
          masuk selama menunggu dapat mengubah biaya rata-ratanya.
        </p>
      )}
      {doc.status === "pending" && !detail.canReview && (
        <p className="ui-alert ui-alert-info">
          Dokumen belum mengubah stok. Minta akun Pemilik/Manajer lain untuk
          mereview; pembuat tidak dapat mereview dokumennya sendiri.
        </p>
      )}
      {doc.status === "rejected" && (
        <p className="ui-alert ui-alert-destructive">
          Ditolak oleh {doc.reviewed_by_name}: {doc.review_reason}
        </p>
      )}
      {doc.status === "posted" && (
        <p className="ui-alert ui-alert-success">
          Sudah diposting. Riwayat mutasi dan jurnal tercatat; transaksi ini
          tidak dapat diedit langsung.
        </p>
      )}
      {a.command.error && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          {a.command.error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        {editable && (
          <button
            className="ui-button ui-button-ghost !text-destructive"
            disabled={a.command.pending}
            onClick={() => a.setCancel(true)}
          >
            Batalkan dokumen
          </button>
        )}
        {editable &&
          doc.status === "draft" &&
          (count ? (
            <button
              className="ui-button ui-button-primary"
              disabled={a.command.pending}
              onClick={() => a.run("count_start")}
            >
              <ClipboardTick size={18} aria-hidden />
              Mulai hitung
            </button>
          ) : (
            <>
              <button
                className="ui-button ui-button-secondary"
                onClick={() => props.onEdit(detail)}
              >
                Edit draf
              </button>
              <button
                className="ui-button ui-button-primary"
                disabled={a.command.pending}
                onClick={() => a.run("submit")}
              >
                <ArrowRight2 size={18} aria-hidden />
                Ajukan persetujuan
              </button>
            </>
          ))}
        {detail.canReview && props.canReview && (
          <>
            <button
              className="ui-button ui-button-secondary !text-destructive"
              disabled={a.command.pending}
              onClick={() => {
                a.form.reset();
                a.setReview("reject");
              }}
            >
              <CloseCircle size={18} aria-hidden />
              Tolak
            </button>
            <button
              className="ui-button ui-button-primary"
              disabled={a.command.pending || !props.canPost}
              onClick={() => {
                a.form.reset();
                a.setReview("approve");
              }}
            >
              <TickCircle size={18} aria-hidden />
              Setujui & posting
            </button>
          </>
        )}
      </div>
      {a.cancel && (
        <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
          <p className="text-14">
            Batalkan {doc.number}? Dokumen disimpan sebagai riwayat dan tidak
            akan mengubah stok.
          </p>
          <div className="flex gap-3">
            <button
              className="ui-button ui-button-secondary"
              disabled={a.command.pending}
              onClick={() => a.setCancel(false)}
            >
              Kembali
            </button>
            <button
              className="ui-button ui-button-destructive"
              disabled={a.command.pending}
              onClick={() => a.run("cancel")}
            >
              Ya, batalkan
            </button>
          </div>
        </div>
      )}
      {a.review && (
        <form
          noValidate
          className="space-y-4 rounded-xl border border-border bg-secondary/40 p-4 ui-form"
          onSubmit={a.submitReview}
        >
          <p className="text-14 font-medium">
            {a.review === "approve"
              ? "Konfirmasi posting seluruh perubahan stok dan jurnal pada dokumen ini."
              : "Tulis alasan penolakan. Stok tidak akan berubah."}
          </p>
          <TextField
            id="inventory-review-reason"
            label={
              a.review === "reject"
                ? "Alasan penolakan"
                : "Catatan persetujuan (opsional)"
            }
            required={a.review === "reject"}
            maxLength={1000}
            error={a.form.formState.errors.reason?.message}
            {...a.form.register("reason", {
              validate: (v) =>
                a.review !== "reject" ||
                v.trim().length >= 3 ||
                "Alasan penolakan minimal 3 karakter.",
            })}
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="ui-button ui-button-secondary"
              disabled={a.command.pending}
              onClick={() => a.setReview(undefined)}
            >
              Batal
            </button>
            <button
              className={`ui-button ${a.review === "approve" ? "ui-button-primary" : "ui-button-destructive"}`}
              disabled={a.command.pending}
            >
              {a.command.pending
                ? "Memproses…"
                : a.review === "approve"
                  ? "Konfirmasi & posting"
                  : "Konfirmasi penolakan"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
