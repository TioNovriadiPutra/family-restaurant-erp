// Exercises the real Supabase SDK against a local fake Auth/PostgREST server.
// No hosted project or credentials are used. Run: node --test tests/auth-api.test.mjs
import { test, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modules = new Map();
function loadSource(filename) {
  if (modules.has(filename)) return modules.get(filename).exports;
  const mod = new Module(filename);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  modules.set(filename, mod);
  const originalRequire = mod.require.bind(mod);
  mod.require = name => name.startsWith("@/")
    ? loadSource(path.join(root, "src", name.slice(2)) + ".ts")
    : name.startsWith(".")
      ? loadSource(path.resolve(path.dirname(filename), name) + ".ts")
      : originalRequire(name);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
  return mod.exports;
}

const user = { id: "65ef7c2e-d91a-4efb-a0bb-019c422062a1", email: "owner@example.com", aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
const access = [{ employee_id: user.id, restaurant_id: user.id, outlet_id: user.id, outlet_name: "Outlet Uji", role: "Pemilik", permissions: ["reports.read", "sales.read", "inventory.read", "audit.read", "recipes.read", "refunds.read", "finance.read", "approvals.review"] }];
let noAccess = false;
let unavailable = false;
let receivedPassword;
let loginRequests = 0;
let refreshRequests = 0;
let dashboardRequests = 0;
const fake = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  let raw = "";
  for await (const chunk of req) raw += chunk;
  if (req.url.startsWith("/auth/v1/token")) {
    const body = JSON.parse(raw);
    if (body.refresh_token) refreshRequests++;
    else { loginRequests++; receivedPassword = body.password; }
    if (body.password === "wrong") { res.statusCode = 400; res.end(JSON.stringify({ code: "invalid_credentials", msg: "Invalid credentials" })); return; }
    const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
    const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })}.test-signature`;
    res.end(JSON.stringify({ access_token: token, token_type: "bearer", expires_in: 3600, refresh_token: "test-refresh-token", user }));
  } else if (req.url === "/auth/v1/user") {
    res.end(JSON.stringify(user));
  } else if (req.url.startsWith("/auth/v1/logout")) {
    res.statusCode = 204; res.end();
  } else if (req.url === "/rest/v1/rpc/my_access") {
    if (unavailable) { res.statusCode = 500; res.end(JSON.stringify({ message: "unavailable" })); }
    else res.end(JSON.stringify(noAccess ? [] : access));
  } else if (req.url === "/rest/v1/rpc/erp_dashboard") {
    dashboardRequests++;
    res.end(JSON.stringify({ revenue: "1234.00", paid_orders: 1 }));
  } else { res.statusCode = 404; res.end("{}"); }
});
after(() => new Promise(resolve => fake.close(resolve)));

test("login API: cookie session, access checks, CSRF, validation and logout", async () => {
  await new Promise(resolve => fake.listen(0, "127.0.0.1", resolve));
  process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${fake.address().port}`;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "local-test-public-key";
  const { default: handler, readAuthSession } = loadSource(path.join(root, "src/pages/api/auth/[action].ts"));
  const { default: dashboardHandler } = loadSource(path.join(root, "src/pages/api/dashboard.ts"));
  const { requireErpPage } = loadSource(path.join(root, "src/lib/server/erp-page.ts"));
  async function request(action, options = {}, apiHandler = handler) {
    const headers = new Map();
    const res = {
      setHeader(name, value) { headers.set(name.toLowerCase(), value); },
      getHeader(name) { return headers.get(name.toLowerCase()); },
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; },
    };
    const req = { query: { action }, method: action === "session" ? "GET" : "POST",
      headers: { host: "localhost:3000", origin: "http://localhost:3000", "content-type": "application/json", ...options.headers },
      body: { email: " owner@example.com ", password: " valid password " }, ...options };
    if (options.headers) req.headers = { host: "localhost:3000", origin: "http://localhost:3000", "content-type": "application/json", ...options.headers };
    await apiHandler(req, res);
    return { ...res, headers };
  }
  assert.equal((await request("login", { method: "GET" })).statusCode, 405);
  assert.equal((await request("login", { headers: { origin: "https://evil.example" } })).statusCode, 403);
  assert.equal((await request("login", { headers: { origin: undefined } })).statusCode, 403);
  assert.equal((await request("login", { headers: { "content-type": "text/plain" } })).statusCode, 415);
  assert.equal((await request("login", { body: { email: "invalid", password: "x" } })).statusCode, 400);
  assert.equal(loginRequests, 0, "rejected inputs must not reach Auth");
  assert.equal((await request("session")).statusCode, 401);
  assert.equal((await request("login", { body: { email: user.email, password: "wrong" } })).statusCode, 401);
  const signedIn = await request("login");
  assert.equal(signedIn.statusCode, 200);
  assert.equal(receivedPassword, " valid password ", "password whitespace must be preserved");
  assert.deepEqual(signedIn.body.session.access, access);
  assert.match(signedIn.headers.get("cache-control"), /no-store/);
  assert.doesNotMatch(JSON.stringify(signedIn.body), /access_token|refresh_token|password/);
  const cookie = signedIn.headers.get("set-cookie").map(value => value.split(";")[0]).join("; ");
  assert.match(cookie, /auth-token/);
  const authenticated = await request("session", { headers: { cookie } });
  assert.equal(authenticated.statusCode, 200);
  assert.equal(authenticated.body.session.user.id, user.id);
  const separator = cookie.indexOf("=");
  const cookieName = cookie.slice(0, separator);
  const cookieValue = cookie.slice(separator + 1);
  assert.ok(cookieValue.startsWith("base64-"));
  const storedSession = JSON.parse(Buffer.from(cookieValue.slice(7), "base64url").toString());
  storedSession.expires_at = Math.floor(Date.now() / 1000) - 60;
  const expiredCookie = `${cookieName}=base64-${Buffer.from(JSON.stringify(storedSession)).toString("base64url")}`;
  const renewed = await request("session", { headers: { cookie: expiredCookie } });
  assert.equal(renewed.statusCode, 200);
  assert.equal(refreshRequests, 1, "expired sessions must refresh through Auth");
  assert.ok(renewed.headers.get("set-cookie").length);
  assert.match(renewed.headers.get("cache-control"), /no-store/);
  const ssr = await readAuthSession({ req: { headers: { cookie } }, res: { setHeader() {}, getHeader() {} } });
  assert.equal(ssr.user.id, user.id);
  const dashboard = await request("dashboard", { method: "GET", query: { outletId: user.id }, headers: { cookie } }, dashboardHandler);
  assert.equal(dashboard.statusCode, 200);
  assert.equal(dashboard.body.dashboard.revenue, "1234.00");
  const beforeDashboardRefresh = refreshRequests;
  const refreshedDashboard = await request("dashboard", { method: "GET", query: { outletId: user.id }, headers: { cookie: expiredCookie } }, dashboardHandler);
  assert.equal(refreshedDashboard.statusCode, 200);
  assert.equal(refreshRequests, beforeDashboardRefresh + 1, "auth and data clients must reuse this request's rotated cookies");
  const otherOutlet = "00000000-0000-0000-0000-000000000001";
  const beforeDenials = dashboardRequests;
  assert.equal((await request("dashboard", { method: "GET", query: { outletId: otherOutlet }, headers: { cookie } }, dashboardHandler)).statusCode, 403);
  for (const role of ["Kasir", "Staf Gudang", "Custom Role"]) {
    access[0].role = role;
    const deniedRole = await request("login");
    assert.equal(deniedRole.statusCode, 403, `${role} cannot log in to ERP`);
    assert.equal((await request("session", { headers: { cookie } })).statusCode, 401);
    assert.equal((await request("dashboard", { method: "GET", query: { outletId: user.id }, headers: { cookie } }, dashboardHandler)).statusCode, 401);
    const guarded = await requireErpPage()({ req: { headers: { cookie } }, res: { setHeader() {}, getHeader() {} } });
    assert.equal(guarded.redirect.destination, "/login", `${role} cannot open protected pages directly`);
  }
  assert.equal(dashboardRequests, beforeDenials, "denied roles/outlets never reach dashboard data");
  access[0].role = "Manajer";
  assert.equal((await request("login")).statusCode, 200);
  access.push({ ...access[0], outlet_id: otherOutlet, role: "Kasir" });
  assert.equal((await request("login")).body.session.access.length, 1, "POS-only outlet assignments are removed");
  access.pop();
  const permission = access[0].permissions.shift();
  assert.equal((await request("dashboard", { method: "GET", query: { outletId: user.id }, headers: { cookie } }, dashboardHandler)).statusCode, 403);
  const moduleGuard = await requireErpPage("reports.read")({ req: { headers: { cookie } }, res: { setHeader() {}, getHeader() {} } });
  assert.equal(moduleGuard.props.forbidden, true);
  access[0].permissions.unshift(permission);
  access.push({ ...access[0], outlet_id: otherOutlet, role: "Manajer", permissions: ["purchasing.read"] });
  const splitOutletGuard = await requireErpPage(["inventory.read", "purchasing.read"])({ req: { headers: { cookie } }, res: { setHeader() {}, getHeader() {} } });
  assert.equal(splitOutletGuard.props.forbidden, true, "parent and submenu permissions cannot be combined across different outlets");
  access[0].permissions.push("purchasing.read");
  const combinedGuard = await requireErpPage(["inventory.read", "purchasing.read"])({ req: { headers: { cookie } }, res: { setHeader() {}, getHeader() {} } });
  assert.equal(combinedGuard.props.forbidden, undefined);
  access[0].permissions.pop();
  access.pop();
  access[0].role = "Pemilik";
  assert.equal((await request("session")).statusCode, 401, "sessions must remain isolated between requests");
  const signedOut = await request("logout", { headers: { cookie } });
  assert.equal(signedOut.statusCode, 200);
  assert.ok(signedOut.headers.get("set-cookie").some(value => /Max-Age=0/i.test(value)));
  noAccess = true;
  const denied = await request("login");
  assert.equal(denied.statusCode, 403);
  assert.ok(denied.headers.get("set-cookie").some(value => /Max-Age=0/i.test(value)));
  noAccess = false;
  unavailable = true;
  assert.equal((await request("login")).statusCode, 503);
  unavailable = false;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "";
  assert.equal((await request("login")).statusCode, 503);
});
