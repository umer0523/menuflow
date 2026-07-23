/**
 * Builders for the Square **SDK** objects `SquareService` receives (camelCase, bigint money) —
 * the raw input to the boundary. Tests construct catalog/location fixtures declaratively and
 * feed them through a mocked `SQUARE_CLIENT`. Only the fields MenuFlow reads are set (ISP).
 *
 * (M2 note: these replaced the earlier snake_case wire-shape placeholders once the real SDK
 * contract landed — the SDK deserializes to camelCase, so the builders now match reality.)
 */
import { Square } from 'square';

const DEFAULT_CURRENCY: Square.Currency = 'USD';

export function makeMoney(
  amount: number,
  currency: Square.Currency = DEFAULT_CURRENCY,
): Square.Money {
  return { amount: BigInt(amount), currency };
}

export function makeVariation(
  overrides: Partial<Square.CatalogObject.ItemVariation> = {},
): Square.CatalogObject.ItemVariation {
  const { itemVariationData, ...rest } = overrides;
  return {
    type: 'ITEM_VARIATION',
    id: 'var-default',
    itemVariationData: { name: 'Regular', priceMoney: makeMoney(500), ...itemVariationData },
    ...rest,
  };
}

export function makeItem(
  overrides: Partial<Square.CatalogObject.Item> = {},
): Square.CatalogObject.Item {
  const { itemData, ...rest } = overrides;
  return {
    type: 'ITEM',
    id: 'item-default',
    presentAtAllLocations: true,
    itemData: {
      name: 'Default Item',
      variations: [makeVariation()],
      ...itemData,
    },
    ...rest,
  };
}

export function makeCategory(
  overrides: Partial<Square.CatalogObject.Category> = {},
): Square.CatalogObject.Category {
  const { categoryData, ...rest } = overrides;
  return {
    type: 'CATEGORY',
    id: 'cat-default',
    presentAtAllLocations: true,
    categoryData: { name: 'Default Category', ...categoryData },
    ...rest,
  };
}

export function makeImage(
  overrides: Partial<Square.CatalogObject.Image> = {},
): Square.CatalogObject.Image {
  const { imageData, ...rest } = overrides;
  return {
    type: 'IMAGE',
    id: 'img-default',
    imageData: { name: 'Default Image', url: 'https://example.com/default.png', ...imageData },
    ...rest,
  };
}

export function makeLocation(overrides: Partial<Square.Location> = {}): Square.Location {
  return {
    id: 'loc-default',
    name: 'Default Location',
    timezone: 'America/New_York',
    currency: DEFAULT_CURRENCY,
    status: 'ACTIVE',
    ...overrides,
  };
}

export function makeAvailabilityPeriod(
  overrides: Partial<Square.CatalogObject.AvailabilityPeriod> = {},
): Square.CatalogObject.AvailabilityPeriod {
  const { availabilityPeriodData, ...rest } = overrides;
  return {
    type: 'AVAILABILITY_PERIOD',
    id: 'period-default',
    availabilityPeriodData: {
      dayOfWeek: 'MON',
      startLocalTime: '08:00:00',
      endLocalTime: '11:00:00',
      ...availabilityPeriodData,
    },
    ...rest,
  };
}
