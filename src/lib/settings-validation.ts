import { uuidPattern } from "./employees-validation";
import { validIndonesianPhone } from "./phone-validation";
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const keys = (v: Record<string, unknown>, allowed: string[]) =>
  Object.keys(v).every((k) => allowed.includes(k));
const text = (v: unknown, min = 0, max = 500): v is string =>
  typeof v === "string" && v.trim().length >= min && v.length <= max;
const uuid = (v: unknown) => typeof v === "string" && uuidPattern.test(v);
const revision = (v: unknown) => Number.isInteger(v) && Number(v) > 0;
const bool = (v: unknown) => typeof v === "boolean";
const identity = (v: Record<string, unknown>) =>
  v.id === undefined || (uuid(v.id) && revision(v.revision));
export const settingsAmount = (v: unknown): v is string =>
  typeof v === "string" && /^(0|[1-9]\d{0,11})(\.\d{1,2})?$/.test(v);
export const settingsPercent = (v: unknown): v is string =>
  typeof v === "string" &&
  /^(100(\.0{1,4})?|[0-9]{1,2}(\.[0-9]{1,4})?)$/.test(v);
export function validSettingsData(action: string, v: unknown) {
  if (!object(v)) return false;
  if (action === "profile")
    return (
      keys(v, [
        "revision",
        "restaurantName",
        "outletName",
        "address",
        "phone",
        "timezone",
        "taxPercent",
        "servicePercent",
        "rounding",
      ]) &&
      revision(v.revision) &&
      text(v.restaurantName, 2, 120) &&
      text(v.outletName, 2, 120) &&
      text(v.address) &&
      text(v.phone, 0, 14) &&
      validIndonesianPhone(v.phone) &&
      ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"].includes(
        String(v.timezone),
      ) &&
      settingsPercent(v.taxPercent) &&
      settingsPercent(v.servicePercent) &&
      ["nearest_1", "nearest_100", "nearest_500", "nearest_1000"].includes(
        String(v.rounding),
      )
    );
  if (action === "receipt")
    return (
      keys(v, [
        "revision",
        "header",
        "footer",
        "paperWidth",
        "digitalEnabled",
        "printerId",
      ]) &&
      revision(v.revision) &&
      text(v.header) &&
      text(v.footer) &&
      [58, 80].includes(Number(v.paperWidth)) &&
      Number.isInteger(v.paperWidth) &&
      bool(v.digitalEnabled) &&
      (v.printerId === "" || uuid(v.printerId))
    );
  if (action === "category")
    return (
      keys(v, [
        "id",
        "revision",
        "name",
        "kind",
        "sortOrder",
        "active",
        "visible",
      ]) &&
      identity(v) &&
      text(v.name, 2, 120) &&
      ["food", "drink", "snack"].includes(String(v.kind)) &&
      Number.isInteger(v.sortOrder) &&
      Number(v.sortOrder) >= 0 &&
      Number(v.sortOrder) <= 99999 &&
      bool(v.active) &&
      bool(v.visible)
    );
  if (action === "menu")
    return (
      keys(v, [
        "id",
        "revision",
        "name",
        "categoryId",
        "description",
        "allergens",
        "price",
        "active",
        "available",
        "recipeId",
        "portions",
        "taxExempt",
        "serviceExempt",
      ]) &&
      identity(v) &&
      text(v.name, 2, 120) &&
      uuid(v.categoryId) &&
      text(v.description, 0, 1000) &&
      text(v.allergens, 0, 300) &&
      settingsAmount(v.price) &&
      bool(v.active) &&
      bool(v.available) &&
      (v.recipeId === "" || uuid(v.recipeId)) &&
      typeof v.portions === "string" &&
      /^(0|[1-9]\d{0,5})(\.\d{1,6})?$/.test(v.portions) &&
      Number(v.portions) > 0 &&
      bool(v.taxExempt) &&
      bool(v.serviceExempt)
    );
  if (action === "price")
    return (
      keys(v, ["id", "revision", "amount", "effectiveFrom", "reason"]) &&
      uuid(v.id) &&
      revision(v.revision) &&
      settingsAmount(v.amount) &&
      typeof v.effectiveFrom === "string" &&
      (v.effectiveFrom === "" ||
        (/^\d{4}-\d{2}-\d{2}T/.test(v.effectiveFrom) &&
          Number.isFinite(Date.parse(v.effectiveFrom)))) &&
      text(v.reason, 2, 200)
    );
  if (action === "payment")
    return (
      keys(v, [
        "id",
        "revision",
        "name",
        "kind",
        "provider",
        "merchantScope",
        "accountId",
        "active",
      ]) &&
      identity(v) &&
      text(v.name, 2, 120) &&
      ["cash", "qris", "edc"].includes(String(v.kind)) &&
      text(v.provider, v.kind === "cash" ? 0 : 2, 120) &&
      text(v.merchantScope, v.kind === "cash" ? 0 : 2, 120) &&
      (v.kind === "cash"
        ? uuid(v.accountId)
        : v.accountId === "" || uuid(v.accountId)) &&
      bool(v.active)
    );
  if (action === "role")
    return (
      keys(v, ["id", "revision", "discountPercent", "permissions"]) &&
      uuid(v.id) &&
      revision(v.revision) &&
      settingsPercent(v.discountPercent) &&
      Array.isArray(v.permissions) &&
      v.permissions.length <= 100 &&
      v.permissions.every((c) => text(c, 1, 80) && c !== "rbac.manage") &&
      new Set(v.permissions).size === v.permissions.length
    );
  if (action === "assignment")
    return (
      keys(v, ["employeeId", "roleId", "expectedRoles"]) &&
      uuid(v.employeeId) &&
      uuid(v.roleId) &&
      Array.isArray(v.expectedRoles) &&
      v.expectedRoles.length <= 20 &&
      v.expectedRoles.every(uuid) &&
      new Set(v.expectedRoles).size === v.expectedRoles.length
    );
  return false;
}
export function validSettingsFilters(v: Record<string, unknown>) {
  return (
    text(v.search, 0, 120) &&
    /^[1-9]\d{0,4}$/.test(String(v.page)) &&
    (v.categoryId === "" || uuid(v.categoryId)) &&
    ["all", "active", "inactive", "unavailable"].includes(String(v.status))
  );
}
