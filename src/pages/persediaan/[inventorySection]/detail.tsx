import Head from "next/head";
import type { GetServerSideProps } from "next";
import type { ErpPage } from "@/interfaces/layout";
import { requireErpPage } from "@/lib/server/erp-page";
import { inventorySections } from "@/lib/inventory-navigation";
import { PageState } from "@/components/shared/page-state";
import { InventoryEditorPage } from "@/components/custom/inventory/inventory-editor-page";
export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.inventorySection;
  if (
    typeof slug !== "string" ||
    ![
      "stock-opname",
      "bahan-terbuang",
      "penyesuaian-stok",
      "persetujuan-opname",
    ].includes(slug) ||
    typeof context.query.id !== "string"
  )
    return { notFound: true };
  const result = await requireErpPage([
    "inventory.read",
    ...(slug === "persetujuan-opname" ? ["approvals.review"] : []),
  ])(context);
  return "props" in result
    ? { props: { ...(await result.props), sectionSlug: slug } }
    : result;
};
const DetailPage: ErpPage = ({
  session,
  forbidden,
  unavailable,
  sectionSlug,
}) => {
  if (!session || forbidden || unavailable)
    return <PageState forbidden={forbidden} />;
  return (
    <>
      <Head>
        <title>Detail persediaan · Dapur Keluarga</title>
      </Head>
      <InventoryEditorPage
        session={session}
        view={inventorySections[sectionSlug as keyof typeof inventorySections]}
      />
    </>
  );
};
DetailPage.erpLayout = true;
export default DetailPage;
