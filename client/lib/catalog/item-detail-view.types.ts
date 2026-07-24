/**
 * View model the item-detail component renders — the DTO adapted for display (prices pre-formatted,
 * the primary image resolved). Keeps the component free of formatting logic and wire-shape details.
 */
export interface ItemVariationView {
  id: string;
  name?: string;
  /** Pre-formatted price, or `null` when the variation is unpriced. */
  priceLabel: string | null;
}

export interface ItemDetailView {
  id: string;
  name: string;
  description?: string;
  /** Pre-formatted "from" price, or `null` when the item has no priced variation. */
  priceLabel: string | null;
  /** The primary image URL, or `null` when the item has no image (→ placeholder). */
  imageUrl: string | null;
  variations: ItemVariationView[];
  /** Whether the item is currently orderable, inherited from its category's time windows. */
  available: boolean;
  /** Today's orderable windows (location timezone) inherited from the category. null = no limit. */
  availabilityWindows: Array<{ startLocalTime: string; endLocalTime: string }> | null;
}
