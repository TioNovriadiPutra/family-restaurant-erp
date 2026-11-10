import { test, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { loadSource, sourceRoot } from "./support/load-source.mjs";
const id = "78000000-0000-0000-0000-000000000001";
let role = "Pemilik",
  permissions = [
    "organization.read",
    "organization.manage",
    "rbac.read",
    "rbac.manage",
  ],
  failure,
  lastCall;
const fake = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  let raw = "";
  for await (const chunk of req) raw += chunk;
  if (req.url.startsWith("/auth/v1/token")) {
    const enc = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");
    res.end(
      JSON.stringify({
        access_token: `${enc({ alg: "HS256" })}.${enc({ sub: id, exp: Math.floor(Date.now() / 1000) + 3600 })}.test`,
        refresh_token: "test-refresh",
        expires_in: 3600,
        token_type: "bearer",
        user: {
          id,
          email: "settings@example.invalid",
          aud: "authenticated",
          role: "authenticated",
          app_metadata: {},
          user_metadata: {},
          created_at: new Date().toISOString(),
        },
      }),
    );
  } else if (req.url === "/auth/v1/user")
    res.end(
      JSON.stringify({
        id,
        email: "settings@example.invalid",
        aud: "authenticated",
        role: "authenticated",
        app_metadata: {},
        user_metadata: {},
      }),
    );
  else if (req.url === "/rest/v1/rpc/my_access")
    res.end(
      JSON.stringify([
        {
          employee_id: id,
          restaurant_id: id,
          outlet_id: id,
          outlet_name: "Test",
          role,
          permissions,
        },
      ]),
    );
  else if (
    req.url === "/rest/v1/rpc/settings_read" ||
    req.url === "/rest/v1/rpc/settings_write"
  ) {
    lastCall = JSON.parse(raw);
    if (failure) {
      res.statusCode = 400;
      res.end(JSON.stringify(failure));
    } else res.end(JSON.stringify({ id }));
  } else {
    res.statusCode = 404;
    res.end("{}");
  }
});
after(() => new Promise((resolve) => fake.close(resolve)));
test("settings API enforces session, CSRF, scope, owner-only RBAC and safe backend errors", async () => {
  await new Promise((resolve) => fake.listen(0, "127.0.0.1", resolve));
  process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${fake.address().port}`;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";
  const handler = loadSource(
    path.join(sourceRoot, "src/pages/api/settings/index.ts"),
  ).default;
  const auth = loadSource(
    path.join(sourceRoot, "src/pages/api/auth/[action].ts"),
  ).default;
  async function request(options = {}, target = handler) {
    const headers = new Map();
    const res = {
      setHeader: (k, v) => headers.set(k.toLowerCase(), v),
      getHeader: (k) => headers.get(k.toLowerCase()),
      status(s) {
        this.statusCode = s;
        return this;
      },
      json(v) {
        this.body = v;
      },
    };
    await target(
      {
        method: "GET",
        query: { outletId: id, view: "profile" },
        ...options,
        headers: {
          host: "localhost:3000",
          origin: "http://localhost:3000",
          "content-type": "application/json",
          ...options.headers,
        },
      },
      res,
    );
    return { ...res, headers };
  }
  const login = await request(
    {
      method: "POST",
      query: { action: "login" },
      body: { email: "settings@example.invalid", password: "test-password" },
    },
    auth,
  );
  const cookie = login.headers
    .get("set-cookie")
    .map((v) => v.split(";")[0])
    .join("; ");
  const post = (body) => request({ method: "POST", headers: { cookie }, body });
  const save = {
    outletId: id,
    action: "receipt",
    requestId: id,
    data: {
      revision: 1,
      header: "",
      footer: "",
      paperWidth: 80,
      digitalEnabled: false,
      printerId: "",
    },
  };
  assert.equal((await request()).statusCode, 401);
  assert.equal((await post(save)).statusCode, 201);
  assert.equal(lastCall.p_outlet_id, id);
  assert.equal(
    (await post({ ...save, data: { ...save.data, serviceRole: true } }))
      .statusCode,
    400,
  );
  assert.equal(
    (await post({ ...save, outletId: "78000000-0000-0000-0000-000000000002" }))
      .statusCode,
    403,
  );
  assert.equal(
    (
      await request({
        method: "POST",
        headers: { cookie, origin: "https://evil.invalid" },
        body: save,
      })
    ).statusCode,
    403,
  );
  const roleSave = {
    ...save,
    action: "role",
    data: {
      id,
      revision: 1,
      discountPercent: "10",
      permissions: ["menu.read"],
    },
  };
  assert.equal((await post(roleSave)).statusCode, 201);
  role = "Manajer";
  assert.equal((await post(roleSave)).statusCode, 403);
  permissions = ["organization.read"];
  assert.equal((await post(save)).statusCode, 403);
  permissions = ["organization.read", "organization.manage"];
  failure = { code: "40001", message: "settings_stale" };
  assert.equal((await post(save)).statusCode, 409);
  failure = { code: "XX000", message: "private-db-detail" };
  const result = await post(save);
  assert.equal(result.statusCode, 503);
  assert.ok(!JSON.stringify(result.body).includes("private-db-detail"));
});
