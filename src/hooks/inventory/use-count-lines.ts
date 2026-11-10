import { useForm } from "react-hook-form";
import { useInventoryCommand } from "./use-inventory-command";
import type {
  InventoryCountEditorProps,
  InventoryCountValues,
} from "@/interfaces/inventory";
export function useCountLines({ outletId, detail }: InventoryCountEditorProps) {
  const form = useForm<InventoryCountValues>({
    defaultValues: {
      lines: detail.lines.map((l) => ({
        itemId: l.itemId,
        countedQuantity: l.counted ?? "",
        reason: l.reason ?? "",
        unitCost: l.unitCost ?? "",
        recount: false,
      })),
    },
  });
  const command = useInventoryCommand(outletId);
  const submit = form.handleSubmit(async (values, event) => {
    const submitter = (event?.nativeEvent as SubmitEvent | undefined)
      ?.submitter as HTMLButtonElement | null;
    const send = submitter?.value === "submit";
    if (send) {
      let invalid = false;
      values.lines.forEach((l, i) => {
        if (l.countedQuantity === "") {
          form.setError(`lines.${i}.countedQuantity`, {
            message: "Isi hitungan fisik, termasuk nol bila habis.",
          });
          invalid = true;
        }
      });
      if (invalid) return;
    }
    try {
      await command.run("count_save", {
        id: detail.document.id,
        version: detail.document.version,
        lines: values.lines,
        submit: send,
      });
    } catch {
      /* presented by command */
    }
  });
  return { form, command, submit };
}
