import type { EmployeeRecord } from "@/interfaces/employees";
import type { NextApiRequest, NextApiResponse } from "next";
import { acceptAuthRequest } from "@/lib/auth-request";
import { canAccessOutlet } from "@/lib/erp-access";
import { uuidPattern, validateEmployeeCreate } from "@/lib/employees-validation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readAuthSession } from "../auth/[action]";

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    res.setHeader("Cache-Control", "private, no-store");
    res.status(405).json({ message: "Metode tidak didukung." }); return;
  }
  if (!acceptAuthRequest(req, res, req.method)) return;
  if (!isSupabaseConfigured()) { res.status(503).json({ message: "Supabase belum dikonfigurasi." }); return; }
  const input = req.method === "POST" ? validateEmployeeCreate(req.body) : null;
  if (input?.errors) { res.status(400).json({ message: "Periksa kembali data karyawan.", fieldErrors: input.errors }); return; }
  const outletId = input?.value?.outletId ?? req.query.outletId;
  if (typeof outletId !== "string" || !uuidPattern.test(outletId)) { res.status(400).json({ message: "Outlet tidak valid." }); return; }
  try {
    const session = await readAuthSession({ req, res });
    if (!session) { res.status(401).json({ message: "Silakan masuk kembali ke ERP." }); return; }
    const required = req.method === "POST" ? ["staff.read", "rbac.read", "staff.manage", "rbac.manage"] : ["staff.read", "rbac.read"];
    if (!required.every(code => canAccessOutlet(session.access, outletId, code))) {
      res.status(403).json({ message: "Anda tidak memiliki izin karyawan untuk outlet ini." }); return;
    }
    const supabase = createSupabaseServerClient({ req, res });
    if (input?.value) {
      const value = input.value;
      const { data, error } = await supabase.rpc("create_employee_profile_auto", {
        p_outlet_id: outletId, p_name: value.name,
        p_email: value.email, p_phone: value.phone || null, p_role_id: value.roleId, p_active: value.active,
      });
      if (error) {
        if (error.code === "23505") {
          const emailConflict = error.message.includes("employee_email_exists");
          res.status(409).json({ message: emailConflict ? "Email sudah digunakan karyawan lain di restoran ini." : "Penomoran karyawan belum berhasil. Silakan coba lagi.", ...(emailConflict ? { fieldErrors: { email: "Email sudah digunakan karyawan lain di restoran ini." } } : {}) }); return;
        }
        if (error.code === "42501") { res.status(403).json({ message: "Anda tidak berhak menambah karyawan pada outlet ini." }); return; }
        if (error.code === "22023") {
          res.status(400).json({ message: "Data atau role karyawan tidak valid. Periksa kembali form.",
            ...(error.message.includes("employee_role_invalid") ? { fieldErrors: { roleId: "Role tidak tersedia pada restoran ini. Pilih role yang valid." } } : {}),
          }); return;
        }
        res.status(503).json({ message: "Profil belum dapat disimpan. Pastikan migrasi direktori karyawan sudah diterapkan." }); return;
      }
      if (typeof data !== "string" || !uuidPattern.test(data)) throw new Error("Invalid employee result");
      res.status(201).json({ employee: { id: data }, message: "Profil karyawan berhasil ditambahkan." }); return;
    }
    const search = req.query.search ?? "";
    const roleId = req.query.roleId ?? "";
    const status = req.query.status ?? "all";
    const pageValue = req.query.page ?? "1";
    const optionsOnly = req.query.options === "1";
    if (typeof search !== "string" || search.length > 120 || typeof roleId !== "string" || (roleId && !uuidPattern.test(roleId)) ||
      typeof status !== "string" || !["all", "active", "inactive"].includes(status) ||
      typeof pageValue !== "string" || !/^[1-9]\d{0,5}$/.test(pageValue)) {
      res.status(400).json({ message: "Filter karyawan tidak valid." }); return;
    }
    const { data, error } = await supabase.rpc("employee_directory", {
      p_outlet_id: outletId, p_search: search.trim(), p_role_id: roleId || null,
      p_active: status === "all" ? null : status === "active", p_page: Number(pageValue), p_page_size: 10, p_options_only: optionsOnly,
    });
    if (error) {
      res.status(error.code === "42501" ? 403 : error.code === "22023" ? 400 : 503).json({ message:
        error.code === "42501" ? "Akses daftar karyawan ditolak." : error.code === "22023" ? "Filter atau role tidak valid." : "Daftar karyawan belum dapat dimuat. Pastikan migrasi ID karyawan otomatis sudah diterapkan.",
      }); return;
    }
    if (!data || typeof data !== "object" || !Array.isArray(data.roles) || (!optionsOnly && !Array.isArray(data.items))) throw new Error("Invalid employee directory");
    if (!optionsOnly && data.items.length) {
      const { data: flags, error: pinError } = await supabase.rpc("employee_pin_statuses", {
        p_outlet_id: outletId, p_employee_ids: data.items.map((item: EmployeeRecord) => item.id),
      });
      if (pinError || !flags || typeof flags !== "object") {
        res.status(503).json({ message: "Status PIN belum dapat dimuat. Pastikan migrasi PIN karyawan sudah diterapkan." }); return;
      }
      for (const item of data.items) {
        const flag = flags[item.id];
        if (typeof flag?.pin_configured !== "boolean" || typeof flag?.pin_eligible !== "boolean") throw new Error("Invalid PIN status");
        item.pin_configured = flag.pin_configured; item.pin_eligible = flag.pin_eligible;
      }
    }
    res.status(200).json(optionsOnly ? { roles: data.roles } : { directory: data });
  } catch {
    res.status(503).json({ message: "Layanan karyawan sedang tidak tersedia. Silakan coba lagi." });
  }
}
