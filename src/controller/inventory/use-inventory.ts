import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  getInventoryDetail,
  getInventoryList,
  getInventoryOptions,
  writeInventory,
} from "@/services/inventory.service";
import type { InventoryFilters } from "@/interfaces/inventory";
export const inventoryStatus: Record<string, string> = {
  draft: "Draf",
  counting: "Sedang dihitung",
  pending: "Menunggu persetujuan",
  posted: "Diposting",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
};
export const inventoryKind: Record<string, string> = {
  count: "Opname",
  manual: "Koreksi manual",
  waste: "Bahan terbuang",
  spoilage: "Rusak / kedaluwarsa",
  shrinkage: "Susut",
  staff_consumption: "Konsumsi staf",
  raw: "Bahan baku",
  semi_finished: "Setengah jadi",
  finished: "Barang jadi",
};
export const inventoryQuantity = (v: string | null | undefined) =>
  v == null
    ? "Belum dihitung"
    : Number(v).toLocaleString("id-ID", { maximumFractionDigits: 6 });
export const inventoryMoney = (v: string | number) =>
  Number(v).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  });
export const inventoryDate = (v: string | null) =>
  v
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
      }).format(new Date(v))
    : "—";
export const inventoryError = (error: unknown) =>
  isAxiosError(error)
    ? (error.response?.data?.message ?? "Koneksi terputus. Coba kembali.")
    : error instanceof Error
      ? error.message
      : "Persediaan belum dapat diproses.";
export const inventoryDefinitiveFailure = (error: unknown) =>
  isAxiosError(error) &&
  [400, 401, 403, 409, 413].includes(error.response?.status ?? 0);
export function useInventoryList<T>(
  outletId: string,
  view: string,
  filters: InventoryFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["inventory", outletId, view, filters],
    queryFn: () => getInventoryList<T>(outletId, view, filters),
    enabled: Boolean(outletId) && enabled,
    retry: false,
  });
}
export function useInventoryOptions(outletId: string) {
  return useQuery({
    queryKey: ["inventory", outletId, "options"],
    queryFn: () => getInventoryOptions(outletId),
    enabled: Boolean(outletId),
    staleTime: 30000,
    retry: false,
  });
}
export function useInventoryDetail(outletId: string, id?: string) {
  return useQuery({
    queryKey: ["inventory", outletId, "detail", id],
    queryFn: () => getInventoryDetail(outletId, id!),
    enabled: Boolean(outletId && id),
    retry: false,
    refetchOnWindowFocus: false,
  });
}
export function useInventoryMutation() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: writeInventory,
    retry: false,
    onSuccess: async (_, v) => {
      await Promise.all([
        cache.invalidateQueries({ queryKey: ["inventory", v.outletId] }),
        cache.invalidateQueries({ queryKey: ["recipes", v.outletId] }),
        cache.invalidateQueries({ queryKey: ["purchasing", v.outletId] }),
        cache.invalidateQueries({ queryKey: ["dashboard", v.outletId] }),
      ]);
    },
  });
}
