import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { purchasingError, usePurchasingMutation, useUploadPurchaseProof } from "@/controller/purchasing/use-purchasing";
import type { PurchaseForm, PurchaseFormProps, PurchaseAttempt } from "@/interfaces/purchasing";
export function usePurchaseForm({ outletId, onSaved, options }: PurchaseFormProps) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const form = useForm<PurchaseForm>({ defaultValues: { supplierId: "", invoiceNumber: "", invoiceDate: today, dueDate: today, locationId: "", paymentStatus: "unpaid", accountId: "", lines: [{ stockItemId: "", unitId: "", quantity: "", unitPrice: "" }] } });
  const lines = useFieldArray({ control: form.control, name: "lines" });
  const values = useWatch({ control: form.control });
  const mutation = usePurchasingMutation(); const upload = useUploadPurchaseProof();
  const [attempt, setAttempt] = useState<PurchaseAttempt>();
  const [file, setFile] = useState<File>(); const [error, setError] = useState("");
  const updateDueDate = (supplierId: string, invoiceDate: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(invoiceDate)) return;
    const due = new Date(`${invoiceDate}T00:00:00Z`);
    due.setUTCDate(due.getUTCDate() + (options.suppliers.find(s => s.id === supplierId)?.payment_terms_days ?? 0));
    if (!Number.isNaN(due.getTime())) form.setValue("dueDate", due.toISOString().slice(0,10), { shouldValidate: true });
  };
  const submit = form.handleSubmit(async data => {
    setError("");
    if (!file || file.size > 8388608 || !["application/pdf", "image/png", "image/jpeg"].includes(file.type)) { setError("Lampirkan invoice PDF, JPG atau PNG maksimal 8 MB."); return; }
    const signature = JSON.stringify(data) + file.name + file.size + file.lastModified;
    if (attempt && attempt.signature !== signature) { setError("Percobaan sebelumnya mungkin sudah tersimpan. Muat ulang daftar untuk memeriksa sebelum membuat pembelian baru."); return; }
    const current = attempt ?? { requestId: crypto.randomUUID(), signature }; setAttempt(current);
    try { const proof = await upload.mutateAsync({ outletId, requestId: current.requestId, file }); await mutation.mutateAsync({ outletId, action: "post", data: { ...data, ...proof, requestId: current.requestId } }); onSaved(); }
    catch (e) { setError(purchasingError(e)); }
  });
  return { form, lines, values, file, setFile, error, submit, updateDueDate, pending: mutation.isPending || upload.isPending, total: values.lines?.reduce((sum, line) => sum + Number(line?.quantity || 0) * Number(line?.unitPrice || 0), 0) ?? 0 };
}
