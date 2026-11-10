import type { ReactNode } from "react";
export interface OutletFormProps {
  outletId: string;
}
export interface FormModalProps {
  label: string;
  onClose: () => void;
  children: ReactNode;
}
export interface FormPageFrameProps {
  backHref: string;
  backLabel: string;
  children: ReactNode;
}
