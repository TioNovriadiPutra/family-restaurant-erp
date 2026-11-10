import { useState } from "react";
import { useForm } from "react-hook-form";
import { parseFinanceCsv } from "@/lib/finance-validation";
import { useFinanceCommand } from "./use-finance-command";
import type {
  FinanceFormProps,
  FinanceImportValues,
} from "@/interfaces/finance";
export function useFinanceImport(p: FinanceFormProps) {
  const form = useForm<FinanceImportValues>({
    defaultValues: { accountId: "", csv: "" },
  });
  const command = useFinanceCommand(p.outletId);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const submit = form.handleSubmit(async (v) => {
    setError("");
    setResult("");
    try {
      const lines = parseFinanceCsv(v.csv);
      const saved = await command.run("import", {
        accountId: v.accountId,
        lines,
      });
      setResult(
        `${saved.added} transaksi diimpor, ${saved.skipped} transaksi yang sudah ada dilewati.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "CSV belum dapat diimpor.");
    }
  });
  const readFile = async (file?: File) => {
    setError("");
    if (!file) return;
    if (file.size > 150000) {
      setError("CSV maksimal 150 KB.");
      return;
    }
    form.setValue("csv", await file.text(), { shouldValidate: true });
  };
  return { form, command, submit, error, result, readFile };
}
