import { useRouter } from "next/router";
import { getAccessView } from "@/controller/auth/access-view";
import { recipeError, useRecipeRead } from "@/controller/recipes/use-recipes";
import { useErpUiState } from "@/stores/erp-ui-store";
import { PageState } from "@/components/shared/page-state";
import { FormPageFrame } from "@/components/shared/form-page-frame";
import { RecipeEditor } from "./recipe-form";
import { RecipeBatchEditor } from "./batch-form";
import type {
  RecipePageProps,
  RecipeEditorPageProps,
  RecipeOptions,
  RecipeDetail,
  RecipeBatchDetail,
} from "@/interfaces/recipes";
export function RecipeEditorPage(props: RecipePageProps) {
  const selected = useErpUiState((s) => s.selectedOutletId);
  const access = getAccessView(props.session, selected);
  if (
    !access.selected ||
    !access.permissions.includes("recipes.manage") ||
    (props.view === "batches" &&
      !access.permissions.includes("inventory.manage"))
  )
    return <PageState forbidden />;
  return (
    <Editor
      key={`${access.selected.outlet_id}-${props.view}`}
      {...props}
      outletId={access.selected.outlet_id}
    />
  );
}
function Editor({ outletId, view }: RecipeEditorPageProps) {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const base =
    view === "recipes" ? "/resep/daftar-resep" : "/resep/batch-produksi";
  const options = useRecipeRead<RecipeOptions>(outletId, "options");
  const recipe = useRecipeRead<RecipeDetail>(
    outletId,
    "detail",
    { id },
    !!id && view === "recipes",
  );
  const batch = useRecipeRead<RecipeBatchDetail>(
    outletId,
    "batch_detail",
    { id },
    !!id && view === "batches",
  );
  const detail = view === "recipes" ? recipe : batch;
  const cancel = () => {
    void router.push(base);
  };
  const common = {
    outletId,
    options: options.data!,
    onCancel: cancel,
    onSaved: () => {
      void router.push(`${base}?saved=1`);
    },
  };
  return (
    <FormPageFrame
      backHref={base}
      backLabel={view === "recipes" ? "Daftar resep" : "Produksi bahan"}
    >
      {options.isPending || (id && (detail.isPending || detail.isFetching)) ? (
        <p role="status">Memuat form…</p>
      ) : options.isError || (id && detail.isError) ? (
        <div role="alert" className="ui-alert ui-alert-destructive">
          <p>{recipeError(options.error ?? detail.error)}</p>
          <button
            className="ui-button ui-button-secondary"
            onClick={() => {
              void options.refetch();
              if (id) void detail.refetch();
            }}
          >
            Coba lagi
          </button>
        </div>
      ) : view === "batches" &&
        batch.data &&
        batch.data.batch.status !== "draft" ? (
        <p role="alert" className="ui-alert ui-alert-warning">
          Produksi yang sudah selesai atau dibatalkan tidak dapat diedit.
        </p>
      ) : (
        options.data &&
        (view === "recipes" ? (
          <RecipeEditor
            key={recipe.data?.recipe.version_id ?? "new"}
            {...common}
            detail={recipe.data}
          />
        ) : (
          <RecipeBatchEditor
            key={batch.data?.batch.id ?? "new"}
            {...common}
            detail={batch.data}
          />
        ))
      )}
    </FormPageFrame>
  );
}
