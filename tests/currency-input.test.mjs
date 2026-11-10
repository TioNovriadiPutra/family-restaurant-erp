import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadSource, sourceRoot } from "./support/load-source.mjs";
const { formatRupiahInput, parseRupiahInput } = loadSource(
  path.join(sourceRoot, "src/lib/currency-input.ts"),
);
test("Rupiah input preserves exact values, fractions, empty state and signed allocations", () => {
  for (const [raw, display] of [
    ["", ""],
    ["0", "0"],
    ["1250000", "1.250.000"],
    ["1250000.50", "1.250.000,50"],
    ["1000.", "1.000,"],
    ["0.000123", "0,000123"],
    ["-1000.25", "-1.000,25"],
    ["999999999999999999.99", "999.999.999.999.999.999,99"],
  ]) {
    assert.equal(formatRupiahInput(raw), display);
    assert.equal(parseRupiahInput(display, true), raw);
  }
  assert.equal(parseRupiahInput("Rp 1.250.000,50", false, 2), "1250000.50");
  assert.equal(parseRupiahInput(",5"), "0.5");
  assert.equal(parseRupiahInput("00012"), "12");
  for (const invalid of ["-1.000", "NaN", "1e6", "1,23,45", "abc123"])
    assert.equal(parseRupiahInput(invalid), undefined);
  assert.equal(parseRupiahInput("12,345", false, 2), undefined);
  assert.equal(parseRupiahInput("12,345678", false, 6), "12.345678");
});
