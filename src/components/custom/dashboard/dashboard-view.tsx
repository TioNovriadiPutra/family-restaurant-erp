import Link from "next/link";
import type { DashboardViewProps } from "@/interfaces/dashboard";
import { activityLabel, costDetail, dateLabel, rupiah } from "@/controller/dashboard/format";
import { MetricCard } from "./metric-card";
import { SalesChart } from "./sales-chart";

export function DashboardView({ data, outletName, permissions }: DashboardViewProps) {
  return <div className="space-y-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <p className="sr-only">Data diperbarui {new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: data.timezone, timeZoneName: "short" }).format(new Date(data.generated_at))}. Ringkasan operasional, bukan laporan laba rugi final.</p>
      <div><h1 className="type-28-semibold">Ringkasan hari ini</h1><p className="mt-2 text-pretty type-14-regular text-muted-foreground">{dateLabel(data.day)} · {outletName} · Sebelum pajak, layanan & retur</p></div>
      {permissions.includes("reports.read") && <Link href="/laporan" className="ui-button ui-button-secondary w-full sm:w-auto sm:min-w-44">Lihat laporan</Link>}
    </div>
    {data.has_refunds && <p className="ui-alert ui-alert-warning" role="status">Ada transaksi dengan retur. Pendapatan di bawah belum dikurangi retur; estimasi laba ditahan agar tidak menampilkan angka yang keliru.</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
      <MetricCard label="Pendapatan bersih" value={rupiah(data.revenue)} detail={`${data.paid_orders} transaksi lunas · setelah diskon`} tone="bg-pastel-sage" />
      <MetricCard label="Transaksi lunas" value={data.paid_orders.toLocaleString("id-ID")} detail={`${data.open_orders} pesanan masih terbuka`} tone="bg-pastel-peach" />
      <MetricCard label="Rata-rata transaksi" value={rupiah(data.average_order)} detail="Pendapatan ÷ transaksi" tone="bg-pastel-blue" />
      <MetricCard label="Estimasi laba kotor" value={rupiah(data.gross_profit)} detail={costDetail(data.cost, data.gross_profit, data.revenue)} tone="bg-destructive-background" />
    </div>
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <SalesChart points={data.sales} />
      <section className="ui-card flex flex-col">
        <h2 className="type-20-semibold">Perlu ditindaklanjuti</h2>
        <ul className="my-8 space-y-2 type-16-regular"><li>{data.low_stock} bahan di bawah stok minimum</li><li>{data.pending_counts} opname menunggu persetujuan</li><li>{data.pending_edc} pembayaran EDC perlu verifikasi</li></ul>
        {permissions.includes("inventory.read") && <Link href="/persediaan" className="ui-button ui-button-secondary mt-auto w-full">Periksa stok minimum</Link>}
      </section>
      <section className="ui-table-container self-start" aria-label="Menu terlaris hari ini">
        <table className="ui-table"><thead><tr><th scope="col">Menu terlaris</th><th scope="col" className="text-right">Porsi</th><th scope="col" className="text-right">Penjualan</th></tr></thead>
          <tbody>{data.top_menu.length ? data.top_menu.map((item, index) => <tr key={`${item.name}-${index}`}><th scope="row" className="!text-foreground">{item.name}</th><td className="ui-amount">{Number(item.quantity).toLocaleString("id-ID", { maximumFractionDigits: 3 })}</td><td className="ui-amount text-primary">{rupiah(item.revenue)}</td></tr>) : <tr><td colSpan={3} className="!py-8 text-center text-muted-foreground">Belum ada menu terjual hari ini.</td></tr>}</tbody>
        </table>
      </section>
      <section className="ui-card">
        <h2 className="type-20-semibold">Aktivitas operasional</h2>
        {data.activities.length ? <ol className="mt-5 grid gap-4">{data.activities.map(activity => <li key={activity.id} className="grid grid-cols-[48px_minmax(0,1fr)] gap-4"><time dateTime={activity.occurred_at} className="type-13-regular text-muted-foreground">{new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: data.timezone }).format(new Date(activity.occurred_at))}</time><p>{activityLabel(activity.action, activity.entity_type, activity.number)}</p></li>)}</ol> : <p className="mt-5 text-muted-foreground">Belum ada aktivitas operasional.</p>}
      </section>
    </div>
  </div>;
}
