import type { NextApiRequest, NextApiResponse } from "next";
import { acceptAuthRequest } from "@/lib/auth-request";
import { canAccessOutlet } from "@/lib/erp-access";
import { validEmployeePin } from "@/lib/employee-pin-validation";
import { uuidPattern } from "@/lib/employees-validation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readAuthSession } from "../../auth/[action]";

export const config = { api: { bodyParser: { sizeLimit: "2kb" } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!acceptAuthRequest(req, res, "POST")) return;
  if (!isSupabaseConfigured()) { res.status(503).json({ message: "Supabase belum dikonfigurasi." }); return; }
  const body = req.body;
  if (typeof req.query.id !== "string" || !uuidPattern.test(req.query.id) || !body || typeof body !== "object" || Array.isArray(body) ||
    Object.keys(body).some(key => !["outletId", "pin", "confirmation", "expectedConfigured"].includes(key)) ||
    typeof body.outletId !== "string" || !uuidPattern.test(body.outletId) || typeof body.pin !== "string" || !validEmployeePin(body.pin) ||
    body.confirmation !== body.pin || typeof body.expectedConfigured !== "boolean") {
    res.status(400).json({ message: "Gunakan PIN 6 angka yang tidak berulang/berurutan dan konfirmasi yang sama." }); return;
  }
  try {
    const session = await readAuthSession({ req, res });
    if (!session) { res.status(401).json({ message: "Silakan masuk kembali ke ERP." }); return; }
    if (!["staff.read", "rbac.read", "staff.manage", "rbac.manage"].every(code => canAccessOutlet(session.access, body.outletId, code))) {
      res.status(403).json({ message: "Anda tidak memiliki izin mengatur PIN pada outlet ini." }); return;
    }
    const supabase = createSupabaseServerClient({ req, res });
    const { error } = await supabase.rpc("set_employee_pos_pin", {
      p_outlet_id: body.outletId, p_employee_id: req.query.id, p_pin: body.pin, p_expected_configured: body.expectedConfigured,
    });
    if (error) {
      const status = error.code === "42501" ? 403 : error.code === "22023" ? 400 : error.code === "40001" ? 409 : 503;
      res.status(status).json({ message: status === 403 ? "PIN hanya dapat diatur untuk Kasir aktif pada outlet yang Anda kelola." :
        status === 400 ? "PIN tidak valid. Gunakan 6 angka yang tidak berulang atau berurutan." :
        status === 409 ? "Status PIN sudah berubah. Tutup form dan muat ulang daftar karyawan." :
        "PIN belum dapat disimpan. Pastikan migrasi PIN karyawan sudah diterapkan." }); return;
    }
    res.status(200).json({ message: body.expectedConfigured ? "PIN kasir berhasil diganti." : "PIN kasir berhasil diatur." });
  } catch {
    res.status(503).json({ message: "Layanan PIN sedang tidak tersedia. Silakan coba lagi." });
  }
}
