import type { MenuCategoryView } from '@/lib/catalog/menu-view.types';

import { MenuItemCard } from './menu-item-card';

/** One category group: a heading and the grid of its location-visible items. */
export function MenuCategorySection({ category }: { category: MenuCategoryView }) {
  return (
    <section aria-labelledby={`category-${category.id ?? 'uncategorized'}`}>
      <h2
        id={`category-${category.id ?? 'uncategorized'}`}
        className="mb-3 text-lg font-semibold tracking-tight"
      >
        {category.name}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
