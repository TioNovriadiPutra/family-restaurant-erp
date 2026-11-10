import type { NextApiRequest, NextApiResponse } from "next";
import { acceptAuthRequest } from "@/lib/auth-request";
import { canAccessOutlet } from "@/lib/erp-access";
import { uuidPattern } from "@/lib/employees-validation";
import {
  validFinanceData,
  validFinanceFilters,
} from "@/lib/finance-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readAuthSession } from "../auth/[action]";
export const config = { api: { bodyParser: { sizeLimit: "180kb" } } };
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
        page: req.query.page ?? 1,
        accountId: req.query.accountId ?? "",
        from: req.query.from ?? "",
        to: req.query.to ?? "",
        status: req.query.status ?? "all",
        ...(req.query.id ? { id: req.query.id } : {}),
      };
  if (
    typeof outletId !== "string" ||
    !uuidPattern.test(outletId) ||
    typeof action !== "string" ||
    (write
      ? !validFinanceData(action, data) ||
        !uuidPattern.test(req.body?.requestId ?? "") ||
        Object.keys(req.body).some(
          (k) => !["outletId", "action", "data", "requestId"].includes(k),
        )
      : ![
          "options",
          "movements",
          "suppliers",
          "expenses",
          "journals",
          "journal_detail",
          "proof",
          "reconciliations",
          "reconcile_options",
        ].includes(action) ||
        !validFinanceFilters(data) ||
        (["journal_detail", "proof"].includes(action) &&
          !uuidPattern.test(String(data.id))))
  ) {
    res.status(400).json({
      message:
        "Data keuangan belum valid. Periksa kolom wajib, tanggal, dan jumlah.",
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
      "finance.read",
      ...(write ? ["finance.manage"] : []),
      ...(["suppliers", "pay"].includes(action)
        ? ["purchasing.read", ...(write ? ["purchasing.manage"] : [])]
        : []),
    ];
    if (
      !permissions.every((p) => canAccessOutlet(session.access, outletId, p))
    ) {
      res.status(403).json({
        message:
          "Anda tidak memiliki izin keuangan untuk tindakan atau outlet ini.",
      });
      return;
    }
    const supabase = createSupabaseServerClient({ req, res });
    const result = await supabase.rpc(
      write ? "finance_write" : "finance_read",
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
            : code?.startsWith("22") || code?.startsWith("23")
              ? 400
              : 503;
      const errors: Record<string, string> = {
        finance_request_changed:
          "Percobaan sebelumnya belum terkonfirmasi. Periksa daftar dan ulangi dengan data yang sama.",
        finance_import_conflict:
          "ID transaksi bank sudah ada dengan isi berbeda. Periksa kembali CSV.",
        finance_difference:
          "Total alokasi bank dan buku harus sama. Catat biaya bank sebagai pengeluaran terlebih dahulu.",
        finance_allocation_invalid:
          "Alokasi melebihi sisa transaksi, berbeda arah, atau berasal dari rekening lain. Muat ulang data.",
        finance_proof_invalid:
          "Bukti belum valid. Unggah nota PDF, JPG atau PNG sebelum menyimpan.",
        finance_name_exists: "Nama rekening atau kategori sudah digunakan.",
        finance_bank_required:
          "Pilih rekening berjenis bank untuk impor dan rekonsiliasi.",
      };
      res.status(status).json({
        message:
          Object.entries(errors).find(([key]) => message?.includes(key))?.[1] ??
          (message?.includes("period")
            ? "Periode pembukuan sudah ditutup atau belum sesuai."
            : status === 403
              ? "Akses dokumen atau rekening ditolak."
              : status === 503
                ? "Layanan keuangan belum tersedia. Periksa migrasi finance_workflows."
                : "Periksa data keuangan dan referensi yang dipilih."),
      });
      return;
    }
    if (action === "proof") {
      const key = result.data?.key;
      if (typeof key !== "string") {
        res.status(404).json({ message: "Bukti tidak ditemukan." });
        return;
      }
      const signed = await supabase.storage
        .from("restaurant-finance-proofs")
        .createSignedUrl(key, 60);
      if (signed.error) {
        res.status(503).json({ message: "Bukti belum dapat diunduh." });
        return;
      }
      res.status(200).json({ url: signed.data.signedUrl });
      return;
    }
    res.status(write ? 201 : 200).json(result.data);
  } catch {
    res.status(503).json({
      message:
        "Koneksi keuangan terputus. Periksa daftar sebelum mengulangi penyimpanan.",
    });
  }
}
