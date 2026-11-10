import type { NavigationItem } from "@/interfaces/layout";
import { Book1, Box1, Category2, Chart2, People, Setting2, ShoppingCart, Wallet2 } from "iconsax-reactjs";

export const erpNavigation: NavigationItem[] = [
  { slug: "", label: "Ringkasan", icon: Category2 },
  { slug: "persediaan", label: "Persediaan", permission: "inventory.read", icon: Box1 },
  { slug: "resep", label: "Resep & HPP", permission: "recipes.read", icon: Book1 },
  { slug: "pembelian", label: "Pembelian", permission: "purchasing.read", icon: ShoppingCart },
  { slug: "keuangan", label: "Keuangan", permission: "finance.read", icon: Wallet2 },
  { slug: "laporan", label: "Laporan", permission: "reports.read", icon: Chart2 },
  { slug: "karyawan", label: "Karyawan", permission: "staff.read", icon: People },
  { slug: "pengaturan", label: "Pengaturan", permission: "organization.manage", icon: Setting2 },
];
