import { useState } from "react";
import {
  useFinanceMutation,
  financeError,
} from "@/controller/finance/use-finance";
import { inventoryDefinitiveFailure } from "@/controller/inventory/use-inventory";
import type { FinanceAction } from "@/interfaces/finance";
export function useFinanceCommand(outletId: string) {
  const mutation = useFinanceMutation();
  const [attempt, setAttempt] =
    useState<import("@/interfaces/purchasing").PurchaseAttempt>();
  const [error, setError] = useState("");
  const run = async (action: FinanceAction, data: Record<string, unknown>) => {
    setError("");
    const signature = JSON.stringify({ action, data });
    if (attempt && attempt.signature !== signature) {
      const message =
        "Percobaan sebelumnya belum terkonfirmasi. Periksa daftar sebelum mengubah data.";
      setError(message);
      throw new Error(message);
    }
    const current = attempt ?? { signature, requestId: crypto.randomUUID() };
    setAttempt(current);
    try {
      const result = await mutation.mutateAsync({
        outletId,
        action,
        data,
        requestId: current.requestId,
      });
      setAttempt(undefined);
      return result;
    } catch (e) {
      if (inventoryDefinitiveFailure(e)) setAttempt(undefined);
      setError(financeError(e));
      throw e;
    }
  };
  return { run, error, pending: mutation.isPending };
}
