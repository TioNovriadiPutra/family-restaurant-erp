import Head from "next/head";
import type { GetServerSideProps } from "next";
import type { ErpPage } from "@/interfaces/layout";
import { requireErpPage } from "@/lib/server/erp-page";
import { inventorySections } from "@/lib/inventory-navigation";
import { PageState } from "@/components/shared/page-state";
import { InventoryPage } from "@/components/custom/inventory/inventory-page";
export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.inventorySection;
  if (typeof slug !== "string" || !Object.hasOwn(inventorySections, slug))
    return { notFound: true };
  const view = inventorySections[slug as keyof typeof inventorySections];
  const result = await requireErpPage([
    "inventory.read",
    ...(view === "materials"
      ? ["inventory.manage"]
      : view === "approvals"
        ? ["approvals.review"]
        : []),
  ])(context);
  return "props" in result
    ? { props: { ...(await result.props), sectionSlug: slug } }
    : result;
};
const InventorySection: ErpPage = ({
  session,
  forbidden,
  unavailable,
  sectionSlug,
}) => {
  const view = inventorySections[sectionSlug as keyof typeof inventorySections];
  if (!session || forbidden || unavailable || !view)
    return <PageState forbidden={forbidden} />;
  return (
    <>
      <Head>
        <title>Persediaan · Dapur Keluarga</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <InventoryPage session={session} view={view} />
    </>
  );
};
InventorySection.erpLayout = true;
export default InventorySection;
