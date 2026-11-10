import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useFinanceRead } from "@/controller/finance/use-finance";
import { useFinanceCommand } from "./use-finance-command";
import type {
  FinanceFormProps,
  FinanceReconcileValues,
  FinanceMatchOptions,
} from "@/interfaces/finance";
export function useFinanceReconcile(p: FinanceFormProps) {
  const form = useForm<FinanceReconcileValues>({
    defaultValues: { accountId: "", bank: [], book: [] },
  });
  const values = useWatch({ control: form.control });
  const query = useFinanceRead<FinanceMatchOptions>(
    p.outletId,
    "reconcile_options",
    { accountId: values.accountId },
    !!values.accountId,
  );
  const command = useFinanceCommand(p.outletId);
  useEffect(() => {
    form.setValue(
      "bank",
      query.data?.bank.map((l) => ({
        id: l.id,
        amount: l.remaining,
        selected: false,
      })) ?? [],
    );
    form.setValue(
      "book",
      query.data?.book.map((l) => ({
        id: l.id,
        amount: l.remaining,
        selected: false,
      })) ?? [],
    );
  }, [query.data, form]);
  const total = (side: "bank" | "book") =>
    (values[side] ?? [])
      .filter((l) => l.selected)
      .reduce((sum, l) => sum + Math.round(Number(l.amount || 0) * 100), 0);
  const bank = total("bank"),
    book = total("book");
  const submit = form.handleSubmit(async (v) => {
    try {
      await command.run("reconcile", {
        accountId: v.accountId,
        bank: v.bank
          .filter((l) => l.selected)
          .map(({ id, amount }) => ({ id, amount })),
        book: v.book
          .filter((l) => l.selected)
          .map(({ id, amount }) => ({ id, amount })),
      });
      p.onSaved();
    } catch {
      /* below */
    }
  });
  return { form, query, command, submit, bank, book, difference: bank - book };
}
