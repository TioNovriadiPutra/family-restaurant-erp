import {
  useFinanceRead,
  financeCurrency,
  financeDate,
  financeError,
} from "@/controller/finance/use-finance";
import type { FinanceJournal, FinanceJournalProps } from "@/interfaces/finance";
export function FinanceJournalDetail(p: FinanceJournalProps) {
  const q = useFinanceRead<FinanceJournal>(p.outletId, "journal_detail", {
    id: p.id,
  });
  return (
    <section className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">Detail jurnal</h2>
        <button className="ui-button ui-button-secondary" onClick={p.onClose}>
          Tutup
        </button>
      </div>
      {q.isPending ? (
        <p role="status">Memuat jurnal...</p>
      ) : q.isError ? (
        <div role="alert" className="ui-alert ui-alert-destructive">
          <p>{financeError(q.error)}</p>
          <button
            className="ui-button ui-button-secondary"
            onClick={() => q.refetch()}
          >
            Coba lagi
          </button>
        </div>
      ) : (
        q.data && (
          <>
            <div>
              <p className="font-medium">{q.data.number}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {financeDate(q.data.date)} / {q.data.description}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="ui-table min-w-[540px]">
                <thead>
                  <tr>
                    <th>Akun</th>
                    <th>Debit</th>
                    <th>Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {q.data.lines.map((l) => (
                    <tr key={l.id}>
                      <th scope="row">
                        {l.name}
                        <span className="mt-1 block text-xs font-normal text-muted-foreground">
                          {l.code}
                        </span>
                      </th>
                      <td className="whitespace-nowrap tabular-nums">
                        {financeCurrency(l.debit)}
                      </td>
                      <td className="whitespace-nowrap tabular-nums">
                        {financeCurrency(l.credit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="ui-help">
              Jurnal berasal dari dokumen transaksi yang diposting. Koreksi
              tidak dilakukan dengan mengedit baris buku besar.
            </p>
          </>
        )
      )}
    </section>
  );
}
