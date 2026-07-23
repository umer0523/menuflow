import { UNCATEGORIZED_KEY } from '@/constants/menu.constants';

/**
 * A stable string key for a category. A category `id` can be `null` (the Uncategorized bucket), so
 * this collapses `null` to a namespaced sentinel — letting the filter model selection as one string
 * and the section list use a single keying rule. One home for the rule (DRY).
 */
export function categoryKey(id: string | null): string {
  return id ?? UNCATEGORIZED_KEY;
}
