import { createHash } from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { acceptAuthRequest } from "@/lib/auth-request";
import { canAccessOutlet } from "@/lib/erp-access";
import { uuidPattern } from "@/lib/employees-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readAuthSession } from "../auth/[action]";
export const config = { api: { bodyParser: false } };
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!acceptAuthRequest(req, res, "POST", false)) return;
  const { outletId, requestId } = req.query;
  if (
    typeof outletId !== "string" ||
    !uuidPattern.test(outletId) ||
    typeof requestId !== "string" ||
    !uuidPattern.test(requestId)
  ) {
    res.status(400).json({ message: "Identitas unggahan tidak valid." });
    return;
  }
  try {
    const session = await readAuthSession({ req, res });
    if (!session) {
      res.status(401).json({ message: "Silakan masuk kembali." });
      return;
    }
    if (!canAccessOutlet(session.access, outletId, "finance.manage")) {
      res.status(403).json({ message: "Akses unggahan ditolak." });
      return;
    }
    const max = 8 * 1024 * 1024;
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > max) {
        res.status(413).json({ message: "Bukti pengeluaran maksimal 8 MB." });
        return;
      }
      chunks.push(Buffer.from(chunk));
    }
    const file = Buffer.concat(chunks);
    const mime =
      file.subarray(0, 5).toString() === "%PDF-"
        ? "application/pdf"
        : file
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          ? "image/png"
          : file[0] === 255 && file[1] === 216 && file[2] === 255
            ? "image/jpeg"
            : "";
    if (!mime || req.headers["content-type"]?.split(";")[0] !== mime) {
      res
        .status(415)
        .json({ message: "Gunakan bukti PDF, JPG atau PNG yang valid." });
      return;
    }
    const proofSha256 = createHash("sha256").update(file).digest("hex");
    const proofKey = `${outletId}/${session.user.id}/${requestId}.${mime === "application/pdf" ? "pdf" : mime === "image/png" ? "png" : "jpg"}`;
    const bucket = createSupabaseServerClient({ req, res }).storage.from(
      "restaurant-finance-proofs",
    );
    const uploaded = await bucket.upload(proofKey, file, {
      contentType: mime,
      upsert: false,
    });
    if (uploaded.error) {
      if (!["409", "400"].includes(String(uploaded.error.statusCode))) {
        res.status(503).json({
          message:
            "Bukti belum dapat diunggah. Periksa migrasi Storage dan koneksi.",
        });
        return;
      }
      const existing = await bucket.download(proofKey);
      if (
        existing.error ||
        createHash("sha256")
          .update(Buffer.from(await existing.data.arrayBuffer()))
          .digest("hex") !== proofSha256
      ) {
        res.status(409).json({
          message:
            "Unggahan belum berhasil atau bukti pada percobaan sebelumnya berbeda. Coba kembali dengan bukti yang sama.",
        });
        return;
      }
    }
    res.status(201).json({ proofKey, proofMime: mime, proofSha256 });
  } catch {
    res.status(503).json({
      message:
        "Bukti belum dapat diunggah. Pastikan migrasi Storage sudah diterapkan.",
    });
  }
}
