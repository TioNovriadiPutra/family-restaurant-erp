import type {
  DataTableProps,
  DataTableHeadProps,
} from "@/interfaces/data-table";
// Native table semantics and application-owned styling; no external table engine.
export function DataTable({ className = "", ...props }: DataTableProps) {
  return (
    <table
      {...props}
      data-ui="data-table"
      className={`ui-table ${className}`}
    />
  );
}
export function DataTableHead({
  children,
  numeric,
  className = "",
  scope = "col",
  ...props
}: DataTableHeadProps) {
  const label = typeof children === "string" ? children.trim() : "";
  const end =
    numeric ??
    /^(?:aksi|tindakan|bukti|porsi|jumlah|total|harga|hpp|nilai|saldo|debit|kredit|masuk|keluar|minimum|tempo)(?:$|\s|\s*\/)/i.test(
      label,
    );
  return (
    <th
      {...props}
      scope={scope}
      data-align={end ? "end" : undefined}
      className={className}
    >
      {children}
    </th>
  );
}
