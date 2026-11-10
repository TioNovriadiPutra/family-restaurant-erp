import Head from "next/head";
import type { GetServerSideProps } from "next";
import type { ErpPage } from "@/interfaces/layout";
import { requireErpPage } from "@/lib/server/erp-page";
import { financeSections, financeLabels } from "@/lib/finance-navigation";
import { PageState } from "@/components/shared/page-state";
import { FinancePage } from "@/components/custom/finance/finance-page";
export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.financeSection;
  if (slug === "review-shift" || slug === "persetujuan-edc")
    return {
      redirect: {
        destination:
          slug === "review-shift"
            ? "/keuangan/kas-bank"
            : "/keuangan/rekonsiliasi",
        permanent: false,
      },
    };
  if (typeof slug !== "string" || !Object.hasOwn(financeSections, slug))
    return { notFound: true };
  const result = await requireErpPage([
    "finance.read",
    ...(slug === "pembayaran-supplier" ? ["purchasing.read"] : []),
  ])(context);
  return "props" in result
    ? { props: { ...(await result.props), sectionSlug: slug } }
    : result;
};
const Section: ErpPage = ({ session, forbidden, unavailable, sectionSlug }) => {
  const view = financeSections[sectionSlug as keyof typeof financeSections];
  if (!session || forbidden || unavailable || !view)
    return <PageState forbidden={forbidden} />;
  return (
    <>
      <Head>
        <title>{`${financeLabels[view]} / Dapur Keluarga`}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <FinancePage session={session} view={view} />
    </>
  );
};
Section.erpLayout = true;
export default Section;
