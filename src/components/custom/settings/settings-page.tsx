import Link from "next/link";
import { useRouter } from "next/router";
import { Add, Edit2, ArrowLeft2 } from "iconsax-reactjs";
import { getAccessView } from "@/controller/auth/access-view";
import { useErpUiState } from "@/stores/erp-ui-store";
import {
  useSettingsRead,
  settingsError,
  settingsMoney,
  settingsMenuStatus,
} from "@/controller/settings/use-settings";
import {
  categorySpec,
  paymentSpec,
} from "@/controller/settings/settings-edit-spec";
import {
  settingsLabels,
  settingsReadPermission,
  settingsWritePermission,
} from "@/lib/settings-navigation";
import { useSettingsUi } from "@/hooks/settings/use-settings-ui";
import { SettingsForm } from "./settings-form";
import { FormModal } from "@/components/shared/form-modal";
import { PageState } from "@/components/shared/page-state";
import type {
  SettingsPageProps,
  SettingsWorkspaceProps,
  SettingsProfile,
  SettingsReceipt,
  SettingsMenuList,
  SettingsOptions,
  SettingsPayments,
  SettingsAccess,
} from "@/interfaces/settings";
export function SettingsPage(p: SettingsPageProps) {
  const selected = useErpUiState((s) => s.selectedOutletId);
  const a = getAccessView(p.session, selected);
  if (!a.selected || !a.permissions.includes(settingsReadPermission[p.view]))
    return <PageState forbidden />;
  return (
    <Workspace
      key={`${a.selected.outlet_id}-${p.view}`}
      {...p}
      outletId={a.selected.outlet_id}
      canManage={
        a.permissions.includes(settingsWritePermission[p.view]) &&
        (p.view !== "access" || a.roles.split(", ").includes("Pemilik"))
      }
      canAssign={
        a.permissions.includes("staff.read") &&
        a.permissions.includes("staff.manage")
      }
    />
  );
}
function Workspace(p: SettingsWorkspaceProps) {
  const s = useSettingsUi();
  const router = useRouter();
  const base = router.asPath.split("?")[0];
  const q = useSettingsRead<
    SettingsProfile | SettingsMenuList | SettingsPayments | SettingsAccess
  >(p.outletId, p.view, {
    search: s.search,
    page: s.page,
    status: "all",
    categoryId: "",
  });
  const receipt = useSettingsRead<SettingsReceipt>(
    p.outletId,
    "receipt",
    {},
    p.view === "payments",
  );
  const options = useSettingsRead<SettingsOptions>(
    p.outletId,
    "options",
    {},
    p.view === "menus",
  );
  const edit = (id?: string, form?: string) =>
    `${base}/form${id ? "?id=" + id : form ? "?mode=" + form : ""}`;
  return (
    <div className="space-y-5">
      <Link
        href="/pengaturan"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft2 size={16} />
        Pengaturan
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{settingsLabels[p.view]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pengaturan operasional restoran untuk lokasi yang dipilih.
          </p>
        </div>
        {p.canManage && (
          <div className="flex gap-2">
            {p.view === "profile" ? (
              <Link href={edit()} className="ui-button ui-button-primary">
                <Edit2 size={16} />
                Edit profil
              </Link>
            ) : p.view === "menus" ? (
              <>
                <button
                  className="ui-button ui-button-secondary"
                  onClick={() => s.setModal(categorySpec())}
                >
                  Tambah kategori
                </button>
                <Link href={edit()} className="ui-button ui-button-primary">
                  <Add size={16} />
                  Tambah menu
                </Link>
              </>
            ) : p.view === "payments" ? (
              <button
                className="ui-button ui-button-primary"
                disabled={!q.data}
                onClick={() =>
                  s.setModal(paymentSpec(q.data as SettingsPayments))
                }
              >
                <Add size={16} />
                Tambah metode
              </button>
            ) : null}
          </div>
        )}
      </div>
      {s.notice && (
        <p role="status" className="ui-alert ui-alert-info">
          {s.notice}
        </p>
      )}
      {q.isPending ? (
        <p role="status">Memuat pengaturan...</p>
      ) : q.error ? (
        <div className="ui-card">
          <p role="alert">{settingsError(q.error)}</p>
          <button
            className="ui-button ui-button-secondary mt-3"
            onClick={() => q.refetch()}
          >
            Coba lagi
          </button>
        </div>
      ) : (
        q.data && (
          <>
            {p.view === "profile" &&
              (() => {
                const d = q.data as SettingsProfile;
                return (
                  <div className="ui-card grid gap-5 sm:grid-cols-2">
                    {[
                      ["Nama restoran", d.restaurantName],
                      ["Nama lokasi", d.outletName],
                      ["Alamat", d.address || "-"],
                      ["Nomor HP", d.phone || "-"],
                      ["Zona waktu", d.timezone],
                      ["Mata uang", d.currency],
                      ["Pajak", `${d.taxPercent}%`],
                      ["Layanan", `${d.servicePercent}%`],
                      [
                        "Pembulatan",
                        (
                          {
                            nearest_1: "Tanpa pembulatan",
                            nearest_100: "Kelipatan Rp100",
                            nearest_500: "Kelipatan Rp500",
                            nearest_1000: "Kelipatan Rp1.000",
                          } as Record<string, string>
                        )[d.rounding] ?? d.rounding,
                      ],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-sm text-muted-foreground">{k}</p>
                        <p className="mt-1 font-medium">{v}</p>
                      </div>
                    ))}
                    <p className="text-sm text-muted-foreground sm:col-span-2">
                      Perubahan tarif berlaku untuk transaksi berikutnya.
                      Riwayat transaksi tetap memakai kebijakan sebelumnya.
                    </p>
                  </div>
                );
              })()}
            {p.view === "menus" &&
              (() => {
                const d = q.data as SettingsMenuList;
                return (
                  <>
                    <input
                      className="ui-input max-w-sm"
                      aria-label="Cari menu"
                      placeholder="Cari nama menu..."
                      value={s.search}
                      onChange={(e) => s.setSearch(e.target.value)}
                    />
                    <div className="ui-card overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            {[
                              "Menu",
                              "Kategori",
                              "Harga",
                              "HPP / porsi",
                              "Status",
                              "Tindakan",
                            ].map((t) => (
                              <th key={t} className="p-3">
                                {t}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {d.items.map((m) => (
                            <tr
                              key={m.id}
                              className="border-b border-border hover:bg-muted/40"
                            >
                              <td className="p-3 font-medium">
                                {m.name}
                                <span className="block text-xs font-normal text-muted-foreground">
                                  {m.recipeName ?? "Belum terhubung resep"}
                                </span>
                              </td>
                              <td className="p-3">{m.category}</td>
                              <td className="p-3">
                                {m.price === null
                                  ? "Belum diatur"
                                  : settingsMoney(m.price)}
                              </td>
                              <td className="p-3">
                                {m.cost?.complete && m.cost.perOutput !== null
                                  ? settingsMoney(
                                      Number(m.cost.perOutput) *
                                        Number(m.portions),
                                    )
                                  : "Belum tersedia"}
                              </td>
                              <td className="p-3">{settingsMenuStatus(m)}</td>
                              <td className="p-3">
                                {p.canManage && (
                                  <div className="flex gap-3">
                                    <Link
                                      href={edit(m.id)}
                                      className="text-primary underline"
                                    >
                                      Edit
                                    </Link>
                                    <button
                                      className="text-primary underline"
                                      onClick={() =>
                                        s.setModal({
                                          action: "price",
                                          title: `Atur harga: ${m.name}`,
                                          values: {
                                            id: m.id,
                                            revision: m.revision,
                                            amount: m.price ?? "",
                                            effectiveFrom: "",
                                            reason: "",
                                          },
                                          fields: [
                                            {
                                              key: "amount",
                                              type: "currency",
                                              label: "Harga (Rp)",
                                              required: true,
                                            },
                                            {
                                              key: "effectiveFrom",
                                              label:
                                                "Berlaku mulai (kosong = sekarang)",
                                              type: "datetime-local",
                                            },
                                            {
                                              key: "reason",
                                              label: "Alasan perubahan",
                                              required: true,
                                            },
                                          ],
                                        })
                                      }
                                    >
                                      Atur harga
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {!d.items.length && (
                        <p className="p-5 text-muted-foreground">
                          Belum ada menu yang sesuai.
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p>{d.total} menu</p>
                      <div className="flex gap-2">
                        <button
                          className="ui-button ui-button-secondary"
                          disabled={s.page === 1}
                          onClick={() => s.setPage(s.page - 1)}
                        >
                          Sebelumnya
                        </button>
                        <button
                          className="ui-button ui-button-secondary"
                          disabled={s.page * 20 >= d.total}
                          onClick={() => s.setPage(s.page + 1)}
                        >
                          Berikutnya
                        </button>
                      </div>
                    </div>
                    <section className="ui-card">
                      <h2 className="mb-3 font-semibold">Kategori menu</h2>
                      {options.error && (
                        <p role="alert">{settingsError(options.error)}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {options.data?.categories.map((c) => (
                          <button
                            key={c.id}
                            disabled={!p.canManage}
                            onClick={() => s.setModal(categorySpec(c))}
                            className="ui-button ui-button-secondary"
                          >{`${c.name}${c.active ? "" : " (nonaktif)"}`}</button>
                        ))}
                      </div>
                    </section>
                  </>
                );
              })()}
            {p.view === "payments" &&
              (() => {
                const d = q.data as SettingsPayments;
                return (
                  <>
                    <section className="ui-card">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Preferensi struk</h2>
                        {p.canManage && (
                          <Link
                            href={edit(undefined, "receipt")}
                            className="ui-button ui-button-secondary"
                          >
                            Edit struk
                          </Link>
                        )}
                      </div>
                      {receipt.data ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Kertas {receipt.data.paperWidth} mm.{" "}
                          {receipt.data.header || "Teks pembuka belum diatur."}{" "}
                          {receipt.data.footer}
                        </p>
                      ) : (
                        <p role="status">
                          {receipt.error
                            ? settingsError(receipt.error)
                            : "Memuat preferensi..."}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        Preferensi ini digunakan oleh integrasi printer dan
                        struk POS.
                      </p>
                    </section>
                    <div className="grid gap-4 md:grid-cols-2">
                      {d.items.map((m) => (
                        <section key={m.id} className="ui-card">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h2 className="font-semibold">{m.name}</h2>
                              <p className="mt-1 text-sm text-muted-foreground">{`${m.kind.toUpperCase()} / ${m.active ? "Aktif" : "Nonaktif"}`}</p>
                            </div>
                            {p.canManage && (
                              <button
                                className="ui-button ui-button-secondary"
                                onClick={() => s.setModal(paymentSpec(d, m))}
                              >
                                Edit
                              </button>
                            )}
                          </div>
                          <p className="mt-3 text-sm">{m.clearingAccount}</p>
                          {m.approval && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Memerlukan persetujuan pembayaran.
                            </p>
                          )}
                        </section>
                      ))}
                    </div>
                    {!d.items.length && (
                      <p className="ui-card">
                        Belum ada metode pembayaran. Buat akun dana di Keuangan
                        sebelum menambah metode tunai.
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Konfigurasi merchant menyimpan referensi penyedia.
                      Aktivasi gateway pembayaran memerlukan integrasi layanan
                      tersendiri.
                    </p>
                  </>
                );
              })()}
            {p.view === "access" &&
              (() => {
                const d = q.data as SettingsAccess;
                return (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      {d.roles.map((r) => (
                        <section key={r.id} className="ui-card">
                          <div className="flex items-center justify-between">
                            <h2 className="font-semibold">{r.name}</h2>
                            {p.canManage && r.name !== "Pemilik" && (
                              <Link
                                href={edit(r.id)}
                                className="ui-button ui-button-secondary"
                              >
                                Edit hak akses
                              </Link>
                            )}
                          </div>
                          <p className="mt-3 text-sm text-muted-foreground">{`${r.permissions.length} izin / batas diskon ${r.discountPercent}%`}</p>
                          {r.name === "Pemilik" && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Hak akses Pemilik dilindungi.
                            </p>
                          )}
                        </section>
                      ))}
                    </div>
                    <section className="ui-card">
                      <h2 className="mb-3 font-semibold">Role karyawan</h2>
                      {!d.canReadStaff ? (
                        <p>Izin membaca karyawan diperlukan.</p>
                      ) : (
                        d.employees.map((e) => (
                          <div
                            key={e.id}
                            className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3"
                          >
                            <div>
                              <p className="font-medium">{e.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {e.roleIds
                                  .map(
                                    (id) =>
                                      d.roles.find((r) => r.id === id)?.name ??
                                      "-",
                                  )
                                  .join(", ") || "Belum memiliki role"}
                              </p>
                            </div>
                            {p.canManage && p.canAssign && (
                              <button
                                disabled={e.id === d.actorId || !e.active}
                                className="ui-button ui-button-secondary"
                                onClick={() =>
                                  s.setModal({
                                    action: "assignment",
                                    title: `Atur role: ${e.name}`,
                                    values: {
                                      employeeId: e.id,
                                      expectedRoles: e.roleIds,
                                      roleId: e.roleIds[0] ?? "",
                                    },
                                    fields: [
                                      {
                                        key: "roleId",
                                        label: "Role karyawan",
                                        required: true,
                                        choices: d.roles.map((r) => ({
                                          id: r.id,
                                          name: r.name,
                                        })),
                                      },
                                    ],
                                  })
                                }
                              >
                                Atur role
                              </button>
                            )}
                          </div>
                        ))
                      )}
                      <Link
                        href="/karyawan"
                        className="mt-4 inline-block text-sm text-primary underline"
                      >
                        Kelola profil karyawan
                      </Link>
                    </section>
                  </>
                );
              })()}
          </>
        )
      )}
      {s.modal && (
        <FormModal label={s.modal.title} onClose={() => s.setModal(null)}>
          <SettingsForm
            outletId={p.outletId}
            spec={s.modal}
            onSaved={s.saved}
            onCancel={() => s.setModal(null)}
          />
        </FormModal>
      )}
    </div>
  );
}
