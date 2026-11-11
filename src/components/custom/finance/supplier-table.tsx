import { DataTable, DataTableHead } from '@/components/shared/data-table';
import { useState } from "react";
import {
  useFinanceRead,
  financeCurrency,
  financeError,
} from "@/controller/finance/use-finance";
import { FormModal } from "@/components/shared/form-modal";
import { PurchaseDetail } from "@/components/custom/purchasing/purchase-detail";
import type {
  FinanceSupplierProps,
  FinanceSupplierList,
} from "@/interfaces/finance";
import type { PurchaseRecord } from "@/interfaces/purchasing";
export function FinanceSupplierTable(p: FinanceSupplierProps) {
  const q = useFinanceRead<FinanceSupplierList>(
    p.outletId,
    "suppliers",
    p.filters,
  );
  const [detail, setDetail] = useState<PurchaseRecord>();
  return (
    <>
      {q.data && (
        <div className="grid gap-3 border-y border-border bg-secondary/30 p-4 sm:grid-cols-2">
          <p className="text-14">
            Utang sesuai filter{" "}
            <strong className="ml-2">
              {financeCurrency(q.data.summary?.outstanding ?? 0)}
            </strong>
          </p>
          <p className="text-14">
            Invoice lunas{" "}
            <strong className="ml-2">
              {financeCurrency(q.data.summary?.paid ?? 0)}
            </strong>
          </p>
        </div>
      )}
      {q.isPending ? (
        <p role="status" className="p-6">
          Memuat invoice...
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
        <p className="p-8 text-center text-14 text-muted-foreground">
          Belum ada invoice pembelian sesuai filter.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <DataTable className="min-w-[760px]">
              <thead>
                <tr>
                  {[
                    "Invoice / supplier",
                    "Tanggal",
                    "Jatuh tempo",
                    "Total",
                    "Pembayaran",
                    "Aksi",
                  ].map((h) => (
                    <DataTableHead key={h}>{h}</DataTableHead>
                  ))}
                </tr>
              </thead>
              <tbody>
                {q.data.items.map((i) => (
                  <tr key={i.id}>
                    <th scope="row">
                      {i.invoice_number}
                      <span className="mt-1 block text-13 font-normal text-muted-foreground">
                        {i.supplier_name}
                      </span>
                    </th>
                    <td>{i.invoice_date}</td>
                    <td>{i.due_date}</td>
                    <td className="whitespace-nowrap tabular-nums">
                      {financeCurrency(i.total)}
                    </td>
                    <td>
                      <span
                        className={
                          i.payment_status === "paid"
                            ? "ui-badge ui-badge-success"
                            : "ui-badge ui-badge-warning"
                        }
                      >
                        {i.payment_status === "paid"
                          ? "Lunas"
                          : "Belum dibayar"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="ui-button ui-button-secondary"
                        onClick={() => setDetail(i)}
                      >
                        Detail invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border p-4 text-14">
            <span>
              {q.data.total} invoice / Halaman {p.filters.page}
            </span>
            <div className="flex gap-2">
              <button
                className="ui-button ui-button-secondary"
                disabled={p.filters.page === 1}
                onClick={() => p.onPage(p.filters.page - 1)}
              >
                Sebelumnya
              </button>
              <button
                className="ui-button ui-button-secondary"
                disabled={p.filters.page * 20 >= q.data.total}
                onClick={() => p.onPage(p.filters.page + 1)}
              >
                Berikutnya
              </button>
            </div>
          </div>
        </>
      )}
      {detail && (
        <FormModal
          label="Detail invoice supplier"
          onClose={() => setDetail(undefined)}
        >
          <PurchaseDetail
            outletId={p.outletId}
            purchase={detail}
            canManage={p.canPay}
            onClose={() => setDetail(undefined)}
          />
        </FormModal>
      )}
    </>
  );
}
