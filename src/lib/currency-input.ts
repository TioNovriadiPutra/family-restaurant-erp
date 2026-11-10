// Display uses Indonesian separators; form/API values stay exact decimal strings.
export function formatRupiahInput(value: unknown) {
  if (value == null || value === "") return "";
  const raw = String(value);
  if (!/^-?\d*(?:\.\d*)?$/.test(raw)) return raw;
  const [integer, fraction] = raw.split(".");
  const sign = integer.startsWith("-") ? "-" : "";
  const digits = integer.replace("-", "");
  return (
    sign +
    digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") +
    (fraction === undefined ? "" : "," + fraction)
  );
}
export function parseRupiahInput(
  display: string,
  allowNegative = false,
  fractionDigits = 6,
) {
  const cleaned = display.replace(/Rp/gi, "").replace(/[\s\u00a0]/g, "");
  if (
    !/^-?[\d.]*(?:,\d*)?$/.test(cleaned) ||
    (!allowNegative && cleaned.startsWith("-"))
  )
    return undefined;
  const raw = cleaned.replace(/\./g, "").replace(",", ".");
  const [integer, fraction] = raw.split(".");
  if (fraction !== undefined && fraction.length > fractionDigits)
    return undefined;
  const normalized = integer.replace(/^(-?)0+(?=\d)/, "$1");
  return (
    (normalized === "" && fraction !== undefined ? "0" : normalized) +
    (fraction === undefined ? "" : "." + fraction)
  );
}
