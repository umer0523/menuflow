'use client';

import { useCatalogControllerGetItem } from '@/lib/api/generated/catalog/catalog';

/**
 * Server-state seam for a single item's detail. Keyed on `itemId` + `locationId`; disabled until a
 * location is chosen (availability — and thus reachability — is location-scoped). `retry: false` so
 * a legitimate 404 surfaces immediately as a not-found state instead of being retried.
 */
export function useItem(itemId: string, locationId: string | null) {
  return useCatalogControllerGetItem(
    itemId,
    { locationId: locationId ?? '' },
    { query: { enabled: itemId !== '' && locationId !== null && locationId !== '', retry: false } },
  );
}
