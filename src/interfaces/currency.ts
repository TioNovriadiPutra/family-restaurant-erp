import type { InputHTMLAttributes } from "react";
import type { FieldValues, UseControllerProps } from "react-hook-form";
export interface CurrencyFieldProps<T extends FieldValues>
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | "name"
    | "value"
    | "defaultValue"
    | "onChange"
    | "onBlur"
    | "type"
    | "prefix"
  > {
  control: UseControllerProps<T>["control"];
  name: UseControllerProps<T>["name"];
  rules?: UseControllerProps<T>["rules"];
  label?: string;
  error?: string;
  allowNegative?: boolean;
  fractionDigits?: number;
}
