import type { NextApiRequest, NextApiResponse } from "next";
import { acceptAuthRequest } from "@/lib/auth-request";
import { canAccessOutlet } from "@/lib/erp-access";
import { uuidPattern, validateEmployeeCreate } from "@/lib/employees-validation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readAuthSession } from "../../auth/[action]";

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!acceptAuthRequest(req, res, "POST")) return;
  if (!isSupabaseConfigured()) { res.status(503).json({ message: "Supabase belum dikonfigurasi." }); return; }
  const body = req.body;
  if (typeof req.query.id !== "string" || !uuidPattern.test(req.query.id) || !body || typeof body !== "object" || Array.isArray(body) ||
    typeof body.outletId !== "string" || !uuidPattern.test(body.outletId) || !["edit", "delete"].includes(body.action)) {
    res.status(400).json({ message: "Permintaan karyawan tidak valid." }); return;
  }
  const { action, changeRole, ...fields } = body;
  const input = action === "edit" ? validateEmployeeCreate(fields) : null;
  if (action === "delete" && Object.keys(body).some(key => !["outletId", "action"].includes(key)) ||
    action === "edit" && (typeof changeRole !== "boolean" || input?.errors)) {
    res.status(400).json({ message: "Periksa kembali data karyawan.", ...(input?.errors ? { fieldErrors: input.errors } : {}) }); return;
  }
  try {
    const session = await readAuthSession({ req, res });
    if (!session) { res.status(401).json({ message: "Silakan masuk kembali ke ERP." }); return; }
    if (!["staff.read", "rbac.read", "staff.manage", "rbac.manage"].every(code => canAccessOutlet(session.access, body.outletId, code))) {
      res.status(403).json({ message: "Anda tidak memiliki izin mengelola karyawan pada outlet ini." }); return;
    }
    const value = input?.value;
    const { error } = await createSupabaseServerClient({ req, res }).rpc("manage_employee_profile", {
      p_outlet_id: body.outletId, p_employee_id: req.query.id, p_action: action,
      p_name: value?.name ?? null, p_email: value?.email ?? null, p_phone: value?.phone || null,
      p_role_id: value?.roleId ?? null, p_active: value?.active ?? null, p_change_role: action === "edit" ? changeRole : null,
    });
    if (error) {
      if (error.code === "42501") { res.status(403).json({ message: "Karyawan berada di luar hak pengelolaan Anda." }); return; }
      if (error.code === "23505") { res.status(409).json({ message: "Email sudah digunakan karyawan lain.", fieldErrors: { email: "Email sudah digunakan." } }); return; }
      if (["23503", "23001"].includes(error.code)) { res.status(409).json({ message: "Karyawan memiliki riwayat terkait dan tidak dapat dihapus. Ubah status menjadi Nonaktif." }); return; }
      if (error.code === "P0001") {
        res.status(409).json({ message: error.message.includes("auth_email") ? "Email akun login harus diubah melalui pengaturan akun Auth." :
          error.message.includes("linked_account") ? "Profil yang terhubung akun login tidak dapat dihapus. Ubah status menjadi Nonaktif." :
          "Pemilik masih dilindungi. Pastikan ada Pemilik aktif lain dan pindahkan role Pemilik sebelum menonaktifkan atau menghapus." }); return;
      }
      if (error.code === "22023") { res.status(400).json({ message: "Data karyawan atau role tidak valid." }); return; }
      res.status(503).json({ message: "Perubahan belum dapat disimpan. Pastikan migrasi pengelolaan karyawan sudah diterapkan." }); return;
    }
    res.status(200).json({ message: action === "edit" ? "Data karyawan berhasil diperbarui." : "Profil karyawan berhasil dihapus." });
  } catch { res.status(503).json({ message: "Layanan karyawan sedang tidak tersedia." }); }
}
