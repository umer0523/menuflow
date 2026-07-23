'use client';

import { useEffect, useMemo, useState } from 'react';

import { CATEGORY_FILTER } from '@/constants/menu.constants';
import { categoryKey } from '@/lib/catalog/category-key';
import type { MenuCategoryView } from '@/lib/catalog/menu-view.types';

interface CategoryFilterState {
  /** The selected category key, or `CATEGORY_FILTER.ALL_KEY` for "show everything". */
  selectedKey: string;
  setSelectedKey: (key: string) => void;
  /** `categories` narrowed to the selection — the full list when "All" is active. */
  filteredCategories: MenuCategoryView[];
}

/**
 * Ephemeral category-filter UI state for the menu (core requirement #4). Selection is **not**
 * persisted (per the spec, only the location is): it resets to "All" whenever the selected category
 * is no longer present — e.g. after a location switch changes the available categories, mirroring
 * the validity guard the location switcher uses for a stale stored location.
 */
export function useCategoryFilter(categories: MenuCategoryView[]): CategoryFilterState {
  const [selectedKey, setSelectedKey] = useState<string>(CATEGORY_FILTER.ALL_KEY);

  const isSelectionPresent =
    selectedKey === CATEGORY_FILTER.ALL_KEY ||
    categories.some((category) => categoryKey(category.id) === selectedKey);

  useEffect(() => {
    if (!isSelectionPresent) {
      setSelectedKey(CATEGORY_FILTER.ALL_KEY);
    }
  }, [isSelectionPresent]);

  const filteredCategories = useMemo(() => {
    if (selectedKey === CATEGORY_FILTER.ALL_KEY || !isSelectionPresent) {
      return categories;
    }
    return categories.filter((category) => categoryKey(category.id) === selectedKey);
  }, [categories, selectedKey, isSelectionPresent]);

  return { selectedKey, setSelectedKey, filteredCategories };
}
