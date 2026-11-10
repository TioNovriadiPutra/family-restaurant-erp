import Head from "next/head";
import type { GetServerSideProps } from "next";
import type { ErpPage } from "@/interfaces/layout";
import { requireErpPage } from "@/lib/server/erp-page";
import { PageState } from "@/components/shared/page-state";
import { FinanceEditorPage } from "@/components/custom/finance/finance-editor-page";
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { financeSection, formAction } = context.params ?? {};
  const mode =
    financeSection === "pengeluaran" && formAction === "form"
      ? "expense"
      : financeSection === "rekonsiliasi" && formAction === "impor"
        ? "import"
        : financeSection === "rekonsiliasi" && formAction === "cocokkan"
          ? "reconcile"
          : undefined;
  if (!mode) return { notFound: true };
  const result = await requireErpPage(["finance.read", "finance.manage"])(
    context,
  );
  return "props" in result
    ? { props: { ...(await result.props), moduleSlug: mode } }
    : result;
};
const Editor: ErpPage = ({ session, forbidden, unavailable, moduleSlug }) => {
  if (
    !session ||
    forbidden ||
    unavailable ||
    !["expense", "import", "reconcile"].includes(moduleSlug ?? "")
  )
    return <PageState forbidden={forbidden} />;
  const mode = moduleSlug as "expense" | "import" | "reconcile";
  return (
    <>
      <Head>
        <title>Form Keuangan / Dapur Keluarga</title>
      </Head>
      <FinanceEditorPage
        session={session}
        view={mode === "expense" ? "expenses" : "reconciliations"}
        mode={mode}
      />
    </>
  );
};
Editor.erpLayout = true;
export default Editor;
