import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/services/dashboard.service";

export function useDashboard(outletId: string | null) {
  return useQuery({
    queryKey: ["dashboard", outletId],
    queryFn: () => getDashboard(outletId!),
    select: response => response.dashboard,
    enabled: Boolean(outletId),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: false,
  });
}
