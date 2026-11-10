import { useState } from "react";
import { getAccessView } from "@/controller/auth/access-view";
import { usePurchasing } from "@/controller/purchasing/use-purchasing";
import { useErpUiState } from "@/stores/erp-ui-store";
import type { PurchasingPageProps, PurchaseRecord, PurchaseSupplier } from "@/interfaces/purchasing";
export function usePurchasingPage({ session, view }: PurchasingPageProps) {
  const selected = useErpUiState(state => state.selectedOutletId);
  const access = getAccessView(session, selected); const outletId = access.selected?.outlet_id ?? "";
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false); const [supplier, setSupplier] = useState<PurchaseSupplier>(); const [detail, setDetail] = useState<PurchaseRecord>(); const [notice, setNotice] = useState("");
  const query = usePurchasing(outletId, view, search, page);
  const canManage = (view === "suppliers" ? ["purchasing.manage"] : ["purchasing.manage", "inventory.manage", "finance.manage"]).every(p => access.permissions.includes(p));
  const close = () => { setCreating(false); setSupplier(undefined); };
  return { outletId, query, search, setSearch: (value: string) => { setSearch(value); setPage(1); }, page, setPage, creating, setCreating, supplier, setSupplier, detail, setDetail, notice, setNotice, canManage, close };
}
