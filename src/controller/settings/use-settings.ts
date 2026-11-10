import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { readSettings, writeSettings } from "@/services/settings.service";
import type { SettingsFilters } from "@/interfaces/settings";
export {
  inventoryError as settingsError,
  inventoryMoney as settingsMoney,
  inventoryDate as settingsDate,
} from "@/controller/inventory/use-inventory";
export function useSettingsRead<T>(
  outletId: string,
  view: string,
  filters: Partial<SettingsFilters> = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ["settings", outletId, view, filters],
    queryFn: () => readSettings<T>(outletId, view, filters),
    enabled: !!outletId && enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
export function useSettingsMutation() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: writeSettings,
    retry: false,
    onSuccess: async () => {
      await Promise.all(
        ["settings", "auth", "employees", "recipes", "dashboard"].map((key) =>
          cache.invalidateQueries({ queryKey: [key] }),
        ),
      );
    },
  });
}
export function settingsMenuStatus(
  m: import("@/interfaces/settings").SettingsMenu,
) {
  return !m.active
    ? "Nonaktif"
    : m.categoryStatus !== "active"
      ? "Kategori nonaktif"
      : !m.categoryVisible
        ? "Disembunyikan"
        : !m.available
          ? "Habis"
          : "Tersedia";
}
export function settingsFoodCost(
  cost: string | null | undefined,
  price: string | null,
  portions: string,
) {
  return cost != null && Number(price) > 0
    ? `${(((Number(cost) * Number(portions)) / Number(price)) * 100).toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`
    : "-";
}
