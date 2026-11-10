import Head from "next/head";
import type { ErpPage } from "@/interfaces/layout";
import { requireErpPage } from "@/lib/server/erp-page";
import { PageState } from "@/components/shared/page-state";
import { PurchasingPage } from "@/components/custom/purchasing/purchasing-page";
export const getServerSideProps = requireErpPage(["purchasing.read", "inventory.read", "finance.read"]);
const Purchases: ErpPage = ({ session, forbidden, unavailable }) => !session || forbidden || unavailable ? <PageState forbidden={forbidden} /> : <><Head><title>Pembelian · Dapur Keluarga</title></Head><PurchasingPage session={session} view="purchases" /></>;
Purchases.erpLayout = true;
export default Purchases;
