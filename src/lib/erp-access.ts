import type { OutletAccess } from "@/interfaces/auth";

// Roles come from my_access(), never from browser storage or editable metadata.
export function filterErpAccess(access: OutletAccess[]) {
  return access.filter(row => row.role === "Pemilik" || row.role === "Manajer");
}

export function canAccessOutlet(access: OutletAccess[], outletId: string, permission?: string) {
  return filterErpAccess(access).some(row => row.outlet_id === outletId &&
    (!permission || row.permissions.includes(permission)));
}
