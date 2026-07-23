import { QueryClient } from '@tanstack/react-query';

/**
 * A TanStack Query client tuned for tests: retries off (so error states surface
 * immediately instead of after backoff) and no `gcTime` churn between tests. Build a
 * fresh one per render so cache never leaks across cases.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}
