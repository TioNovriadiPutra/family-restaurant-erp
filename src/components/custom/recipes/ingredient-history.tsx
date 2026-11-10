import {
  useRecipeRead,
  recipeDate,
  recipeError,
  recipeMoney,
  recipeQuantity,
} from "@/controller/recipes/use-recipes";
import type {
  RecipeIngredientHistoryProps,
  RecipeMovements,
} from "@/interfaces/recipes";
export function RecipeIngredientHistory({
  outletId,
  recipeId,
}: RecipeIngredientHistoryProps) {
  const query = useRecipeRead<RecipeMovements>(outletId, "movements", {
    recipeId,
  });
  if (query.isPending)
    return (
      <p role="status" className="ui-card">
        Memuat mutasi biaya bahan…
      </p>
    );
  if (query.isError)
    return (
      <p role="alert" className="ui-alert ui-alert-destructive">
        {recipeError(query.error)}
      </p>
    );
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Sumber perubahan biaya bahan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Maksimal 50 mutasi terbaru bahan dalam resep. Biaya mutasi adalah
          biaya saat pencatatan, bukan HPP penjualan.
        </p>
      </div>
      <div className="ui-table-container">
        <table className="ui-table min-w-[680px]">
          <thead>
            <tr>
              {[
                "Tanggal",
                "Bahan",
                "Jumlah masuk / keluar",
                "Biaya satuan stok",
                "Dokumen sumber",
              ].map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!query.data?.items.length && (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Belum ada mutasi bahan untuk resep ini.
                </td>
              </tr>
            )}
            {query.data?.items.map((m) => (
              <tr key={m.sequence}>
                <td className="whitespace-nowrap">
                  {recipeDate(m.occurred_at)}
                </td>
                <th scope="row">{m.name}</th>
                <td>
                  {recipeQuantity(m.quantity)} {m.unit}
                </td>
                <td>
                  {recipeMoney(m.unit_cost)} / {m.unit}
                </td>
                <td>{m.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
