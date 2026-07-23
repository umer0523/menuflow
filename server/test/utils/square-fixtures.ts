/**
 * Ready-made raw Square fixtures for the availability / money / category tests.
 *
 * The scenario deliberately includes an item present at only ONE of the two locations,
 * so the `present_at_all_locations` / `present_at_location_ids` / `absent_at_location_ids`
 * resolution (architecture doc §6) has something to prove. Extend as M2/M4 land.
 */
import {
  makeCategory,
  makeItem,
  makeLocation,
  makeMoney,
  makeVariation,
  type SquareCatalogCategory,
  type SquareCatalogItem,
  type SquareLocation,
} from './catalog-builders';

export const DOWNTOWN_LOCATION_ID = 'loc-downtown';
export const AIRPORT_LOCATION_ID = 'loc-airport';

export const TWO_LOCATIONS: SquareLocation[] = [
  makeLocation({ id: DOWNTOWN_LOCATION_ID, name: 'Downtown', timezone: 'America/New_York' }),
  makeLocation({ id: AIRPORT_LOCATION_ID, name: 'Airport', timezone: 'America/Chicago' }),
];

export const COFFEE_CATEGORY_ID = 'cat-coffee';
export const PASTRY_CATEGORY_ID = 'cat-pastry';

export const CATEGORIES: SquareCatalogCategory[] = [
  makeCategory({ id: COFFEE_CATEGORY_ID, category_data: { name: 'Coffee' } }),
  makeCategory({ id: PASTRY_CATEGORY_ID, category_data: { name: 'Pastry' } }),
];

export const ITEMS: SquareCatalogItem[] = [
  // Available everywhere.
  makeItem({
    id: 'item-latte',
    present_at_all_locations: true,
    item_data: {
      name: 'Latte',
      description: 'Espresso with steamed milk',
      category_id: COFFEE_CATEGORY_ID,
      variations: [
        makeVariation({ id: 'var-latte', item_variation_data: { price_money: makeMoney(500) } }),
      ],
    },
  }),
  // Present at all locations, but explicitly absent at the airport.
  makeItem({
    id: 'item-drip',
    present_at_all_locations: true,
    absent_at_location_ids: [AIRPORT_LOCATION_ID],
    item_data: {
      name: 'Drip Coffee',
      category_id: COFFEE_CATEGORY_ID,
      variations: [
        makeVariation({ id: 'var-drip', item_variation_data: { price_money: makeMoney(300) } }),
      ],
    },
  }),
  // Single-location: only at downtown (proves the location filter).
  makeItem({
    id: 'item-croissant',
    present_at_all_locations: false,
    present_at_location_ids: [DOWNTOWN_LOCATION_ID],
    item_data: {
      name: 'Croissant',
      category_id: PASTRY_CATEGORY_ID,
      variations: [
        makeVariation({
          id: 'var-croissant',
          item_variation_data: { price_money: makeMoney(375) },
        }),
      ],
    },
  }),
];
