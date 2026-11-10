import { httpClient } from "@/lib/http";
import type { PurchaseOptions, PurchaseProof, PurchasingMutation, PurchaseRecord, PurchaseStock, PurchaseSupplier } from "@/interfaces/purchasing";
export async function readPurchasing(outletId: string, view: string, search = "", page = 1) {
  return (await httpClient.get<{ items: (PurchaseSupplier | PurchaseRecord | PurchaseStock)[]; total?: number }>("/purchasing", { params: { outletId, view, search, page } })).data;
}
export async function purchaseOptions(outletId: string) { return (await httpClient.get<PurchaseOptions>("/purchasing", { params: { outletId, view: "options" } })).data; }
export async function mutatePurchasing(input: PurchasingMutation) { return (await httpClient.post<{ id: string }>("/purchasing", input)).data; }
export async function uploadPurchaseProof(outletId: string, requestId: string, file: File) {
  return (await httpClient.post<PurchaseProof>("/purchasing/upload", file, { params: { outletId, requestId }, headers: { "Content-Type": file.type }, timeout: 60000 })).data;
}
export async function getPurchaseProof(outletId: string, id: string) { return (await httpClient.get<{ url: string }>("/purchasing", { params: { outletId, view: "proof", id } })).data; }
