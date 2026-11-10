import { useState } from "react";
import type { SettingsEditSpec } from "@/interfaces/settings-ui";
export function useSettingsUi() {
  const [modal, setModal] = useState<SettingsEditSpec | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  return {
    modal,
    setModal,
    search,
    page,
    setPage,
    notice,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    saved: () => {
      setModal(null);
      setNotice("Pengaturan berhasil disimpan.");
    },
  };
}
