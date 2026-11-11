import Link from "next/link";
import { Box1, ClipboardTick, Card } from "iconsax-reactjs";
import type { DashboardOperationsProps } from "@/interfaces/dashboard";
export function DashboardOperations({
  data,
  permissions,
}: DashboardOperationsProps) {
  return (
    <section className="ui-card">
      <div className="dashboard-section-heading">
        <div>
          <h2>Perlu ditindaklanjuti</h2>
          <p className="mt-1 type-13-regular text-muted-foreground">
            Pemeriksaan operasional outlet
          </p>
        </div>
      </div>
      <div className="dashboard-followup">
        <span className="dashboard-followup-icon">
          <Box1 size={18} aria-hidden="true" />
        </span>
        <p className="flex-1 type-14-regular">Bahan di bawah stok minimum</p>
        <span className="ui-badge ui-badge-neutral">{data.low_stock}</span>
      </div>
      <div className="dashboard-followup">
        <span className="dashboard-followup-icon">
          <ClipboardTick size={18} aria-hidden="true" />
        </span>
        <p className="flex-1 type-14-regular">Opname menunggu persetujuan</p>
        <span className="ui-badge ui-badge-neutral">{data.pending_counts}</span>
      </div>
      <div className="dashboard-followup">
        <span className="dashboard-followup-icon">
          <Card size={18} aria-hidden="true" />
        </span>
        <p className="flex-1 type-14-regular">
          Pembayaran EDC perlu verifikasi
        </p>
        <span className="ui-badge ui-badge-neutral">{data.pending_edc}</span>
      </div>
      {permissions.includes("inventory.read") && (
        <Link
          prefetch={false}
          href="/persediaan/stok-bahan"
          className="ui-button ui-button-secondary mt-4 w-full"
        >
          Periksa persediaan
        </Link>
      )}
    </section>
  );
}
