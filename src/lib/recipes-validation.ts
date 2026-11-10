import { uuidPattern } from "./employees-validation";
const obj = (v: unknown): v is Record<string, unknown> =>
  Boolean(v) && typeof v === "object" && !Array.isArray(v);
const uuid = (v: unknown) => typeof v === "string" && uuidPattern.test(v);
const text = (v: unknown, min: number, max: number) =>
  typeof v === "string" &&
  v.trim().length >= min &&
  v.length <= max &&
  !/[\u0000-\u001f\u007f]/.test(v);
const optional = (v: unknown) => v === undefined || v === "" || uuid(v);
const keys = (v: Record<string, unknown>, allowed: string[]) =>
  Object.keys(v).every((k) => allowed.includes(k));
export const recipeDecimal = (v: unknown, max = 1000000) =>
  typeof v === "string" &&
  /^\d{1,9}(\.\d{1,6})?$/.test(v) &&
  Number(v) > 0 &&
  Number(v) <= max;
const revision = (v: unknown) => Number.isInteger(v) && Number(v) > 0;
export function validRecipeData(action: string, d: unknown) {
  if (!obj(d)) return false;
  if (action === "save")
    return (
      keys(d, [
        "id",
        "revision",
        "name",
        "category",
        "yield",
        "grossYield",
        "outputUnitId",
        "outputItemId",
        "targetPercent",
        "referencePrice",
        "notes",
        "lines",
      ]) &&
      optional(d.id) &&
      (!d.id || revision(d.revision)) &&
      text(d.name, 2, 120) &&
      text(d.category, 1, 80) &&
      recipeDecimal(d.yield) &&
      (d.grossYield === "" ||
        (recipeDecimal(d.grossYield) &&
          Number(d.grossYield) >= Number(d.yield))) &&
      uuid(d.outputUnitId) &&
      optional(d.outputItemId) &&
      recipeDecimal(d.targetPercent, 100) &&
      (d.referencePrice === "" ||
        recipeDecimal(d.referencePrice, 1000000000)) &&
      text(d.notes ?? "", 0, 1000) &&
      Array.isArray(d.lines) &&
      d.lines.length > 0 &&
      d.lines.length <= 100 &&
      d.lines.every(
        (l) =>
          obj(l) &&
          keys(l, ["itemId", "unitId", "quantity"]) &&
          uuid(l.itemId) &&
          uuid(l.unitId) &&
          recipeDecimal(l.quantity),
      ) &&
      new Set(d.lines.map((l) => l.itemId)).size === d.lines.length
    );
  if (action === "batch_save")
    return (
      keys(d, [
        "id",
        "revision",
        "recipeVersionId",
        "sourceLocationId",
        "outputLocationId",
        "target",
        "actual",
        "date",
        "notes",
        "lines",
      ]) &&
      optional(d.id) &&
      (!d.id || revision(d.revision)) &&
      uuid(d.recipeVersionId) &&
      uuid(d.sourceLocationId) &&
      uuid(d.outputLocationId) &&
      recipeDecimal(d.target) &&
      recipeDecimal(d.actual) &&
      typeof d.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(d.date) &&
      !Number.isNaN(Date.parse(d.date)) &&
      text(d.notes ?? "", 0, 1000) &&
      Array.isArray(d.lines) &&
      d.lines.length > 0 &&
      d.lines.length <= 100 &&
      d.lines.every(
        (l) =>
          obj(l) &&
          keys(l, ["componentId", "quantityBase"]) &&
          uuid(l.componentId) &&
          recipeDecimal(l.quantityBase),
      ) &&
      new Set(d.lines.map((l) => l.componentId)).size === d.lines.length
    );
  return (
    ["publish", "active", "snapshot", "batch_post", "batch_cancel"].includes(
      action,
    ) &&
    keys(d, ["id", "revision", ...(action === "active" ? ["active"] : [])]) &&
    uuid(d.id) &&
    revision(d.revision) &&
    (action !== "active" || typeof d.active === "boolean")
  );
}
export function validRecipeFilters(d: Record<string, unknown>) {
  return (
    typeof d.search === "string" &&
    d.search.length <= 120 &&
    [
      "all",
      "active",
      "inactive",
      "draft",
      "published",
      "retired",
      "posted",
      "cancelled",
    ].includes(String(d.status)) &&
    /^[1-9]\d{0,4}$/.test(String(d.page)) &&
    optional(d.recipeId)
  );
}
