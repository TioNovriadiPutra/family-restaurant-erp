import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "./config";

export function getSupabaseBrowserClient() {
  const { url, publishableKey } = getSupabaseConfig();

  // @supabase/ssr reuses a singleton only in the browser, not across SSR requests.
  return createBrowserClient(url, publishableKey);
}
