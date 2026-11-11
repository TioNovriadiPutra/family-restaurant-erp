import { PageTitle } from "@/components/shared/page-heading";
import Link from "next/link";
import {
  Wallet2,
  ReceiptItem,
  Chart2,
  TrendUp,
  Calendar1,
  ArrowRight2,
} from "iconsax-reactjs";
import { useMemo } from "react";
import type { DashboardViewProps } from "@/interfaces/dashboard";
import {
  activityLabel,
  costDetail,
  dateLabel,
  rupiah,
} from "@/controller/dashboard/format";
import { MetricCard } from "./metric-card";
import { SalesChart } from "./sales-chart";
import { MenuPerformance } from "./menu-performance";
import { DashboardOperations } from "./dashboard-operations";
export function DashboardView({
  data,
  outletName,
  permissions,
}: DashboardViewProps) {
  const time = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: data.timezone,
      }),
    [data.timezone],
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <PageTitle>
            Ringkasan hari ini
          </PageTitle>
          <p className="mt-2 flex flex-wrap items-center gap-2 type-14-regular text-muted-foreground">
            <Calendar1 size={16} aria-hidden="true" />
            {dateLabel(data.day)} / {outletName}
          </p>
        </div>
        {permissions.includes("reports.read") && (
          <Link
            prefetch={false}
            href="/laporan"
            className="ui-button ui-button-secondary w-full sm:w-auto"
          >
            Lihat laporan <ArrowRight2 size={16} aria-hidden="true" />
          </Link>
        )}
      </div>
      <p className="sr-only">
        Data diperbarui {time.format(new Date(data.generated_at))}. Ringkasan
        operasional, bukan laporan laba rugi final.
      </p>
      {data.has_refunds && (
        <p className="ui-alert ui-alert-warning" role="status">
          Ada transaksi dengan retur. Pendapatan di bawah belum dikurangi retur;
          estimasi laba ditahan agar tidak menampilkan angka yang keliru.
        </p>
      )}
      <div className="dashboard-metrics">
        <MetricCard
          featured
          icon={Wallet2}
          label="Pendapatan bersih"
          value={rupiah(data.revenue)}
          detail={`${data.paid_orders} transaksi lunas / setelah diskon`}
        />
        <MetricCard
          icon={ReceiptItem}
          label="Transaksi lunas"
          value={data.paid_orders.toLocaleString("id-ID")}
          detail={`${data.open_orders} pesanan masih terbuka`}
        />
        <MetricCard
          icon={Chart2}
          label="Rata-rata transaksi"
          value={rupiah(data.average_order)}
          detail="Pendapatan dibagi transaksi lunas"
        />
      </div>
      <div className="dashboard-primary-grid">
        <SalesChart points={data.sales} />
        <MenuPerformance items={data.top_menu} />
      </div>
      <div className="dashboard-secondary-grid">
        <section className="ui-card">
          <div className="dashboard-section-heading">
            <h2>Estimasi laba kotor</h2>
            <TrendUp
              size={20}
              aria-hidden="true"
              className="text-primary shrink-0"
            />
          </div>
          <p className="type-28-semibold tabular-nums break-words">
            {rupiah(data.gross_profit)}
          </p>
          <p className="mt-3 type-13-regular text-muted-foreground">
            {costDetail(data.cost, data.gross_profit, data.revenue)}
          </p>
          <p className="mt-6 type-13-regular text-muted-foreground">
            Pendapatan setelah diskon, sebelum pajak, layanan dan retur.
            Estimasi laba mengikuti kelengkapan HPP.
          </p>
        </section>
        <DashboardOperations data={data} permissions={permissions} />
        <section className="ui-card">
          <div className="dashboard-section-heading">
            <div>
              <h2>Aktivitas operasional</h2>
              <p className="mt-1 type-13-regular text-muted-foreground">
                Pencatatan terbaru di outlet
              </p>
            </div>
          </div>
          {data.activities.length ? (
            <ol>
              {data.activities.map((activity) => (
                <li key={activity.id} className="dashboard-activity">
                  <time
                    dateTime={activity.occurred_at}
                    className="type-13-regular text-muted-foreground"
                  >
                    {time.format(new Date(activity.occurred_at))}
                  </time>
                  <p className="type-14-regular">
                    {activityLabel(
                      activity.action,
                      activity.entity_type,
                      activity.number,
                    )}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="type-14-regular text-muted-foreground">
              Belum ada aktivitas operasional.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
