import type { GetServerSideProps } from "next";
import type { ErpPageProps } from "@/interfaces/layout";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { readAuthSession } from "@/pages/api/auth/[action]";
import { canAccessOutlet } from "@/lib/erp-access";

export function requireErpPage(permission?: string | string[]): GetServerSideProps<ErpPageProps> {
  return async ({ req, res }) => {
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Vary", "Cookie");
    if (!isSupabaseConfigured()) return { redirect: { destination: "/login", permanent: false } };
    try {
      const session = await readAuthSession({ req, res });
      if (!session) return { redirect: { destination: "/login", permanent: false } };
      const required = typeof permission === "string" ? [permission] : permission ?? [];
      const access = session.access.filter(row => required.every(code => canAccessOutlet(session.access, row.outlet_id, code)));
      if (!access.length) {
        res.statusCode = 403;
        return { props: { session, unavailable: false, forbidden: true } };
      }
      return { props: { session, unavailable: false } };
    } catch {
      res.statusCode = 503;
      return { props: { session: null, unavailable: true } };
    }
  };
}
