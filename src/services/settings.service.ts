import { httpClient } from "@/lib/http";
import type { SettingsCommand, SettingsFilters } from "@/interfaces/settings";
export async function readSettings<T>(
  outletId: string,
  view: string,
  filters: Partial<SettingsFilters> = {},
) {
  return (
    await httpClient.get<T>("/settings", {
      params: { outletId, view, ...filters },
    })
  ).data;
}
export async function writeSettings(input: SettingsCommand) {
  return (await httpClient.post<{ id: string }>("/settings", input)).data;
}
