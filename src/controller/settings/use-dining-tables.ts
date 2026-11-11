import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  readDiningTables,
  writeDiningTable,
} from "@/services/dining-tables.service";
export { settingsError as diningTableError } from "./use-settings";
export function useDiningTables(outletId: string) {
  return useQuery({
    queryKey: ["dining-tables", outletId],
    queryFn: () => readDiningTables(outletId),
    retry: false,
  });
}
export function useDiningTableMutation() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: writeDiningTable,
    retry: false,
    onSuccess: () => cache.invalidateQueries({ queryKey: ["dining-tables"] }),
  });
}
