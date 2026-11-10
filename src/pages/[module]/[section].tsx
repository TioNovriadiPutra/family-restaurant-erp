import Head from "next/head";
import type { GetServerSideProps } from "next";
import type { ErpPage, ErpPageProps } from "@/interfaces/layout";
import { erpNavigation } from "@/lib/erp-navigation";
import { moduleMenus } from "@/lib/module-menu";
import { requireErpPage } from "@/lib/server/erp-page";
import { PageState } from "@/components/shared/page-state";
import { ModuleSection } from "@/components/custom/modules/module-section";

export const getServerSideProps: GetServerSideProps<ErpPageProps> = async context => {
  const moduleSlug = context.params?.module;
  const sectionSlug = context.params?.section;
  if (typeof moduleSlug !== "string" || typeof sectionSlug !== "string") return { notFound: true };
  const parent = erpNavigation.find(item => item.slug === moduleSlug);
  const section = moduleMenus[moduleSlug]?.sections.find(item => item.slug === sectionSlug);
  if (!parent || !section) return { notFound: true };
  const permissions = [parent.permission, section.permission].filter((value): value is string => Boolean(value));
  const result = await requireErpPage(permissions)(context);
  if (!("props" in result)) return result;
  return { props: { ...await result.props, module: parent.label, moduleSlug, sectionSlug } };
};

const SectionPage: ErpPage = ({ session, unavailable, forbidden, module, moduleSlug, sectionSlug }) => {
  if (!session || unavailable || forbidden || !moduleSlug || !sectionSlug) return <PageState forbidden={forbidden} />;
  const section = moduleMenus[moduleSlug]?.sections.find(item => item.slug === sectionSlug);
  return <><Head><title>{`${section?.title ?? "Menu"} · Dapur Keluarga`}</title></Head><ModuleSection moduleSlug={moduleSlug} sectionSlug={sectionSlug} title={module ?? ""} session={session} /></>;
};
SectionPage.erpLayout = true;
export default SectionPage;
