import {
  recipeDate,
  recipeError,
  recipeMoney,
  recipeQuantity,
  recipeStatus,
} from "@/controller/recipes/use-recipes";
import { useRecipeBatchDetail } from "@/hooks/recipes/use-recipe-detail";
import type { RecipeBatchDetailProps } from "@/interfaces/recipes";
export function RecipeBatchPanel(props: RecipeBatchDetailProps) {
  const s = useRecipeBatchDetail(props);
  if (s.query.isPending)
    return (
      <p role="status" className="ui-card">
        Memuat produksi bahan…
      </p>
    );
  if (s.query.isError || !s.query.data)
    return (
      <div className="ui-alert ui-alert-destructive">
        <p>{recipeError(s.query.error)}</p>
        <button
          className="ui-button ui-button-secondary w-fit"
          onClick={() => s.query.refetch()}
        >
          Coba lagi
        </button>
      </div>
    );
  const d = s.query.data;
  const b = d.batch;
  return (
    <section aria-label="Detail produksi bahan" className="ui-card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {b.number} · {recipeStatus[b.status]}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{b.recipe_name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Versi {b.recipe_version} · {b.output_location} ·{" "}
            {recipeDate(b.produced_at)} · {b.produced_by_name}
          </p>
        </div>
        <button
          className="ui-button ui-button-secondary"
          onClick={props.onClose}
        >
          Tutup detail
        </button>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Target hasil", `${recipeQuantity(b.target)} ${b.unit}`],
          ["Hasil aktual", `${recipeQuantity(b.actual)} ${b.unit}`],
          [
            "Total biaya",
            b.total === null ? "Saat posting" : recipeMoney(b.total),
          ],
          [
            `Biaya per ${b.unit}`,
            b.unit_cost === null ? "Saat posting" : recipeMoney(b.unit_cost),
          ],
        ].map(([label, value]) => (
          <div key={label} className="rounded-control bg-secondary p-4">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-lg font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="ui-table-container">
        <table className="ui-table min-w-[680px]">
          <thead>
            <tr>
              {["Bahan aktual", "Lokasi bahan", "Dipakai", "Nilai aktual"].map(
                (t) => (
                  <th key={t} scope="col">
                    {t}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {d.lines.map((l) => (
              <tr key={l.id}>
                <th scope="row">{l.name}</th>
                <td>{l.location}</td>
                <td>
                  {recipeQuantity(l.quantityBase)} {l.unit}
                </td>
                <td>
                  {l.amount === null ? "Saat posting" : recipeMoney(l.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {b.notes && <p className="text-sm text-muted-foreground">{b.notes}</p>}
      {b.status === "draft" && (
        <>
          <p className="text-sm text-muted-foreground">
            Menyelesaikan produksi akan mengurangi bahan dan menambah {b.output_name} sesuai hasil
            bersih aktual dalam satu transaksi. Nilai total persediaan tetap
            sama.
          </p>
          <div className="flex flex-wrap gap-3">
            {props.canProduce && (
              <>
                <button
                  className="ui-button ui-button-secondary"
                  disabled={s.command.pending}
                  onClick={() => props.onEdit(d)}
                >
                  Edit draf produksi
                </button>
                <button
                  className="ui-button ui-button-ghost !text-destructive"
                  disabled={s.command.pending}
                  onClick={() => s.setConfirm("batch_cancel")}
                >
                  Batalkan produksi
                </button>
              </>
            )}
            {props.canPost && (
              <button
                className="ui-button ui-button-primary"
                disabled={s.command.pending}
                onClick={() => s.setConfirm("batch_post")}
              >
                Selesaikan produksi
              </button>
            )}
          </div>
        </>
      )}
      {s.confirm && (
        <div
          role="group"
          aria-label="Konfirmasi produksi"
          className="ui-alert ui-alert-warning"
        >
          <p>
            {s.confirm === "batch_post"
              ? "Selesaikan produksi ini sekarang? Pemakaian bahan dan hasil aktual akan dicatat permanen."
              : "Batalkan draf produksi ini? Stok tidak berubah."}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className="ui-button ui-button-secondary"
              disabled={s.command.pending}
              onClick={() => s.setConfirm(undefined)}
            >
              Kembali
            </button>
            <button
              className="ui-button ui-button-primary"
              disabled={s.command.pending}
              onClick={s.run}
            >
              {s.command.pending
                ? "Memproses…"
                : s.confirm === "batch_post"
                  ? "Ya, selesaikan produksi"
                  : "Ya, batalkan produksi"}
            </button>
          </div>
        </div>
      )}
      {s.command.error && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          {s.command.error}
        </p>
      )}
    </section>
  );
}
