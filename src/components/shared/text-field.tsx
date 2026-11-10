import type { TextFieldProps } from "@/interfaces/auth";
import { RequiredMark } from "./required-mark";

export function TextField({ id, label, error, ...props }: TextFieldProps) {
  return <div className="ui-field">
    <label htmlFor={id} className="ui-label text-foreground">{label}{props.required && <RequiredMark />}</label>
    <input {...props} id={id} className="ui-input max-sm:min-h-12" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : props["aria-describedby"]} />
    {error && <p id={`${id}-error`} className="ui-field-error" role="alert">{error}</p>}
  </div>;
}
