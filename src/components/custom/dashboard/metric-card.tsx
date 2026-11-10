import type { MetricCardProps } from "@/interfaces/dashboard";

export function MetricCard({ label, value, detail, tone }: MetricCardProps) {
  return <section className={`rounded-card border border-border px-5 py-4 shadow-card ${tone}`}>
    <h2 className="type-14-regular text-muted-foreground">{label}</h2>
    <p className="mt-1 break-words type-28-semibold tabular-nums">{value}</p>
    <p className="mt-2 type-13-regular text-muted-foreground">{detail}</p>
  </section>;
}
