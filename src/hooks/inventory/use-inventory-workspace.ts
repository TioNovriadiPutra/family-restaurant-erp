import { useState } from "react";
import type {
  InventoryFilters,
  InventoryMaterial,
  InventoryStock,
  InventoryView,
} from "@/interfaces/inventory";
export function useInventoryWorkspace(view: InventoryView) {
  const [filters, setFilters] = useState<InventoryFilters>({
    search: "",
    status:
      view === "materials" ? "all" : view === "approvals" ? "pending" : "all",
    locationId: "",
    page: 1,
  });
  const [creating, setCreating] = useState(false);
  const [conversion, setConversion] = useState<InventoryMaterial>();
  const [movement, setMovement] = useState<InventoryStock>();
  const [aux, setAux] = useState<"unit" | "location">();
  const [notice, setNotice] = useState("");
  const change = (key: "search" | "status" | "locationId", value: string) =>
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  const close = () => {
    setCreating(false);
    setConversion(undefined);
    setAux(undefined);
  };
  const saved = () => {
    close();
    setNotice("Data persediaan berhasil disimpan.");
  };
  return {
    filters,
    change,
    setPage: (page: number) => setFilters((v) => ({ ...v, page })),
    creating,
    setCreating,
    conversion,
    setConversion,
    movement,
    setMovement,
    aux,
    setAux,
    notice,
    setNotice,
    close,
    saved,
  };
}
