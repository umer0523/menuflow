'use client';

import { useMemo } from 'react';
import { RefreshCw } from 'lucide-react';

import { CATEGORY_FILTER, MENU_COPY, MENU_SKELETON_COUNT } from '@/constants/menu.constants';
import { useCatalog } from '@/hooks/use-catalog';
import { useCategoryFilter } from '@/hooks/use-category-filter';
import { categoryKey } from '@/lib/catalog/category-key';
import { toMenuView } from '@/lib/catalog/to-menu-view';
import { useSelectedLocation } from '@/providers/location-provider';
import { getErrorMessage } from '@/utils/get-error-message';

import { CategoryFilter } from './category-filter';
import { MenuCategorySection } from './menu-category-section';

/** A filter is only useful once there's more than one category to choose between. */
const MIN_CATEGORIES_FOR_FILTER = 2;

/**
 * Grouped, location-aware menu (core requirements #2, #3, #4 + time-of-day bonus). Re-fetches
 * whenever the selected location changes and renders explicit loading / empty / error+retry states.
 *
 * Unavailable categories (outside their time window) are shown dimmed with an "Available HH–HH"
 * badge rather than hidden — the category filter chips only list currently-orderable categories,
 * but the "All" view always shows every category so guests know what's coming up.
 */
export function MenuBrowser() {
  const { selectedLocationId } = useSelectedLocation();
  const { data, isPending, isError, error, refetch } = useCatalog(selectedLocationId);

  const allCategories = useMemo(() => (data ? toMenuView(data) : []), [data]);
  const availableCategories = useMemo(
    () => allCategories.filter((c) => c.available),
    [allCategories],
  );
  const { selectedKey, setSelectedKey, filteredCategories } =
    useCategoryFilter(availableCategories);

  // "All" shows every category (available normal, unavailable dimmed); a specific filter shows only
  // that category (always available, since unavailable ones never appear in the filter chips).
  const displayCategories = useMemo(
    () => (selectedKey === CATEGORY_FILTER.ALL_KEY ? allCategories : filteredCategories),
    [selectedKey, allCategories, filteredCategories],
  );

  if (isPending) {
    return (
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
        aria-label={MENU_COPY.LOADING_LABEL}
      >
        {Array.from({ length: MENU_SKELETON_COUNT }).map((_, index) => (
          <span key={index} className="h-28 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="flex items-center gap-3 text-sm text-destructive">
        <span>{getErrorMessage(error)}</span>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 font-medium text-foreground hover:bg-accent"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          {MENU_COPY.RETRY}
        </button>
      </div>
    );
  }

  if (allCategories.length === 0) {
    return <p className="text-sm text-muted-foreground">{MENU_COPY.EMPTY}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {availableCategories.length >= MIN_CATEGORIES_FOR_FILTER ? (
        <CategoryFilter
          categories={availableCategories}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
        />
      ) : null}
      <div className="flex flex-col gap-8">
        {displayCategories.map((category) => (
          <MenuCategorySection key={categoryKey(category.id)} category={category} />
        ))}
      </div>
    </div>
  );
}
