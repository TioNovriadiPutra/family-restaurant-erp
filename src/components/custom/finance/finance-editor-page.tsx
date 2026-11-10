import { useRouter } from "next/router";
import { getAccessView } from "@/controller/auth/access-view";
import { useErpUiState } from "@/stores/erp-ui-store";
import { useFinanceRead, financeError } from "@/controller/finance/use-finance";
import { PageState } from "@/components/shared/page-state";
import { FormPageFrame } from "@/components/shared/form-page-frame";
import { FinanceExpenseForm } from "./expense-form";
import { FinanceImportForm } from "./import-form";
import { FinanceReconcileForm } from "./reconcile-form";
import type {
  FinanceEditorPageProps,
  FinanceEditorWorkspaceProps,
  FinanceOptions,
} from "@/interfaces/finance";
export function FinanceEditorPage(p: FinanceEditorPageProps) {
  const selected = useErpUiState((s) => s.selectedOutletId);
  const access = getAccessView(p.session, selected);
  if (
    !access.selected ||
    !["finance.read", "finance.manage"].every((permission) =>
      access.permissions.includes(permission),
    )
  )
    return <PageState forbidden />;
  return (
    <Editor
      key={`${access.selected.outlet_id}-${p.mode}`}
      {...p}
      outletId={access.selected.outlet_id}
    />
  );
}
function Editor(p: FinanceEditorWorkspaceProps) {
  const router = useRouter();
  const q = useFinanceRead<FinanceOptions>(p.outletId, "options");
  const base =
    p.mode === "expense" ? "/keuangan/pengeluaran" : "/keuangan/rekonsiliasi";
  const common = q.data
    ? {
        outletId: p.outletId,
        options: q.data,
        onCancel: () => {
          void router.push(base);
        },
        onSaved: () => {
          void router.push(`${base}?saved=1`);
        },
      }
    : undefined;
  return (
    <FormPageFrame
      backHref={base}
      backLabel={
        p.mode === "expense" ? "Daftar pengeluaran" : "Rekonsiliasi bank"
      }
    >
      {q.isPending ? (
        <p role="status">Memuat form keuangan...</p>
      ) : q.isError ? (
        <div role="alert" className="ui-alert ui-alert-destructive">
          <p>{financeError(q.error)}</p>
          <button
            className="ui-button ui-button-secondary"
            onClick={() => q.refetch()}
          >
            Coba lagi
          </button>
        </div>
      ) : (
        common &&
        (p.mode === "expense" ? (
          <FinanceExpenseForm {...common} />
        ) : p.mode === "import" ? (
          <FinanceImportForm {...common} />
        ) : (
          <FinanceReconcileForm {...common} />
        ))
      )}
    </FormPageFrame>
  );
}
