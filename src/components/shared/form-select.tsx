import { Controller } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import type { FormSelectProps } from "@/interfaces/shared";
import { SelectInput } from "./select-input";
export function FormSelect<T extends FieldValues>({ control, name, required, onValueChange, ...props }: FormSelectProps<T>) {
  return <Controller control={control} name={name} rules={{ required: required ? "Pilih salah satu pilihan." : false }} render={({ field, fieldState }) => <><SelectInput {...props} name={field.name} ref={field.ref} value={field.value ?? ""} required={required} onBlur={field.onBlur} aria-invalid={fieldState.invalid || props["aria-invalid"]} onValueChange={value => { field.onChange(value); onValueChange?.(value); }} />{fieldState.error && !props["aria-describedby"] && <p role="alert" className="mt-1 text-13 text-destructive">{fieldState.error.message}</p>}</>} />;
}
