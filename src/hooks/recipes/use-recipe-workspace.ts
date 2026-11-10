import { useState } from "react";
import type { RecipeFilters } from "@/interfaces/recipes";
export function useRecipeWorkspace(recipeId?: string) {
  const [filters, setFilters] = useState<RecipeFilters>({
    search: "",
    status: "all",
    page: 1,
    recipeId,
  });
  const [detailId, setDetailId] = useState<string>();
  const change = (key: "search" | "status", value: string) =>
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  return {
    filters,
    setFilters,
    detailId,
    setDetailId,
    change,
  };
}
