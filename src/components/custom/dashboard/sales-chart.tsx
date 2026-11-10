import type { SalesChartProps } from "@/interfaces/dashboard";
import { rupiah } from "@/controller/dashboard/format";

export function SalesChart({ points }: SalesChartProps) {
  const maximum = Math.max(...points.map(point => Number(point.revenue)), 1);
  const hasSales = points.some(point => Number(point.revenue) > 0);
  return <section className="ui-card min-w-0">
    <h2 className="type-20-semibold">Penjualan 7 hari</h2>
    <p className="mt-2 type-13-regular text-muted-foreground">Pendapatan setelah diskon · sebelum pajak, layanan & retur</p>
    <div className="mt-6 flex h-40 items-end gap-3 sm:gap-6" aria-hidden="true">
      {points.map((point, index) => <div key={point.day} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-3">
        <div title={rupiah(point.revenue)} className={`w-full rounded-t-control ${index === points.length-1 ? "bg-primary" : "bg-chart-muted"}`}
          style={{ height: `${Math.max(Number(point.revenue) / maximum * 100, Number(point.revenue) > 0 ? 2 : 0)}%` }} />
        <span className="type-13-regular text-muted-foreground">{new Intl.DateTimeFormat("id-ID", { weekday: "short", timeZone: "UTC" }).format(new Date(`${point.day}T12:00:00Z`))}</span>
      </div>)}
    </div>
    {!hasSales && <p className="mt-3 type-13-regular text-muted-foreground">Belum ada penjualan lunas dalam 7 hari terakhir.</p>}
    <table className="sr-only"><caption>Pendapatan tujuh hari terakhir</caption><thead><tr><th>Tanggal</th><th>Pendapatan</th></tr></thead><tbody>{points.map(point => <tr key={point.day}><th>{point.day}</th><td>{rupiah(point.revenue)}</td></tr>)}</tbody></table>
  </section>;
}
