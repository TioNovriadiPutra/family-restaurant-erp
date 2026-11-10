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
    slug !== "master-bahan" &&
    slug !== "bahan-terbuang" &&
    slug !== "penyesuaian-stok"
  )
    return { notFound: true };
  const result = await requireErpPage(["inventory.read", "inventory.manage"])(
    context,
  );
  return "props" in result
    ? { props: { ...(await result.props), sectionSlug: slug } }
    : result;
};
const FormPage: ErpPage = ({
  session,
  forbidden,
  unavailable,
  sectionSlug,
}) => {
  if (!session || forbidden || unavailable)
    return <PageState forbidden={forbidden} />;
  const view = inventorySections[sectionSlug as keyof typeof inventorySections];
  return (
    <>
      <Head>
        <title>Form persediaan · Dapur Keluarga</title>
      </Head>
      <InventoryEditorPage session={session} view={view} />
    </>
  );
};
FormPage.erpLayout = true;
export default FormPage;
