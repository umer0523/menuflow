/**
 * Internal-model `CatalogSnapshot` — the shape `SquareService.getCatalog()` actually returns
 * (post-mapping), which the catalog service + e2e consume. Mirrors the same seed scenario as the
 * SDK-level `square-fixtures.ts` (two locations, two categories, a single-location item) and reuses
 * its id constants, so the two tiers stay in lockstep without duplicating the scenario's identity.
 */
import type { CatalogSnapshot, SquareLocationModel } from '../../src/square/square.types';

import {
  AIRPORT_LOCATION_ID,
  COFFEE_CATEGORY_ID,
  DOWNTOWN_LOCATION_ID,
  LATTE_IMAGE_ID,
  LATTE_IMAGE_URL,
  PASTRY_CATEGORY_ID,
} from './square-fixtures';

export {
  AIRPORT_LOCATION_ID,
  COFFEE_CATEGORY_ID,
  DOWNTOWN_LOCATION_ID,
  LATTE_IMAGE_ID,
  LATTE_IMAGE_URL,
  PASTRY_CATEGORY_ID,
};

const USD = 'USD';

/**
 * Normalized `SquareLocationModel[]` as `SquareService.getLocations()` returns them (post-mapping) —
 * the shape `CatalogService` reads to resolve a location's timezone for time-of-day availability.
 * Distinct from the SDK-level `TWO_LOCATIONS` in `square-fixtures.ts`, which is the raw input.
 */
export const SNAPSHOT_LOCATIONS: SquareLocationModel[] = [
  {
    id: DOWNTOWN_LOCATION_ID,
    name: 'Downtown',
    timezone: 'America/New_York',
    currency: USD,
    status: 'ACTIVE',
  },
  {
    id: AIRPORT_LOCATION_ID,
    name: 'Airport',
    timezone: 'America/Chicago',
    currency: USD,
    status: 'ACTIVE',
  },
];

/** Latte — available at every location, with an image and two sizes (proves the variations list). */
export const LATTE_PRICE = 500;
export const LATTE_LARGE_PRICE = 600;
/** Drip — present everywhere except explicitly absent at the airport. */
export const DRIP_PRICE = 300;
/** Croissant — present at downtown only (proves the single-location filter). */
export const CROISSANT_PRICE = 375;

export const CATALOG_SNAPSHOT: CatalogSnapshot = {
  categories: [
    {
      id: COFFEE_CATEGORY_ID,
      name: 'Coffee',
      presentAtAllLocations: true,
      presentAtLocationIds: [],
      absentAtLocationIds: [],
      availabilityPeriodIds: [],
    },
    {
      id: PASTRY_CATEGORY_ID,
      name: 'Pastry',
      presentAtAllLocations: true,
      presentAtLocationIds: [],
      absentAtLocationIds: [],
      availabilityPeriodIds: [],
    },
  ],
  items: [
    {
      id: 'item-latte',
      name: 'Latte',
      description: 'Espresso with steamed milk',
      categoryId: COFFEE_CATEGORY_ID,
      imageIds: [LATTE_IMAGE_ID],
      variations: [
        { id: 'var-latte', name: 'Small', price: { amount: LATTE_PRICE, currency: USD } },
        { id: 'var-latte-lg', name: 'Large', price: { amount: LATTE_LARGE_PRICE, currency: USD } },
      ],
      presentAtAllLocations: true,
      presentAtLocationIds: [],
      absentAtLocationIds: [],
    },
    {
      id: 'item-drip',
      name: 'Drip Coffee',
      categoryId: COFFEE_CATEGORY_ID,
      imageIds: [],
      variations: [
        { id: 'var-drip', name: 'Regular', price: { amount: DRIP_PRICE, currency: USD } },
      ],
      presentAtAllLocations: true,
      presentAtLocationIds: [],
      absentAtLocationIds: [AIRPORT_LOCATION_ID],
    },
    {
      id: 'item-croissant',
      name: 'Croissant',
      categoryId: PASTRY_CATEGORY_ID,
      imageIds: [],
      variations: [
        { id: 'var-croissant', name: 'Regular', price: { amount: CROISSANT_PRICE, currency: USD } },
      ],
      presentAtAllLocations: false,
      presentAtLocationIds: [DOWNTOWN_LOCATION_ID],
      absentAtLocationIds: [],
    },
  ],
  images: { [LATTE_IMAGE_ID]: LATTE_IMAGE_URL },
  availabilityPeriods: {},
};
