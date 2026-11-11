import type { BaseSyntheticEvent } from "react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useDiningTables,
  useDiningTableMutation,
  diningTableError,
} from "@/controller/settings/use-dining-tables";
import { inventoryDefinitiveFailure } from "@/controller/inventory/use-inventory";
import type {
  DiningTable,
  TableValues,
  TableFormProps,
  TableAttempt,
} from "@/interfaces/dining-tables";
export function useDiningTablesUi(outletId: string) {
  const query = useDiningTables(outletId);
  const [modal, setModal] = useState<DiningTable | null | undefined>();
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const items = (query.data?.items ?? []).filter((t) =>
    t.code.toLowerCase().includes(search.toLowerCase()),
  );
  return {
    query,
    modal,
    setModal,
    search,
    setSearch,
    notice,
    items,
    saved: () => {
      setModal(undefined);
      setNotice(
        "Meja berhasil disimpan. POS akan memuat perubahan saat diperbarui.",
      );
    },
  };
}
export function useDiningTableForm(p: TableFormProps) {
  const mutation = useDiningTableMutation();
  const form = useForm<TableValues>({
    defaultValues: {
      code: p.table?.code ?? "",
      seats: p.table?.seats ?? 4,
      active: p.table?.active ?? true,
    },
  });
  const attempt = useRef<TableAttempt | null>(null);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const submit = (event: BaseSyntheticEvent) =>
    form.handleSubmit(async (values) => {
      if (submitting.current) return;
      submitting.current = true;
      setError("");
      const data = {
        ...values,
        code: values.code.trim().toUpperCase(),
        ...(p.table ? { id: p.table.id, revision: p.table.revision } : {}),
      };
      const signature = JSON.stringify(data);
      if (attempt.current && attempt.current.signature !== signature) {
        setError(
          "Hasil penyimpanan sebelumnya belum pasti. Muat ulang daftar sebelum mengubah data.",
        );
        submitting.current = false;
        return;
      }
      const request = attempt.current ?? {
        signature,
        requestId: crypto.randomUUID(),
      };
      attempt.current = request;
      try {
        await mutation.mutateAsync({
          outletId: p.outletId,
          requestId: request.requestId,
          data,
        });
        attempt.current = null;
        p.onSaved();
      } catch (e) {
        if (inventoryDefinitiveFailure(e)) attempt.current = null;
        setError(diningTableError(e));
      } finally {
        submitting.current = false;
      }
    })(event);
  return { form, submit, error, pending: mutation.isPending };
}
