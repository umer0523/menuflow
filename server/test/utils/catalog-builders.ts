/**
 * Builders for Square's *raw wire shapes* — the objects `SquareService` receives
 * before it normalizes them into our response DTOs. Tests drive the availability,
 * money, and category-grouping logic through these so they stay declarative and DRY.
 *
 * Only the subset of fields MenuFlow actually reads is modeled (never `any`); Square
 * returns more, but a consumer shouldn't depend on fields it never uses (ISP). When M2
 * lands the concrete `SquareService` internal models, extend these shapes in one place.
 */

/** Square money: integer amount in the smallest currency unit (cents) + ISO currency. */
export interface SquareMoney {
  amount: number;
  currency: string;
}

/** Fields shared by every Square catalog object that carries location availability. */
export interface SquareAvailability {
  present_at_all_locations: boolean;
  present_at_location_ids?: string[];
  absent_at_location_ids?: string[];
}

export interface SquareItemVariation {
  type: 'ITEM_VARIATION';
  id: string;
  item_variation_data: {
    name?: string;
    price_money?: SquareMoney;
  };
}

export interface SquareCatalogItem extends SquareAvailability {
  type: 'ITEM';
  id: string;
  item_data: {
    name: string;
    description?: string;
    category_id?: string;
    variations?: SquareItemVariation[];
  };
}

export interface SquareCatalogCategory extends SquareAvailability {
  type: 'CATEGORY';
  id: string;
  category_data: {
    name: string;
  };
}

export interface SquareLocation {
  id: string;
  name: string;
  timezone: string;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const DEFAULT_CURRENCY = 'USD';

export function makeMoney(amount: number, currency: string = DEFAULT_CURRENCY): SquareMoney {
  return { amount, currency };
}

export function makeVariation(overrides: Partial<SquareItemVariation> = {}): SquareItemVariation {
  return {
    type: 'ITEM_VARIATION',
    id: 'var-default',
    item_variation_data: { name: 'Regular', price_money: makeMoney(500) },
    ...overrides,
  };
}

export function makeItem(overrides: Partial<SquareCatalogItem> = {}): SquareCatalogItem {
  const { item_data, ...rest } = overrides;
  return {
    type: 'ITEM',
    id: 'item-default',
    present_at_all_locations: true,
    item_data: {
      name: 'Default Item',
      variations: [makeVariation()],
      ...item_data,
    },
    ...rest,
  };
}

export function makeCategory(
  overrides: Partial<SquareCatalogCategory> = {},
): SquareCatalogCategory {
  const { category_data, ...rest } = overrides;
  return {
    type: 'CATEGORY',
    id: 'cat-default',
    present_at_all_locations: true,
    category_data: { name: 'Default Category', ...category_data },
    ...rest,
  };
}

export function makeLocation(overrides: Partial<SquareLocation> = {}): SquareLocation {
  return {
    id: 'loc-default',
    name: 'Default Location',
    timezone: 'America/New_York',
    currency: DEFAULT_CURRENCY,
    status: 'ACTIVE',
    ...overrides,
  };
}
