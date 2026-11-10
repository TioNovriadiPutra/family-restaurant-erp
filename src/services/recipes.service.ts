import { httpClient } from "@/lib/http";
import type {
  RecipeCommand,
  RecipeCommandResult,
  RecipeFilters,
} from "@/interfaces/recipes";
export async function readRecipes<T>(
  outletId: string,
  view: string,
  filters: Partial<RecipeFilters> & { id?: string } = {},
) {
  return (
    await httpClient.get<T>("/recipes", {
      params: { outletId, view, ...filters },
    })
  ).data;
}
export async function writeRecipes(command: RecipeCommand) {
  return (await httpClient.post<RecipeCommandResult>("/recipes", command)).data;
}
