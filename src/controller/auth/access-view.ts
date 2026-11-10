import type { AuthSession } from "@/interfaces/auth";

export function getAccessView(session: AuthSession | null, outletId: string | null) {
  const access = session?.access ?? [];
  const selected = access.find(row => row.outlet_id === outletId) ?? access[0];
  const rows = access.filter(row => row.outlet_id === selected?.outlet_id);
  return {
    access,
    selected,
    outlets: Array.from(new Map(access.map(row => [row.outlet_id, row])).values()),
    permissions: Array.from(new Set(rows.flatMap(row => row.permissions))),
    roles: Array.from(new Set(rows.map(row => row.role))).join(", "),
  };
}
