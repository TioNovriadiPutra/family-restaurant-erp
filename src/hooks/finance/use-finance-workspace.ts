import { useState } from "react";
import type {
  FinanceFilters,
  FinanceQuickMode,
  FinanceAccount,
} from "@/interfaces/finance";
export function useFinanceWorkspace() {
  const [filters, setFilters] = useState<FinanceFilters>({
    search: "",
    page: 1,
    accountId: "",
    from: "",
    to: "",
    status: "all",
  });
  const [quick, setQuick] = useState<FinanceQuickMode>();
  const [account, setAccount] = useState<FinanceAccount>();
  const [journal, setJournal] = useState<string>();
  const [notice, setNotice] = useState("");
  const close = () => {
    setQuick(undefined);
    setAccount(undefined);
  };
  return {
    filters,
    change: (key: keyof FinanceFilters, value: string | number) =>
      setFilters((f) => ({
        ...f,
        [key]: value,
        page: key === "page" ? Number(value) : 1,
      })),
    quick,
    setQuick,
    account,
    setAccount,
    journal,
    setJournal,
    notice,
    setNotice,
    close,
    saved: () => {
      close();
      setNotice("Data keuangan berhasil disimpan.");
    },
  };
}
