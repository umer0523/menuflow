import { MENU_COPY } from '@/constants/menu.constants';
import type { MenuItemView } from '@/lib/catalog/menu-view.types';

/** A single menu item. `data-testid`/`data-item-name` let the e2e journey assert availability. */
export function MenuItemCard({ item }: { item: MenuItemView }) {
  return (
    <article
      data-testid="menu-item"
      data-item-name={item.name}
      className="flex h-full flex-col rounded-lg border border-border bg-card p-4"
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
    </article>
  );
}
