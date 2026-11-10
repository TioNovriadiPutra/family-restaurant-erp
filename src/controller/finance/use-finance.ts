import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  readFinance,
  writeFinance,
  uploadFinanceProof,
  signFinanceProof,
} from "@/services/finance.service";
import type { FinanceFilters } from "@/interfaces/finance";
export {
  inventoryError as financeError,
  inventoryMoney as financeCurrency,
  inventoryDate as financeDate,
} from "@/controller/inventory/use-inventory";
export function useFinanceRead<T>(
  outletId: string,
  view: string,
  filters: Partial<FinanceFilters> & { id?: string } = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ["finance", outletId, view, filters],
    queryFn: () => readFinance<T>(outletId, view, filters),
    enabled: !!outletId && enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
export function useFinanceMutation() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: writeFinance,
    retry: false,
    onSuccess: async (_, v) => {
      await Promise.all(
        ["finance", "purchasing", "dashboard"].map((key) =>
          cache.invalidateQueries({ queryKey: [key, v.outletId] }),
        ),
      );
    },
  });
}
export function useFinanceUpload() {
  return useMutation({ mutationFn: uploadFinanceProof, retry: false });
}
export function useFinanceProof() {
  return useMutation({ mutationFn: signFinanceProof, retry: false });
}
export function financeToday(timezone = "Asia/Jakarta") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function financeSourceLabel(source?: string) {
  const labels: Record<string, string> = {
    direct_purchase: "Pembelian bahan",
    purchase: "Pembelian bahan",
    supplier_invoice: "Invoice supplier",
    supplier_payment: "Pelunasan supplier",
    expense: "Pengeluaran",
    owner_capital: "Setoran modal",
    fund_transfer: "Transfer dana",
    production_batch: "Produksi bahan",
    production: "Produksi bahan",
    stock_count: "Stock opname",
    stock_adjustment: "Koreksi stok",
    sale: "Penjualan",
    order: "Penjualan",
  };
  return labels[source ?? ""] ?? "Dokumen transaksi";
}
