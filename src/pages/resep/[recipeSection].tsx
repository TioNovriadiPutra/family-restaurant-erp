import Head from "next/head";
import type { GetServerSideProps } from "next";
import type { ErpPage } from "@/interfaces/layout";
import { requireErpPage } from "@/lib/server/erp-page";
import { PageState } from "@/components/shared/page-state";
import { RecipesPage } from "@/components/custom/recipes/recipes-page";
import { recipeSections } from "@/lib/recipes-navigation";
export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.recipeSection;
  if (typeof slug !== "string" || !Object.hasOwn(recipeSections, slug))
    return { notFound: true };
  const result = await requireErpPage([
    "recipes.read",
    ...(slug === "batch-produksi" ? ["inventory.read"] : []),
  ])(context);
  return "props" in result
    ? { props: { ...(await result.props), sectionSlug: slug } }
    : result;
};
const RecipeSection: ErpPage = ({
  session,
  forbidden,
  unavailable,
  sectionSlug,
}) => {
  const view = recipeSections[sectionSlug as keyof typeof recipeSections];
  if (!session || forbidden || unavailable || !view)
    return <PageState forbidden={forbidden} />;
  const title =
    view === "history"
      ? "Riwayat biaya"
      : view === "batches"
        ? "Produksi bahan"
        : "Resep & HPP";
  return (
    <>
      <Head>
        <title>{`${title} · Dapur Keluarga`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <RecipesPage session={session} view={view} />
    </>
  );
};
RecipeSection.erpLayout = true;
export default RecipeSection;
