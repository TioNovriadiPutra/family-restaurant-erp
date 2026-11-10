import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import type { ServerAuthContext } from "@/interfaces/auth";

import { getSupabaseConfig } from "./config";


// Use inside getServerSideProps or a Pages API handler, once per request.
export function createSupabaseServerClient({ req, res }: ServerAuthContext) {
  const { url, publishableKey } = getSupabaseConfig();
  const cookies = new Map(
    parseCookieHeader(req.headers.cookie ?? "").map(({ name, value }) => [
      name,
      value,
    ]),
  );

  // Authenticated responses must never enter shared/CDN caches.
  res.setHeader("Cache-Control", "private, no-store");

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return Array.from(cookies, ([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet, headers) {
        const existing = res.getHeader("Set-Cookie");
        const previous =
          typeof existing === "string"
            ? [existing]
            : Array.isArray(existing)
              ? existing
              : [];

        const next = cookiesToSet.map(({ name, value, options }) => {
          cookies.set(name, value);
          return serializeCookieHeader(name, value, options);
        });

        res.setHeader("Set-Cookie", [...previous, ...next]);
        // Later server operations in this request must see rotated tokens too.
        req.headers.cookie = Array.from(cookies, ([name, value]) =>
          `${name}=${encodeURIComponent(value ?? "")}`,
        ).join("; ");
        // @supabase/ssr supplies additional no-cache headers when tokens rotate.
        Object.entries(headers).forEach(([name, value]) => {
          res.setHeader(name, value);
        });
      },
    },
  });
}
