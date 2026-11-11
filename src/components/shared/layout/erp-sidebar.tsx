import Link from "next/link";
import { CloseCircle, Shop } from "iconsax-reactjs";
import type { SidebarProps } from "@/interfaces/layout";
import { useSidebarDialog } from "@/hooks/layout/use-sidebar-dialog";

export function ErpSidebar(props: SidebarProps) {
  const dialogRef = useSidebarDialog(props.mobileOpen);
  const managementStart = props.items.find(
    (item) => item.slug === "karyawan" || item.slug === "pengaturan",
  )?.slug;
  const navigation = (
    <>
      <Link
        prefetch={false}
        href="/"
        className="erp-sidebar-brand"
        onClick={props.onNavigate}
        aria-label="Dapur Keluarga — Ringkasan"
      >
        <span className="erp-brand-mark">DK</span>
        <span className={props.collapsed ? "lg:sr-only" : ""}>
          <span className="block type-16-semibold">Dapur Keluarga</span>
          <span className="mt-1 block type-13-regular text-muted-foreground">
            Manajemen restoran
          </span>
        </span>
      </Link>
      <p className={`erp-nav-label ${props.collapsed ? "lg:sr-only" : ""}`}>
        Menu utama
      </p>
      <nav aria-label="Navigasi ERP" className="erp-sidebar-nav">
        {props.items.map(({ icon: Icon, ...item }) => (
          <div key={item.slug}>
            {item.slug === managementStart && (
              <p
                className={`erp-nav-label !mx-3 !mb-3 !mt-6 ${props.collapsed ? "lg:sr-only" : ""}`}
              >
                Manajemen
              </p>
            )}
            <Link
              prefetch={false}
              href={`/${item.slug}`}
              onClick={props.onNavigate}
              aria-current={
                props.activePath === `/${item.slug}` ||
                (item.slug && props.activePath.startsWith(`/${item.slug}/`))
                  ? "page"
                  : undefined
              }
              title={props.collapsed ? item.label : undefined}
              className="ui-nav-item min-h-11 lg:min-h-10"
            >
              <Icon
                aria-hidden="true"
                size={20}
                variant="Linear"
                className="shrink-0"
              />
              <span className={props.collapsed ? "lg:sr-only" : ""}>
                {item.label}
              </span>
            </Link>
          </div>
        ))}
      </nav>
      <div className="mt-auto pt-8">
        <div
          className={`erp-outlet ${props.collapsed ? "lg:!mx-3 lg:!justify-center lg:!px-0" : ""}`}
        >
          <Shop
            aria-hidden="true"
            size={20}
            className="shrink-0 text-primary"
          />
          <div className={`min-w-0 ${props.collapsed ? "lg:sr-only" : ""}`}>
            <p className="truncate type-13-semibold">{props.outletName}</p>
            <p className="mt-1 type-13-regular text-muted-foreground">
              {props.roles}
            </p>
          </div>
        </div>
      </div>
    </>
  );
  return (
    <>
      <aside
        id="erp-desktop-sidebar"
        className={`ui-sidebar fixed inset-y-0 left-0 z-20 hidden flex-col lg:flex ${props.collapsed ? "!w-20" : ""}`}
      >
        {navigation}
      </aside>
      <dialog
        id="erp-mobile-sidebar"
        ref={dialogRef}
        onClose={props.closeMobile}
        onCancel={props.closeMobile}
        aria-label="Menu ERP"
        className="m-0 h-dvh max-h-none w-[min(320px,calc(100%-32px))] max-w-none border-0 bg-surface text-foreground backdrop:bg-foreground/30"
      >
        <div className="flex min-h-full flex-col">
          <button
            type="button"
            className="ui-button ui-button-ghost m-4 ml-auto"
            onClick={props.closeMobile}
          >
            <CloseCircle aria-hidden="true" size={20} variant="Linear" />
            Tutup menu
          </button>
          {navigation}
        </div>
      </dialog>
    </>
  );
}
