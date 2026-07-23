import { SquareObjectType } from './square-object-type.enum';

/**
 * In-memory cache tuning. The catalog changes rarely relative to request volume and Square
 * rate-limits, so a short TTL keeps location switching + category filtering off the wire
 * without risking stale menus. Process-local, best-effort — a miss simply refetches.
 */
export const SQUARE_CACHE = {
  LOCATIONS_KEY: 'locations',
  CATALOG_KEY: 'catalog',
  LOCATIONS_TTL_MS: 60_000,
  CATALOG_TTL_MS: 60_000,
} as const;

/** Catalog list is filtered server-side to only the object types MenuFlow renders. */
export const CATALOG_LIST_TYPES = `${SquareObjectType.Item},${SquareObjectType.Category}`;
