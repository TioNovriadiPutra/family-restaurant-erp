import type { NextApiRequest, NextApiResponse } from "next";
import { acceptAuthRequest } from "@/lib/auth-request";
import { canAccessOutlet } from "@/lib/erp-access";
import { uuidPattern } from "@/lib/employees-validation";
import {
  validSettingsData,
  validSettingsFilters,
} from "@/lib/settings-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readAuthSession } from "../auth/[action]";
export const config = { api: { bodyParser: { sizeLimit: "32kb" } } };
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!["GET", "POST"].includes(req.method ?? "")) {
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ message: "Metode tidak didukung." });
    return;
  }
  if (!acceptAuthRequest(req, res, req.method!)) return;
  const write = req.method === "POST",
    outletId = write ? req.body?.outletId : req.query.outletId,
    action = write ? req.body?.action : req.query.view;
  const data = write
    ? req.body?.data
    : {
        search: req.query.search ?? "",
        status: req.query.status ?? "all",
        categoryId: req.query.categoryId ?? "",
        page: req.query.page ?? 1,
        ...(req.query.id ? { id: req.query.id } : {}),
      };
  if (
    typeof outletId !== "string" ||
    !uuidPattern.test(outletId) ||
    typeof action !== "string" ||
    (write
      ? !validSettingsData(action, data) ||
        !uuidPattern.test(req.body?.requestId ?? "") ||
        Object.keys(req.body).some(
          (k) => !["outletId", "action", "data", "requestId"].includes(k),
        )
      : ![
          "profile",
          "receipt",
          "menus",
          "menu_detail",
          "options",
          "payments",
          "access",
        ].includes(action) ||
        !validSettingsFilters(data) ||
        (action === "menu_detail" && !uuidPattern.test(String(data.id))))
  ) {
    res
      .status(400)
      .json({
        message:
          "Pengaturan belum valid. Periksa kolom wajib, persentase, nominal, dan referensi.",
      });
    return;
  }
  try {
    const session = await readAuthSession({ req, res });
    if (!session) {
      res.status(401).json({ message: "Silakan masuk kembali ke ERP." });
      return;
    }
    const menu = [
        "menus",
        "menu_detail",
        "options",
        "menu",
        "category",
        "price",
      ].includes(action),
      access = ["access", "role", "assignment"].includes(action);
    const permissions = [
      menu ? "menu.read" : access ? "rbac.read" : "organization.read",
      ...(write
        ? [
            menu
              ? "menu.manage"
              : access
                ? "rbac.manage"
                : "organization.manage",
          ]
        : []),
      ...(action === "assignment" ? ["staff.read", "staff.manage"] : []),
    ];
    if (
      !permissions.every((p) => canAccessOutlet(session.access, outletId, p)) ||
      (["role", "assignment"].includes(action) &&
        !session.access.some(
          (a) => a.outlet_id === outletId && a.role === "Pemilik",
        ))
    ) {
      res
        .status(403)
        .json({
          message:
            "Anda tidak memiliki izin untuk mengubah atau membaca pengaturan ini.",
        });
      return;
    }
    const result = await createSupabaseServerClient({ req, res }).rpc(
      write ? "settings_write" : "settings_read",
      write
        ? {
            p_outlet_id: outletId,
            p_action: action,
            p_data: data,
            p_request_id: req.body.requestId,
          }
        : { p_outlet_id: outletId, p_view: action, p_data: data },
    );
    if (result.error) {
      const { code, message } = result.error;
      const status =
        code === "42501"
          ? 403
          : ["40001", "23505"].includes(code)
            ? 409
            : code?.startsWith("22") ||
                code?.startsWith("23") ||
                code === "P0001"
              ? 400
              : 503;
      const known: Record<string, string> = {
        settings_stale:
          "Data sudah berubah. Tutup form dan muat ulang sebelum menyimpan.",
        settings_request_changed:
          "Percobaan sebelumnya belum terkonfirmasi. Periksa data sebelum mengubah isinya.",
        settings_timezone_locked:
          "Zona waktu terkunci karena sudah ada dokumen transaksi.",
        settings_name_exists: "Nama sudah digunakan. Pilih nama lain.",
        settings_recipe_invalid:
          "Pilih resep sajian aktif yang sudah diterbitkan.",
        settings_method_locked:
          "Jenis atau akun metode yang memiliki riwayat tidak dapat diganti.",
        settings_last_cash: "Setidaknya satu metode tunai harus tetap aktif.",
        settings_owner_protected:
          "Role akun sendiri dan Pemilik aktif terakhir dilindungi.",
        "last active owner": "Pemilik aktif terakhir tidak dapat diganti.",
        settings_permission_protected:
          "Hak pengelolaan role tetap khusus Pemilik.",
        settings_global_denied:
          "Perubahan ini memerlukan izin pada seluruh lokasi yang terkait.",
        settings_price_date_invalid:
          "Pilih waktu mendatang atau kosongkan untuk berlaku sekarang.",
      };
      res
        .status(status)
        .json({
          message:
            Object.entries(known).find(([k]) => message?.includes(k))?.[1] ??
            (status === 503
              ? "Pengaturan belum tersedia. Migrasi settings_workflows perlu diterapkan pada backend."
              : status === 403
                ? "Akses pengaturan atau referensi ini ditolak."
                : "Periksa data, revisi, dan referensi pengaturan yang dipilih."),
        });
      return;
    }
    res.status(write ? 201 : 200).json(result.data);
  } catch {
    res
      .status(503)
      .json({
        message:
          "Koneksi pengaturan terputus. Periksa data sebelum mengulangi penyimpanan.",
      });
  }
}
