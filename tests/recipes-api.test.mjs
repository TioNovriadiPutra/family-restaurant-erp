import { test, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { loadSource, sourceRoot } from "./support/load-source.mjs";
const id = "78000000-0000-0000-0000-000000000001",
  other = "78000000-0000-0000-0000-000000000002";
const user = {
  id,
  email: "recipes@example.invalid",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString(),
};
let permissions = [
    "recipes.read",
    "recipes.manage",
    "inventory.read",
    "inventory.manage",
    "finance.manage",
  ],
  role = "Pemilik",
  failure,
  calls = [];
const fake = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  let raw = "";
  for await (const c of req) raw += c;
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
    ["/rest/v1/rpc/recipes_read", "/rest/v1/rpc/recipes_write"].includes(
      req.url,
    )
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
test("recipe API validates input, role/outlet scope, production permissions, CSRF and safe errors", async () => {
  await new Promise((resolve) => fake.listen(0, "127.0.0.1", resolve));
  process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${fake.address().port}`;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";
  const handler = loadSource(
    path.join(sourceRoot, "src/pages/api/recipes/index.ts"),
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
        query: { outletId: id, view: "recipes" },
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
  const post = (body) => request({ method: "POST", headers: { cookie }, body });
  const save = {
    outletId: id,
    action: "save",
    requestId: other,
    data: {
      name: "Nasi ayam",
      category: "Makanan",
      yield: "2",
      grossYield: "",
      outputUnitId: id,
      outputItemId: "",
      targetPercent: "30",
      referencePrice: "25000",
      notes: "",
      lines: [{ itemId: id, unitId: id, quantity: "0.2" }],
    },
  };
  assert.equal((await request()).statusCode, 401);
  assert.equal((await request({ headers: { cookie } })).statusCode, 200);
  assert.equal(
    (
      await request({
        headers: { cookie },
        query: { outletId: other, view: "recipes" },
      })
    ).statusCode,
    403,
  );
  const before = calls.length;
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
  assert.equal(
    (
      await post({
        ...save,
        data: { ...save.data, lines: [...save.data.lines, ...save.data.lines] },
      })
    ).statusCode,
    400,
  );
  assert.equal(
    (await post({ ...save, data: { ...save.data, yield: "NaN" } })).statusCode,
    400,
  );
  assert.equal(
    (await post({ ...save, data: { ...save.data, referencePrice: "-1" } }))
      .statusCode,
    400,
  );
  assert.equal(
    (await post({ ...save, data: { ...save.data, targetPercent: "101" } }))
      .statusCode,
    400,
  );
  assert.equal(
    (await post({ ...save, data: { ...save.data, outputUnitId: "invalid" } }))
      .statusCode,
    400,
  );
  assert.equal((await post({ ...save, requestId: 7 })).statusCode, 400);
  assert.equal((await post({ ...save, serviceRole: true })).statusCode, 400);
  assert.equal(
    (
      await request({
        headers: { cookie },
        query: { outletId: id, view: "snapshot", id: "bad" },
      })
    ).statusCode,
    400,
  );
  assert.equal(
    (
      await request({
        headers: { cookie },
        query: { outletId: id, view: "history", recipeId: "bad" },
      })
    ).statusCode,
    400,
  );
  assert.equal(calls.length, before);
  assert.equal((await post(save)).statusCode, 201);
  assert.equal(calls.at(-1).p_action, "save");
  assert.equal(calls.at(-1).p_data.lines[0].quantity, "0.2");
  permissions = ["recipes.read"];
  assert.equal((await post(save)).statusCode, 403);
  assert.equal(
    (
      await request({
        headers: { cookie },
        query: { outletId: id, view: "batches" },
      })
    ).statusCode,
    403,
  );
  permissions = [
    "recipes.read",
    "recipes.manage",
    "inventory.read",
    "inventory.manage",
  ];
  const posting = {
    outletId: id,
    action: "batch_post",
    requestId: other,
    data: { id: other, revision: 1 },
  };
  assert.equal((await post(posting)).statusCode, 403);
  assert.equal(
    (await post({ ...posting, action: "batch_cancel" })).statusCode,
    201,
  );
  const draft = {
    ...posting,
    action: "batch_save",
    data: {
      recipeVersionId: id,
      sourceLocationId: id,
      outputLocationId: id,
      target: "2",
      actual: "1.8",
      date: "2026-11-09",
      notes: "",
      lines: [{ componentId: other, quantityBase: "0.25" }],
    },
  };
  assert.equal((await post(draft)).statusCode, 201);
  assert.equal(
    (
      await post({
        ...draft,
        data: {
          ...draft.data,
          lines: [{ componentId: other, quantityBase: "0" }],
        },
      })
    ).statusCode,
    400,
  );
  permissions.push("finance.manage");
  failure = { code: "22023", message: "recipe_insufficient_stock" };
  const insufficient = await post(posting);
  assert.equal(insufficient.statusCode, 400);
  assert.match(insufficient.body.message, /tidak cukup/);
  failure = { code: "40001", message: "recipe_stale" };
  assert.equal((await post(posting)).statusCode, 409);
  failure = { code: "42501", message: "private SQL secret" };
  assert.equal((await post(posting)).statusCode, 403);
  failure = { code: "XX000", message: "private SQL secret" };
  const unknown = await post(posting);
  assert.equal(unknown.statusCode, 503);
  assert.ok(!JSON.stringify(unknown.body).includes("private SQL"));
  failure = undefined;
  role = "Manajer";
  assert.equal((await post(save)).statusCode, 201);
  role = "Kasir";
  assert.equal((await request({ headers: { cookie } })).statusCode, 401);
});
