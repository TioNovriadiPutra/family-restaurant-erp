import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadSource, sourceRoot } from "./support/load-source.mjs";
const { validSettingsData, validSettingsFilters } = loadSource(
  path.join(sourceRoot, "src/lib/settings-validation.ts"),
);
const id = "78000000-0000-0000-0000-000000000001";
test("settings reject unsafe rates, protected permissions, unknown keys and invalid references", () => {
  const profile = {
    revision: 1,
    restaurantName: "Restoran",
    outletName: "Utama",
    address: "",
    phone: "",
    timezone: "Asia/Jakarta",
    taxPercent: "10",
    servicePercent: "5",
    rounding: "nearest_1",
  };
  assert.ok(validSettingsData("profile", profile));
  for (const taxPercent of ["NaN", "Infinity", "-1", "100.1", "1e2"])
    assert.equal(
      validSettingsData("profile", { ...profile, taxPercent }),
      false,
    );
  assert.equal(
    validSettingsData("profile", { ...profile, phone: "0212345678" }),
    false,
  );
  assert.equal(
    validSettingsData("profile", { ...profile, serviceRole: true }),
    false,
  );
  const role = {
    id,
    revision: 1,
    discountPercent: "10",
    permissions: ["menu.read"],
  };
  assert.ok(validSettingsData("role", role));
  assert.equal(
    validSettingsData("role", { ...role, permissions: ["rbac.manage"] }),
    false,
  );
  assert.equal(
    validSettingsData("role", {
      ...role,
      permissions: ["menu.read", "menu.read"],
    }),
    false,
  );
  const receipt = {
    revision: 1,
    header: "",
    footer: "",
    paperWidth: 80,
    digitalEnabled: false,
    printerId: "",
  };
  assert.ok(validSettingsData("receipt", receipt));
  assert.equal(
    validSettingsData("receipt", { ...receipt, paperWidth: "80" }),
    false,
  );
  assert.equal(
    validSettingsData("assignment", {
      employeeId: id,
      roleId: "bad",
      expectedRoles: [],
    }),
    false,
  );
  assert.ok(
    validSettingsFilters({
      search: "",
      page: 1,
      categoryId: "",
      status: "all",
    }),
  );
  assert.equal(
    validSettingsFilters({
      search: "",
      page: -1,
      categoryId: "",
      status: "all",
    }),
    false,
  );
});
