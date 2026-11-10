import Link from "next/link";
import { useRouter } from "next/router";
import {
  Add,
  ArrowLeft2,
  Book1,
  Clock,
  Layer,
  SearchNormal1,
} from "iconsax-reactjs";
import { getAccessView } from "@/controller/auth/access-view";
import { recipeError, useRecipeRead } from "@/controller/recipes/use-recipes";
import { useErpUiState } from "@/stores/erp-ui-store";
import { useRecipeWorkspace } from "@/hooks/recipes/use-recipe-workspace";
import { PageState } from "@/components/shared/page-state";
import { SelectInput } from "@/components/shared/select-input";
import { RecipeDetailPanel } from "./recipe-detail";
import { RecipeBatchPanel } from "./batch-detail";
import { RecipeSnapshotPanel } from "./snapshot-detail";
import { RecipeRecordsTable } from "./recipe-tables";
import { RecipeIngredientHistory } from "./ingredient-history";
import type {
  RecipeBatch,
  RecipeHistory,
  RecipeList,
  RecipeOptions,
  RecipePageProps,
  RecipeRecord,
  RecipeWorkspaceProps,
} from "@/interfaces/recipes";
const screens = {
  recipes: {
    title: "Resep & HPP",
    description:
      "Susun komposisi, hasil bersih, dan biaya bahan untuk setiap resep.",
    icon: Book1,
  },
  history: {
    title: "Riwayat biaya",
    description:
      "Bandingkan HPP yang tersimpan dan telusuri dokumen perubahan biaya bahan.",
    icon: Clock,
  },
  batches: {
    title: "Produksi bahan",
    description:
      "Catat pemakaian bahan dan hasil aktual persiapan dapur dalam satu kali pembuatan.",
    icon: Layer,
  },
};
export function RecipesPage(props: RecipePageProps) {
  const selected = useErpUiState((s) => s.selectedOutletId);
  const access = getAccessView(props.session, selected);
  if (
    !access.selected ||
    !access.permissions.includes("recipes.read") ||
    (props.view === "batches" && !access.permissions.includes("inventory.read"))
  )
    return <PageState forbidden />;
  const canManage = access.permissions.includes("recipes.manage");
  const canProduce =
    canManage && access.permissions.includes("inventory.manage");
  return (
    <RecipesWorkspace
      key={`${access.selected.outlet_id}-${props.view}`}
      {...props}
      outletId={access.selected.outlet_id}
      canManage={canManage}
      canProduce={canProduce}
      canPost={canProduce && access.permissions.includes("finance.manage")}
    />
  );
}
function RecipesWorkspace(props: RecipeWorkspaceProps) {
  const router = useRouter();
  const preset =
    typeof router.query.recipeId === "string"
      ? router.query.recipeId
      : undefined;
  const s = useRecipeWorkspace(preset);
  const { outletId, view } = props;
  const screen = screens[view];
  const Icon = screen.icon;
  const options = useRecipeRead<RecipeOptions>(outletId, "options");
  const query = useRecipeRead<
    RecipeList<RecipeRecord | RecipeHistory | RecipeBatch>
  >(outletId, view, s.filters);
  const statuses =
    view === "recipes"
      ? [
          ["all", "Semua status"],
          ["active", "Aktif"],
          ["inactive", "Nonaktif"],
          ["draft", "Draf"],
          ["published", "Diterbitkan"],
        ]
      : [
          ["all", "Semua status"],
          ["draft", "Draf"],
          ["posted", "Diposting"],
          ["cancelled", "Dibatalkan"],
        ];
  return (
    <div className="space-y-5">
      <Link
        href="/resep"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft2 size={16} aria-hidden />
        Resep & HPP
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-control border border-border bg-secondary text-primary">
            <Icon size={22} aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {screen.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {screen.description}
            </p>
          </div>
        </div>
        {view !== "history" &&
          (view === "recipes" ? props.canManage : props.canProduce) && (
            <button
              type="button"
              className="ui-button ui-button-primary"
              disabled={!options.data}
              onClick={() => {
                void router.push(`${router.asPath.split("?")[0]}/form`);
              }}
            >
              <Add size={18} aria-hidden />
              {view === "recipes" ? "Tambah resep" : "Catat produksi"}
            </button>
          )}
      </div>
      {router.query.saved === "1" && (
        <p role="status" className="ui-alert ui-alert-success">
          Data berhasil disimpan.
        </p>
      )}
      {options.isError && (
        <div className="ui-alert ui-alert-destructive">
          <p>{recipeError(options.error)}</p>
          <button
            className="ui-button ui-button-secondary w-fit"
            onClick={() => options.refetch()}
          >
            Muat pilihan kembali
          </button>
        </div>
      )}
      {s.detailId &&
        (view === "recipes" ? (
          <RecipeDetailPanel
            key={s.detailId}
            outletId={outletId}
            id={s.detailId}
            canManage={props.canManage}
            onClose={() => s.setDetailId(undefined)}
            onEdit={(d) => {
              void router.push(`/resep/daftar-resep/form?id=${d.recipe.id}`);
            }}
            onHistory={(id) =>
              router.push({
                pathname: "/resep/riwayat-biaya",
                query: { recipeId: id },
              })
            }
          />
        ) : view === "history" ? (
          <RecipeSnapshotPanel
            outletId={outletId}
            id={s.detailId}
            onClose={() => s.setDetailId(undefined)}
          />
        ) : (
          <RecipeBatchPanel
            key={s.detailId}
            outletId={outletId}
            id={s.detailId}
            canProduce={props.canProduce}
            canPost={props.canPost}
            onClose={() => s.setDetailId(undefined)}
            onEdit={(d) => {
              void router.push(`/resep/batch-produksi/form?id=${d.batch.id}`);
            }}
          />
        ))}
      {
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <div className="ui-card !p-4">
            <p className="text-sm text-muted-foreground">
              {view === "recipes"
                ? "Resep sesuai filter"
                : view === "history"
                  ? "Snapshot tersimpan"
                  : "Produksi sesuai filter"}
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {query.data?.total ?? "—"}
            </p>
          </div>
          <div className="ui-card !p-4">
            <p className="text-sm text-muted-foreground">Metode biaya</p>
            <p className="mt-2 font-semibold">Rata-rata tertimbang</p>
          </div>
          <div className="ui-card !p-4 max-lg:col-span-2">
            <p className="text-sm text-muted-foreground">
              {view === "batches" ? "Perubahan stok" : "Dasar perhitungan"}
            </p>
            <p className="mt-2 font-semibold">
              {view === "batches"
                ? "Setelah produksi diselesaikan"
                : view === "history"
                  ? "Biaya saat snapshot disimpan"
                  : "Komposisi ÷ hasil bersih"}
            </p>
          </div>
        </div>
      }
      <section
        aria-label={`Daftar ${screen.title.toLowerCase()}`}
        className="ui-table-container"
      >
        <div className="flex flex-wrap items-end justify-between gap-3 p-4">
          <div className="ui-field w-full sm:max-w-sm">
            <label htmlFor="recipe-search" className="ui-label">
              Cari {view === "batches" ? "produksi" : "resep"}
            </label>
            <div className="relative">
              <SearchNormal1
                aria-hidden
                size={17}
                className="pointer-events-none absolute left-3 top-3 text-muted-foreground"
              />
              <input
                id="recipe-search"
                type="search"
                className="ui-input !pl-10"
                maxLength={120}
                value={s.filters.search}
                onChange={(e) => s.change("search", e.target.value)}
              />
            </div>
          </div>
          {view !== "history" && (
            <SelectInput
              className="ui-input w-full sm:!w-52"
              aria-label="Filter status resep"
              value={s.filters.status}
              onValueChange={(v) => s.change("status", v)}
            >
              {statuses.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectInput>
          )}
          {view === "history" && s.filters.recipeId && (
            <button
              className="ui-button ui-button-secondary"
              onClick={() => {
                s.setFilters((f) => ({ ...f, recipeId: undefined, page: 1 }));
                router.replace("/resep/riwayat-biaya", undefined, {
                  shallow: true,
                });
              }}
            >
              Tampilkan semua resep
            </button>
          )}
        </div>
        {query.isPending ? (
          <p role="status" className="p-8 text-center text-muted-foreground">
            Memuat data…
          </p>
        ) : query.isError ? (
          <div className="ui-alert ui-alert-destructive m-4">
            <p>{recipeError(query.error)}</p>
            <button
              className="ui-button ui-button-secondary w-fit"
              onClick={() => query.refetch()}
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <>
            <RecipeRecordsTable
              view={view}
              items={query.data.items}
              onOpen={s.setDetailId}
            />
            <div className="ui-pagination">
              <span>
                {query.data.total
                  ? `${(s.filters.page - 1) * 20 + 1}–${Math.min(s.filters.page * 20, query.data.total)}`
                  : "0"}{" "}
                dari {query.data.total} hasil
              </span>
              <div className="flex gap-2">
                <button
                  className="ui-button ui-button-secondary"
                  disabled={s.filters.page === 1 || query.isFetching}
                  onClick={() =>
                    s.setFilters((f) => ({ ...f, page: f.page - 1 }))
                  }
                >
                  Sebelumnya
                </button>
                <button
                  className="ui-button ui-button-secondary"
                  disabled={
                    s.filters.page * 20 >= query.data.total || query.isFetching
                  }
                  onClick={() =>
                    s.setFilters((f) => ({ ...f, page: f.page + 1 }))
                  }
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      {view === "history" && s.filters.recipeId && (
        <RecipeIngredientHistory
          outletId={outletId}
          recipeId={s.filters.recipeId}
        />
      )}
      {view === "history" && (
        <p className="text-sm text-muted-foreground">
          Riwayat berisi snapshot yang sengaja disimpan. Pembelian baru
          memperbarui estimasi HPP saat ini, tetapi tidak menulis ulang snapshot
          lama.
        </p>
      )}
    </div>
  );
}
