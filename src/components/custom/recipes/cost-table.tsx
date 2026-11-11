import { DataTable, DataTableHead } from '@/components/shared/data-table';
import { recipeMoney, recipeQuantity } from "@/controller/recipes/use-recipes";
import type { RecipeCostTableProps } from "@/interfaces/recipes";
export function RecipeCostTable({
  cost,
  unit,
  yieldQuantity,
}: RecipeCostTableProps) {
  return (
    <div className="space-y-4">
      {!cost.complete && (
        <p role="status" className="ui-alert ui-alert-warning">
          {cost.missingCount} bahan belum memiliki biaya persediaan. HPP belum
          lengkap; bahan tersebut tidak dianggap gratis.
        </p>
      )}
      <div className="ui-table-container">
        <DataTable className="min-w-[680px]">
          <thead>
            <tr>
              {[
                "Bahan",
                "Jumlah resep",
                "Konversi ke stok",
                "Biaya / satuan stok",
                "Biaya bahan",
              ].map((t) => (
                <DataTableHead key={t} scope="col">
                  {t}
                </DataTableHead>
              ))}
            </tr>
          </thead>
          <tbody>
            {cost.lines.map((l) => (
              <tr key={l.id}>
                <th scope="row">
                  {l.name}
                  {!l.active && (
                    <span className="block text-13 text-destructive">
                      Bahan nonaktif
                    </span>
                  )}
                </th>
                <td className="whitespace-nowrap">
                  {recipeQuantity(l.quantity)} {l.unit}
                </td>
                <td className="whitespace-nowrap">
                  {recipeQuantity(l.quantityBase)} {l.baseUnit}
                </td>
                <td className="whitespace-nowrap">
                  {l.unitCost === null
                    ? "Belum tersedia"
                    : recipeMoney(l.unitCost)}
                </td>
                <td className="whitespace-nowrap font-medium">
                  {l.amount === null ? "—" : recipeMoney(l.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
      <p className="text-14 text-muted-foreground">
        Total biaya bahan dibagi hasil bersih {recipeQuantity(yieldQuantity)}{" "}
        {unit}. Biaya setengah jadi memakai saldo hasil produksi, sehingga bahan
        mentahnya tidak dihitung dua kali.
      </p>
    </div>
  );
}
