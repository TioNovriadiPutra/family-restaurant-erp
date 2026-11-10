import { TextField } from "@/components/shared/text-field";
import { FormSelect } from "@/components/shared/form-select";
import { RequiredMark } from "@/components/shared/required-mark";
import { useBatchForm } from "@/hooks/recipes/use-batch-form";
import { recipeDecimal } from "@/lib/recipes-validation";
import type { RecipeBatchEditorProps } from "@/interfaces/recipes";
export function RecipeBatchEditor(props: RecipeBatchEditorProps) {
  const s = useBatchForm(props);
  const {
    register,
    formState: { errors },
  } = s.form;
  const positive = {
    required: "Jumlah wajib diisi.",
    validate: (v: string) =>
      recipeDecimal(v) || "Isi angka positif maksimal 6 desimal.",
  };
  const unit =
    s.choice?.outputUnit ?? props.detail?.batch.unit ?? "satuan dasar";
  return (
    <form
      aria-busy={s.command.pending}
      noValidate
      className="ui-card space-y-5"
      onSubmit={s.submit}
    >
      <div>
        <h1 className="text-lg font-semibold">
          {props.detail ? "Edit draf produksi" : "Catat produksi bahan"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Draf belum mengubah stok. Periksa pemakaian aktual sebelum posting
          produksi.
        </p>
      </div>
      {!props.options.recipes.length && !props.detail && (
        <p className="ui-alert ui-alert-info">
          Belum ada resep produksi aktif. Buat resep dengan hasil stok setengah
          jadi, lalu terbitkan terlebih dahulu.
        </p>
      )}
      <fieldset disabled={s.command.pending} className="space-y-5">
        <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="ui-field">
            <label htmlFor="batch-recipe" className="ui-label">
              Resep produksi
              <RequiredMark />
            </label>
            <FormSelect
              id="batch-recipe"
              control={s.form.control}
              name="recipeVersionId"
              required
              disabled={Boolean(props.detail)}
              onValueChange={s.select}
            >
              <option value="">Pilih resep diterbitkan</option>
              {props.options.recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {`${r.name} · v${r.version}`}
                </option>
              ))}
              {props.detail && !s.choice && (
                <option value={props.detail.batch.recipe_version_id}>
                  {`${props.detail.batch.recipe_name} · v${props.detail.batch.recipe_version}`}
                </option>
              )}
            </FormSelect>
          </div>
          <div className="ui-field">
            <label htmlFor="batch-source" className="ui-label">
              Lokasi bahan
              <RequiredMark />
            </label>
            <FormSelect
              id="batch-source"
              control={s.form.control}
              name="sourceLocationId"
              required
            >
              <option value="">Pilih lokasi</option>
              {props.options.locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </FormSelect>
          </div>
          <div className="ui-field">
            <label htmlFor="batch-output" className="ui-label">
              Lokasi hasil
              <RequiredMark />
            </label>
            <FormSelect
              id="batch-output"
              control={s.form.control}
              name="outputLocationId"
              required
            >
              <option value="">Pilih lokasi</option>
              {props.options.locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </FormSelect>
          </div>
          <TextField
            id="batch-target"
            label={`Target hasil (${unit})`}
            required
            inputMode="decimal"
            error={errors.target?.message}
            {...register("target", positive)}
          />
          <TextField
            id="batch-actual"
            label={`Hasil bersih aktual (${unit})`}
            required
            inputMode="decimal"
            error={errors.actual?.message}
            {...register("actual", positive)}
          />
          <TextField
            id="batch-date"
            label="Tanggal produksi"
            required
            type="date"
            max={s.today}
            error={errors.date?.message}
            {...register("date", { required: "Tanggal wajib diisi." })}
          />
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">Bahan yang benar-benar dipakai</h3>
            {s.choice && (
              <button
                type="button"
                className="ui-button ui-button-secondary"
                onClick={() =>
                  s.seed(
                    s.form.getValues("recipeVersionId"),
                    s.form.getValues("target"),
                  )
                }
              >
                Isi ulang sesuai target
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Jumlah memakai satuan dasar bahan. Perubahan target tidak menimpa
            input aktual secara otomatis.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {s.fields.fields.map((field, index) => {
              const info =
                s.choice?.lines.find(
                  (l) => l.componentId === field.componentId,
                ) ??
                props.detail?.lines.find(
                  (l) => l.componentId === field.componentId,
                );
              return (
                <TextField
                  key={field.id}
                  id={`batch-input-${index}`}
                  label={`${info?.name ?? "Bahan"} (${info?.unit ?? "satuan dasar"})`}
                  required
                  inputMode="decimal"
                  error={errors.lines?.[index]?.quantityBase?.message}
                  {...register(`lines.${index}.quantityBase`, positive)}
                />
              );
            })}
          </div>
        </div>
        <TextField
          id="batch-notes"
          label="Catatan produksi (opsional)"
          maxLength={1000}
          {...register("notes")}
        />
      </fieldset>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          Lengkapi resep, lokasi, hasil, tanggal, dan pemakaian bahan.
        </p>
      )}
      {s.command.error && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          {s.command.error}
        </p>
      )}
      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          className="ui-button ui-button-secondary"
          disabled={s.command.pending}
          onClick={props.onCancel}
        >
          Batal
        </button>
        <button
          className="ui-button ui-button-primary"
          disabled={s.command.pending || !s.fields.fields.length}
        >
          {s.command.pending ? "Menyimpan…" : "Simpan draf produksi"}
        </button>
      </div>
    </form>
  );
}
