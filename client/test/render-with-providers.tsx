import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

import { createTestQueryClient } from './test-query-client';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Supply a shared client to assert on cache state; defaults to a fresh test client. */
  queryClient?: QueryClient;
}

interface RenderWithProvidersResult extends RenderResult {
  queryClient: QueryClient;
}

/**
 * Renders a component inside the providers it needs at runtime (TanStack Query) so
 * component tests mirror the real tree without hitting the network. Returns the
 * `queryClient` alongside Testing Library's result for cache assertions.
 */
export function renderWithProviders(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), ...options }: RenderWithProvidersOptions = {},
): RenderWithProvidersResult {
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}
