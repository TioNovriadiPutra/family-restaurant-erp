import Link from "next/link";
import { SearchNormal1 } from "iconsax-reactjs";
import { useNavigationSearch } from "@/hooks/layout/use-navigation-search";
import type { NavigationSearchProps } from "@/interfaces/layout";
export function NavigationSearch({ items }: NavigationSearchProps) {
  const search = useNavigationSearch(items);
  return (
    <form
      role="search"
      aria-label="Pencarian menu ERP"
      className="erp-search"
      onSubmit={(e) => {
        e.preventDefault();
        search.submit();
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) search.setQuery("");
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          search.setQuery("");
        }
      }}
    >
      <div className="erp-search-field">
        <SearchNormal1
          size={20}
          aria-hidden="true"
          className="text-muted-foreground shrink-0"
        />
        <label htmlFor={search.id} className="sr-only">
          Cari menu ERP
        </label>
        <input
          id={search.id}
          type="search"
          autoComplete="off"
          placeholder="Cari menu ERP..."
          value={search.query}
          onChange={(e) => search.setQuery(e.target.value)}
          aria-controls={
            search.query.trim() ? `${search.id}-results` : undefined
          }
        />
      </div>
      {search.query.trim() && (
        <div id={`${search.id}-results`} className="erp-search-results">
          <p
            role="status"
            className="px-3 py-2 type-13-regular text-muted-foreground"
          >
            {search.results.length
              ? `${search.results.length} menu ditemukan`
              : "Menu tidak ditemukan"}
          </p>
          <ul>
            {search.results.map(({ icon: Icon, ...item }) => (
              <li key={item.slug}>
                <Link
                  prefetch={false}
                  href={`/${item.slug}`}
                  onClick={() => search.setQuery("")}
                >
                  <Icon size={18} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
