import Link from 'next/link';
import { Clock } from 'lucide-react';

import { MENU_COPY } from '@/constants/menu.constants';
import { ROUTES } from '@/constants/routes.constants';
import { buildAvailabilityLabel } from '@/lib/catalog/availability-label';
import type { MenuItemView } from '@/lib/catalog/menu-view.types';
import { cn } from '@/lib/utils';

/**
 * A single menu item, linking to its detail page (core requirement #5). When the item is outside its
 * category's time-of-day window it gets a muted, dashed "disabled" surface and a readable
 * "Available 7 AM–11 AM" badge — still navigable so guests can preview it. `data-testid`/
 * `data-item-name` let the e2e journeys assert availability and navigation.
 */
export function MenuItemCard({ item }: { item: MenuItemView }) {
  return (
    <Link
      href={ROUTES.item(item.id)}
      data-testid="menu-item"
      data-item-name={item.name}
      className={cn(
        'flex h-full flex-col rounded-lg border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        item.available
          ? 'border-border bg-card hover:border-ring hover:bg-accent/40'
          : 'border-dashed border-border bg-muted/40 hover:border-ring',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-foreground">{item.name}</h3>
        <span className="whitespace-nowrap text-sm font-semibold text-foreground">
          {item.priceLabel ?? MENU_COPY.NO_PRICE}
        </span>
      </div>
      {item.description ? (
        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
      ) : null}
      {!item.available ? (
        <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {buildAvailabilityLabel(item.availabilityWindows)}
        </span>
      ) : null}
    </Link>
  );
}
