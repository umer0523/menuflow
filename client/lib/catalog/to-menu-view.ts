import type { MenuCategoryResponseDto } from '@/lib/api/generated/menuFlowAPI.schemas';
import { formatMoney } from '@/utils/format-money';

import type { MenuCategoryView, MenuItemView } from './menu-view.types';

/**
 * Adapts the `/catalog` DTO into the view model the menu renders — the one place prices become
 * display strings (via `formatMoney`). Keeps components declarative and insulated from the wire
 * contract, so a DTO change is absorbed here rather than across every component.
 */
export function toMenuView(categories: MenuCategoryResponseDto[]): MenuCategoryView[] {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    items: category.items.map(toItemView),
    available: category.available,
    availabilityWindows: category.availabilityWindows ?? null,
  }));
}

function toItemView(item: MenuCategoryResponseDto['items'][number]): MenuItemView {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    priceLabel: item.price === null ? null : formatMoney(item.price),
    available: item.available,
    availabilityWindows: item.availabilityWindows ?? null,
  };
}
