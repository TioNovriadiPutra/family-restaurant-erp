import {
  financeCurrency,
  financeDate,
  financeSourceLabel,
} from "@/controller/finance/use-finance";
import type { FinanceTableProps } from "@/interfaces/finance";
export function FinanceTable({
  view,
  items,
  onJournal,
  onProof,
  proofPending,
}: FinanceTableProps) {
  const headers =
    view === "movements"
      ? ["Tanggal", "Referensi", "Rekening", "Masuk", "Keluar"]
      : view === "journals"
        ? [
            "Tanggal",
            "Dokumen / keterangan",
            "Sumber",
            "Debit",
            "Kredit",
            "Aksi",
          ]
        : view === "expenses"
          ? [
              "Tanggal / dokumen",
              "Keterangan",
              "Kategori",
              "Sumber dana",
              "Jumlah",
              "Bukti",
            ]
          : [
              "Tanggal / dokumen",
              "Rekening",
              "Alokasi",
              "Baris bank / buku",
              "Status",
            ];
  return (
    <div className="overflow-x-auto">
      <table className="ui-table min-w-[740px]">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id}>
              {view === "movements" ? (
                <>
                  <td className="whitespace-nowrap text-xs">
                    {financeDate(row.date)}
                  </td>
                  <th scope="row">
                    <span className="block">{row.number}</span>
                    <span className="mt-1 block max-w-sm truncate text-xs font-normal text-muted-foreground">
                      {row.reference}
                    </span>
                  </th>
                  <td>{row.account}</td>
                  <td className="whitespace-nowrap tabular-nums text-primary">
                    {Number(row.amount) > 0
                      ? financeCurrency(row.amount!)
                      : "-"}
                  </td>
                  <td className="whitespace-nowrap tabular-nums">
                    {Number(row.amount) < 0
                      ? financeCurrency(-Number(row.amount))
                      : "-"}
                  </td>
                </>
              ) : view === "journals" ? (
                <>
                  <td className="whitespace-nowrap text-xs">
                    {financeDate(row.date)}
                  </td>
                  <th scope="row">
                    {row.number}
                    <span className="mt-1 block max-w-sm truncate text-xs font-normal text-muted-foreground">
                      {row.description}
                    </span>
                  </th>
                  <td className="text-xs">{financeSourceLabel(row.source)}</td>
                  <td className="whitespace-nowrap tabular-nums">
                    {financeCurrency(row.debit ?? 0)}
                  </td>
                  <td className="whitespace-nowrap tabular-nums">
                    {financeCurrency(row.credit ?? 0)}
                  </td>
                  <td>
                    <button
                      className="ui-button ui-button-secondary"
                      onClick={() => onJournal(row.id)}
                    >
                      Detail jurnal
                    </button>
                  </td>
                </>
              ) : view === "expenses" ? (
                <>
                  <th scope="row">
                    {row.number}
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {financeDate(row.date)}
                    </span>
                  </th>
                  <td className="max-w-xs break-words">{row.description}</td>
                  <td>{row.category}</td>
                  <td>{row.account}</td>
                  <td className="whitespace-nowrap tabular-nums">
                    {financeCurrency(row.amount ?? 0)}
                  </td>
                  <td>
                    {row.proof ? (
                      <button
                        className="ui-button ui-button-secondary"
                        disabled={proofPending}
                        onClick={() => onProof(row.id)}
                      >
                        Unduh nota
                      </button>
                    ) : (
                      "Belum ada"
                    )}
                  </td>
                </>
              ) : (
                <>
                  <th scope="row">
                    {row.number}
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {financeDate(row.date)}
                    </span>
                  </th>
                  <td>{row.account}</td>
                  <td className="whitespace-nowrap tabular-nums">
                    {financeCurrency(row.amount ?? 0)}
                  </td>
                  <td>
                    {row.bankCount} / {row.bookCount}
                  </td>
                  <td>
                    <span className="ui-badge ui-badge-success">
                      {row.status === "reconciled" ? "Cocok" : row.status}
                    </span>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
