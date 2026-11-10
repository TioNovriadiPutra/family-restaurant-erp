import { useState } from "react";
import { useForm } from "react-hook-form";
import { useInventoryCommand } from "./use-inventory-command";
import type {
  InventoryAction,
  InventoryDocument,
  InventoryReviewForm,
} from "@/interfaces/inventory";
export function useInventoryDetailActions(
  outletId: string,
  doc?: InventoryDocument,
) {
  const command = useInventoryCommand(outletId);
  const [review, setReview] = useState<"approve" | "reject">();
  const [cancel, setCancel] = useState(false);
  const form = useForm<InventoryReviewForm>({ defaultValues: { reason: "" } });
  const run = async (action: InventoryAction) => {
    if (!doc) return;
    try {
      await command.run(action, { id: doc.id, version: doc.version });
      setCancel(false);
    } catch {
      /* below */
    }
  };
  const submitReview = form.handleSubmit(async (value) => {
    if (!doc || !review) return;
    try {
      await command.run(review, {
        id: doc.id,
        version: doc.version,
        reason: value.reason,
      });
      setReview(undefined);
      form.reset();
    } catch {
      /* below */
    }
  });
  return {
    command,
    review,
    setReview,
    cancel,
    setCancel,
    form,
    run,
    submitReview,
  };
}
