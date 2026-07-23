import { describe, expect, it } from 'vitest';

import type { MenuCategoryResponseDto } from '@/lib/api/generated/menuFlowAPI.schemas';

import { toMenuView } from './to-menu-view';

const CATEGORIES: MenuCategoryResponseDto[] = [
  {
    id: 'cat-coffee',
    name: 'Coffee',
    items: [
      {
        id: 'item-latte',
        name: 'Latte',
        description: 'Espresso with steamed milk',
        categoryId: 'cat-coffee',
        price: { amount: 500, currency: 'USD' },
        imageIds: [],
      },
      {
        id: 'item-free',
        name: 'Tap Water',
        categoryId: 'cat-coffee',
        price: null,
        imageIds: [],
      },
    ],
  },
];

describe('toMenuView', () => {
  it('formats prices and preserves grouping', () => {
    const view = toMenuView(CATEGORIES);
    const coffee = view.find((category) => category.id === 'cat-coffee');

    expect(coffee?.name).toBe('Coffee');
    expect(coffee?.items.find((item) => item.name === 'Latte')?.priceLabel).toBe('$5.00');
  });

  it('maps a priceless item to a null label rather than inventing a price', () => {
    const view = toMenuView(CATEGORIES);
    const water = view
      .flatMap((category) => category.items)
      .find((item) => item.name === 'Tap Water');
    expect(water?.priceLabel).toBeNull();
  });
});
