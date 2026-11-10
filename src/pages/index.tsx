import Head from "next/head";
import type { ErpPage } from "@/interfaces/layout";
import { requireErpPage } from "@/lib/server/erp-page";
import { DashboardHome } from "@/components/custom/dashboard/dashboard-home";
import { PageState } from "@/components/shared/page-state";

export const getServerSideProps = requireErpPage();

const Home: ErpPage = ({ session, unavailable, forbidden }) => {
  if (unavailable || !session || forbidden) return <PageState forbidden={forbidden} />;
  return <>
    <Head>
      <title>Ringkasan · Dapur Keluarga</title>
      <meta name="description" content="Ringkasan operasional restoran per outlet." />
      <meta name="robots" content="noindex, nofollow" />
    </Head>
    <DashboardHome session={session} />
  </>;
};
Home.erpLayout = true;
export default Home;