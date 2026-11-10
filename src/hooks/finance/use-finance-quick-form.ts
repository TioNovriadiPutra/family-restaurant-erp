import { useForm, useWatch } from "react-hook-form";
import { financeToday } from "@/controller/finance/use-finance";
import { useFinanceCommand } from "./use-finance-command";
import type {
  FinanceQuickProps,
  FinanceQuickValues,
} from "@/interfaces/finance";
export function useFinanceQuickForm(p: FinanceQuickProps) {
  const form = useForm<FinanceQuickValues>({
    defaultValues: {
      id: p.account?.id,
      name: p.account?.name ?? "",
      kind: p.account?.kind ?? "cash",
      mask: p.account?.mask ?? "",
      accountId: "",
      toAccountId: "",
      amount: "",
      date: financeToday(p.options.timezone),
      description: "",
    },
  });
  const command = useFinanceCommand(p.outletId);
  const submit = form.handleSubmit(async (v) => {
    try {
      const data =
        p.action === "category"
          ? { name: v.name }
          : p.action === "account"
            ? {
                ...(v.id ? { id: v.id } : {}),
                name: v.name,
                kind: v.kind,
                mask: v.mask,
              }
            : {
                accountId: v.accountId,
                amount: v.amount,
                date: v.date,
                description: v.description,
                ...(p.action === "transfer"
                  ? { toAccountId: v.toAccountId }
                  : {}),
              };
      await command.run(p.action, data);
      p.onSaved();
    } catch {
      /* shown in form */
    }
  });
  const accountId = useWatch({ control: form.control, name: "accountId" });
  return { form, command, submit, accountId };
}
