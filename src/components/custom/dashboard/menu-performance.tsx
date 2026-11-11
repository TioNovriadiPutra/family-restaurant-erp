import { Reserve } from "iconsax-reactjs";
import type { MenuPerformanceProps } from "@/interfaces/dashboard";
import { menuPerformanceRows, rupiah } from "@/controller/dashboard/format";
export function MenuPerformance({ items }: MenuPerformanceProps) {
  const rows = menuPerformanceRows(items);
  return (
    <section className="ui-card">
      <div className="dashboard-section-heading">
        <div>
          <h2>Performa menu</h2>
          <p className="mt-1 type-13-regular text-muted-foreground">
            Porsi dan penjualan lunas hari ini
          </p>
        </div>
        <Reserve
          size={20}
          aria-hidden="true"
          className="text-primary shrink-0"
        />
      </div>
      {rows.length ? (
        <ol>
          {rows.map((item, index) => (
            <li key={`${item.name}-${index}`} className="menu-performance-row">
              <span className="menu-performance-rank" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="type-14-semibold">{item.name}</h3>
                  <span className="type-13-regular text-muted-foreground tabular-nums">
                    {Number(item.quantity).toLocaleString("id-ID", {
                      maximumFractionDigits: 3,
                    })}{" "}
                    porsi
                  </span>
                </div>
                <div className="menu-performance-track" aria-hidden="true">
                  <div
                    className="menu-performance-fill"
                    style={{ width: `${item.relativeQuantity}%` }}
                  />
                </div>
                <p className="mt-2 type-13-regular text-muted-foreground tabular-nums">
                  {rupiah(item.revenue)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="grid min-h-56 content-center justify-items-center gap-3 text-center">
          <span className="dashboard-followup-icon">
            <Reserve size={22} aria-hidden="true" />
          </span>
          <p className="type-14-regular text-muted-foreground">
            Belum ada menu terjual hari ini.
          </p>
        </div>
      )}
    </section>
  );
}
