'use client';

import { CATEGORY_FILTER } from '@/constants/menu.constants';
import { categoryKey } from '@/lib/catalog/category-key';
import type { MenuCategoryView } from '@/lib/catalog/menu-view.types';
import { cn } from '@/lib/utils';

/**
 * Single-select category filter (core requirement #4). "All" plus one chip per category; the caller
 * only ever passes non-empty categories (the backend hides empty ones), so an empty category can
 * never appear here. Mirrors the location switcher's segmented control for a consistent, accessible
 * pattern (`aria-pressed`, keyboard focusable buttons).
 */
export function CategoryFilter({
  categories,
  selectedKey,
  onSelect,
}: {
  categories: MenuCategoryView[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  const options = [
    { key: CATEGORY_FILTER.ALL_KEY, label: CATEGORY_FILTER.ALL_LABEL },
    ...categories.map((category) => ({ key: categoryKey(category.id), label: category.name })),
  ];

  return (
    <div
      role="group"
      aria-label={CATEGORY_FILTER.FILTER_LABEL}
      data-testid="category-filter"
      className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1"
    >
      {options.map((option) => {
        const isSelected = option.key === selectedKey;
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={isSelected}
            data-testid="category-filter-option"
            data-category-key={option.key}
            onClick={() => onSelect(option.key)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isSelected
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
