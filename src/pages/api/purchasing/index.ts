import type { NextApiRequest, NextApiResponse } from "next";
import { acceptAuthRequest } from "@/lib/auth-request";
import { canAccessOutlet } from "@/lib/erp-access";
import { uuidPattern } from "@/lib/employees-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readAuthSession } from "../auth/[action]";
import { validPurchasingInput } from "@/lib/purchasing-validation";
export const config = { api: { bodyParser: { sizeLimit: "64kb" } } };
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!["GET", "POST"].includes(req.method ?? "")) { res.setHeader("Allow", "GET, POST"); res.status(405).json({ message: "Metode tidak didukung." }); return; }
  if (!acceptAuthRequest(req, res, req.method!)) return;
  const write = req.method === "POST";
  const outletId = write ? req.body?.outletId : req.query.outletId;
  const action = write ? req.body?.action : req.query.view;
  const data = write ? req.body?.data : { search: req.query.search ?? "", page: req.query.page ?? 1, id: req.query.id };
  if (typeof outletId !== "string" || !uuidPattern.test(outletId) || typeof action !== "string" ||
    !(write ? ["supplier", "material", "post", "pay"] : ["suppliers", "options", "purchases", "detail", "stock", "proof"]).includes(action) ||
    !data || typeof data !== "object" || Array.isArray(data) || JSON.stringify(data).length > 60000) {
    res.status(400).json({ message: "Permintaan pembelian tidak valid." }); return;
  }
  if (!write && (typeof data.search !== "string" || data.search.length > 120 || !/^[1-9]\d{0,4}$/.test(String(data.page)))) { res.status(400).json({ message: "Filter tidak valid." }); return; }
  if (write && !validPurchasingInput(action, data)) { res.status(400).json({ message: "Data belum valid. Periksa seluruh isian dan bukti invoice." }); return; }
  try {
    const session = await readAuthSession({ req, res });
    if (!session) { res.status(401).json({ message: "Silakan masuk kembali." }); return; }
    const permissions = action === "stock" ? ["inventory.read"] : ["purchasing.read"];
    if (write) permissions.push(action === "material" ? "inventory.manage" : "purchasing.manage");
    if (action === "post" || action === "options") permissions.push("inventory.read", "finance.read");
    if (action === "post") permissions.push("inventory.manage", "finance.manage");
    if (action === "pay") permissions.push("finance.manage");
    if (!permissions.every(p => canAccessOutlet(session.access, outletId, p))) { res.status(403).json({ message: "Anda tidak memiliki izin untuk tindakan ini." }); return; }
    const supabase = createSupabaseServerClient({ req, res });
    if (["proof", "detail"].includes(action) && (typeof data.id !== "string" || !uuidPattern.test(data.id))) { res.status(400).json({ message: "Pembelian tidak valid." }); return; }
    const { data: result, error } = await supabase.rpc("simple_purchasing", { p_outlet_id: outletId, p_action: action === "proof" ? "detail" : action, p_data: data });
    if (error) {
      const status = error.code === "42501" ? 403 : error.code === "23505" ? 409 : error.code?.startsWith("22") || error.code === "23502" || error.code === "23514" ? 400 : 503;
      res.status(status).json({ message: status === 409 ? "Supplier, bahan atau nomor invoice sudah terdaftar. Periksa kembali." : status === 403 ? "Akses pembelian ditolak." : status === 400 ? error.message.includes("period") ? "Periode akuntansi tertutup atau belum sesuai. Periksa tanggal invoice." : "Data belum valid. Periksa bahan, satuan, tanggal dan bukti invoice." : "Pembelian belum tersedia. Pastikan migrasi pembelian dan Storage telah diterapkan." }); return;
    }
    if (action === "proof") {
      const key = result?.items?.[0]?.invoice_storage_key;
      if (!key) { res.status(404).json({ message: "Bukti tidak ditemukan." }); return; }
      const signed = await supabase.storage.from("restaurant-purchase-invoices").createSignedUrl(key, 60, { download: `invoice.${key.split(".").pop()}` });
      if (signed.error) throw signed.error;
      res.status(200).json({ url: signed.data.signedUrl }); return;
    }
    res.status(write ? 201 : 200).json(result);
  } catch { res.status(503).json({ message: "Layanan pembelian belum dapat diakses. Coba kembali." }); }
}
