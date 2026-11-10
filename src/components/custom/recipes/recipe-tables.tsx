import { DocumentText } from "iconsax-reactjs";
import {
  recipeDate,
  recipeMoney,
  recipeQuantity,
  recipeStatus,
} from "@/controller/recipes/use-recipes";
import type {
  RecipeBatch,
  RecipeHistory,
  RecipeRecord,
  RecipeTableProps,
  RecipeBatchRowProps,
  RecipeHistoryRowProps,
  RecipeRowProps,
} from "@/interfaces/recipes";
export function RecipeRecordsTable({ view, items, onOpen }: RecipeTableProps) {
  const headings =
    view === "recipes"
      ? [
          "Resep / kode",
          "Kategori",
          "Hasil bersih",
          "HPP / hasil",
          "Status",
          "Aksi",
        ]
      : view === "history"
        ? [
            "Resep",
            "Waktu snapshot",
            "Versi",
            "Total bahan",
            "HPP / hasil",
            "Aksi",
          ]
        : [
            "Produksi / resep",
            "Tanggal produksi",
            "Hasil aktual",
            "Nilai produksi",
            "Status",
            "Aksi",
          ];
  return (
    <table className="ui-table min-w-[680px]">
      <thead>
        <tr>
          {headings.map((h) => (
            <th scope="col" key={h}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {!items.length && (
          <tr>
            <td colSpan={6}>
              <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
                <DocumentText size={24} aria-hidden />
                <p>
                  {view === "history"
                    ? "Belum ada snapshot HPP. Simpan snapshot dari detail resep."
                    : view === "batches"
                      ? "Belum ada produksi bahan sesuai filter."
                      : "Belum ada resep sesuai filter. Tambahkan resep pertama."}
                </p>
              </div>
            </td>
          </tr>
        )}
        {items.map((item) =>
          view === "recipes" ? (
            <RecipeRow
              key={item.id}
              item={item as RecipeRecord}
              onOpen={onOpen}
            />
          ) : view === "history" ? (
            <HistoryRow
              key={item.id}
              item={item as RecipeHistory}
              onOpen={onOpen}
            />
          ) : (
            <BatchRow
              key={item.id}
              item={item as RecipeBatch}
              onOpen={onOpen}
            />
          ),
        )}
      </tbody>
    </table>
  );
}
function RecipeRow({ item: r, onOpen }: RecipeRowProps) {
  return (
    <tr>
      <th scope="row">
        <span>{r.name}</span>
        <span className="mt-1 block text-xs font-normal text-muted-foreground">
          {r.code} · v{r.version}
          {r.output_name ? ` · ${r.output_name}` : ""}
        </span>
      </th>
      <td>{r.category}</td>
      <td className="whitespace-nowrap">
        {recipeQuantity(r.yield)} {r.unit}
      </td>
      <td className="whitespace-nowrap">
        {r.cost.perOutput === null ? (
          <span className="text-warning">Biaya belum lengkap</span>
        ) : (
          <>
            {recipeMoney(r.cost.perOutput)}
            <span className="block text-xs text-muted-foreground">
              per {r.unit === "pcs" ? "porsi" : r.unit}
            </span>
          </>
        )}
      </td>
      <td>
        <span
          className={`ui-badge ${r.active && r.status === "published" ? "ui-badge-success" : "ui-badge-neutral"}`}
        >
          {r.active ? recipeStatus[r.status] : "Nonaktif"}
        </span>
        {r.status === "draft" && r.published_version_id && (
          <span className="mt-1 block text-xs text-muted-foreground">
            Versi terbit masih berlaku
          </span>
        )}
      </td>
      <td>
        <button
          type="button"
          className="ui-button ui-button-secondary"
          aria-label={`Buka resep ${r.name}`}
          onClick={() => onOpen(r.id)}
        >
          Buka
        </button>
      </td>
    </tr>
  );
}
function HistoryRow({ item: r, onOpen }: RecipeHistoryRowProps) {
  return (
    <tr>
      <th scope="row">
        {r.name}
        <span className="block text-xs font-normal text-muted-foreground">
          {r.code}
        </span>
      </th>
      <td className="whitespace-nowrap">{recipeDate(r.calculated_at)}</td>
      <td>v{r.version}</td>
      <td>{recipeMoney(r.total)}</td>
      <td className="whitespace-nowrap">
        {recipeMoney(r.per_output)} / {r.unit}
      </td>
      <td>
        <button
          type="button"
          className="ui-button ui-button-secondary"
          aria-label={`Buka snapshot ${r.name}`}
          onClick={() => onOpen(r.id)}
        >
          Rincian
        </button>
      </td>
    </tr>
  );
}
function BatchRow({ item: b, onOpen }: RecipeBatchRowProps) {
  return (
    <tr>
      <th scope="row">
        {b.number}
        <span className="block text-xs font-normal text-muted-foreground">
          {b.recipe_name} · v{b.recipe_version}
        </span>
      </th>
      <td className="whitespace-nowrap">{recipeDate(b.produced_at)}</td>
      <td>
        {recipeQuantity(b.actual)} {b.unit}
      </td>
      <td>{b.total === null ? "Belum diposting" : recipeMoney(b.total)}</td>
      <td>
        <span
          className={`ui-badge ${b.status === "posted" ? "ui-badge-success" : "ui-badge-neutral"}`}
        >
          {recipeStatus[b.status]}
        </span>
      </td>
      <td>
        <button
          type="button"
          className="ui-button ui-button-secondary"
          aria-label={`Buka produksi ${b.number}`}
          onClick={() => onOpen(b.id)}
        >
          Buka
        </button>
      </td>
    </tr>
  );
}
