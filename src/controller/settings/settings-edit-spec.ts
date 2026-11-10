import type { SettingsEditSpec, SettingsField } from "@/interfaces/settings-ui";
import type {
  SettingsProfile,
  SettingsReceipt,
  SettingsMenu,
  SettingsOptions,
  SettingsPayment,
  SettingsPayments,
  SettingsCategory,
} from "@/interfaces/settings";
const yes = (key: string, label: string): SettingsField => ({
  key,
  label,
  type: "checkbox",
});
const text = (key: string, label: string, required = true): SettingsField => ({
  key,
  label,
  required,
});
const choices = (
  key: string,
  label: string,
  values: string[],
): SettingsField => ({
  key,
  label,
  required: true,
  choices: values.map((id) => ({
    id,
    name:
      (
        {
          nearest_1: "Tanpa pembulatan",
          nearest_100: "Kelipatan Rp100",
          nearest_500: "Kelipatan Rp500",
          nearest_1000: "Kelipatan Rp1.000",
          cash: "Tunai",
          qris: "QRIS",
          edc: "Kartu / EDC",
        } as Record<string, string>
      )[id] ?? id,
  })),
});
export function profileSpec(d: SettingsProfile): SettingsEditSpec {
  return {
    action: "profile",
    title: "Edit profil restoran",
    values: {
      revision: d.revision,
      restaurantName: d.restaurantName,
      outletName: d.outletName,
      address: d.address,
      phone: d.phone,
      timezone: d.timezone,
      taxPercent: String(Number(d.taxPercent)),
      servicePercent: String(Number(d.servicePercent)),
      rounding: d.rounding,
    },
    fields: [
      {
        ...text("restaurantName", "Nama restoran"),
        disabled: !d.canRenameRestaurant,
      },
      text("outletName", "Nama lokasi"),
      { key: "address", label: "Alamat", type: "textarea" },
      text("phone", "Nomor HP Indonesia", false),
      {
        ...choices("timezone", "Zona waktu", [
          "Asia/Jakarta",
          "Asia/Makassar",
          "Asia/Jayapura",
        ]),
        disabled: d.timezoneLocked,
      },
      text("taxPercent", "Pajak (%)"),
      text("servicePercent", "Layanan (%)"),
      choices("rounding", "Pembulatan rupiah", [
        "nearest_1",
        "nearest_100",
        "nearest_500",
        "nearest_1000",
      ]),
    ],
  };
}
export function receiptSpec(d: SettingsReceipt): SettingsEditSpec {
  return {
    action: "receipt",
    title: "Preferensi struk",
    values: {
      revision: d.revision,
      header: d.header,
      footer: d.footer,
      paperWidth: d.paperWidth,
      digitalEnabled: d.digitalEnabled,
      printerId: d.printerId ?? "",
    },
    fields: [
      { key: "header", label: "Teks pembuka", type: "textarea" },
      { key: "footer", label: "Teks penutup", type: "textarea" },
      choices("paperWidth", "Lebar kertas (mm)", ["58", "80"]),
      {
        key: "printerId",
        label: "Printer",
        choices: [{ id: "", name: "Belum dipilih" }, ...d.printers],
      },
      yes("digitalEnabled", "Aktifkan preferensi struk digital"),
    ],
  };
}
export function menuSpec(
  o: SettingsOptions,
  m?: SettingsMenu,
): SettingsEditSpec {
  return {
    action: "menu",
    title: m ? "Edit menu" : "Tambah menu",
    values: {
      ...(m ? { id: m.id, revision: m.revision } : {}),
      name: m?.name ?? "",
      categoryId: m?.categoryId ?? "",
      description: m?.description ?? "",
      allergens: m?.allergens ?? "",
      price: m?.price ?? "",
      active: m?.active ?? true,
      available: m?.available ?? true,
      recipeId: m?.recipeId ?? "",
      portions: m?.portions ?? "1",
      taxExempt: m?.taxExempt ?? false,
      serviceExempt: m?.serviceExempt ?? false,
    },
    fields: [
      text("name", "Nama menu"),
      {
        key: "categoryId",
        label: "Kategori",
        required: true,
        choices: o.categories.map((c) => ({ id: c.id, name: c.name })),
      },
      { ...text("price", "Harga jual (Rp)"), type: "currency" },
      {
        key: "description",
        label: "Deskripsi",
        type: "textarea",
        maxLength: 1000,
      },
      text("allergens", "Informasi alergen", false),
      {
        key: "recipeId",
        label: "Resep sajian",
        disabled: !o.canLinkRecipe,
        choices: [
          { id: "", name: "Belum dihubungkan" },
          ...o.recipes,
          ...(m?.recipeId && !o.recipes.some((r) => r.id === m.recipeId)
            ? [{ id: m.recipeId, name: m.recipeName ?? "Resep saat ini" }]
            : []),
        ],
      },
      text("portions", "Porsi resep per menu"),
      yes("active", "Menu aktif"),
      yes("available", "Tersedia di lokasi ini"),
      yes("taxExempt", "Bebas pajak"),
      yes("serviceExempt", "Bebas biaya layanan"),
    ],
  };
}
export function categorySpec(c?: SettingsCategory): SettingsEditSpec {
  return {
    action: "category",
    title: c ? "Edit kategori" : "Tambah kategori",
    values: {
      ...(c ? { id: c.id, revision: c.revision } : {}),
      name: c?.name ?? "",
      kind: c?.kind ?? "food",
      sortOrder: c?.sortOrder ?? 0,
      active: c?.active ?? true,
      visible: c?.visible ?? true,
    },
    fields: [
      text("name", "Nama kategori"),
      {
        key: "kind",
        label: "Jenis",
        required: true,
        choices: [
          { id: "food", name: "Makanan" },
          { id: "drink", name: "Minuman" },
          { id: "snack", name: "Camilan" },
        ],
      },
      { key: "sortOrder", label: "Urutan", type: "number", required: true },
      yes("active", "Kategori aktif"),
      yes("visible", "Tampil di POS"),
    ],
  };
}
export function paymentSpec(
  o: SettingsPayments,
  m?: SettingsPayment,
): SettingsEditSpec {
  return {
    action: "payment",
    title: m ? "Edit metode pembayaran" : "Tambah metode pembayaran",
    values: {
      ...(m ? { id: m.id, revision: m.revision } : {}),
      name: m?.name ?? "",
      kind: m?.kind ?? "cash",
      provider: m?.provider ?? "",
      merchantScope: m?.merchantScope ?? "",
      accountId: m?.accountId ?? "",
      active: m?.active ?? true,
    },
    fields: [
      text("name", "Nama metode"),
      { ...choices("kind", "Jenis", ["cash", "qris", "edc"]), disabled: !!m },
      {
        key: "accountId",
        label: "Akun dana (wajib untuk tunai)",
        disabled: m?.used,
        choices: [{ id: "", name: "Pilih akun untuk tunai" }, ...o.accounts],
      },
      text("provider", "Penyedia (wajib QRIS / EDC)", false),
      text("merchantScope", "ID merchant (wajib QRIS / EDC)", false),
      yes("active", "Metode aktif"),
    ],
  };
}
