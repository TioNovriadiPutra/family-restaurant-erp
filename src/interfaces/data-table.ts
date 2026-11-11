import type { Ref, TableHTMLAttributes, ThHTMLAttributes } from "react";
export interface DataTableProps extends TableHTMLAttributes<HTMLTableElement> {
  ref?: Ref<HTMLTableElement>;
}
export interface DataTableHeadProps
  extends ThHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}
