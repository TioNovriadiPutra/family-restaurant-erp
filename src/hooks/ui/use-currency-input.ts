import { useRef } from "react";
import type { ChangeEvent } from "react";
import { formatRupiahInput, parseRupiahInput } from "@/lib/currency-input";
export function useCurrencyInput(
  value: unknown,
  onValueChange: (value: string) => void,
  allowNegative = false,
  fractionDigits = 6,
) {
  const input = useRef<HTMLInputElement | null>(null);
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const element = event.currentTarget;
    const text = element.value;
    const position = element.selectionStart ?? text.length;
    const count = (text.slice(0, position).match(/[\d,-]/g) ?? []).length;
    const raw = parseRupiahInput(text, allowNegative, fractionDigits);
    if (raw === undefined) {
      element.value = formatRupiahInput(value);
      return;
    }
    const formatted = formatRupiahInput(raw);
    onValueChange(raw);
    element.value = formatted;
    let caret = 0,
      seen = 0;
    while (caret < formatted.length && seen < count) {
      if (/[\d,-]/.test(formatted[caret])) seen++;
      caret++;
    }
    element.setSelectionRange(caret, caret);
    requestAnimationFrame(() => {
      if (input.current === element && document.activeElement === element)
        element.setSelectionRange(caret, caret);
    });
  };
  return {
    setRef: (element: HTMLInputElement | null) => {
      input.current = element;
    },
    onChange,
    display: formatRupiahInput(value),
  };
}
