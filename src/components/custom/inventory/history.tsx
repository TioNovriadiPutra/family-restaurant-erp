import { useState } from "react";
import {
  inventoryDate,
  inventoryError,
  inventoryMoney,
  inventoryQuantity,
  useInventoryList,
} from "@/controller/inventory/use-inventory";
import type {
  InventoryMovement,
  InventoryHistoryProps,
} from "@/interfaces/inventory";
export function InventoryHistory({
  outletId,
  stock,
  onClose,
}: InventoryHistoryProps) {
  const [page, setPage] = useState(1);
  const query = useInventoryList<InventoryMovement>(outletId, "movements", {
    itemId: stock.id,
    locationId: stock.location_id,
    page,
    status: "all",
    search: "",
  });
  return (
    <section className="ui-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Mutasi · {stock.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {stock.location} · satuan {stock.unit}
          </p>
        </div>
        <button className="ui-button ui-button-secondary" onClick={onClose}>
          Tutup mutasi
        </button>
      </div>
      {query.isPending ? (
        <p role="status">Memuat riwayat…</p>
      ) : query.isError ? (
        <p role="alert" className="text-destructive">
          {inventoryError(query.error)}
        </p>
      ) : !query.data.items.length ? (
        <p className="text-sm text-muted-foreground">
          Belum ada mutasi bahan ini.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="ui-table min-w-[650px]">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Dokumen</th>
                <th>Perubahan</th>
                <th>Nilai</th>
                <th>Saldo setelahnya</th>
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((m) => (
                <tr key={m.id}>
                  <td>{inventoryDate(m.occurred_at)}</td>
                  <th scope="row">{m.number}</th>
                  <td
                    className={
                      Number(m.quantity_delta) < 0
                        ? "text-destructive"
                        : "text-primary"
                    }
                  >
                    {inventoryQuantity(m.quantity_delta)} {stock.unit}
                  </td>
                  <td>{inventoryMoney(m.value_delta)}</td>
                  <td>
                    {inventoryQuantity(m.balance_quantity)} {stock.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {Number(query.data?.total) > 20 && (
        <div className="flex justify-end gap-3">
          <button
            className="ui-button ui-button-secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Sebelumnya
          </button>
          <button
            className="ui-button ui-button-secondary"
            disabled={page * 20 >= (query.data?.total ?? 0)}
            onClick={() => setPage((p) => p + 1)}
          >
            Berikutnya
          </button>
        </div>
      )}
    </section>
  );
}
