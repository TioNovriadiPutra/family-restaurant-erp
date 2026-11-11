import type { MetricCardProps } from "@/interfaces/dashboard";
export function MetricCard({
  label,
  value,
  detail,
  featured,
  icon: Icon,
}: MetricCardProps) {
  return (
    <section className="dashboard-metric" data-featured={featured}>
      <span className="dashboard-metric-icon">
        <Icon size={22} aria-hidden="true" variant="Bold" />
      </span>
      <h2 className="dashboard-metric-label">{label}</h2>
      <p className="mt-3 break-words type-28-semibold tabular-nums tracking-tight">
        {value}
      </p>
      <p className="dashboard-metric-detail">{detail}</p>
    </section>
  );
}
