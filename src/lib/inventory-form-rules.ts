export const inventoryDecimalRule = {
  pattern: {
    value: /^\d{1,9}(\.\d{1,6})?$/,
    message: "Gunakan angka dengan maksimal 6 desimal.",
  },
};
export const inventoryPositiveRule = {
  ...inventoryDecimalRule,
  required: "Kolom ini wajib diisi.",
  validate: (value: string) =>
    Number(value) > 0 || "Jumlah harus lebih dari nol.",
};
export const inventoryNonnegativeRule = {
  ...inventoryDecimalRule,
  required: "Kolom ini wajib diisi.",
  validate: (value: string) =>
    Number(value) >= 0 || "Jumlah tidak boleh negatif.",
};
