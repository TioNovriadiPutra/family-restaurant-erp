import Head from "next/head";
import { AuthShell } from "@/components/shared/auth-shell";
import { LoginForm } from "@/components/custom/auth/login-form";

export default function LoginPage() {
  return <><Head><title>Masuk ke ERP · Dapur Keluarga</title><meta name="description" content="Masuk ke ERP Dapur Keluarga menggunakan akun petugas restoran." /><meta name="robots" content="noindex, nofollow" /></Head>
    <AuthShell><LoginForm /></AuthShell>
  </>;
}
