import "@/styles/globals.css";
import type { ErpAppProps } from "@/interfaces/layout";
import { Inter } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { ErpLayout } from "@/components/shared/layout/erp-layout";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function App({ Component, pageProps }: ErpAppProps) {
  return (
    <>
      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
        }
      `}</style>
      <AppProviders dehydratedState={pageProps.dehydratedState}>
        {Component.erpLayout && pageProps.session && !pageProps.unavailable ? (
          <ErpLayout session={pageProps.session}><Component {...pageProps} /></ErpLayout>
        ) : <Component {...pageProps} />}
      </AppProviders>
    </>
  );
}
