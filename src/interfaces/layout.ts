import type { NextPage } from "next";
import type { AppProps } from "next/app";
import type { ReactNode } from "react";
import type { DehydratedState } from "@tanstack/react-query";
import type { AuthSession, OutletAccess } from "./auth";
import type { Icon } from "iconsax-reactjs";

export interface ErpPageProps {
  session: AuthSession | null;
  unavailable: boolean;
  forbidden?: boolean;
  module?: string;
  moduleSlug?: string;
  sectionSlug?: string;
}
export interface ApplicationPageProps extends Partial<ErpPageProps> {
  dehydratedState?: DehydratedState;
}
export type ErpPage<P = ErpPageProps> = NextPage<P> & { erpLayout?: boolean };
export type ErpAppProps = AppProps<ApplicationPageProps> & { Component: ErpPage<ApplicationPageProps> };
export interface ErpLayoutProps { session: AuthSession; children: ReactNode }
export interface PageStateProps { forbidden?: boolean }
export interface NavigationItem { slug: string; label: string; permission?: string; icon: Icon }
export interface SidebarProps {
  items: NavigationItem[];
  activePath: string;
  outletName: string;
  roles: string;
  collapsed: boolean;
  mobileOpen: boolean;
  closeMobile: () => void;
  onNavigate: () => void;
}
export interface HeaderProps {
  title: string;
  session: AuthSession;
  outlets: OutletAccess[];
  mobileOpen: boolean;
  collapsed: boolean;
  roles: string;
  outletId: string;
  onOutletChange: (id: string) => void;
  toggleSidebar: () => void;
  toggleMobile: () => void;
  logout: () => void;
  loggingOut: boolean;
  error: string | null;
}
