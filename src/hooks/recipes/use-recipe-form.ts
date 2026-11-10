import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRecipeCommand } from "./use-recipe-command";
import type { RecipeEditorProps, RecipeForm } from "@/interfaces/recipes";
export function useRecipeForm({
  outletId,
  options,
  detail,
  onSaved,
}: RecipeEditorProps) {
  const recipe = detail?.recipe;
  const form = useForm<RecipeForm>({
    defaultValues: {
      id: recipe?.id,
      revision: recipe?.revision,
      name: recipe?.name ?? "",
      category: recipe?.category ?? "Makanan",
      yield: recipe?.yield ?? "1",
      grossYield: recipe?.gross_yield ?? "",
      outputUnitId:
        recipe?.output_unit_id ??
        options.units.find((u) => u.code === "pcs")?.id ??
        "",
      outputItemId: recipe?.output_item_id ?? "",
      targetPercent: recipe ? String(Number(recipe.target_rate) * 100) : "30",
      referencePrice: recipe?.reference_price ?? "",
      notes: recipe?.notes ?? "",
      lines: detail?.cost.lines.map((l) => ({
        itemId: l.itemId,
        unitId: l.unitId,
        quantity: l.quantity,
      })) ?? [{ itemId: "", unitId: "", quantity: "" }],
    },
  });
  const lines = useFieldArray({ control: form.control, name: "lines" });
  const values = useWatch({ control: form.control });
  const command = useRecipeCommand(outletId);
  const output = options.items.find((i) => i.id === values.outputItemId);
  const changeOutput = (id: string) =>
    form.setValue(
      "outputUnitId",
      options.items.find((i) => i.id === id)?.baseUnitId ??
        options.units.find((u) => u.code === "pcs")?.id ??
        "",
      { shouldValidate: true },
    );
  const submit = form.handleSubmit(async (value) => {
    try {
      onSaved((await command.run("save", { ...value })).id);
    } catch {
      /* shown inline */
    }
  });
  return { form, lines, values, output, changeOutput, submit, command };
}
