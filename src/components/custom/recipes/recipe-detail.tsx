import { DataTable, DataTableHead } from '@/components/shared/data-table';
import { SectionTitle } from '@/components/shared/page-heading';
import { Book1, Edit2, Clock, TickCircle } from "iconsax-reactjs";
import {
  recipeDate,
  recipeError,
  recipeMoney,
  recipePercent,
  recipeQuantity,
  recipeStatus,
} from "@/controller/recipes/use-recipes";
import { useRecipeDetail } from "@/hooks/recipes/use-recipe-detail";
import { RecipeCostTable } from "./cost-table";
import type { RecipeDetailProps } from "@/interfaces/recipes";
export function RecipeDetailPanel(props: RecipeDetailProps) {
  const s = useRecipeDetail(props);
  if (s.query.isPending)
    return (
      <p role="status" className="ui-card">
        Memuat rincian resep…
      </p>
    );
  if (s.query.isError || !s.query.data)
    return (
      <div className="ui-alert ui-alert-destructive">
        <p>{recipeError(s.query.error)}</p>
        <button
          className="ui-button ui-button-secondary w-fit"
          onClick={() => s.query.refetch()}
        >
          Coba lagi
        </button>
      </div>
    );
  const detail = s.query.data;
  const r = detail.recipe;
  const c = detail.cost;
  return (
    <section aria-label="Detail resep" className="space-y-4">
      <div className="ui-card flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-14 text-muted-foreground">
            <Book1 size={18} aria-hidden />
            {r.code} · Versi {r.version}
            <span
              className={`ui-badge ${r.status === "published" ? "ui-badge-success" : "ui-badge-neutral"}`}
            >
              {recipeStatus[r.status]}
            </span>
            {!r.active && (
              <span className="ui-badge ui-badge-warning">Nonaktif</span>
            )}
          </div>
          <SectionTitle className="">{r.name}</SectionTitle>
          <p className="mt-1 text-14 text-muted-foreground">
            {r.category} · Hasil {recipeQuantity(r.yield)} {r.unit}
            {r.output_name ? ` · Produksi ${r.output_name}` : " · Resep sajian"}
          </p>
        </div>
        <button
          type="button"
          className="ui-button ui-button-secondary"
          onClick={props.onClose}
        >
          Tutup detail
        </button>
      </div>
      {s.notice && (
        <p role="status" className="ui-alert ui-alert-success">
          {s.notice}
        </p>
      )}
      {s.command.error && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          {s.command.error}
        </p>
      )}
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <RecipeCostTable cost={c} unit={r.unit} yieldQuantity={r.yield} />
        <aside className="ui-card space-y-5">
          <div>
            <h3 className="font-semibold">
              HPP per {r.unit === "pcs" ? "porsi" : r.unit}
            </h3>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {c.perOutput === null
                ? "Belum lengkap"
                : recipeMoney(c.perOutput)}
            </p>
            <p className="mt-2 text-13 text-muted-foreground">
              Estimasi saat ini · rata-rata tertimbang outlet
            </p>
          </div>
          <dl className="space-y-2 text-14">
            <div className="flex justify-between gap-3">
              <dt>Total bahan</dt>
              <dd>{c.total === null ? "—" : recipeMoney(c.total)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Hasil bersih</dt>
              <dd>
                {recipeQuantity(r.yield)} {r.unit}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Harga jual acuan</dt>
              <dd>
                {r.reference_price
                  ? recipeMoney(r.reference_price)
                  : "Belum diisi"}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-border pt-3">
              <dt>Food cost</dt>
              <dd>{c.foodCost === null ? "—" : recipePercent(c.foodCost)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Margin kotor / hasil</dt>
              <dd>{c.margin === null ? "—" : recipeMoney(c.margin)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Target food cost</dt>
              <dd>{recipePercent(r.target_rate, true)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Harga minimum acuan</dt>
              <dd>
                {c.minimumPrice === null ? "—" : recipeMoney(c.minimumPrice)}
              </dd>
            </div>
          </dl>
          <p className="text-13 text-muted-foreground">
            Belum termasuk gaji, sewa, pajak, dan biaya operasional. Harga acuan
            tidak mengubah harga menu.
          </p>
          <div className="grid gap-2">
            {props.canManage && (
              <>
                <button
                  type="button"
                  className="ui-button ui-button-primary"
                  disabled={s.command.pending || !c.complete}
                  onClick={() => s.run("snapshot")}
                >
                  Simpan snapshot HPP
                </button>
                {r.status === "draft" && (
                  <button
                    type="button"
                    className="ui-button ui-button-secondary"
                    disabled={s.command.pending || !r.active}
                    onClick={() => s.run("publish")}
                  >
                    <TickCircle size={18} aria-hidden />
                    Terbitkan resep
                  </button>
                )}
                <button
                  type="button"
                  className="ui-button ui-button-secondary"
                  disabled={s.command.pending}
                  onClick={() => props.onEdit(detail)}
                >
                  <Edit2 size={18} aria-hidden />
                  Buat versi baru
                </button>
                <button
                  type="button"
                  className="ui-button ui-button-ghost"
                  disabled={s.command.pending}
                  onClick={() => s.run("active")}
                >
                  {r.active ? "Nonaktifkan resep" : "Aktifkan resep"}
                </button>
              </>
            )}
            <button
              type="button"
              className="ui-button ui-button-secondary"
              onClick={() => props.onHistory(r.id)}
            >
              <Clock size={18} aria-hidden />
              Lihat riwayat biaya
            </button>
          </div>
        </aside>
      </div>
      {r.notes && <p className="ui-card text-14">{r.notes}</p>}
      <div className="ui-table-container">
        <DataTable className="min-w-[680px]">
          <caption className="p-4 text-left font-semibold">Versi resep</caption>
          <thead>
            <tr>
              <DataTableHead scope="col">Versi</DataTableHead>
              <DataTableHead scope="col">Hasil</DataTableHead>
              <DataTableHead scope="col">Status</DataTableHead>
              <DataTableHead scope="col">Dibuat</DataTableHead>
              <DataTableHead scope="col">Berlaku mulai</DataTableHead>
            </tr>
          </thead>
          <tbody>
            {detail.versions.map((v) => (
              <tr key={v.id}>
                <th scope="row">v{v.version}</th>
                <td>
                  {recipeQuantity(v.yield)} {v.unit}
                </td>
                <td>{recipeStatus[v.status]}</td>
                <td>{recipeDate(v.createdAt)}</td>
                <td>{recipeDate(v.effectiveFrom)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    </section>
  );
}
