export function rupiah(amount: string | null) {
  if (amount === null) return "—";
  const negative = amount.startsWith("-");
  const [whole, fraction = ""] = amount.replace(/^-/, "").split(".");
  const decimals = fraction.slice(0, 2).padEnd(2, "0");
  return `${negative ? "−" : ""}Rp${BigInt(whole).toLocaleString("id-ID")}${decimals === "00" ? "" : `,${decimals}`}`;
}

export function dateLabel(day: string) {
  // SQL already converted this date to the outlet's calendar; do not shift it twice.
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T12:00:00Z`));
}

export function costDetail(
  cost: string | null,
  profit: string | null,
  revenue: string,
) {
  if (cost === null || profit === null)
    return "HPP belum lengkap atau terdapat retur";
  const margin =
    Number(revenue) > 0
      ? ` · ${new Intl.NumberFormat("id-ID", { style: "percent", maximumFractionDigits: 0 }).format(Number(profit) / Number(revenue))}`
      : "";
  return `HPP ${rupiah(cost)}${margin}`;
}

export function activityLabel(
  action: string,
  entity: string,
  number: string | null,
) {
  const names: Record<string, string> = {
    orders: "Penjualan",
    order: "Penjualan",
    goods_receipts: "Penerimaan",
    stock_counts: "Opname",
    menu_prices: "Harga menu",
    stock_items: "Bahan",
  };
  const actions: Record<string, string> = {
    created: "dibuat",
    create: "dibuat",
    updated: "diperbarui",
    update: "diperbarui",
    posted: "diposting",
    post: "diposting",
    verified: "diverifikasi",
    verify: "diverifikasi",
  };
  return `${names[entity] ?? "Dokumen"}${number ? ` ${number}` : ""} ${actions[action] ?? "diperbarui"}`;
}

export function menuPerformanceRows(
  items: import("@/interfaces/dashboard").TopMenu[],
): import("@/interfaces/dashboard").DashboardMenuRow[] {
  const maximum = Math.max(...items.map((item) => Number(item.quantity)), 1);
  return items.map((item) => ({
    ...item,
    relativeQuantity: Math.max(
      0,
      Math.min(100, (Number(item.quantity) / maximum) * 100),
    ),
  }));
}
