import Link from "next/link";
import type { ErpLayoutProps } from "@/interfaces/layout";
import { useErpLayout } from "@/hooks/layout/use-erp-layout";
import { ErpSidebar } from "./erp-sidebar";
import { ErpHeader } from "./erp-header";

export function ErpLayout({ session: initialSession, children }: ErpLayoutProps) {
  const layout = useErpLayout(initialSession);
  if (!layout.session || !layout.selected) return <main className="grid min-h-dvh place-items-center p-6"><div className="ui-card max-w-lg"><h1 className="type-24-semibold">Sesi tidak dapat diverifikasi</h1><p className="mt-4 text-muted-foreground">{layout.error ?? "Silakan masuk kembali."}</p><Link href="/login" className="ui-button ui-button-primary mt-6">Masuk kembali</Link></div></main>;
  return <div className="min-h-dvh bg-background">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface focus:p-4">Lewati navigasi</a>
    <ErpSidebar items={layout.items} activePath={layout.activePath} outletName={layout.selected.outlet_name} roles={layout.roles}
      collapsed={layout.state.sidebarCollapsed} mobileOpen={layout.state.mobileSidebarOpen} closeMobile={layout.closeMobile} onNavigate={layout.closeMobile} />
    <div className={layout.state.sidebarCollapsed ? "lg:ml-20" : "lg:ml-[232px]"}>
      <ErpHeader title={layout.title} session={layout.session} outlets={layout.outlets} mobileOpen={layout.state.mobileSidebarOpen} collapsed={layout.state.sidebarCollapsed} roles={layout.roles} outletId={layout.selected.outlet_id}
        onOutletChange={layout.changeOutlet} toggleSidebar={layout.toggleSidebar} toggleMobile={layout.toggleMobile}
        logout={layout.logout} loggingOut={layout.loggingOut} error={layout.error} />
      <main id="main-content" tabIndex={-1} className="p-4 outline-none sm:p-8">
        {layout.allowed ? children : <div className="ui-alert ui-alert-warning" role="alert">Anda tidak memiliki izin modul ini pada outlet yang dipilih.</div>}
      </main>
    </div>
  </div>;
}
