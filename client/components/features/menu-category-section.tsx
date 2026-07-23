import { Clock } from 'lucide-react';

import { categoryKey } from '@/lib/catalog/category-key';
import type { MenuCategoryView } from '@/lib/catalog/menu-view.types';
import { cn } from '@/lib/utils';
import { formatLocalTime } from '@/utils/format-time';

import { MenuItemCard } from './menu-item-card';

function buildAvailabilityLabel(
  windows: MenuCategoryView['availabilityWindows'],
): string {
  const [w] = windows ?? [];
  if (!w) return 'Not available today';
  return `Available ${formatLocalTime(w.startLocalTime)}–${formatLocalTime(w.endLocalTime)}`;
}

/** One category group: a heading (with optional time badge when unavailable) and the item grid. */
export function MenuCategorySection({ category }: { category: MenuCategoryView }) {
  const headingId = `category-${categoryKey(category.id)}`;
  const availabilityLabel = category.available ? null : buildAvailabilityLabel(category.availabilityWindows);

  return (
    <section
      aria-labelledby={headingId}
      className={cn(!category.available && 'opacity-50')}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 id={headingId} className="text-lg font-semibold tracking-tight">
          {category.name}
          {availabilityLabel !== null && (
            <span className="sr-only"> — {availabilityLabel}</span>
          )}
        </h2>
        {availabilityLabel !== null && (
          <span
            aria-hidden="true"
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
          >
            <Clock className="h-3 w-3" />
            {availabilityLabel}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
