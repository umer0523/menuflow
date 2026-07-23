/**
 * Internal models — the normalized shapes MenuFlow works with after `SquareService`
 * maps Square's loosely-typed SDK objects. Square's own shapes never leave the `square/`
 * boundary; feature services (M3/M4) consume these and map them again to response DTOs.
 */

/** The subset of Square's SDK `Money` we read — amount is a bigint in the current SDK. */
export interface RawMoney {
  amount?: bigint | number | null;
  currency?: string | null;
}

/** Money kept as Square sends it: integer amount in the smallest unit (cents) + currency. */
export interface MoneyModel {
  amount: number;
  currency: string;
}

export interface ItemVariationModel {
  id: string;
  name?: string;
  price: MoneyModel | null;
}

/**
 * Location-availability inputs shared by items and categories. Kept as its own interface
 * so the availability rule (see `availability.util.ts`) depends only on these fields (ISP).
 */
export interface AvailabilityFields {
  presentAtAllLocations: boolean;
  presentAtLocationIds: string[];
  absentAtLocationIds: string[];
}

/**
 * The raw (all-optional) availability shape as it arrives on Square SDK objects — items and
 * categories share these fields without a common base class. Normalized into {@link AvailabilityFields}.
 */
export interface AvailabilitySource {
  presentAtAllLocations?: boolean;
  presentAtLocationIds?: string[];
  absentAtLocationIds?: string[];
}

export interface CatalogItemModel extends AvailabilityFields {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  imageIds: string[];
  variations: ItemVariationModel[];
}

export interface CatalogCategoryModel extends AvailabilityFields {
  id: string;
  name: string;
  availabilityPeriodIds: string[];
}

/** A normalized `CatalogAvailabilityPeriod` — time-of-day window for a category. */
export interface AvailabilityPeriodModel {
  id: string;
  startLocalTime: string;
  endLocalTime: string;
  dayOfWeek: string;
}

export interface SquareLocationModel {
  id: string;
  name: string;
  timezone: string;
  currency: string;
  status: string;
}

/**
 * A single normalized read of the Catalog: items + categories, pre-availability-filter, plus an
 * `imageId → url` map so consumers (the item-detail view) resolve an item's `imageIds` without a
 * second Square call. Populated from the IMAGE objects in the same paginated list read.
 */
export interface CatalogSnapshot {
  items: CatalogItemModel[];
  categories: CatalogCategoryModel[];
  images: Record<string, string>;
  availabilityPeriods: Record<string, AvailabilityPeriodModel>;
}
