import { test, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { loadSource, sourceRoot } from "./support/load-source.mjs";
const id = "72000000-0000-0000-0000-000000000001";
const other = "72000000-0000-0000-0000-000000000002";
const user = {
  id,
  email: "inventory@example.invalid",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString(),
};
let permissions = [
    "inventory.read",
    "inventory.manage",
    "finance.manage",
    "approvals.review",
  ],
  role = "Pemilik",
  calls = [],
  failure;
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
        user,
      }),
    );
  } else if (req.url === "/auth/v1/user") res.end(JSON.stringify(user));
  else if (req.url === "/rest/v1/rpc/my_access")
    res.end(
      JSON.stringify([
        {
          employee_id: id,
          restaurant_id: id,
          outlet_id: id,
          outlet_name: "Outlet",
          role,
          permissions,
        },
      ]),
    );
  else if (
    req.url === "/rest/v1/rpc/inventory_read" ||
    req.url === "/rest/v1/rpc/inventory_write"
  ) {
    calls.push(JSON.parse(raw));
    if (failure) {
      res.statusCode = 400;
      res.end(JSON.stringify(failure));
    } else
      res.end(
        JSON.stringify({ id, items: [], total: 0, page: 1, pageSize: 20 }),
      );
  } else {
    res.statusCode = 404;
    res.end("{}");
  }
});
after(() => new Promise((resolve) => fake.close(resolve)));
test("inventory API enforces scope, validation, CSRF, reviewer/finance permissions and safe business errors", async () => {
  await new Promise((resolve) => fake.listen(0, "127.0.0.1", resolve));
  process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${fake.address().port}`;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";
  const handler = loadSource(
    path.join(sourceRoot, "src/pages/api/inventory/index.ts"),
  ).default;
  const auth = loadSource(
    path.join(sourceRoot, "src/pages/api/auth/[action].ts"),
  ).default;
  async function request(options = {}, target = handler) {
    const headers = new Map();
    const res = {
      setHeader(k, v) {
        headers.set(k.toLowerCase(), v);
      },
      getHeader(k) {
        return headers.get(k.toLowerCase());
      },
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
        query: { outletId: id, view: "stock" },
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
      body: { email: user.email, password: "test-password" },
    },
    auth,
  );
  const cookie = login.headers
    .get("set-cookie")
    .map((v) => v.split(";")[0])
    .join("; ");
  assert.equal((await request()).statusCode, 401);
  assert.equal((await request({ headers: { cookie } })).statusCode, 200);
  assert.equal(calls.at(-1).p_outlet_id, id);
  assert.equal(
    (
      await request({
        headers: { cookie },
        query: { outletId: other, view: "stock" },
      })
    ).statusCode,
    403,
  );
  const body = {
    outletId: id,
    action: "approve",
    data: { id: other, version: 1 },
    requestId: other,
  };
  const before = calls.length;
  assert.equal(
    (
      await request({
        method: "POST",
        headers: { cookie, origin: "https://evil.invalid" },
        body,
      })
    ).statusCode,
    403,
  );
  assert.equal(
    (
      await request({
        method: "POST",
        headers: { cookie },
        body: { ...body, data: { id: other, version: -1 } },
      })
    ).statusCode,
    400,
  );
  assert.equal(calls.length, before);
  permissions = ["inventory.read", "inventory.manage", "approvals.review"];
  assert.equal(
    (await request({ method: "POST", headers: { cookie }, body })).statusCode,
    403,
  );
  assert.equal(
    (
      await request({
        method: "POST",
        headers: { cookie },
        body: {
          ...body,
          action: "reject",
          data: { id: other, version: 1, reason: "Periksa ulang" },
        },
      })
    ).statusCode,
    201,
  );
  permissions.push("finance.manage");
  failure = { code: "22023", message: "inventory_insufficient_stock" };
  const stock = await request({ method: "POST", headers: { cookie }, body });
  assert.equal(stock.statusCode, 400);
  assert.ok(stock.body.message.includes("tidak cukup"));
  failure = { code: "40001", message: "inventory_stale_version" };
  assert.equal(
    (await request({ method: "POST", headers: { cookie }, body })).statusCode,
    409,
  );
  failure = { code: "42501", message: "inventory_self_approval_denied" };
  const self = await request({ method: "POST", headers: { cookie }, body });
  assert.equal(self.statusCode, 403);
  assert.ok(self.body.message.includes("sendiri"));
  failure = { code: "XX000", message: "private SQL secret" };
  const err = await request({ headers: { cookie } });
  assert.equal(err.statusCode, 503);
  assert.ok(!JSON.stringify(err.body).includes("private SQL"));
  failure = undefined;
  const countBody = {
    outletId: id,
    action: "count_save",
    requestId: other,
    data: {
      id: other,
      version: 2,
      submit: true,
      lines: [
        {
          itemId: id,
          countedQuantity: "0",
          reason: "Stok habis",
          unitCost: "",
          recount: true,
        },
      ],
    },
  };
  assert.equal(
    (await request({ method: "POST", headers: { cookie }, body: countBody }))
      .statusCode,
    201,
  );
  assert.equal(calls.at(-1).p_data.lines[0].recount, true);
  assert.equal(
    (
      await request({
        method: "POST",
        headers: { cookie },
        body: {
          ...countBody,
          data: {
            ...countBody.data,
            lines: [{ ...countBody.data.lines[0], recount: "true" }],
          },
        },
      })
    ).statusCode,
    400,
  );
  role = "Kasir";
  assert.equal((await request({ headers: { cookie } })).statusCode, 401);
});
