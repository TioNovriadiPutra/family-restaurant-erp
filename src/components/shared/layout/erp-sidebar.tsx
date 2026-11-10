import Link from "next/link";
import { CloseCircle } from "iconsax-reactjs";
import type { SidebarProps } from "@/interfaces/layout";
import { useSidebarDialog } from "@/hooks/layout/use-sidebar-dialog";

export function ErpSidebar(props: SidebarProps) {
  const dialogRef = useSidebarDialog(props.mobileOpen);
  const navigation = <>
    <Link href="/" className="flex min-h-24 items-center gap-3 px-5" onClick={props.onNavigate} aria-label="Dapur Keluarga — Ringkasan">
      <span className="grid size-8 shrink-0 place-items-center rounded-control bg-primary type-13-semibold text-primary-foreground">DK</span>
      <span className={props.collapsed ? "lg:sr-only" : ""}><span className="block type-16-semibold">Dapur Keluarga</span><span className="mt-1 block type-13-regular text-muted-foreground">Manajemen restoran</span></span>
    </Link>
    <p className={`px-6 pb-4 type-13-regular text-muted-foreground ${props.collapsed ? "lg:sr-only" : ""}`}>Operasional</p>
    <nav aria-label="Navigasi ERP" className="grid gap-2 px-4">
      {props.items.map(({ icon: Icon, ...item }) => <Link key={item.slug} href={`/${item.slug}`} onClick={props.onNavigate}
        aria-current={props.activePath === `/${item.slug}` || (item.slug && props.activePath.startsWith(`/${item.slug}/`)) ? "page" : undefined}
        title={props.collapsed ? item.label : undefined} className="ui-nav-item min-h-11 lg:min-h-10">
        <Icon aria-hidden="true" size={20} variant="Linear" className="shrink-0" />
        <span className={props.collapsed ? "lg:sr-only" : ""}>{item.label}</span>
      </Link>)}
    </nav>
    <div className={`mx-4 mt-auto border-t border-border px-2 py-6 ${props.collapsed ? "lg:sr-only" : ""}`}>
      <p className="break-words type-13-regular text-muted-foreground">{props.outletName}</p>
      <p className="mt-4 type-13-semibold">{props.roles}</p>
    </div>
  </>;
  return <>
    <aside id="erp-desktop-sidebar" className={`ui-sidebar fixed inset-y-0 left-0 z-20 hidden flex-col lg:flex ${props.collapsed ? "!w-20" : ""}`}>{navigation}</aside>
    <dialog id="erp-mobile-sidebar" ref={dialogRef} onClose={props.closeMobile} onCancel={props.closeMobile} aria-label="Menu ERP"
      className="m-0 h-dvh max-h-none w-[min(320px,calc(100%-32px))] max-w-none border-0 bg-secondary text-foreground backdrop:bg-foreground/30">
      <div className="flex min-h-full flex-col"><button type="button" className="ui-button ui-button-ghost m-4 ml-auto" onClick={props.closeMobile}><CloseCircle aria-hidden="true" size={20} variant="Linear" />Tutup menu</button>{navigation}</div>
    </dialog>
  </>;
}
