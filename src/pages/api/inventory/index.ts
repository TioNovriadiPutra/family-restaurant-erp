import type { NextApiRequest, NextApiResponse } from "next";
import { acceptAuthRequest } from "@/lib/auth-request";
import { canAccessOutlet } from "@/lib/erp-access";
import { uuidPattern } from "@/lib/employees-validation";
import { validInventoryData } from "@/lib/inventory-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readAuthSession } from "../auth/[action]";
export const config = { api: { bodyParser: { sizeLimit: "160kb" } } };
const views = [
  "stock",
  "materials",
  "counts",
  "waste",
  "adjustments",
  "approvals",
  "options",
  "detail",
  "movements",
];
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
  const write = req.method === "POST";
  const outletId = write ? req.body?.outletId : req.query.outletId;
  const action = write ? req.body?.action : req.query.view;
  if (
    typeof outletId !== "string" ||
    !uuidPattern.test(outletId) ||
    typeof action !== "string"
  ) {
    res.status(400).json({ message: "Permintaan persediaan tidak valid." });
    return;
  }
  const data = write
    ? req.body?.data
    : {
        search: req.query.search ?? "",
        status: req.query.status ?? "all",
        locationId: req.query.locationId ?? "",
        page: req.query.page ?? 1,
        id: req.query.id,
        itemId: req.query.itemId,
      };
  if (
    write
      ? !validInventoryData(action, data) ||
        !uuidPattern.test(req.body?.requestId ?? "") ||
        Object.keys(req.body).some(
          (k) => !["outletId", "action", "data", "requestId"].includes(k),
        )
      : !views.includes(action) ||
        typeof data.search !== "string" ||
        data.search.length > 120 ||
        ![
          "all",
          "active",
          "inactive",
          "low",
          "draft",
          "counting",
          "pending",
          "posted",
          "rejected",
          "cancelled",
        ].includes(data.status) ||
        !/^[1-9]\d{0,4}$/.test(String(data.page)) ||
        typeof data.locationId !== "string" ||
        (data.locationId && !uuidPattern.test(data.locationId)) ||
        (action === "detail" && !uuidPattern.test(String(data.id))) ||
        (action === "movements" && !uuidPattern.test(String(data.itemId)))
  ) {
    res
      .status(400)
      .json({
        message:
          "Data atau filter persediaan tidak valid. Periksa kolom wajib dan angka yang diisi.",
      });
    return;
  }
  try {
    const session = await readAuthSession({ req, res });
    if (!session) {
      res.status(401).json({ message: "Silakan masuk kembali ke ERP." });
      return;
    }
    const permissions = [
      "inventory.read",
      ...(write ? ["inventory.manage"] : []),
      ...(["approve", "reject", "approvals"].includes(action)
        ? ["approvals.review"]
        : []),
      ...(action === "approve" ? ["finance.manage"] : []),
    ];
    if (
      !permissions.every((p) => canAccessOutlet(session.access, outletId, p))
    ) {
      res
        .status(403)
        .json({
          message: "Anda tidak memiliki izin persediaan untuk tindakan ini.",
        });
      return;
    }
    const supabase = createSupabaseServerClient({ req, res });
    const result = await supabase.rpc(
      write ? "inventory_write" : "inventory_read",
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
      const known: Record<string, string> = {
        inventory_self_approval_denied:
          "Pembuat dokumen tidak boleh menyetujui atau menolak dokumennya sendiri. Minta Pemilik/Manajer lain untuk mereview.",
        inventory_insufficient_stock:
          "Stok terbaru tidak cukup. Periksa saldo bahan sebelum melakukan posting.",
        inventory_cost_required:
          "Isi biaya satuan untuk penambahan stok yang belum memiliki biaya rata-rata.",
        inventory_count_incomplete:
          "Hitung semua bahan dan isi alasan untuk setiap selisih sebelum mengajukan.",
        inventory_count_in_progress:
          "Masih ada opname yang sedang dihitung atau menunggu persetujuan pada lokasi ini.",
        inventory_count_empty:
          "Belum ada bahan aktif. Tambahkan master bahan terlebih dahulu.",
        inventory_base_unit_locked:
          "Satuan dasar dan jenis bahan yang sudah dibuat tidak dapat diganti. Gunakan konversi satuan.",
        inventory_stale_version:
          "Dokumen sudah berubah. Muat ulang detail sebelum melanjutkan.",
      };
      const status =
        code === "42501"
          ? 403
          : ["40001", "23505"].includes(code)
            ? 409
            : code?.startsWith("22") || code?.startsWith("23")
              ? 400
              : 503;
      const specific = Object.entries(known).find(([key]) =>
        message.includes(key),
      )?.[1];
      res
        .status(status)
        .json({
          message:
            specific ??
            (message.includes("period")
              ? "Periode akuntansi tertutup atau konfigurasinya belum sesuai. Posting dibatalkan."
              : status === 403
                ? "Akses dokumen atau lokasi ini ditolak."
                : status === 409
                  ? "Data sudah ada atau dokumen berubah. Muat ulang daftar."
                  : status === 400
                    ? "Data belum valid. Periksa angka, satuan, alasan dan lokasi."
                    : "Layanan persediaan belum tersedia. Periksa migrasi inventory_workflows."),
        });
      return;
    }
    res.status(write ? 201 : 200).json(result.data);
  } catch {
    res
      .status(503)
      .json({
        message:
          "Persediaan belum dapat diproses. Periksa koneksi lalu coba lagi.",
      });
  }
}
