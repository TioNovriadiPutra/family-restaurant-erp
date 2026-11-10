import Head from "next/head";
import type { ErpPage } from "@/interfaces/layout";
import { requireErpPage } from "@/lib/server/erp-page";
import { PageState } from "@/components/shared/page-state";
import { PurchasingPage } from "@/components/custom/purchasing/purchasing-page";
export const getServerSideProps = requireErpPage("purchasing.read");
const Suppliers: ErpPage = ({ session, forbidden, unavailable }) => !session || forbidden || unavailable ? <PageState forbidden={forbidden} /> : <><Head><title>Supplier · Dapur Keluarga</title></Head><PurchasingPage session={session} view="suppliers" /></>;
Suppliers.erpLayout = true;
export default Suppliers;
