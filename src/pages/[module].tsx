import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import type { ErpPage, ErpPageProps } from "@/interfaces/layout";
import { erpNavigation } from "@/lib/erp-navigation";
import { requireErpPage } from "@/lib/server/erp-page";
import { PageState } from "@/components/shared/page-state";
import { moduleMenus } from "@/lib/module-menu";
import { ModuleMenu } from "@/components/custom/modules/module-menu";

export const getServerSideProps: GetServerSideProps<ErpPageProps> = async context => {
  const item = erpNavigation.find(entry => entry.slug && entry.slug === context.params?.module);
  if (!item) return { notFound: true };
  const result = await requireErpPage(item.permission)(context);
  if (!("props" in result)) return result;
  return { props: { ...await result.props, module: item.label, moduleSlug: item.slug } };
};

const ModulePage: ErpPage = ({ session, unavailable, forbidden, module, moduleSlug }) => {
  if (unavailable || !session || forbidden) return <PageState forbidden={forbidden} />;
  return <><Head><title>{`${module} · Dapur Keluarga`}</title></Head>
    {moduleSlug && moduleMenus[moduleSlug] ? <ModuleMenu moduleSlug={moduleSlug} title={module ?? ""} session={session} /> : <div className="ui-card max-w-2xl"><h1 className="type-28-semibold">{module}</h1>
      <p className="mt-4 text-muted-foreground">Modul {module?.toLowerCase()} belum diimplementasikan. Anda dapat menggunakan ringkasan operasional yang tersedia di halaman home.</p>
      <Link href="/" className="ui-button ui-button-secondary mt-6">Kembali ke ringkasan</Link>
    </div>}
  </>;
};
ModulePage.erpLayout = true;
export default ModulePage;
