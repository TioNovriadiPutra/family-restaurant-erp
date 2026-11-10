import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

export interface SelectInputProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue" | "onChange"> {
  value?: string; defaultValue?: string; onValueChange?: (value: string) => void;
  required?: boolean; children?: ReactNode; ref?: Ref<HTMLButtonElement>;
}
export interface SelectOption { value: string; label: string; disabled: boolean }
export interface SelectPosition { left: number; top: number; width: number; maxHeight: number }
export interface FormSelectProps<T extends FieldValues> extends SelectInputProps { control: Control<T>; name: FieldPath<T> }
