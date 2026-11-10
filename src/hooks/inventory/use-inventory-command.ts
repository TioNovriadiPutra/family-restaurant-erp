import { useState } from "react";
import {
  inventoryDefinitiveFailure,
  inventoryError,
  useInventoryMutation,
} from "@/controller/inventory/use-inventory";
import type { InventoryAction, InventoryAttempt } from "@/interfaces/inventory";
export function useInventoryCommand(outletId: string) {
  const mutation = useInventoryMutation();
  const [attempt, setAttempt] = useState<InventoryAttempt>();
  const [error, setError] = useState("");
  const run = async (
    action: InventoryAction,
    data: Record<string, unknown>,
  ) => {
    setError("");
    const signature = JSON.stringify({ action, data });
    if (attempt && attempt.signature !== signature) {
      const message =
        "Percobaan sebelumnya belum terkonfirmasi. Periksa daftar sebelum mengubah atau membuat dokumen baru.";
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
      return result.id;
    } catch (e) {
      if (inventoryDefinitiveFailure(e)) setAttempt(undefined);
      setError(inventoryError(e));
      throw e;
    }
  };
  return { run, error, pending: mutation.isPending };
}
