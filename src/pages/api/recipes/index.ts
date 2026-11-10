import type { NextApiRequest, NextApiResponse } from "next";
import { acceptAuthRequest } from "@/lib/auth-request";
import { canAccessOutlet } from "@/lib/erp-access";
import { uuidPattern } from "@/lib/employees-validation";
import { validRecipeData, validRecipeFilters } from "@/lib/recipes-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readAuthSession } from "../auth/[action]";
export const config = { api: { bodyParser: { sizeLimit: "160kb" } } };
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
  const data = write
    ? req.body?.data
    : {
        search: req.query.search ?? "",
        status: req.query.status ?? "all",
        page: req.query.page ?? 1,
        id: req.query.id,
        recipeId: req.query.recipeId,
      };
  if (
    typeof outletId !== "string" ||
    !uuidPattern.test(outletId) ||
    typeof action !== "string" ||
    (write
      ? !validRecipeData(action, data) ||
        typeof req.body?.requestId !== "string" ||
        !uuidPattern.test(req.body.requestId) ||
        Object.keys(req.body).some(
          (k) => !["outletId", "action", "data", "requestId"].includes(k),
        )
      : ![
          "options",
          "recipes",
          "detail",
          "history",
          "snapshot",
          "batches",
          "batch_detail",
          "movements",
        ].includes(action) ||
        !validRecipeFilters(data) ||
        (["detail", "snapshot", "batch_detail"].includes(action) &&
          !uuidPattern.test(String(data.id))) ||
        (action === "movements" && !uuidPattern.test(String(data.recipeId))))
  ) {
    res
      .status(400)
      .json({
        message:
          "Data resep belum valid. Periksa kolom wajib, satuan, dan jumlah bahan.",
      });
    return;
  }
  try {
    const session = await readAuthSession({ req, res });
    if (!session) {
      res.status(401).json({ message: "Silakan masuk kembali ke ERP." });
      return;
    }
    const production = action.startsWith("batch_") || action === "batches";
    const permissions = [
      "recipes.read",
      ...(write ? ["recipes.manage"] : []),
      ...(production
        ? ["inventory.read", ...(write ? ["inventory.manage"] : [])]
        : []),
      ...(action === "batch_post" ? ["finance.manage"] : []),
    ];
    if (
      !permissions.every((p) => canAccessOutlet(session.access, outletId, p))
    ) {
      res
        .status(403)
        .json({
          message:
            "Anda tidak memiliki izin untuk tindakan resep atau produksi ini.",
        });
      return;
    }
    const supabase = createSupabaseServerClient({ req, res });
    const result = await supabase.rpc(
      write ? "recipes_write" : "recipes_read",
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
        recipe_cost_incomplete:
          "Biaya bahan belum lengkap. Catat pembelian atau produksi bahan yang belum memiliki biaya sebelum menyimpan HPP atau posting.",
        recipe_insufficient_stock:
          "Stok bahan terbaru tidak cukup. Periksa jumlah pemakaian dan lokasi bahan.",
        recipe_cycle:
          "Resep membentuk siklus bahan. Hasil produksi tidak boleh menjadi bahan dirinya sendiri, termasuk melalui resep lain.",
        recipe_unit_invalid:
          "Satuan belum memiliki konversi yang sesuai. Atur konversi pada master bahan.",
        recipe_output_locked:
          "Bahan hasil produksi tidak dapat diganti pada resep yang sudah dibuat. Buat resep baru.",
        recipe_stale:
          "Data sudah berubah. Muat ulang detail sebelum mencoba lagi.",
        recipe_batch_locked:
          "Produksi sudah diselesaikan atau dibatalkan dan tidak dapat diubah.",
        recipe_batch_recipe_invalid:
          "Pilih resep produksi aktif yang sudah diterbitkan dan memiliki bahan hasil produksi.",
        recipe_publish_invalid:
          "Resep belum dapat diterbitkan. Periksa status resep dan keaktifan bahan.",
        recipe_duplicate_item:
          "Bahan yang sama cukup ditulis satu kali dalam resep.",
        recipe_request_changed:
          "Percobaan sebelumnya belum terkonfirmasi. Periksa daftar dan ulangi dengan data yang sama.",
      };
      const status =
        code === "42501"
          ? 403
          : ["40001", "23505"].includes(code)
            ? 409
            : code?.startsWith("22") || code?.startsWith("23")
              ? 400
              : 503;
      const safe = Object.entries(known).find(([k]) =>
        message?.includes(k),
      )?.[1];
      res
        .status(status)
        .json({
          message:
            safe ??
            (message?.includes("period")
              ? "Periode akuntansi tertutup atau belum sesuai. Posting dibatalkan."
              : status === 403
                ? "Akses resep atau lokasi ini ditolak."
                : status === 400 || status === 409
                  ? "Periksa data, versi, lokasi, dan satuan yang dipilih."
                  : "Layanan resep belum tersedia. Periksa migrasi recipes_hpp_workflows."),
        });
      return;
    }
    res.status(write ? 201 : 200).json(result.data);
  } catch {
    res
      .status(503)
      .json({
        message: "Resep belum dapat diproses. Periksa koneksi lalu coba lagi.",
      });
  }
}
