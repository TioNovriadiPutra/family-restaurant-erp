import { test, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { loadSource, sourceRoot } from "./support/load-source.mjs";

const id = "70000000-0000-0000-0000-000000000001";
const otherId = "70000000-0000-0000-0000-000000000002";
const roleId = "70000000-0000-0000-0000-000000000003";
const user = { id, email: "owner@example.invalid", aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
const permissions = ["staff.read", "rbac.read", "staff.manage", "rbac.manage"];
let access = [{ employee_id: id, restaurant_id: id, outlet_id: id, outlet_name: "Test outlet", role: "Pemilik", permissions }];
let rpcCalls = [];
let failure = null;
let profilesCreated = 0;
const fake = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  let raw = ""; for await (const chunk of req) raw += chunk;
  if (req.url.startsWith("/auth/v1/token")) {
    const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
    const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: id, exp: Math.floor(Date.now()/1000)+3600 })}.test`;
    res.end(JSON.stringify({ access_token: token, refresh_token: "employee-test-refresh", expires_in: 3600, token_type: "bearer", user }));
  } else if (req.url === "/auth/v1/user") res.end(JSON.stringify(user));
  else if (req.url === "/rest/v1/rpc/my_access") res.end(JSON.stringify(access));
  else if (req.url === "/rest/v1/rpc/employee_directory") {
    const body = JSON.parse(raw); rpcCalls.push({ name: "directory", body });
    res.end(JSON.stringify(body.p_options_only ? { roles: [{ id: roleId, name: "Kasir" }] } : { items: body.p_search === "pinstatus" ? [{id:otherId, name:"Andi"}] : [], total: body.p_search === "pinstatus" ? 1 : 0, page: body.p_page, page_size: 10, summary: { total: 0, active: 0, inactive: 0 }, roles: [{ id: roleId, name: "Kasir" }] }));
  } else if (req.url === "/rest/v1/rpc/employee_pin_statuses") {
    res.end(JSON.stringify({[otherId]:{pin_configured:true,pin_eligible:true}}));
  } else if (req.url === "/rest/v1/rpc/manage_employee_profile") {
    rpcCalls.push({ name: "manage", body: JSON.parse(raw) });
    if (failure) { res.statusCode = 400; res.end(JSON.stringify(failure)); } else res.end("null");
  } else if (req.url === "/rest/v1/rpc/set_employee_pos_pin") {
    rpcCalls.push({ name: "pin", body: JSON.parse(raw) });
    if (failure) { res.statusCode = 400; res.end(JSON.stringify(failure)); } else res.end("null");
  } else if (req.url === "/rest/v1/rpc/create_employee_profile_auto") {
    const body = JSON.parse(raw); rpcCalls.push({ name: "create", body });
    if (failure) { res.statusCode = 400; res.end(JSON.stringify({ code: failure.code, message: failure.message, details: "internal details must not leak", hint: "sensitive database hint" })); }
    else { profilesCreated++; res.end(JSON.stringify(otherId)); }
  } else { res.statusCode = 404; res.end("{}"); }
});
after(() => new Promise(resolve => fake.close(resolve)));

test("employee API validates, scopes permissions, normalizes data and surfaces safe errors", async () => {
  await new Promise(resolve => fake.listen(0, "127.0.0.1", resolve));
  process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${fake.address().port}`;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-public-key";
  const handler = loadSource(path.join(sourceRoot, "src/pages/api/employees/index.ts")).default;
  const pinHandler = loadSource(path.join(sourceRoot, "src/pages/api/employees/[id]/pin.ts")).default;
  const manageHandler = loadSource(path.join(sourceRoot, "src/pages/api/employees/[id]/manage.ts")).default;
  const auth = loadSource(path.join(sourceRoot, "src/pages/api/auth/[action].ts")).default;
  async function request(options = {}, target = handler) {
    const headers = new Map();
    const res = { setHeader(name, value) { headers.set(name.toLowerCase(), value); }, getHeader(name) { return headers.get(name.toLowerCase()); }, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; } };
    const req = { method: "GET", query: { outletId: id }, ...options,
      headers: { host: "localhost:3000", origin: "http://localhost:3000", "content-type": "application/json", ...options.headers } };
    await target(req, res);
    return { ...res, headers };
  }
  const login = await request({ method: "POST", query: { action: "login" }, body: { email: user.email, password: "test-password" } }, auth);
  assert.equal(login.statusCode, 200);
  const cookie = login.headers.get("set-cookie").map(value => value.split(";")[0]).join("; ");
  const input = { outletId: id, name: "  Andi Pratama  ", email: " ANDI@example.invalid ", phone: " 62812345678 ", roleId, active: false };
  assert.equal((await request()).statusCode, 401);
  assert.equal((await request({ method: "DELETE" })).statusCode, 405);
  assert.equal((await request({ method: "POST", headers: { cookie, origin: "https://evil.example" }, body: input })).statusCode, 403);
  for (const body of [{ ...input, auth_user_id: id }, { ...input, restaurant_id: id }, { ...input, active: "false" }, { ...input, phone: "------" }, { ...input, email: "invalid" }, { ...input, employeeCode: "!" }, { ...input, roleId: "invalid" }]) {
    assert.equal((await request({ method: "POST", headers: { cookie }, body })).statusCode, 400);
  }
  assert.equal(rpcCalls.length, 0, "invalid input never reaches data RPCs");
  const listing = await request({ headers: { cookie }, query: { outletId: id, search: " andi ", status: "inactive", page: "2", roleId } });
  assert.equal(listing.statusCode, 200);
  assert.match(listing.headers.get("cache-control"), /no-store/);
  assert.equal(rpcCalls.at(-1).body.p_search, "andi");
  assert.equal(rpcCalls.at(-1).body.p_active, false);
  assert.equal(rpcCalls.at(-1).body.p_page, 2);
  assert.equal((await request({ headers: { cookie }, query: { outletId: id, page: "-1" } })).statusCode, 400);
  const withPin = await request({headers:{cookie},query:{outletId:id,search:"pinstatus"}});
  assert.equal(withPin.statusCode,200); assert.equal(withPin.body.directory.items[0].pin_configured,true); assert.equal(withPin.body.directory.items[0].pin_eligible,true);
  assert.doesNotMatch(JSON.stringify(withPin.body),/pin_hash/);
  const roles = await request({ headers: { cookie }, query: { outletId: id, options: "1" } });
  assert.equal(roles.body.roles[0].id, roleId);
  const created = await request({ method: "POST", headers: { cookie }, body: input });
  assert.equal(created.statusCode, 201);
  assert.equal(created.body.employee.id, otherId);
  assert.equal(profilesCreated, 1);
  assert.deepEqual(rpcCalls.at(-1).body, { p_outlet_id: id, p_name: "Andi Pratama", p_email: "andi@example.invalid", p_phone: "62812345678", p_role_id: roleId, p_active: false });
  for (const [code, message, status, field] of [["23505", "employee_code_exists", 409], ["23505", "employee_email_exists", 409, "email"], ["22023", "employee_role_invalid", 400, "roleId"], ["42501", "denied", 403], ["PGRST202", "missing function", 503]]) {
    failure = { code, message };
    const response = await request({ method: "POST", headers: { cookie }, body: input });
    assert.equal(response.statusCode, status);
    if (field) assert.ok(response.body.fieldErrors[field]);
    assert.doesNotMatch(JSON.stringify(response.body), /internal details|sensitive database hint/);
  }
  failure = null;
  const pinInput = { outletId: id, pin: "694827", confirmation: "694827", expectedConfigured: false };
  const pinRequest = options => request({ method: "POST", query: { id: otherId }, headers: { cookie }, body: pinInput, ...options }, pinHandler);
  assert.equal((await pinRequest({ headers: {} })).statusCode, 401);
  assert.equal((await pinRequest({ method: "GET" })).statusCode, 405);
  assert.equal((await pinRequest({ headers: { cookie, origin: "https://evil.example" } })).statusCode, 403);
  for (const bad of [{ ...pinInput, pin: "123456", confirmation: "123456" }, { ...pinInput, pin: "111111" }, { ...pinInput, pin: 694827 }, { ...pinInput, confirmation: "805274" }, { ...pinInput, auth_user_id: id }, { ...pinInput, expectedConfigured: "false" }]) {
    assert.equal((await pinRequest({ body: bad })).statusCode, 400);
  }
  const pinResult = await pinRequest({});
  assert.equal(pinResult.statusCode, 200);
  assert.deepEqual(rpcCalls.at(-1).body, { p_outlet_id: id, p_employee_id: otherId, p_pin: "694827", p_expected_configured: false });
  assert.doesNotMatch(JSON.stringify(pinResult.body), /694827|hash/);
  assert.match(pinResult.headers.get("cache-control"), /no-store/);
  for (const [code, status] of [["42501", 403], ["22023", 400], ["40001", 409], ["PGRST202", 503]]) {
    failure = { code, message: "694827 internal details" };
    const result = await pinRequest({});
    assert.equal(result.statusCode, status);
    assert.doesNotMatch(JSON.stringify(result.body), /694827|internal details/);
  }
  failure = null;
  const manageInput = { ...input, action: "edit", changeRole: false };
  const manageRequest = options => request({ method: "POST", query: { id: otherId }, headers: { cookie }, body: manageInput, ...options }, manageHandler);
  assert.equal((await manageRequest({})).statusCode, 200);
  assert.equal(rpcCalls.at(-1).body.p_name, "Andi Pratama");
  assert.equal(rpcCalls.at(-1).body.p_change_role, false);
  assert.equal((await manageRequest({ body: { action: "delete", outletId: id } })).statusCode, 200);
  assert.equal(rpcCalls.at(-1).body.p_action, "delete");
  assert.equal((await manageRequest({ body: { action: "delete", outletId: id, auth_user_id: id } })).statusCode, 400);
  assert.equal((await manageRequest({ headers: {} })).statusCode, 401);
  assert.equal((await manageRequest({ headers: { cookie, origin: "https://evil.example" } })).statusCode, 403);
  for (const [code, status] of [["42501", 403], ["22023", 400], ["23505", 409], ["23503", 409], ["23001", 409], ["P0001", 409], ["PGRST202", 503]]) {
    failure = { code, message: "internal detail" };
    const response = await manageRequest({});
    assert.equal(response.statusCode, status);
    assert.doesNotMatch(JSON.stringify(response.body), /internal detail/);
  }
  failure = null;
  const beforeManagementDenied = rpcCalls.length;
  access = [{ ...access[0], role: "Manajer", permissions: ["staff.read", "rbac.read"] }];
  assert.equal((await request({ method: "POST", headers: { cookie }, body: input })).statusCode, 403);
  assert.equal((await request({ headers: { cookie }, query: { outletId: otherId } })).statusCode, 403);
  assert.equal((await pinRequest({})).statusCode, 403);
  assert.equal((await pinRequest({ body: { ...pinInput, outletId: otherId } })).statusCode, 403);
  assert.equal((await manageRequest({})).statusCode, 403);
  assert.equal((await manageRequest({ body: { action: "delete", outletId: otherId } })).statusCode, 403);
  assert.equal(rpcCalls.length, beforeManagementDenied);
  assert.equal((await request({ headers: { cookie } })).statusCode, 200, "manager can list with read permissions");
  access = [{ ...access[0], role: "Kasir", permissions }];
  assert.equal((await request({ headers: { cookie } })).statusCode, 401, "POS role cannot enter employee API even with forged grants");
  assert.equal(profilesCreated, 1, "denied requests and failed RPCs do not create profiles");
});
