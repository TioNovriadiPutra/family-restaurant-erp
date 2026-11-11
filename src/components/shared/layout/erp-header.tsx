import { NavigationSearch } from "./navigation-search";
import {
  ArrowDown2,
  ArrowRight2,
  HamburgerMenu,
  Logout,
  ProfileCircle,
  Shop,
  SidebarLeft,
  SidebarRight,
} from "iconsax-reactjs";
import type { HeaderProps } from "@/interfaces/layout";
import { SelectInput } from "@/components/shared/select-input";

export function ErpHeader(props: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-toolbar min-w-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={props.toggleMobile}
          className="ui-button ui-button-ghost !size-11 shrink-0 !p-0 lg:hidden"
          aria-label="Buka menu navigasi"
          aria-expanded={props.mobileOpen}
          aria-controls="erp-mobile-sidebar"
        >
          <HamburgerMenu aria-hidden="true" size={22} variant="Linear" />
        </button>
        <button
          type="button"
          onClick={props.toggleSidebar}
          className="ui-button ui-button-ghost hidden !size-11 shrink-0 !p-0 lg:inline-flex"
          aria-label={props.collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          aria-expanded={!props.collapsed}
          aria-controls="erp-desktop-sidebar"
        >
          {props.collapsed ? (
            <SidebarRight aria-hidden="true" size={22} variant="Linear" />
          ) : (
            <SidebarLeft aria-hidden="true" size={22} variant="Linear" />
          )}
        </button>
        <div className="hidden w-64 min-w-0 md:block xl:w-80">
          <NavigationSearch items={props.navigationItems} />
        </div>
        <nav aria-label="Breadcrumb" className="min-w-0 md:hidden">
          <ol className="flex min-w-0 items-center gap-2 type-14-regular">
            <li className="hidden text-muted-foreground sm:block">
              Operasional
            </li>
            <li
              aria-hidden="true"
              className="hidden shrink-0 text-muted-foreground sm:block"
            >
              <ArrowRight2 size={14} variant="Linear" />
            </li>
            <li aria-current="page" className="truncate font-medium">
              {props.title}
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <span className="hidden max-w-52 items-center gap-2 truncate type-13-regular text-muted-foreground md:inline-flex">
          <Shop aria-hidden="true" size={17} className="shrink-0" />
          <span className="truncate">
            {
              props.outlets.find(
                (outlet) => outlet.outlet_id === props.outletId,
              )?.outlet_name
            }
          </span>
        </span>
        <details className="group relative sm:border-l sm:border-border sm:pl-4">
          <summary className="flex h-11 cursor-pointer list-none items-center gap-3 rounded-control px-2 text-foreground transition-colors hover:bg-secondary motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-primary">
              <ProfileCircle aria-hidden="true" size={24} variant="Linear" />
            </span>
            <span className="hidden max-w-40 truncate type-14-semibold sm:block">
              {props.roles}
            </span>
            <ArrowDown2
              aria-hidden="true"
              size={16}
              variant="Linear"
              className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none"
            />
            <span className="sr-only">Menu akun</span>
          </summary>
          <div className="ui-popover absolute right-0 top-full mt-3 w-[min(320px,calc(100vw-32px))] !p-0">
            <div className="border-b border-border p-4">
              <p className="type-14-semibold">{props.roles}</p>
              <p className="mt-1 break-words type-13-regular text-muted-foreground">
                {props.session.user.email}
              </p>
            </div>
            <div className="space-y-4 p-4">
              <div className="ui-field">
                <label
                  htmlFor="header-outlet"
                  className="ui-label flex items-center gap-2"
                >
                  <Shop aria-hidden="true" size={16} variant="Linear" />
                  Outlet aktif
                </label>
                <SelectInput
                  id="header-outlet"
                  className="min-h-11"
                  value={props.outletId}
                  onValueChange={props.onOutletChange}
                >
                  {props.outlets.map((outlet) => (
                    <option key={outlet.outlet_id} value={outlet.outlet_id}>
                      {outlet.outlet_name}
                    </option>
                  ))}
                </SelectInput>
              </div>
              {props.error && (
                <p role="alert" className="ui-field-error">
                  {props.error}
                </p>
              )}
              <button
                type="button"
                className="ui-button ui-button-secondary min-h-11 w-full"
                onClick={props.logout}
                disabled={props.loggingOut}
              >
                <Logout aria-hidden="true" size={18} variant="Linear" />
                {props.loggingOut ? "Mengakhiri sesi…" : "Keluar dari ERP"}
              </button>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
