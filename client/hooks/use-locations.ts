'use client';

import { useLocationsControllerGetLocations } from '@/lib/api/generated/locations/locations';

/**
 * Server-state seam for locations. Components depend on this wrapper — never on generated code
 * directly — so the generated client can be regenerated freely and tests mock a single module.
 */
export function useLocations() {
  return useLocationsControllerGetLocations();
}
