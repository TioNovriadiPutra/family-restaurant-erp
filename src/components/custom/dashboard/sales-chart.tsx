import { DataTableHead } from '@/components/shared/data-table';
import { Chart2 } from "iconsax-reactjs";
import type { SalesChartProps } from "@/interfaces/dashboard";
import { rupiah } from "@/controller/dashboard/format";
const weekday = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  timeZone: "UTC",
});
export function SalesChart({ points }: SalesChartProps) {
  const maximum = Math.max(...points.map((p) => Number(p.revenue)), 1);
  const hasSales = points.some((p) => Number(p.revenue) > 0);
  return (
    <section className="ui-card min-w-0">
      <div className="dashboard-section-heading">
        <div>
          <h2>Penjualan 7 hari</h2>
          <p className="mt-1 type-13-regular text-muted-foreground">
            Setelah diskon, sebelum pajak, layanan & retur
          </p>
        </div>
        <Chart2
          size={20}
          aria-hidden="true"
          className="shrink-0 text-primary"
        />
      </div>
      <div className="dashboard-chart" aria-hidden="true">
        {points.map((p) => (
          <div key={p.day} className="dashboard-chart-column">
            <div className="dashboard-chart-track">
              <div
                title={rupiah(p.revenue)}
                className="dashboard-chart-bar"
                style={{
                  height: `${Math.max((Number(p.revenue) / maximum) * 100, Number(p.revenue) > 0 ? 2 : 0)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-chart-labels" aria-hidden="true">
        {points.map((p) => (
          <span key={p.day}>
            {weekday.format(new Date(`${p.day}T12:00:00Z`))}
          </span>
        ))}
      </div>
      {!hasSales && (
        <p className="mt-4 type-13-regular text-muted-foreground">
          Belum ada penjualan lunas dalam 7 hari terakhir.
        </p>
      )}
      <table className="sr-only">
        <caption>Pendapatan tujuh hari terakhir</caption>
        <thead>
          <tr>
            <DataTableHead>Tanggal</DataTableHead>
            <DataTableHead>Pendapatan</DataTableHead>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.day}>
              <th>{p.day}</th>
              <td>{rupiah(p.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
