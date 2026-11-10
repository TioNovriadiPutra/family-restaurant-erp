import { Add, Trash } from "iconsax-reactjs";
import { TextField } from "@/components/shared/text-field";
import { FormSelect } from "@/components/shared/form-select";
import { RequiredMark } from "@/components/shared/required-mark";
import { useRecipeForm } from "@/hooks/recipes/use-recipe-form";
import { recipeDecimal } from "@/lib/recipes-validation";
import type { RecipeEditorProps } from "@/interfaces/recipes";
export function RecipeEditor(props: RecipeEditorProps) {
  const s = useRecipeForm(props);
  const {
    register,
    formState: { errors },
  } = s.form;
  const positive = {
    required: "Jumlah wajib diisi.",
    validate: (v: string) =>
      recipeDecimal(v) || "Gunakan angka positif, maksimal 6 desimal.",
  };
  const outputUnits = s.output
    ? s.output.units
    : props.options.units.filter((u) => u.dimension === "count");
  return (
    <form
      aria-busy={s.command.pending}
      noValidate
      className="ui-card space-y-5"
      onSubmit={s.submit}
    >
      <div>
        <h1 className="text-lg font-semibold">
          {props.detail ? "Buat versi resep baru" : "Tambah resep"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Simpan sebagai draf, periksa HPP, lalu terbitkan. Versi sebelumnya
          tetap tersimpan.
        </p>
      </div>
      <fieldset disabled={s.command.pending} className="space-y-5">
        <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            id="recipe-name"
            label="Nama resep"
            required
            maxLength={120}
            error={errors.name?.message}
            {...register("name", {
              required: "Nama resep wajib diisi.",
              validate: (v) =>
                v.trim().length >= 2 || "Nama minimal 2 karakter.",
            })}
          />
          <TextField
            id="recipe-category"
            label="Kategori"
            required
            maxLength={80}
            error={errors.category?.message}
            {...register("category", {
              required: "Kategori wajib diisi.",
              validate: (v) => Boolean(v.trim()) || "Kategori wajib diisi.",
            })}
          />
          <div className="ui-field">
            <label htmlFor="recipe-output" className="ui-label">
              Hasil produksi stok
            </label>
            <FormSelect
              id="recipe-output"
              control={s.form.control}
              name="outputItemId"
              disabled={Boolean(props.detail)}
              onValueChange={s.changeOutput}
            >
              <option value="">Resep sajian (tanpa hasil stok)</option>
              {props.options.items
                .filter((i) => i.kind !== "raw")
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
            </FormSelect>
            <p className="text-xs text-muted-foreground">
              Untuk bumbu/setengah jadi, buat bahan hasilnya di Master bahan
              terlebih dahulu.
            </p>
          </div>
          <TextField
            id="recipe-yield"
            label="Hasil bersih resep"
            inputMode="decimal"
            required
            error={errors.yield?.message}
            {...register("yield", positive)}
          />
          <div className="ui-field">
            <label htmlFor="recipe-output-unit" className="ui-label">
              Satuan hasil
              <RequiredMark />
            </label>
            <FormSelect
              id="recipe-output-unit"
              control={s.form.control}
              name="outputUnitId"
              required
            >
              <option value="">Pilih satuan</option>
              {outputUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.code === "pcs" && !s.output ? "pcs / porsi" : u.code}
                </option>
              ))}
            </FormSelect>
            <p className="text-xs text-muted-foreground">
              Seluruh bahan di bawah menghasilkan jumlah bersih ini.
            </p>
          </div>
          <TextField
            id="recipe-gross"
            label="Hasil sebelum susut (opsional)"
            inputMode="decimal"
            error={errors.grossYield?.message}
            {...register("grossYield", {
              validate: (v) =>
                v === "" ||
                (recipeDecimal(v) &&
                  Number(v) >= Number(s.form.getValues("yield"))) ||
                "Hasil kotor minimal sama dengan hasil bersih.",
            })}
          />
          <TextField
            id="recipe-price"
            label="Harga jual acuan (opsional)"
            inputMode="decimal"
            error={errors.referencePrice?.message}
            {...register("referencePrice", {
              validate: (v) =>
                v === "" ||
                recipeDecimal(v, 1000000000) ||
                "Isi harga positif.",
            })}
          />
          <TextField
            id="recipe-target"
            label="Target food cost (%)"
            required
            inputMode="decimal"
            error={errors.targetPercent?.message}
            {...register("targetPercent", {
              required: "Target wajib diisi.",
              validate: (v) =>
                recipeDecimal(v, 100) || "Isi angka lebih dari 0 sampai 100.",
            })}
          />
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold">Komposisi bahan mentah</h3>
          {s.lines.fields.map((field, index) => {
            const item = props.options.items.find(
              (i) => i.id === s.values.lines?.[index]?.itemId,
            );
            return (
              <div
                key={field.id}
                className="grid items-start gap-3 rounded-control border border-border p-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_44px]"
              >
                <div className="ui-field">
                  <label htmlFor={`recipe-item-${index}`} className="ui-label">
                    Bahan {index + 1}
                    <RequiredMark />
                  </label>
                  <FormSelect
                    id={`recipe-item-${index}`}
                    control={s.form.control}
                    name={`lines.${index}.itemId`}
                    required
                    onValueChange={(id) =>
                      s.form.setValue(
                        `lines.${index}.unitId`,
                        props.options.items.find((i) => i.id === id)
                          ?.baseUnitId ?? "",
                        { shouldValidate: true },
                      )
                    }
                  >
                    <option value="">Pilih bahan</option>
                    {props.options.items
                      .filter((i) => i.id !== s.values.outputItemId)
                      .map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                  </FormSelect>
                </div>
                <TextField
                  id={`recipe-quantity-${index}`}
                  label={`Jumlah bahan ${index + 1}`}
                  inputMode="decimal"
                  required
                  error={errors.lines?.[index]?.quantity?.message}
                  {...register(`lines.${index}.quantity`, positive)}
                />
                <div className="ui-field">
                  <label htmlFor={`recipe-unit-${index}`} className="ui-label">
                    Satuan bahan {index + 1}
                    <RequiredMark />
                  </label>
                  <FormSelect
                    id={`recipe-unit-${index}`}
                    control={s.form.control}
                    name={`lines.${index}.unitId`}
                    required
                  >
                    <option value="">Pilih satuan</option>
                    {item?.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.code}
                      </option>
                    ))}
                  </FormSelect>
                </div>
                <button
                  type="button"
                  className="ui-button ui-button-ghost min-h-11 !px-2 sm:mt-6 max-sm:justify-self-end max-sm:w-11"
                  aria-label={`Hapus bahan ${index + 1}`}
                  disabled={s.lines.fields.length === 1}
                  onClick={() => s.lines.remove(index)}
                >
                  <Trash size={19} aria-hidden />
                </button>
              </div>
            );
          })}
          <button
            type="button"
            className="ui-button ui-button-secondary"
            disabled={s.lines.fields.length >= 100}
            onClick={() =>
              s.lines.append({ itemId: "", unitId: "", quantity: "" })
            }
          >
            <Add size={18} aria-hidden />
            Tambah bahan resep
          </button>
        </div>
        <TextField
          id="recipe-notes"
          label="Catatan resep (opsional)"
          maxLength={1000}
          {...register("notes")}
        />
      </fieldset>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          Periksa kolom wajib dan jumlah setiap bahan.
        </p>
      )}
      {s.command.error && (
        <p role="alert" className="ui-alert ui-alert-destructive">
          {s.command.error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          Harga acuan tidak mengubah harga jual menu POS.
        </p>
        <div className="flex gap-3">
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
            disabled={s.command.pending}
          >
            {s.command.pending ? "Menyimpan…" : "Simpan draf resep"}
          </button>
        </div>
      </div>
    </form>
  );
}
