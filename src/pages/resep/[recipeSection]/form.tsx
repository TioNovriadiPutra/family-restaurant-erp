import Head from "next/head";
import type { GetServerSideProps } from "next";
import type { ErpPage } from "@/interfaces/layout";
import { requireErpPage } from "@/lib/server/erp-page";
import { recipeSections } from "@/lib/recipes-navigation";
import { PageState } from "@/components/shared/page-state";
import { RecipeEditorPage } from "@/components/custom/recipes/recipe-editor-page";
export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.recipeSection;
  if (slug !== "daftar-resep" && slug !== "batch-produksi")
    return { notFound: true };
  const result = await requireErpPage([
    "recipes.read",
    "recipes.manage",
    ...(slug === "batch-produksi"
      ? ["inventory.read", "inventory.manage"]
      : []),
  ])(context);
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
  const view = recipeSections[sectionSlug as keyof typeof recipeSections];
  return (
    <>
      <Head>
        <title>Form resep & produksi · Dapur Keluarga</title>
      </Head>
      <RecipeEditorPage session={session} view={view} />
    </>
  );
};
FormPage.erpLayout = true;
export default FormPage;
