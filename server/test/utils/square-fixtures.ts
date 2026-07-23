/**
 * Ready-made Square SDK fixtures for the SquareService boundary tests.
 *
 * The scenario mirrors the challenge seed guidance: two locations, two categories, and items
 * including one present at only ONE location — so the availability resolution has something to
 * prove once the catalog service (M4) consumes this snapshot.
 */
import type { Square } from 'square';

import { makeCategory, makeItem, makeLocation, makeMoney, makeVariation } from './catalog-builders';

export const DOWNTOWN_LOCATION_ID = 'loc-downtown';
export const AIRPORT_LOCATION_ID = 'loc-airport';

export const TWO_LOCATIONS: Square.Location[] = [
  makeLocation({ id: DOWNTOWN_LOCATION_ID, name: 'Downtown', timezone: 'America/New_York' }),
  makeLocation({ id: AIRPORT_LOCATION_ID, name: 'Airport', timezone: 'America/Chicago' }),
];

export const COFFEE_CATEGORY_ID = 'cat-coffee';
export const PASTRY_CATEGORY_ID = 'cat-pastry';

export const CATEGORIES: Square.CatalogObject.Category[] = [
  makeCategory({ id: COFFEE_CATEGORY_ID, categoryData: { name: 'Coffee' } }),
  makeCategory({ id: PASTRY_CATEGORY_ID, categoryData: { name: 'Pastry' } }),
];

export const ITEMS: Square.CatalogObject.Item[] = [
  // Available everywhere.
  makeItem({
    id: 'item-latte',
    presentAtAllLocations: true,
    itemData: {
      name: 'Latte',
      description: 'Espresso with steamed milk',
      categoryId: COFFEE_CATEGORY_ID,
      variations: [
        makeVariation({ id: 'var-latte', itemVariationData: { priceMoney: makeMoney(500) } }),
      ],
    },
  }),
  // Present at all locations, but explicitly absent at the airport.
  makeItem({
    id: 'item-drip',
    presentAtAllLocations: true,
    absentAtLocationIds: [AIRPORT_LOCATION_ID],
    itemData: {
      name: 'Drip Coffee',
      categoryId: COFFEE_CATEGORY_ID,
      variations: [
        makeVariation({ id: 'var-drip', itemVariationData: { priceMoney: makeMoney(300) } }),
      ],
    },
  }),
  // Single-location: only at downtown (proves the location filter).
  makeItem({
    id: 'item-croissant',
    presentAtAllLocations: false,
    presentAtLocationIds: [DOWNTOWN_LOCATION_ID],
    itemData: {
      name: 'Croissant',
      categoryId: PASTRY_CATEGORY_ID,
      variations: [
        makeVariation({ id: 'var-croissant', itemVariationData: { priceMoney: makeMoney(375) } }),
      ],
    },
  }),
];

/** All catalog objects a mocked `catalog.list` page would yield, interleaved as Square returns them. */
export const CATALOG_OBJECTS: Square.CatalogObject[] = [...CATEGORIES, ...ITEMS];
