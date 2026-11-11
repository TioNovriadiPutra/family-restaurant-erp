import { PageTitle } from '@/components/shared/page-heading';
import Link from "next/link";
import type { PageStateProps } from "@/interfaces/layout";

export function PageState({ forbidden = false }: PageStateProps) {
  return <div className="ui-card mx-auto max-w-xl">
    <PageTitle className="">{forbidden ? "Akses tidak diizinkan" : "Layanan belum tersedia"}</PageTitle>
    <p className="mt-4 text-muted-foreground">{forbidden ? "Akun Anda tidak memiliki permission untuk modul ini." : "Sesi belum dapat diverifikasi. Silakan coba lagi beberapa saat."}</p>
    <Link href="/" className="ui-button ui-button-secondary mt-6">Kembali ke ringkasan</Link>
  </div>;
}
