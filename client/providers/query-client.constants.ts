/** Default TanStack Query behavior. Menu data is short-lived server state, so we
    keep a modest stale window and avoid noisy refetch-on-focus during browsing. */
export const QUERY_CLIENT_DEFAULTS = {
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
} as const;
