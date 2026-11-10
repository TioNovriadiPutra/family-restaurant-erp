import { Edit2, Key, Trash } from "iconsax-reactjs";
import type { EmployeeActionsProps } from "@/interfaces/employees";
import { ActionMenu } from "@/components/shared/action-menu";

export function EmployeeActions({ employee, onSetPin, onEdit, onDelete }: EmployeeActionsProps) {
  return <ActionMenu label={`Aksi ${employee.name}`} items={[
    ...(employee.roles.some(role => role.name === "Kasir") ? [
      { label: employee.pin_configured ? "Reset PIN" : "Atur PIN", icon: <Key aria-hidden="true" size={18} />, disabled: !employee.pin_eligible, onSelect: () => onSetPin(employee) },
    ] : []),
    { label: "Edit", icon: <Edit2 aria-hidden="true" size={18} />, onSelect: () => onEdit(employee) },
    { label: "Hapus", icon: <Trash aria-hidden="true" size={18} />, destructive: true, onSelect: () => onDelete(employee) },
  ]} />;
}
