import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  financeToday,
  financeError,
  useFinanceMutation,
  useFinanceUpload,
} from "@/controller/finance/use-finance";
import { inventoryDefinitiveFailure } from "@/controller/inventory/use-inventory";
import type {
  FinanceFormProps,
  FinanceExpenseValues,
} from "@/interfaces/finance";
import type { PurchaseAttempt } from "@/interfaces/purchasing";
export function useFinanceExpense(p: FinanceFormProps) {
  const form = useForm<FinanceExpenseValues>({
    defaultValues: {
      accountId: "",
      categoryId: "",
      amount: "",
      date: financeToday(p.options.timezone),
      description: "",
    },
  });
  const mutation = useFinanceMutation(),
    upload = useFinanceUpload();
  const [file, setFile] = useState<File>();
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState<PurchaseAttempt>();
  const submit = form.handleSubmit(async (data) => {
    setError("");
    if (
      !file ||
      file.size > 8388608 ||
      !["application/pdf", "image/png", "image/jpeg"].includes(file.type)
    ) {
      setError("Lampirkan nota PDF, JPG atau PNG maksimal 8 MB.");
      return;
    }
    const signature =
      JSON.stringify(data) + file.name + file.size + file.lastModified;
    if (attempt && attempt.signature !== signature) {
      setError(
        "Periksa daftar pengeluaran sebelum mengubah percobaan yang belum terkonfirmasi.",
      );
      return;
    }
    const current = attempt ?? { requestId: crypto.randomUUID(), signature };
    setAttempt(current);
    try {
      const proof = await upload.mutateAsync({
        outletId: p.outletId,
        requestId: current.requestId,
        file,
      });
      await mutation.mutateAsync({
        outletId: p.outletId,
        action: "expense",
        data: { ...data, ...proof },
        requestId: current.requestId,
      });
      p.onSaved();
    } catch (e) {
      if (inventoryDefinitiveFailure(e)) setAttempt(undefined);
      setError(financeError(e));
    }
  });
  return {
    form,
    submit,
    setFile,
    error,
    pending: mutation.isPending || upload.isPending,
  };
}
