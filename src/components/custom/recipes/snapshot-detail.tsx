import { SectionTitle } from '@/components/shared/page-heading';
import {
  useRecipeRead,
  recipeDate,
  recipeError,
  recipeMoney,
} from "@/controller/recipes/use-recipes";
import { RecipeCostTable } from "./cost-table";
import type { RecipeSnapshot, RecipeSnapshotProps } from "@/interfaces/recipes";
export function RecipeSnapshotPanel({
  outletId,
  id,
  onClose,
}: RecipeSnapshotProps) {
  const query = useRecipeRead<RecipeSnapshot>(outletId, "snapshot", { id });
  if (query.isPending)
    return (
      <p role="status" className="ui-card">
        Memuat snapshot HPP…
      </p>
    );
  if (query.isError || !query.data)
    return (
      <p role="alert" className="ui-alert ui-alert-destructive">
        {recipeError(query.error)}
      </p>
    );
  const d = query.data;
  const m = d.metadata;
  return (
    <section aria-label="Detail snapshot HPP" className="ui-card space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-14 text-muted-foreground">
            Snapshot biaya · {recipeDate(d.calculatedAt)}
          </p>
          <SectionTitle className="mt-1">
            {m.name} · v{m.version}
          </SectionTitle>
          <p className="mt-1 font-medium">
            {recipeMoney(d.perOutput)} / {m.unit}
          </p>
        </div>
        <button className="ui-button ui-button-secondary" onClick={onClose}>
          Tutup snapshot
        </button>
      </div>
      {m.lines ? (
        <RecipeCostTable cost={m} unit={m.unit} yieldQuantity={m.yield} />
      ) : (
        <p className="ui-alert ui-alert-info">
          Snapshot lama belum menyimpan rincian tampilan.
        </p>
      )}
      <p className="text-14 text-muted-foreground">
        Biaya tersimpan tetap sama meskipun harga bahan atau versi resep
        berubah.
      </p>
    </section>
  );
}
