import type { NextApiRequest, NextApiResponse } from "next";
import { acceptAuthRequest } from "@/lib/auth-request";
import { canAccessOutlet } from "@/lib/erp-access";
import { uuidPattern } from "@/lib/employees-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readAuthSession } from "./auth/[action]";
export const config = { api: { bodyParser: { sizeLimit: "4kb" } } };
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
  const data = req.body?.data;
  if (
    typeof outletId !== "string" ||
    !uuidPattern.test(outletId) ||
    (write &&
      (!req.body ||
        Object.keys(req.body).some(
          (k) => !["outletId", "requestId", "data"].includes(k),
        ) ||
        !uuidPattern.test(req.body.requestId ?? "") ||
        !data ||
        typeof data !== "object" ||
        Array.isArray(data) ||
        Object.keys(data).some(
          (k) => !["id", "revision", "code", "seats", "active"].includes(k),
        ) ||
        typeof data.code !== "string" ||
        !/^[A-Z0-9][A-Z0-9 _-]{0,19}$/.test(data.code.trim().toUpperCase()) ||
        !Number.isInteger(data.seats) ||
        data.seats < 1 ||
        data.seats > 100 ||
        typeof data.active !== "boolean" ||
        (data.id !== undefined &&
          (!uuidPattern.test(data.id) ||
            !Number.isInteger(data.revision) ||
            data.revision < 1)) ||
        (data.id === undefined && data.revision !== undefined)))
  ) {
    res
      .status(400)
      .json({
        message: "Isi kode meja, jumlah kursi 1-100, dan status yang valid.",
      });
    return;
  }
  try {
    const session = await readAuthSession({ req, res });
    if (!session) {
      res.status(401).json({ message: "Silakan masuk kembali ke ERP." });
      return;
    }
    if (
      ![
        "organization.read",
        "menu.read",
        ...(write ? ["organization.manage"] : []),
      ].every((p) => canAccessOutlet(session.access, outletId, p))
    ) {
      res
        .status(403)
        .json({ message: "Anda tidak memiliki izin mengelola meja." });
      return;
    }
    const { data: result, error } = await createSupabaseServerClient({
      req,
      res,
    }).rpc(
      write ? "dining_tables_write" : "dining_tables_read",
      write
        ? { p_outlet: outletId, p_data: data, p_request: req.body.requestId }
        : { p_outlet: outletId },
    );
    if (error) {
      const known: Record<string, string> = {
        table_busy:
          "Meja sedang digunakan pesanan. Selesaikan pesanan sebelum mengubah meja.",
        table_stale: "Data sudah berubah. Tutup form dan muat ulang daftar.",
        table_request_changed:
          "Hasil penyimpanan sebelumnya belum pasti. Muat ulang daftar.",
        table_duplicate: "Kode meja sudah digunakan.",
        table_not_found: "Meja tidak ditemukan pada lokasi ini.",
      };
      const status =
        error.code === "42501"
          ? 403
          : ["40001", "23505"].includes(error.code)
            ? 409
            : error.code?.startsWith("22")
              ? 400
              : 503;
      res
        .status(status)
        .json({
          message:
            Object.entries(known).find(([k]) =>
              error.message.includes(k),
            )?.[1] ??
            (status === 503
              ? "Layanan meja belum tersedia. Silakan coba kembali."
              : "Data meja atau akses tidak valid."),
        });
      return;
    }
    res.status(write ? 201 : 200).json(result);
  } catch {
    res
      .status(503)
      .json({
        message: "Koneksi terputus. Periksa daftar sebelum menyimpan ulang.",
      });
  }
}
