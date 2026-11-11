import Head from "next/head";
import { requireErpPage } from "@/lib/server/erp-page";
import { PageState } from "@/components/shared/page-state";
import { DiningTablesPage } from "@/components/custom/settings/dining-tables-page";
import type { ErpPage } from "@/interfaces/layout";
export const getServerSideProps = requireErpPage("menu.read");
const Page: ErpPage = ({ session, forbidden, unavailable }) =>
  !session || forbidden || unavailable ? (
    <PageState forbidden={forbidden} />
  ) : (
    <>
      <Head>
        <title>Meja / Dapur Keluarga</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <DiningTablesPage session={session} />
    </>
  );
Page.erpLayout = true;
export default Page;
