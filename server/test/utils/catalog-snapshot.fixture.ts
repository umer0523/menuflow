/**
 * Internal-model `CatalogSnapshot` — the shape `SquareService.getCatalog()` actually returns
 * (post-mapping), which the catalog service + e2e consume. Mirrors the same seed scenario as the
 * SDK-level `square-fixtures.ts` (two locations, two categories, a single-location item) and reuses
 * its id constants, so the two tiers stay in lockstep without duplicating the scenario's identity.
 */
import type { CatalogSnapshot } from '../../src/square/square.types';

import {
  AIRPORT_LOCATION_ID,
  COFFEE_CATEGORY_ID,
  DOWNTOWN_LOCATION_ID,
  PASTRY_CATEGORY_ID,
} from './square-fixtures';

export { AIRPORT_LOCATION_ID, COFFEE_CATEGORY_ID, DOWNTOWN_LOCATION_ID, PASTRY_CATEGORY_ID };

const USD = 'USD';

/** Latte — available at every location. */
export const LATTE_PRICE = 500;
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
    },
    {
      id: PASTRY_CATEGORY_ID,
      name: 'Pastry',
      presentAtAllLocations: true,
      presentAtLocationIds: [],
      absentAtLocationIds: [],
    },
  ],
  items: [
    {
      id: 'item-latte',
      name: 'Latte',
      description: 'Espresso with steamed milk',
      categoryId: COFFEE_CATEGORY_ID,
      imageIds: [],
      variations: [
        { id: 'var-latte', name: 'Regular', price: { amount: LATTE_PRICE, currency: USD } },
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
};
