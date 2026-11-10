import { httpClient } from "@/lib/http";
import type {
  FinanceCommand,
  FinanceResult,
  FinanceFilters,
} from "@/interfaces/finance";
import type {
  PurchaseUploadInput,
  PurchaseProof,
} from "@/interfaces/purchasing";
export async function readFinance<T>(
  outletId: string,
  view: string,
  filters: Partial<FinanceFilters> & { id?: string } = {},
) {
  return (
    await httpClient.get<T>("/finance", {
      params: { outletId, view, ...filters },
    })
  ).data;
}
export async function writeFinance(input: FinanceCommand) {
  return (await httpClient.post<FinanceResult>("/finance", input)).data;
}
export async function uploadFinanceProof({
  outletId,
  requestId,
  file,
}: PurchaseUploadInput) {
  return (
    await httpClient.post<PurchaseProof>("/finance/upload", file, {
      params: { outletId, requestId },
      headers: { "Content-Type": file.type },
    })
  ).data;
}
export async function signFinanceProof(input: {
  outletId: string;
  id: string;
}) {
  return (
    await httpClient.get<{ url: string }>("/finance", {
      params: { ...input, view: "proof" },
    })
  ).data;
}
