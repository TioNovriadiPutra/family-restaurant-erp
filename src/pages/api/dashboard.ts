import type { NextApiRequest, NextApiResponse } from "next";
import { readAuthSession } from "./auth/[action]";
import { acceptAuthRequest } from "@/lib/auth-request";
import { canAccessOutlet } from "@/lib/erp-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!acceptAuthRequest(req, res, "GET")) return;
  if (!isSupabaseConfigured()) {
    res.status(503).json({ message: "Supabase belum dikonfigurasi." });
    return;
  }
  const outletId = req.query.outletId;
  if (typeof outletId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(outletId)) {
    res.status(400).json({ message: "Outlet tidak valid." });
    return;
  }
  try {
    const session = await readAuthSession({ req, res });
    if (!session) { res.status(401).json({ message: "Sesi ERP tidak tersedia. Silakan masuk kembali." }); return; }
    const permissions = ["reports.read", "sales.read", "inventory.read", "audit.read", "recipes.read", "refunds.read", "finance.read", "approvals.review"];
    if (!permissions.every(permission => canAccessOutlet(session.access, outletId, permission))) {
      res.status(403).json({ message: "Anda tidak memiliki izin ringkasan untuk outlet ini." });
      return;
    }
    // Reuse refreshed request cookies when creating this request's data client.
    const supabase = createSupabaseServerClient({ req, res });
    const { data, error } = await supabase.rpc("erp_dashboard", { p_outlet_id: outletId });
    if (error) {
      res.status(error.code === "42501" ? 403 : 503).json({
        message: error.code === "42501" ? "Akses ringkasan ditolak." :
          error.code === "PGRST202" || error.code === "42883" ? "Ringkasan belum tersedia. Administrator perlu menerapkan migrasi ERP dashboard." : "Data ringkasan belum dapat dimuat.",
      });
      return;
    }
    res.status(200).json({ dashboard: data });
  } catch {
    res.status(503).json({ message: "Layanan ringkasan sedang tidak tersedia." });
  }
}
