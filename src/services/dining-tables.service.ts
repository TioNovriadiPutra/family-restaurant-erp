import { httpClient } from "@/lib/http";
import type { DiningTable, TableWrite } from "@/interfaces/dining-tables";
export async function readDiningTables(outletId: string) {
  return (
    await httpClient.get<{ items: DiningTable[] }>("/dining-tables", {
      params: { outletId },
    })
  ).data;
}
export async function writeDiningTable(input: TableWrite) {
  return (await httpClient.post<{ id: string }>("/dining-tables", input)).data;
}
