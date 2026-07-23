'use client';

import { useCatalogControllerGetCatalog } from '@/lib/api/generated/catalog/catalog';

/**
 * Server-state seam for the grouped menu. Keyed on `locationId` (the generated query key includes
 * the params), so switching location re-fetches the correct availability set. Disabled until a
 * location is chosen — avoids firing a request with no location to scope availability to.
 * Components depend on this wrapper, never on generated code directly.
 */
export function useCatalog(locationId: string | null) {
  return useCatalogControllerGetCatalog(
    { locationId: locationId ?? '' },
    { query: { enabled: locationId !== null && locationId !== '' } },
  );
}
