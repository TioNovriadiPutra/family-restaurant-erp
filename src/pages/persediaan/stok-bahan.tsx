import Head from "next/head";
import type { ErpPage } from "@/interfaces/layout";
import { requireErpPage } from "@/lib/server/erp-page";
import { PageState } from "@/components/shared/page-state";
import { InventoryPage } from "@/components/custom/inventory/inventory-page";
export const getServerSideProps = requireErpPage("inventory.read");
const Stock: ErpPage = ({ session, forbidden, unavailable }) =>
  !session || forbidden || unavailable ? (
    <PageState forbidden={forbidden} />
  ) : (
    <>
      <Head>
        <title>Stok bahan · Dapur Keluarga</title>
      </Head>
      <InventoryPage session={session} view="stock" />
    </>
  );
Stock.erpLayout = true;
export default Stock;
