import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRecipeCommand } from "./use-recipe-command";
import type {
  RecipeBatchEditorProps,
  RecipeBatchForm,
} from "@/interfaces/recipes";
export function useBatchForm({
  outletId,
  options,
  detail,
  onSaved,
}: RecipeBatchEditorProps) {
  const batch = detail?.batch;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const form = useForm<RecipeBatchForm>({
    defaultValues: {
      id: batch?.id,
      revision: batch?.version,
      recipeVersionId: batch?.recipe_version_id ?? "",
      sourceLocationId:
        batch?.source_location_id ?? options.locations[0]?.id ?? "",
      outputLocationId:
        batch?.output_location_id ?? options.locations[0]?.id ?? "",
      target: batch?.target ?? "1",
      actual: batch?.actual ?? "1",
      date: batch?.produced_at.slice(0, 10) ?? today,
      notes: batch?.notes ?? "",
      lines:
        detail?.lines.map((l) => ({
          componentId: l.componentId,
          quantityBase: l.quantityBase,
        })) ?? [],
    },
  });
  const fields = useFieldArray({ control: form.control, name: "lines" });
  const values = useWatch({ control: form.control });
  const choice = options.recipes.find((r) => r.id === values.recipeVersionId);
  const seed = (versionId: string, target: string) => {
    const recipe = options.recipes.find((r) => r.id === versionId);
    if (!recipe) return;
    const ratio =
      Number(target) / (Number(recipe.yield) * Number(recipe.outputFactor));
    fields.replace(
      recipe.lines.map((l) => ({
        componentId: l.componentId,
        quantityBase: String(
          Number((Number(l.quantityBase) * ratio).toFixed(6)),
        ),
      })),
    );
  };
  const select = (id: string) => {
    const r = options.recipes.find((x) => x.id === id);
    if (!r) return;
    const target = String(Number(r.yield) * Number(r.outputFactor));
    form.setValue("target", target, { shouldValidate: true });
    form.setValue("actual", target, { shouldValidate: true });
    seed(id, target);
  };
  const command = useRecipeCommand(outletId);
  const submit = form.handleSubmit(async (value) => {
    try {
      onSaved((await command.run("batch_save", { ...value })).id);
    } catch {
      /* shown inline */
    }
  });
  return { form, fields, values, choice, select, seed, command, submit, today };
}
