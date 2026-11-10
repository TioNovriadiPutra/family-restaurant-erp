import Head from "next/head";
import { useRouter } from "next/router";
import type { ErpPage } from "@/interfaces/layout";
import type { OutletFormProps } from "@/interfaces/form-surface";
import { requireErpPage } from "@/lib/server/erp-page";
import { getAccessView } from "@/controller/auth/access-view";
import {
  usePurchaseOptions,
  purchasingError,
} from "@/controller/purchasing/use-purchasing";
import { useErpUiState } from "@/stores/erp-ui-store";
import { PageState } from "@/components/shared/page-state";
import { FormPageFrame } from "@/components/shared/form-page-frame";
import { PurchaseEditor } from "@/components/custom/purchasing/purchase-form";
export const getServerSideProps = requireErpPage([
  "purchasing.read",
  "purchasing.manage",
  "inventory.manage",
  "finance.manage",
]);
function Editor({ outletId }: OutletFormProps) {
  const router = useRouter();
  const options = usePurchaseOptions(outletId, true);
  const base = "/pembelian/pembelian-bahan";
  return (
    <FormPageFrame backHref={base} backLabel="Riwayat pembelian">
      {options.isPending ? (
        <p role="status">Memuat pilihan pembelian…</p>
      ) : options.isError ? (
        <div role="alert" className="ui-alert ui-alert-destructive">
          <p>{purchasingError(options.error)}</p>
          <button
            className="ui-button ui-button-secondary"
            onClick={() => options.refetch()}
          >
            Coba lagi
          </button>
        </div>
      ) : (
        options.data && (
          <PurchaseEditor
            outletId={outletId}
            options={options.data}
            onCancel={() => {
              void router.push(base);
            }}
            onSaved={() => {
              void router.push(`${base}?saved=1`);
            }}
          />
        )
      )}
    </FormPageFrame>
  );
}
const PurchaseFormPage: ErpPage = ({ session, forbidden, unavailable }) => {
  const selected = useErpUiState((s) => s.selectedOutletId);
  if (!session || forbidden || unavailable)
    return <PageState forbidden={forbidden} />;
  const access = getAccessView(session, selected);
  if (
    !access.selected ||
    !["purchasing.manage", "inventory.manage", "finance.manage"].every((p) =>
      access.permissions.includes(p),
    )
  )
    return <PageState forbidden />;
  return (
    <>
      <Head>
        <title>Catat pembelian · Dapur Keluarga</title>
      </Head>
      <Editor
        key={access.selected.outlet_id}
        outletId={access.selected.outlet_id}
      />
    </>
  );
};
PurchaseFormPage.erpLayout = true;
export default PurchaseFormPage;
