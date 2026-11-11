import { useId } from "react";
import { useController } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import type { CurrencyFieldProps } from "@/interfaces/currency";
import { useCurrencyInput } from "@/hooks/ui/use-currency-input";
import { RequiredMark } from "./required-mark";
export function CurrencyField<T extends FieldValues>({
  control,
  name,
  rules,
  label,
  error,
  allowNegative = false,
  fractionDigits = 6,
  id: providedId,
  className = "",
  ...props
}: CurrencyFieldProps<T>) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const { field, fieldState } = useController({ control, name, rules });
  const s = useCurrencyInput(
    field.value,
    field.onChange,
    allowNegative,
    fractionDigits,
  );
  const message = error ?? fieldState.error?.message;
  return (
    <span className="ui-field block min-w-0">
      {label && (
        <label htmlFor={id} className="ui-label text-foreground">
          {label}
          {props.required && <RequiredMark />}
        </label>
      )}
      <span className="relative block min-w-0">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-14 text-muted-foreground"
        >
          Rp
        </span>
        <input
          {...props}
          id={id}
          name={field.name}
          ref={(element) => {
            s.setRef(element);
            field.ref(element);
          }}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={s.display}
          onChange={s.onChange}
          onBlur={field.onBlur}
          aria-invalid={!!message || props["aria-invalid"]}
          aria-describedby={message ? `${id}-error` : props["aria-describedby"]}
          className={`ui-input !pl-10 tabular-nums max-sm:min-h-12 ${className}`}
        />
      </span>
      {message && (
        <span id={`${id}-error`} className="ui-field-error" role="alert">
          {message}
        </span>
      )}
    </span>
  );
}
