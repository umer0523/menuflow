'use client';

import { RefreshCw } from 'lucide-react';

import { MENU_COPY, MENU_SKELETON_COUNT } from '@/constants/menu.constants';
import { useCatalog } from '@/hooks/use-catalog';
import { toMenuView } from '@/lib/catalog/to-menu-view';
import { useSelectedLocation } from '@/providers/location-provider';
import { getErrorMessage } from '@/utils/get-error-message';

import { MenuCategorySection } from './menu-category-section';

/**
 * Grouped, location-aware menu (core requirements #2 + #3). Re-fetches whenever the selected
 * location changes (the query is keyed on it) and renders explicit loading / empty / error+retry
 * states — never a bare spinner. Server state stays in TanStack Query; the selected location is UI
 * state from the provider.
 */
export function MenuBrowser() {
  const { selectedLocationId } = useSelectedLocation();
  const { data, isPending, isError, error, refetch } = useCatalog(selectedLocationId);

  if (isPending) {
    return (
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
        aria-label="Loading menu"
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

  const categories = toMenuView(data);

  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">{MENU_COPY.EMPTY}</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {categories.map((category) => (
        <MenuCategorySection key={category.id ?? 'uncategorized'} category={category} />
      ))}
    </div>
  );
}
