import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadSource, sourceRoot } from "./support/load-source.mjs";
const { phoneDigits, validIndonesianPhone } = loadSource(path.join(sourceRoot, "src/lib/phone-validation.ts"));
const { validateEmployeeCreate } = loadSource(path.join(sourceRoot, "src/lib/employees-validation.ts"));
const { validPurchasingInput } = loadSource(path.join(sourceRoot, "src/lib/purchasing-validation.ts"));
test("Indonesian mobile inputs clean paste and validate local/international mobile formats consistently", () => {
  assert.equal(phoneDigits("+62 812-3456-7890"), "6281234567890");
  assert.equal(phoneDigits("08abc12e34567890"), "081234567890");
  for (const value of ["", "0812345678", "0812345678901", "62812345678", "62812345678901"]) assert.equal(validIndonesianPhone(value), true, value);
  for (const value of ["12345678", "08123", "08123456789012", "628123456789012", "02123456789", "080123456789", "+628123456789", "0812 34567890", "0812e3456789", "6591234567"]) assert.equal(validIndonesianPhone(value), false, value);
  const employee = { outletId: "70000000-0000-0000-0000-000000000001", name: "Andi", email: "andi@example.invalid", phone: "081234567890", roleId: "70000000-0000-0000-0000-000000000002", active: true };
  assert.ok(validateEmployeeCreate(employee).value);
  assert.ok(validateEmployeeCreate({ ...employee, phone: "02123456789" }).errors.phone);
  const supplier = { name: "Supplier", email: "", phone: "6281234567890", contact: "", payment_terms_days: 0, active: true };
  assert.equal(validPurchasingInput("supplier", supplier), true);
  assert.equal(validPurchasingInput("supplier", { ...supplier, phone: "02123456789" }), false);
});
