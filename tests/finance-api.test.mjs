import { test, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { loadSource, sourceRoot } from "./support/load-source.mjs";
const id = "78000000-0000-0000-0000-000000000001",
  other = "78000000-0000-0000-0000-000000000002";
const user = {
  id,
  email: "finance@example.invalid",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString(),
};
let permissions = [
    "finance.read",
    "finance.manage",
    "purchasing.read",
    "purchasing.manage",
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
    ["/rest/v1/rpc/finance_read", "/rest/v1/rpc/finance_write"].includes(
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
  } else if (req.url.startsWith("/storage/v1/object/")) {
    res.end(JSON.stringify({ Key: "review", Id: id }));
  } else {
    res.statusCode = 404;
    res.end("{}");
  }
});
after(() => new Promise((resolve) => fake.close(resolve)));
test("finance API validates input, role/outlet scope, supplier permissions, CSRF and safe errors", async () => {
  await new Promise((resolve) => fake.listen(0, "127.0.0.1", resolve));
  process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${fake.address().port}`;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";
  const handler = loadSource(
    path.join(sourceRoot, "src/pages/api/finance/index.ts"),
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
        query: { outletId: id, view: "movements" },
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
    action: "capital",
    requestId: other,
    data: {
      accountId: id,
      amount: "1000.25",
      date: "2026-11-09",
      description: "Modal pemilik",
    },
  };
  assert.equal((await request()).statusCode, 401);
  assert.equal((await request({ headers: { cookie } })).statusCode, 200);
  assert.equal(
    (
      await request({
        headers: { cookie },
        query: { outletId: other, view: "options" },
      })
    ).statusCode,
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
  const before = calls.length;
  for (const amount of ["NaN", "Infinity", "0", "-1", "1e4", "1.001", 1000])
    assert.equal(
      (await post({ ...save, data: { ...save.data, amount } })).statusCode,
      400,
    );
  assert.equal(
    (await post({ ...save, data: { ...save.data, date: "2026-02-30" } }))
      .statusCode,
    400,
  );
  assert.equal(
    (await post({ ...save, data: { ...save.data, serviceRole: true } }))
      .statusCode,
    400,
  );
  assert.equal((await post({ ...save, requestId: "bad" })).statusCode, 400);
  assert.equal(
    (
      await request({
        headers: { cookie },
        query: { outletId: id, view: "journal_detail", id: "bad" },
      })
    ).statusCode,
    400,
  );
  assert.equal(calls.length, before);
  assert.equal((await post(save)).statusCode, 201);
  assert.equal(calls.at(-1).p_request_id, other);
  assert.equal(calls.at(-1).p_data.amount, "1000.25");
  const upload = loadSource(
    path.join(sourceRoot, "src/pages/api/finance/upload.ts"),
  ).default;
  const uploadRequest = (bytes, mime = "application/pdf") =>
    request(
      {
        method: "POST",
        query: { outletId: id, requestId: other },
        headers: { cookie, "content-type": mime },
        [Symbol.asyncIterator]: async function* () {
          yield bytes;
        },
      },
      upload,
    );
  const proof = await uploadRequest(Buffer.from("%PDF-1.4 test fixture"));
  assert.equal(proof.statusCode, 201);
  assert.match(proof.body.proofSha256, /^[a-f0-9]{64}$/);
  assert.equal(proof.body.proofKey, `${id}/${id}/${other}.pdf`);
  assert.equal((await uploadRequest(Buffer.from("not a PDF"))).statusCode, 415);
  assert.equal(
    (await uploadRequest(Buffer.from("%PDF-1.4"), "image/png")).statusCode,
    415,
  );
  assert.equal((await uploadRequest(Buffer.alloc(8388609))).statusCode, 413);
  permissions = ["finance.read"];
  assert.equal(
    (await uploadRequest(Buffer.from("%PDF-1.4 test"))).statusCode,
    403,
  );
  assert.equal((await post(save)).statusCode, 403);
  permissions = ["finance.read", "finance.manage"];
  assert.equal(
    (
      await post({
        outletId: id,
        action: "pay",
        requestId: other,
        data: { id, accountId: "" },
      })
    ).statusCode,
    403,
  );
  const match = {
    ...save,
    action: "reconcile",
    data: {
      accountId: id,
      bank: [{ id, amount: "100" }],
      book: [{ id: other, amount: "100" }],
    },
  };
  assert.equal(
    (
      await post({
        ...match,
        data: { ...match.data, bank: [...match.data.bank, ...match.data.bank] },
      })
    ).statusCode,
    400,
  );
  assert.equal((await post(match)).statusCode, 201);
  failure = { code: "22023", message: "finance_allocation_invalid" };
  assert.equal((await post(match)).statusCode, 400);
  failure = { code: "40001", message: "finance_request_changed" };
  assert.equal((await post(save)).statusCode, 409);
  failure = { code: "42501", message: "private SQL secret" };
  assert.equal((await post(save)).statusCode, 403);
  failure = { code: "XX000", message: "private SQL secret" };
  const bad = await post(save);
  assert.equal(bad.statusCode, 503);
  assert.ok(!JSON.stringify(bad.body).includes("private SQL"));
  failure = undefined;
  role = "Manajer";
  assert.equal((await post(save)).statusCode, 201);
  role = "Kasir";
  assert.equal((await request({ headers: { cookie } })).statusCode, 401);
});
test("canonical bank CSV preserves signed cents, quotes and stable transaction IDs", () => {
  const { parseFinanceCsv } = loadSource(
    path.join(sourceRoot, "src/lib/finance-validation.ts"),
  );
  const csv =
    'id,tanggal,jumlah,referensi,keterangan\r\nBK1,2026-11-09,-6500.25,ADM,"Biaya, bank"\r\n';
  const [row] = parseFinanceCsv(csv);
  assert.equal(row.amount, "-6500.25");
  assert.equal(row.description, "Biaya, bank");
  assert.throws(() =>
    parseFinanceCsv(
      "id,tanggal,jumlah,referensi,keterangan\nBK1,2026-02-30,1,a,b",
    ),
  );
  assert.throws(() =>
    parseFinanceCsv(
      "id,tanggal,jumlah,referensi,keterangan\nBK1,2026-11-09,1,a,b\nBK1,2026-11-09,1,a,b",
    ),
  );
  assert.throws(() => parseFinanceCsv("wrong,header"));
});

test("bank CSV rejects misplaced quotes without changing transaction IDs", () => {
  const { parseFinanceCsv } = loadSource(
    path.join(sourceRoot, "src/lib/finance-validation.ts"),
  );
  for (const key of ['BK"1', '"BK1"x'])
    assert.throws(() =>
      parseFinanceCsv(
        "id,tanggal,jumlah,referensi,keterangan\n" + key + ",2026-11-09,1,a,b",
      ),
    );
});
