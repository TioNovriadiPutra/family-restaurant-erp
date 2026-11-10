import { uuidPattern } from "./employees-validation";
import type { FinanceImportLine } from "@/interfaces/finance";
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const exact = (v: Record<string, unknown>, keys: string[]) =>
  Object.keys(v).every((k) => keys.includes(k));
const text = (v: unknown, min = 0, max = 500): v is string =>
  typeof v === "string" && v.trim().length >= min && v.length <= max;
const uuid = (v: unknown) => typeof v === "string" && uuidPattern.test(v);
export const financeMoney = (v: unknown, signed = false): v is string =>
  typeof v === "string" &&
  /^-?(0|[1-9]\d{0,11})(\.\d{1,2})?$/.test(v) &&
  Number(v) !== 0 &&
  (signed || Number(v) > 0);
export const financeDay = (v: unknown): v is string =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  !Number.isNaN(Date.parse(v)) &&
  new Date(v + "T00:00:00Z").toISOString().slice(0, 10) === v;
export function validFinanceData(action: string, v: unknown) {
  if (!object(v)) return false;
  if (action === "account")
    return (
      exact(v, ["id", "name", "kind", "mask"]) &&
      (v.id === undefined || uuid(v.id)) &&
      text(v.name, 2, 120) &&
      ["cash", "bank"].includes(String(v.kind)) &&
      text(v.mask, 0, 40)
    );
  if (action === "category") return exact(v, ["name"]) && text(v.name, 2, 120);
  if (action === "pay")
    return (
      exact(v, ["id", "accountId"]) &&
      uuid(v.id) &&
      (v.accountId === "" || uuid(v.accountId))
    );
  if (["capital", "transfer", "expense"].includes(action))
    return (
      exact(v, [
        "accountId",
        "toAccountId",
        "categoryId",
        "amount",
        "date",
        "description",
        "proofKey",
        "proofMime",
        "proofSha256",
      ]) &&
      uuid(v.accountId) &&
      financeMoney(v.amount) &&
      financeDay(v.date) &&
      text(v.description, 2, 500) &&
      (action !== "transfer" ||
        (uuid(v.toAccountId) && v.toAccountId !== v.accountId)) &&
      (action !== "expense" ||
        (uuid(v.categoryId) &&
          text(v.proofKey, 1, 200) &&
          ["application/pdf", "image/png", "image/jpeg"].includes(
            String(v.proofMime),
          ) &&
          typeof v.proofSha256 === "string" &&
          /^[a-f0-9]{64}$/.test(v.proofSha256)))
    );
  if (action === "import")
    return (
      exact(v, ["accountId", "lines"]) &&
      uuid(v.accountId) &&
      Array.isArray(v.lines) &&
      v.lines.length > 0 &&
      v.lines.length <= 100 &&
      v.lines.every(
        (l) =>
          object(l) &&
          exact(l, ["key", "date", "amount", "reference", "description"]) &&
          text(l.key, 1, 120) &&
          financeDay(l.date) &&
          financeMoney(l.amount, true) &&
          text(l.reference, 0, 120) &&
          text(l.description, 0, 500),
      ) &&
      new Set(v.lines.map((l) => l.key)).size === v.lines.length
    );
  if (action === "reconcile")
    return (
      exact(v, ["accountId", "bank", "book"]) &&
      uuid(v.accountId) &&
      [v.bank, v.book].every(
        (lines) =>
          Array.isArray(lines) &&
          lines.length > 0 &&
          lines.length <= 100 &&
          lines.every(
            (l) =>
              object(l) &&
              exact(l, ["id", "amount"]) &&
              uuid(l.id) &&
              financeMoney(l.amount, true),
          ) &&
          new Set(lines.map((l) => l.id)).size === lines.length,
      )
    );
  return false;
}
export function validFinanceFilters(v: Record<string, unknown>) {
  return (
    text(v.search, 0, 120) &&
    /^[1-9]\d{0,4}$/.test(String(v.page)) &&
    (v.accountId === "" || uuid(v.accountId)) &&
    (v.from === "" || financeDay(v.from)) &&
    (v.to === "" || financeDay(v.to)) &&
    (!v.from || !v.to || String(v.from) <= String(v.to)) &&
    ["all", "paid", "unpaid"].includes(String(v.status))
  );
}
// Strict canonical CSV, quoted commas/newlines and doubled quotes are supported.
export function parseFinanceCsv(source: string): FinanceImportLine[] {
  if (source.length > 150000)
    throw new Error("CSV maksimal 150 KB dan 100 transaksi.");
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false,
    closedQuote = false;
  source = source.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (c === '"') {
      if (quoted && source[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quoted) {
        quoted = false;
        closedQuote = true;
      } else {
        if (cell || closedQuote)
          throw new Error("Posisi tanda kutip CSV tidak valid.");
        quoted = true;
      }
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
      closedQuote = false;
    } else if (c === "\n" && !quoted) {
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = "";
      closedQuote = false;
    } else {
      if (closedQuote)
        throw new Error("Ada karakter setelah penutup tanda kutip CSV.");
      cell += c;
    }
  }
  if (quoted) throw new Error("Tanda kutip CSV belum ditutup.");
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  if (
    rows
      .shift()
      ?.map((v) => v.trim())
      .join(",") !== "id,tanggal,jumlah,referensi,keterangan"
  )
    throw new Error("Header CSV harus id,tanggal,jumlah,referensi,keterangan.");
  const lines = rows.map((c) => {
    if (c.length !== 5)
      throw new Error("Setiap baris CSV harus berisi lima kolom.");
    return {
      key: c[0].trim(),
      date: c[1].trim(),
      amount: c[2].trim(),
      reference: c[3].trim(),
      description: c[4].trim(),
    };
  });
  if (
    !validFinanceData("import", {
      accountId: "00000000-0000-0000-0000-000000000001",
      lines,
    })
  )
    throw new Error(
      "Periksa ID unik, tanggal YYYY-MM-DD, dan jumlah dengan titik desimal (maksimal 100 baris).",
    );
  return lines;
}
