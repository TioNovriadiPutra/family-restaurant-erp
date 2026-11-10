import type { NextApiRequest, NextApiResponse } from "next";
import type {
  AuthSession,
  OutletAccess,
  ServerAuthContext,
} from "@/interfaces/auth";
import { acceptAuthRequest } from "@/lib/auth-request";
import { filterErpAccess } from "@/lib/erp-access";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };

function isAccess(value: unknown): value is OutletAccess {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    ["employee_id", "restaurant_id", "outlet_id", "outlet_name", "role"].every(
      (key) => typeof row[key] === "string",
    ) &&
    Array.isArray(row.permissions) &&
    row.permissions.every((item) => typeof item === "string")
  );
}

// Shared with SSR entry guards; Supabase operations remain inside pages/api.
export async function readAuthSession(
  context: ServerAuthContext,
): Promise<AuthSession | null> {
  const supabase = createSupabaseServerClient(context);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    if (
      error.name === "AuthSessionMissingError" ||
      (error.status && error.status >= 400 && error.status < 429)
    )
      return null;
    throw new Error("Auth unavailable");
  }
  if (!user) return null;
  const { data, error: accessError } = await supabase.rpc("my_access");
  if (accessError || !Array.isArray(data) || !data.every(isAccess))
    throw new Error("Access unavailable");
  const access = filterErpAccess(data);
  if (!access.length) return null;
  return { user: { id: user.id, email: user.email ?? "" }, access };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const action = req.query.action;
  if (!["login", "session", "logout"].includes(String(action))) {
    res.status(404).json({ message: "Endpoint tidak ditemukan." });
    return;
  }
  if (!acceptAuthRequest(req, res, action === "session" ? "GET" : "POST"))
    return;
  if (!isSupabaseConfigured()) {
    res
      .status(503)
      .json({
        message: "Supabase belum dikonfigurasi. Hubungi administrator.",
      });
    return;
  }
  try {
    if (action === "session") {
      const session = await readAuthSession({ req, res });
      res
        .status(session ? 200 : 401)
        .json(session ? { session } : { message: "Silakan masuk kembali." });
      return;
    }
    const supabase = createSupabaseServerClient({ req, res });
    if (action === "logout") {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
        res
          .status(503)
          .json({ message: "Belum dapat keluar. Silakan coba lagi." });
        return;
      }
      res.status(200).json({ success: true });
      return;
    }
    const body: unknown = req.body;
    if (
      !body ||
      typeof body !== "object" ||
      !("email" in body) ||
      !("password" in body) ||
      typeof body.email !== "string" ||
      typeof body.password !== "string" ||
      body.email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
      !body.password.length ||
      body.password.length > 1024
    ) {
      res
        .status(400)
        .json({ message: "Isi email dan kata sandi dengan benar." });
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: body.email.trim(),
      password: body.password,
    });
    if (error) {
      const status =
        error.status === 429
          ? 429
          : error.status && error.status >= 500
            ? 503
            : 401;
      res
        .status(status)
        .json({
          message:
            status === 429
              ? "Terlalu banyak percobaan. Coba lagi beberapa saat."
              : status === 503
                ? "Layanan login sedang tidak tersedia."
                : "Email atau kata sandi tidak sesuai, atau akun belum dikonfirmasi.",
        });
      return;
    }
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    const { data, error: accessError } = await supabase.rpc("my_access");
    if (
      userError ||
      accessError ||
      !Array.isArray(data) ||
      !data.every(isAccess)
    ) {
      await supabase.auth.signOut({ scope: "local" });
      res
        .status(503)
        .json({
          message: "Hak akses belum dapat dimuat. Hubungi administrator.",
        });
      return;
    }
    const access = filterErpAccess(data);
    if (!user || !access.length) {
      await supabase.auth.signOut({ scope: "local" });
      res
        .status(403)
        .json({
          message:
            "Akses ERP hanya untuk Pemilik dan Manajer dengan profil serta penugasan outlet aktif. Hubungi administrator restoran.",
        });
      return;
    }
    res
      .status(200)
      .json({
        session: { user: { id: user.id, email: user.email ?? "" }, access },
      });
  } catch {
    res
      .status(503)
      .json({ message: "Layanan tidak dapat dihubungi. Silakan coba lagi." });
  }
}
