import Head from "next/head";
import type { GetServerSideProps } from "next";
import type { ErpPage } from "@/interfaces/layout";
import { requireErpPage } from "@/lib/server/erp-page";
import {
  settingsSections,
  settingsLabels,
  settingsReadPermission,
} from "@/lib/settings-navigation";
import { PageState } from "@/components/shared/page-state";
import { SettingsPage } from "@/components/custom/settings/settings-page";
export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.settingsSection;
  if (typeof slug !== "string" || !Object.hasOwn(settingsSections, slug))
    return { notFound: true };
  const view = settingsSections[slug as keyof typeof settingsSections];
  const result = await requireErpPage(settingsReadPermission[view])(context);
  return "props" in result
    ? { props: { ...(await result.props), sectionSlug: slug } }
    : result;
};
const Page: ErpPage = ({ session, forbidden, unavailable, sectionSlug }) => {
  const view = settingsSections[sectionSlug as keyof typeof settingsSections];
  if (!session || forbidden || unavailable || !view)
    return <PageState forbidden={forbidden} />;
  return (
    <>
      <Head>
        <title>{`${settingsLabels[view]} / Dapur Keluarga`}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <SettingsPage session={session} view={view} />
    </>
  );
};
Page.erpLayout = true;
export default Page;
