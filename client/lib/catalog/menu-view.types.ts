/**
 * View models the menu components render — the DTO shape adapted for display (prices pre-formatted
 * to strings). Keeps components free of formatting logic and decoupled from the wire contract.
 */
export interface MenuItemView {
  id: string;
  name: string;
  description?: string;
  /** Pre-formatted "from" price, or `null` when the item has no priced variation. */
  priceLabel: string | null;
}

export interface MenuCategoryView {
  /** `null` for the Uncategorized bucket. */
  id: string | null;
  name: string;
  items: MenuItemView[];
  available: boolean;
  /** Today's orderable windows in the location timezone. null = no restriction. */
  availabilityWindows: Array<{ startLocalTime: string; endLocalTime: string }> | null;
}
