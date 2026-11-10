import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { readRecipes, writeRecipes } from "@/services/recipes.service";
import type { RecipeFilters } from "@/interfaces/recipes";
export {
  inventoryMoney as recipeMoney,
  inventoryQuantity as recipeQuantity,
  inventoryDate as recipeDate,
  inventoryError as recipeError,
} from "@/controller/inventory/use-inventory";
export const recipeStatus: Record<string, string> = {
  draft: "Draf",
  published: "Diterbitkan",
  retired: "Versi lama",
  posted: "Selesai",
  cancelled: "Dibatalkan",
};
export const recipePercent = (value: string, ratio = false) =>
  `${(Number(value) * (ratio ? 100 : 1)).toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`;
export function useRecipeRead<T>(
  outletId: string,
  view: string,
  filters: Partial<RecipeFilters> & { id?: string } = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ["recipes", outletId, view, filters],
    queryFn: () => readRecipes<T>(outletId, view, filters),
    enabled: Boolean(outletId) && enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
export function useRecipeMutation() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: writeRecipes,
    retry: false,
    onSuccess: async (_, v) => {
      await Promise.all([
        cache.invalidateQueries({ queryKey: ["recipes", v.outletId] }),
        ...(v.action === "batch_post"
          ? [
              cache.invalidateQueries({ queryKey: ["inventory", v.outletId] }),
              cache.invalidateQueries({ queryKey: ["purchasing", v.outletId] }),
              cache.invalidateQueries({ queryKey: ["dashboard", v.outletId] }),
            ]
          : []),
      ]);
    },
  });
}
