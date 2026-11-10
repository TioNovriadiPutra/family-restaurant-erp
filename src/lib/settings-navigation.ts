export const settingsSections = {
  "restoran-outlet": "profile",
  "menu-harga": "menus",
  "pembayaran-struk": "payments",
  "hak-akses": "access",
} as const;
export const settingsLabels = {
  profile: "Profil restoran",
  menus: "Menu & harga",
  payments: "Pembayaran & struk",
  access: "Hak akses",
};
export const settingsReadPermission = {
  profile: "organization.read",
  menus: "menu.read",
  payments: "organization.read",
  access: "rbac.read",
};
export const settingsWritePermission = {
  profile: "organization.manage",
  menus: "menu.manage",
  payments: "organization.manage",
  access: "rbac.manage",
};
