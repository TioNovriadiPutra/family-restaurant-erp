import { httpClient } from "@/lib/http";
import type {
  InventoryCommand,
  InventoryDetail,
  InventoryFilters,
  InventoryList,
  InventoryOptions,
} from "@/interfaces/inventory";
export async function getInventoryList<T>(
  outletId: string,
  view: string,
  filters: InventoryFilters,
) {
  const { data } = await httpClient.get<InventoryList<T>>("/inventory", {
    params: { outletId, view, ...filters },
  });
  if (!Array.isArray(data.items) || typeof data.total !== "number")
    throw new Error("Invalid inventory list");
  return data;
}
export async function getInventoryOptions(outletId: string) {
  return (
    await httpClient.get<InventoryOptions>("/inventory", {
      params: { outletId, view: "options" },
    })
  ).data;
}
export async function getInventoryDetail(outletId: string, id: string) {
  return (
    await httpClient.get<InventoryDetail>("/inventory", {
      params: { outletId, view: "detail", id },
    })
  ).data;
}
export async function writeInventory(input: InventoryCommand) {
  return (await httpClient.post<{ id: string }>("/inventory", input)).data;
}
