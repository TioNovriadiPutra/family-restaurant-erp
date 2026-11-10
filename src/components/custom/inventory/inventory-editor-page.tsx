import { useRouter } from "next/router";
import { getAccessView } from "@/controller/auth/access-view";
import {
  useInventoryOptions,
  useInventoryList,
  useInventoryDetail,
  inventoryError,
} from "@/controller/inventory/use-inventory";
import { useErpUiState } from "@/stores/erp-ui-store";
import { inventorySections } from "@/lib/inventory-navigation";
import { PageState } from "@/components/shared/page-state";
import { FormPageFrame } from "@/components/shared/form-page-frame";
import { InventoryMaterialEditor } from "./material-form";
import { InventoryAdjustmentEditor } from "./adjustment-form";
import { InventoryDocumentDetail } from "./document-detail";
import type {
  InventoryPageProps,
  InventoryMaterial,
  InventoryWorkspaceProps,
} from "@/interfaces/inventory";
export function InventoryEditorPage(props: InventoryPageProps) {
  const router = useRouter();
  const selected = useErpUiState((s) => s.selectedOutletId);
  const access = getAccessView(props.session, selected);
  if (
    !access.selected ||
    !access.permissions.includes("inventory.read") ||
    (props.view === "approvals"
      ? !access.permissions.includes("approvals.review")
      : !router.pathname.endsWith("/detail") &&
        !access.permissions.includes("inventory.manage"))
  )
    return <PageState forbidden />;
  return (
    <Editor
      key={`${access.selected.outlet_id}-${props.view}`}
      {...props}
      outletId={access.selected.outlet_id}
      canManage={access.permissions.includes("inventory.manage")}
      canReview={access.permissions.includes("approvals.review")}
      canPost={
        access.permissions.includes("inventory.manage") &&
        access.permissions.includes("finance.manage")
      }
    />
  );
}
function Editor({
  outletId,
  view,
  canManage,
  canReview,
  canPost,
}: InventoryWorkspaceProps) {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const code = typeof router.query.code === "string" ? router.query.code : "";
  const section = Object.entries(inventorySections).find(
    ([, value]) => value === view,
  )![0];
  const base = `/persediaan/${section}`;
  const showingDetail = router.pathname.endsWith("/detail");
  const options = useInventoryOptions(outletId);
  const materials = useInventoryList<InventoryMaterial>(
    outletId,
    "materials",
    { search: code, status: "all", locationId: "", page: 1 },
    view === "materials" && !!id,
  );
  const detail = useInventoryDetail(
    outletId,
    view !== "materials" && !showingDetail ? id : undefined,
  );
  const material = materials.data?.items.find((item) => item.id === id);
  const editing = !!id && !showingDetail;
  const loading =
    options.isPending ||
    (!showingDetail &&
      id &&
      (view === "materials"
        ? materials.isPending || materials.isFetching
        : detail.isPending || detail.isFetching));
  const error =
    options.error ??
    (!showingDetail && id
      ? view === "materials"
        ? materials.error
        : detail.error
      : null);
  const cancel = () => {
    void router.push(base);
  };
  const common = {
    outletId,
    options: options.data!,
    onCancel: cancel,
    onSaved: (savedId: string) => {
      void router.push(
        view === "materials"
          ? `${base}?saved=1`
          : `${base}/detail?id=${savedId}`,
      );
    },
  };
  return (
    <FormPageFrame backHref={base} backLabel="Kembali ke daftar">
      {loading ? (
        <p role="status">Memuat form…</p>
      ) : error ? (
        <div role="alert" className="ui-alert ui-alert-destructive">
          <p>{inventoryError(error)}</p>
          <button
            className="ui-button ui-button-secondary"
            onClick={() => {
              void options.refetch();
              if (id) {
                if (view === "materials") void materials.refetch();
                else void detail.refetch();
              }
            }}
          >
            Coba lagi
          </button>
        </div>
      ) : editing &&
        (view === "materials" ? !material : !detail.data?.canEdit) ? (
        <p role="alert" className="ui-alert ui-alert-warning">
          Data tidak ditemukan atau sudah tidak dapat diedit.
        </p>
      ) : showingDetail && id && options.data ? (
        <InventoryDocumentDetail
          outletId={outletId}
          id={id}
          options={options.data}
          canManage={canManage}
          canReview={canReview}
          canPost={canPost}
          onClose={cancel}
          onEdit={() => {
            void router.push(`${base}/form?id=${id}`);
          }}
        />
      ) : (
        options.data &&
        (view === "materials" ? (
          <InventoryMaterialEditor
            key={id ?? "new"}
            {...common}
            material={material}
          />
        ) : (
          <InventoryAdjustmentEditor
            key={id ?? "new"}
            {...common}
            waste={
              view === "waste" ||
              (!!detail.data && detail.data.document.kind !== "manual")
            }
            detail={detail.data}
          />
        ))
      )}
    </FormPageFrame>
  );
}
