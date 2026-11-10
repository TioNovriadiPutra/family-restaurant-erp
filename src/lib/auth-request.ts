import type { NextApiRequest, NextApiResponse } from "next";

// POST requests require the browser's same-origin header and JSON body.
export function acceptAuthRequest(req: NextApiRequest, res: NextApiResponse, method: string, requireJson = true) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Vary", "Cookie");
  if (req.method !== method) {
    res.setHeader("Allow", method);
    res.status(405).json({ message: "Metode tidak didukung." });
    return false;
  }
  if (method === "POST") {
    let sameOrigin = false;
    try {
      const origin = new URL(req.headers.origin ?? "");
      sameOrigin = ["http:", "https:"].includes(origin.protocol) && origin.host === req.headers.host;
    } catch { /* Missing or malformed origins are rejected. */ }
    if (!sameOrigin || req.headers["sec-fetch-site"] === "cross-site") {
      res.status(403).json({ message: "Permintaan tidak diizinkan. Muat ulang halaman." });
      return false;
    }
    if (requireJson && !req.headers["content-type"]?.startsWith("application/json")) {
      res.status(415).json({ message: "Gunakan format JSON." });
      return false;
    }
  }
  return true;
}
