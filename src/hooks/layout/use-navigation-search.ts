import { useState, useId } from "react";
import { useRouter } from "next/router";
import type { NavigationItem } from "@/interfaces/layout";
export function useNavigationSearch(items: NavigationItem[]) {
  const [query, setQuery] = useState("");
  const id = useId();
  const router = useRouter();
  const results = query.trim()
    ? items.filter((item) =>
        item.label
          .toLocaleLowerCase("id-ID")
          .includes(query.trim().toLocaleLowerCase("id-ID")),
      )
    : [];
  const submit = () => {
    if (results[0]) {
      void router.push(`/${results[0].slug}`);
      setQuery("");
    }
  };
  return { query, setQuery, results, id, submit };
}
