import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getPurchaseProof, mutatePurchasing, purchaseOptions, readPurchasing, uploadPurchaseProof } from "@/services/purchasing.service";
import type { PurchaseProofInput, PurchaseUploadInput } from "@/interfaces/purchasing";
export function purchasingError(error: unknown) { return isAxiosError(error) ? error.response?.data?.message ?? "Periksa koneksi lalu coba kembali." : "Data belum dapat disimpan."; }
export const purchaseMoney = (value: string | number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 2 }).format(Number(value));
export function usePurchasing(outletId: string, view: string, search: string, page: number) {
  return useQuery({ queryKey: ["purchasing", outletId, view, search, page], queryFn: () => readPurchasing(outletId, view, search, page), enabled: Boolean(outletId), retry: false });
}
export function usePurchaseOptions(outletId: string, enabled = true) { return useQuery({ queryKey: ["purchasing", outletId, "options"], queryFn: () => purchaseOptions(outletId), enabled: Boolean(outletId) && enabled, retry: false }); }
export function usePurchasingMutation() {
  const cache = useQueryClient();
  return useMutation({ mutationFn: mutatePurchasing, retry: false, onSuccess: async (_, input) => {
    await Promise.all([cache.invalidateQueries({ queryKey: ["purchasing", input.outletId] }), cache.invalidateQueries({ queryKey: ["inventory", input.outletId] }), cache.invalidateQueries({ queryKey: ["recipes", input.outletId] }), cache.invalidateQueries({ queryKey: ["dashboard", input.outletId] }), cache.invalidateQueries({ queryKey: ["finance", input.outletId] })]);
  } });
}
export function useUploadPurchaseProof() { return useMutation({ mutationFn: ({ outletId, requestId, file }: PurchaseUploadInput) => uploadPurchaseProof(outletId, requestId, file), retry: false }); }
export function usePurchaseProof() { return useMutation({ mutationFn: ({ outletId, id }: PurchaseProofInput) => getPurchaseProof(outletId, id), retry: false }); }
