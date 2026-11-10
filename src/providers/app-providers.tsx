import {
  HydrationBoundary,
  QueryClientProvider,
  type DehydratedState,
} from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

import { createQueryClient } from "@/lib/query-client";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ErpUiStoreProvider, useErpUiStore } from "@/stores/erp-ui-store";

export type AppPageProps = { dehydratedState?: DehydratedState };

function AuthCacheBoundary({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const uiStore = useErpUiStore();

  useEffect(() => {
    // Keep the scaffold buildable before project credentials are supplied.
    if (!isSupabaseConfigured()) return;

    let previousUserId: string | null | undefined;
    const { data } = getSupabaseBrowserClient().auth.onAuthStateChange(
      (event, session) => {
        const userId = session?.user.id ?? null;

        if (
          event === "SIGNED_OUT" ||
          (previousUserId !== undefined && previousUserId !== userId)
        ) {
          queryClient.clear();
          uiStore.setState((state) => ({ ...state, selectedOutletId: null }));
        }

        previousUserId = userId;
      },
    );

    return () => data.subscription.unsubscribe();
  }, [queryClient, uiStore]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export function AppProviders({
  children,
  dehydratedState,
}: AppPageProps & { children: ReactNode }) {
  return (
    <ErpUiStoreProvider>
      <AuthCacheBoundary>
        <HydrationBoundary state={dehydratedState}>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </HydrationBoundary>
      </AuthCacheBoundary>
    </ErpUiStoreProvider>
  );
}
