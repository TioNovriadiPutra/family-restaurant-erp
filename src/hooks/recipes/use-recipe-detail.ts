import { useState } from "react";
import { useRecipeCommand } from "./use-recipe-command";
import { useRecipeRead } from "@/controller/recipes/use-recipes";
import type {
  RecipeAction,
  RecipeDetail,
  RecipeDetailProps,
  RecipeBatchDetail,
  RecipeBatchDetailProps,
} from "@/interfaces/recipes";
export function useRecipeDetail({ outletId, id }: RecipeDetailProps) {
  const query = useRecipeRead<RecipeDetail>(outletId, "detail", { id });
  const command = useRecipeCommand(outletId);
  const [notice, setNotice] = useState("");
  const run = async (action: RecipeAction) => {
    if (!query.data) return;
    try {
      const r = query.data.recipe;
      await command.run(action, {
        id: r.id,
        revision: r.revision,
        ...(action === "active" ? { active: !r.active } : {}),
      });
      setNotice(
        action === "snapshot"
          ? "Snapshot HPP berhasil disimpan di Riwayat biaya."
          : "Status resep berhasil diperbarui.",
      );
    } catch {
      /* error rendered */
    }
  };
  return { query, command, notice, run };
}
export function useRecipeBatchDetail({ outletId, id }: RecipeBatchDetailProps) {
  const query = useRecipeRead<RecipeBatchDetail>(outletId, "batch_detail", {
    id,
  });
  const command = useRecipeCommand(outletId);
  const [confirm, setConfirm] = useState<"batch_post" | "batch_cancel">();
  const run = async () => {
    if (!query.data || !confirm) return;
    try {
      await command.run(confirm, { id, revision: query.data.batch.version });
      setConfirm(undefined);
    } catch {
      /* error rendered */
    }
  };
  return { query, command, confirm, setConfirm, run };
}
