import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  // Create per mounted app (and per SSR request), never as a server singleton.
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
      },
    },
  });
}
