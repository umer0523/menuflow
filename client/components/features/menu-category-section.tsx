import { buildAvailabilityLabel } from '@/lib/catalog/availability-label';
import { categoryKey } from '@/lib/catalog/category-key';
import type { MenuCategoryView } from '@/lib/catalog/menu-view.types';
import { cn } from '@/lib/utils';

import { MenuItemCard } from './menu-item-card';

/**
 * One category group: a heading and the grid of its items. When the category is outside its
 * time-of-day window the heading is muted and the schedule is announced to screen readers here;
 * the visible "Available 7 AM–11 AM" badge lives on each item card (see {@link MenuItemCard}).
 */
export function MenuCategorySection({ category }: { category: MenuCategoryView }) {
  const headingId = `category-${categoryKey(category.id)}`;
  const availabilityLabel = category.available
    ? null
    : buildAvailabilityLabel(category.availabilityWindows);

  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className={cn(
          'mb-3 text-lg font-semibold tracking-tight',
          !category.available && 'text-muted-foreground',
        )}
      >
        {category.name}
        {availabilityLabel !== null && <span className="sr-only"> — {availabilityLabel}</span>}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
