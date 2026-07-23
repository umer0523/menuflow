/** User-facing copy + tuning for the menu views — no hardcoded strings/numbers in components. */
export const MENU_COPY = {
  EMPTY: 'No items are available at this location yet.',
  RETRY: 'Retry',
  NO_PRICE: 'Price unavailable',
} as const;

/** Placeholder cards shown while the menu loads (a bounded skeleton, never an infinite spinner). */
export const MENU_SKELETON_COUNT = 6;
