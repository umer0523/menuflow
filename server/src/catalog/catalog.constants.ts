/**
 * Fallback group for visible items whose `categoryId` matches no category in the snapshot (or is
 * absent). Real Square catalogs always categorize items, so this is a defensive bucket — it keeps
 * a visible item from silently vanishing rather than something the seed data exercises.
 */
export const UNCATEGORIZED = {
  id: null,
  name: 'Uncategorized',
} as const;
