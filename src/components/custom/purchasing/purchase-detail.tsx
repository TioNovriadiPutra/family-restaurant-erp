import { FormModal } from "@/components/shared/form-modal";
import { SelectInput } from "@/components/shared/select-input";
import { useState } from "react";
import { DocumentDownload, TickCircle } from "iconsax-reactjs";
import {
  purchaseMoney,
  purchasingError,
  usePurchasingMutation,
  usePurchaseProof,
  usePurchaseOptions,
} from "@/controller/purchasing/use-purchasing";
import type { PurchaseDetailProps } from "@/interfaces/purchasing";
export function PurchaseDetail({
  outletId,
  purchase,
  canManage,
  onClose,
}: PurchaseDetailProps) {
  const pay = usePurchasingMutation();
  const proof = usePurchaseProof();
  const [confirm, setConfirm] = useState(false);
  const accounts = usePurchaseOptions(
    outletId,
    canManage && purchase.payment_status === "unpaid",
  );
  const [accountId, setAccountId] = useState("");
  return (
    <section
      className="ui-card space-y-5 p-5 sm:p-6"
      aria-label="Detail pembelian"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{purchase.number}</p>
          <h2 className="mt-1 text-xl font-semibold">
            Invoice {purchase.invoice_number}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {purchase.supplier_name} · {purchase.invoice_date}
          </p>
        </div>
        <button
          className="ui-button ui-button-secondary"
          onClick={onClose}
          disabled={pay.isPending}
        >
          Tutup
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="ui-table">
          <thead>
            <tr>
              <th>Bahan</th>
              <th>Jumlah</th>
              <th>Harga satuan</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {purchase.lines.map((l, i) => (
              <tr key={i}>
                <th scope="row">{l.name}</th>
                <td>
                  {l.quantity} {l.unit}
                </td>
                <td>{purchaseMoney(l.unit_price)}</td>
                <td>{purchaseMoney(l.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {purchase.payment_status === "paid"
              ? "Lunas"
              : `Belum dibayar · jatuh tempo ${purchase.due_date}`}
          </p>
          <p className="mt-1 text-xl font-semibold">
            {purchaseMoney(purchase.total)}
          </p>
        </div>
        <button
          className="ui-button ui-button-secondary"
          disabled={proof.isPending}
          onClick={async () => {
            try {
              const result = await proof.mutateAsync({
                outletId,
                id: purchase.id,
              });
              window.location.assign(result.url);
            } catch {
              /* Displayed below. */
            }
          }}
        >
          <DocumentDownload size={18} aria-hidden />
          Unduh invoice
        </button>
      </div>
      {purchase.payment_status === "unpaid" && canManage && (
        <>
          <button
            className="ui-button ui-button-primary"
            onClick={() => setConfirm(true)}
          >
            <TickCircle size={18} aria-hidden />
            Catat pelunasan
          </button>

          {confirm && (
            <FormModal
              label="Catat pelunasan"
              onClose={() => setConfirm(false)}
            >
              <div aria-busy={pay.isPending} className="space-y-3 p-5">
                <h2 className="text-lg font-semibold">Catat pelunasan</h2>
                <p className="text-sm">
                  Catat pelunasan {purchaseMoney(purchase.total)} melalui sumber
                  dana yang dipilih? Stok sudah diterima dan tidak akan
                  ditambahkan lagi.
                </p>
                <label className="mt-3 block max-w-sm text-sm font-medium">
                  Sumber dana
                  <SelectInput
                    className="ui-input mt-1.5"
                    value={accountId}
                    onValueChange={setAccountId}
                    disabled={pay.isPending}
                  >
                    <option value="">Kas restoran (otomatis)</option>
                    {accounts.data?.accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </SelectInput>
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="ui-button ui-button-secondary"
                    disabled={pay.isPending}
                    onClick={() => setConfirm(false)}
                  >
                    Batal
                  </button>
                  <button
                    className="ui-button ui-button-primary"
                    disabled={pay.isPending}
                    onClick={async () => {
                      try {
                        await pay.mutateAsync({
                          outletId,
                          action: "pay",
                          data: { id: purchase.id, accountId },
                        });
                        onClose();
                      } catch {
                        /* Displayed below. */
                      }
                    }}
                  >
                    {pay.isPending ? "Mencatat…" : "Konfirmasi pelunasan"}
                  </button>
                </div>
                {pay.isError && (
                  <p role="alert" className="text-sm text-destructive">
                    {purchasingError(pay.error)}
                  </p>
                )}
              </div>
            </FormModal>
          )}
        </>
      )}
      {(pay.isError || proof.isError) && (
        <p className="ui-alert ui-alert-destructive" role="alert">
          {purchasingError(pay.error ?? proof.error)}
        </p>
      )}
    </section>
  );
}
