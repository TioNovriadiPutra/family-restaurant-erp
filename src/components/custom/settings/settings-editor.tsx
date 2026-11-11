import { SectionTitle } from '@/components/shared/page-heading';
import { useRouter } from "next/router";
import { getAccessView } from "@/controller/auth/access-view";
import { useErpUiState } from "@/stores/erp-ui-store";
import {
  useSettingsRead,
  settingsError,
  settingsDate,
  settingsMoney,
} from "@/controller/settings/use-settings";
import {
  profileSpec,
  receiptSpec,
  menuSpec,
} from "@/controller/settings/settings-edit-spec";
import {
  settingsWritePermission,
  settingsReadPermission,
} from "@/lib/settings-navigation";
import { FormPageFrame } from "@/components/shared/form-page-frame";
import { SettingsForm } from "./settings-form";
import { PageState } from "@/components/shared/page-state";
import type {
  SettingsPageProps,
  SettingsWorkspaceProps,
  SettingsProfile,
  SettingsReceipt,
  SettingsOptions,
  SettingsMenu,
  SettingsAccess,
} from "@/interfaces/settings";
import type { SettingsEditSpec } from "@/interfaces/settings-ui";
export function SettingsEditor(p: SettingsPageProps) {
  const selected = useErpUiState((s) => s.selectedOutletId);
  const a = getAccessView(p.session, selected);
  if (
    !a.selected ||
    !a.permissions.includes(settingsReadPermission[p.view]) ||
    !a.permissions.includes(settingsWritePermission[p.view]) ||
    (p.view === "access" && !a.roles.split(", ").includes("Pemilik"))
  )
    return <PageState forbidden />;
  return (
    <Editor
      key={`${a.selected.outlet_id}-${p.view}`}
      {...p}
      outletId={a.selected.outlet_id}
      canManage
      canAssign
    />
  );
}
function Editor(p: SettingsWorkspaceProps) {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";
  const base = router.asPath.split("/form")[0];
  const view =
    p.view === "profile"
      ? "profile"
      : p.view === "payments"
        ? "receipt"
        : p.view === "access"
          ? "access"
          : "options";
  const q = useSettingsRead<
    SettingsProfile | SettingsReceipt | SettingsOptions | SettingsAccess
  >(p.outletId, view);
  const detail = useSettingsRead<SettingsMenu>(
    p.outletId,
    "menu_detail",
    { id },
    p.view === "menus" && !!id,
  );
  const back = () => {
    void router.push(base);
  };
  if (q.isPending || (p.view === "menus" && id && detail.isPending))
    return <p role="status">Memuat form...</p>;
  if (q.error || detail.error)
    return (
      <FormPageFrame backHref={base} backLabel="Kembali">
        <p role="alert" className="ui-card">
          {settingsError(q.error ?? detail.error)}
        </p>
      </FormPageFrame>
    );
  if (!q.data) return null;
  let spec: SettingsEditSpec;
  if (p.view === "profile") spec = profileSpec(q.data as SettingsProfile);
  else if (p.view === "payments") spec = receiptSpec(q.data as SettingsReceipt);
  else if (p.view === "menus")
    spec = menuSpec(q.data as SettingsOptions, detail.data);
  else {
    const d = q.data as SettingsAccess;
    const role = d.roles.find((r) => r.id === id);
    if (!role || role.name === "Pemilik") return <PageState forbidden />;
    spec = {
      action: "role",
      title: `Hak akses ${role.name}`,
      values: {
        id: role.id,
        revision: role.revision,
        discountPercent: String(Number(role.discountPercent)),
        permissions: role.permissions.filter((code) => code !== "rbac.manage"),
      },
      fields: [
        { key: "discountPercent", label: "Batas diskon (%)", required: true },
      ],
    };
    return (
      <FormPageFrame backHref={base} backLabel="Kembali ke hak akses">
        <RoleForm
          outletId={p.outletId}
          spec={spec}
          permissions={d.permissions}
          onSaved={back}
          onCancel={back}
        />
      </FormPageFrame>
    );
  }
  return (
    <FormPageFrame backHref={base} backLabel="Kembali ke pengaturan">
      <SettingsForm
        key={id || view}
        outletId={p.outletId}
        spec={spec}
        onSaved={back}
        onCancel={back}
      />
      {p.view === "menus" && detail.data && (
        <section className="ui-card">
          <SectionTitle className="mb-3">Riwayat harga</SectionTitle>
          {detail.data.prices.map((price) => (
            <p
              key={price.id}
              className="border-b border-border py-3 text-14"
            >{`${settingsMoney(price.amount)} / ${settingsDate(price.valid_from)} / ${price.reason}${price.cancelled_at ? " (dibatalkan)" : ""}`}</p>
          ))}
        </section>
      )}
    </FormPageFrame>
  );
}
import { SettingsRoleForm as RoleForm } from "./settings-role-form";
