import type { TextFieldProps } from "@/interfaces/auth";
import { phoneDigits } from "@/lib/phone-validation";
import { TextField } from "./text-field";
export function PhoneField({ onChange, ...props }: TextFieldProps) {
  return <TextField {...props} type="tel" inputMode="numeric" autoComplete="tel" maxLength={32} placeholder={props.placeholder ?? "081234567890"} onChange={event => {
    event.currentTarget.value = phoneDigits(event.currentTarget.value);
    onChange?.(event);
  }} />;
}
