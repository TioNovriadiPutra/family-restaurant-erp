import { useState } from "react";
import {
  useRecipeMutation,
  recipeError,
} from "@/controller/recipes/use-recipes";
import { inventoryDefinitiveFailure } from "@/controller/inventory/use-inventory";
import type { RecipeAction, RecipeAttempt } from "@/interfaces/recipes";
export function useRecipeCommand(outletId: string) {
  const mutation = useRecipeMutation();
  const [attempt, setAttempt] = useState<RecipeAttempt>();
  const [error, setError] = useState("");
  const run = async (action: RecipeAction, data: Record<string, unknown>) => {
    setError("");
    const signature = JSON.stringify({ action, data });
    if (attempt && attempt.signature !== signature) {
      const message =
        "Percobaan sebelumnya belum terkonfirmasi. Periksa daftar sebelum mengubah data.";
      setError(message);
      throw new Error(message);
    }
    const current = attempt ?? { signature, requestId: crypto.randomUUID() };
    setAttempt(current);
    try {
      const result = await mutation.mutateAsync({
        outletId,
        action,
        data,
        requestId: current.requestId,
      });
      setAttempt(undefined);
      return result;
    } catch (e) {
      if (inventoryDefinitiveFailure(e)) setAttempt(undefined);
      setError(recipeError(e));
      throw e;
    }
  };
  return { run, error, pending: mutation.isPending };
}
