import { uuidPattern } from "./employees-validation";
const object = (v: unknown): v is Record<string, unknown> =>
  Boolean(v) && typeof v === "object" && !Array.isArray(v);
const uuid = (v: unknown) => typeof v === "string" && uuidPattern.test(v);
const optionalId = (v: unknown) => v === undefined || v === "" || uuid(v);
const text = (v: unknown, min: number, max: number) =>
  typeof v === "string" &&
  v.trim().length >= min &&
  v.length <= max &&
  !/[\u0000-\u001f\u007f]/.test(v);
const decimal = (v: unknown, signed = false) =>
  typeof v === "string" &&
  (signed ? /^-?\d{1,9}(\.\d{1,6})?$/ : /^\d{1,9}(\.\d{1,6})?$/).test(v);
const keys = (v: Record<string, unknown>, allowed: string[]) =>
  Object.keys(v).every((k) => allowed.includes(k));
const version = (v: unknown) => Number.isInteger(v) && Number(v) > 0;
export function validInventoryData(action: string, d: unknown) {
  if (!object(d)) return false;
  if (action === "material")
    return (
      keys(d, [
        "id",
        "name",
        "category",
        "kind",
        "baseUnitId",
        "active",
        "minimumQuantity",
        "locationId",
      ]) &&
      optionalId(d.id) &&
      text(d.name, 2, 120) &&
      text(d.category, 1, 80) &&
      ["raw", "semi_finished", "finished"].includes(String(d.kind)) &&
      uuid(d.baseUnitId) &&
      typeof d.active === "boolean" &&
      decimal(d.minimumQuantity) &&
      optionalId(d.locationId)
    );
  if (action === "conversion")
    return (
      keys(d, ["itemId", "unitId", "baseQuantity"]) &&
      uuid(d.itemId) &&
      uuid(d.unitId) &&
      decimal(d.baseQuantity) &&
      Number(d.baseQuantity) > 0
    );
  if (action === "location") return keys(d, ["name"]) && text(d.name, 2, 80);
  if (action === "unit")
    return (
      keys(d, ["code", "dimension"]) &&
      typeof d.code === "string" &&
      /^[a-z][a-z0-9_]{0,11}$/.test(d.code) &&
      ["mass", "volume", "count"].includes(String(d.dimension))
    );
  if (action === "count_create")
    return (
      keys(d, ["locationId", "notes", "scheduledAt", "itemIds"]) &&
      optionalId(d.locationId) &&
      text(d.notes ?? "", 0, 1000) &&
      (d.scheduledAt === undefined ||
        d.scheduledAt === "" ||
        (typeof d.scheduledAt === "string" &&
          /^\d{4}-\d{2}-\d{2}T/.test(d.scheduledAt) &&
          !Number.isNaN(Date.parse(d.scheduledAt)))) &&
      (d.itemIds === undefined ||
        (Array.isArray(d.itemIds) &&
          d.itemIds.length <= 1000 &&
          d.itemIds.every(uuid)))
    );
  if (action === "adjustment")
    return (
      keys(d, ["id", "version", "kind", "reason", "locationId", "lines"]) &&
      optionalId(d.id) &&
      (!d.id || version(d.version)) &&
      [
        "manual",
        "waste",
        "spoilage",
        "shrinkage",
        "staff_consumption",
      ].includes(String(d.kind)) &&
      text(d.reason, 3, 1000) &&
      optionalId(d.locationId) &&
      Array.isArray(d.lines) &&
      d.lines.length > 0 &&
      d.lines.length <= 100 &&
      d.lines.every(
        (l) =>
          object(l) &&
          keys(l, ["itemId", "quantity", "unitCost"]) &&
          uuid(l.itemId) &&
          decimal(l.quantity, d.kind === "manual") &&
          Number(l.quantity) !== 0 &&
          (d.kind === "manual" || Number(l.quantity) > 0) &&
          (l.unitCost === "" ||
            l.unitCost === undefined ||
            decimal(l.unitCost)),
      )
    );
  if (action === "count_save")
    return (
      keys(d, ["id", "version", "lines", "submit"]) &&
      (d.submit === undefined || typeof d.submit === "boolean") &&
      uuid(d.id) &&
      version(d.version) &&
      Array.isArray(d.lines) &&
      d.lines.length > 0 &&
      d.lines.length <= 1000 &&
      d.lines.every(
        (l) =>
          object(l) &&
          keys(l, [
            "itemId",
            "countedQuantity",
            "reason",
            "unitCost",
            "recount",
          ]) &&
          (l.recount === undefined || typeof l.recount === "boolean") &&
          uuid(l.itemId) &&
          (l.countedQuantity === "" || decimal(l.countedQuantity)) &&
          text(l.reason ?? "", 0, 500) &&
          (l.unitCost === "" ||
            l.unitCost === undefined ||
            decimal(l.unitCost)),
      )
    );
  return (
    ["count_start", "submit", "cancel", "approve", "reject"].includes(action) &&
    keys(d, ["id", "version", "reason"]) &&
    uuid(d.id) &&
    version(d.version) &&
    (action === "reject"
      ? text(d.reason, 3, 1000)
      : d.reason === undefined || text(d.reason, 0, 1000))
  );
}
