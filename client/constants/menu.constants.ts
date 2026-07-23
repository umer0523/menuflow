/** User-facing copy + tuning for the menu views — no hardcoded strings/numbers in components. */
export const MENU_COPY = {
  EMPTY: 'No items are available at this location yet.',
  RETRY: 'Retry',
  NO_PRICE: 'Price unavailable',
} as const;

/** Placeholder cards shown while the menu loads (a bounded skeleton, never an infinite spinner). */
export const MENU_SKELETON_COUNT = 6;

/**
 * Category filter copy + the "All" sentinel. `ALL_KEY`/`UNCATEGORIZED_KEY` are namespaced strings
 * that can't collide with a real Square category id, so selection can be modeled as a single string
 * key even though a category id may be `null` (the Uncategorized bucket).
 */
export const CATEGORY_FILTER = {
  ALL_KEY: 'all',
  ALL_LABEL: 'All',
  FILTER_LABEL: 'Filter by category',
} as const;

/** Stable key for a category whose id is `null` (the Uncategorized bucket) — see `category-key.ts`. */
export const UNCATEGORIZED_KEY = 'uncategorized';

/** Item-detail view copy. */
export const ITEM_DETAIL = {
  NOT_FOUND: "This item isn't on the menu at this location.",
  BACK: 'Back to menu',
  OPTIONS_LABEL: 'Options',
  NO_IMAGE: 'No image available',
} as const;
