import { describe, expect, it } from 'vitest';

import type { ItemDetailResponseDto } from '@/lib/api/generated/menuFlowAPI.schemas';

import { toItemDetailView } from './to-item-detail-view';

const LATTE: ItemDetailResponseDto = {
  id: 'item-latte',
  name: 'Latte',
  description: 'Espresso with steamed milk',
  categoryId: 'cat-coffee',
  price: { amount: 500, currency: 'USD' },
  imageIds: ['img-latte'],
  imageUrls: ['https://img/latte.png', 'https://img/latte-2.png'],
  variations: [
    { id: 'v1', name: 'Small', price: { amount: 500, currency: 'USD' } },
    { id: 'v2', name: 'Large', price: { amount: 600, currency: 'USD' } },
  ],
};

describe('toItemDetailView', () => {
  it('formats the item + variation prices and picks the primary image', () => {
    const view = toItemDetailView(LATTE);

    expect(view).toMatchObject({
      name: 'Latte',
      priceLabel: '$5.00',
      imageUrl: 'https://img/latte.png',
    });
    expect(view.variations).toEqual([
      { id: 'v1', name: 'Small', priceLabel: '$5.00' },
      { id: 'v2', name: 'Large', priceLabel: '$6.00' },
    ]);
  });

  it('yields a null image and null price labels when absent', () => {
    const view = toItemDetailView({
      ...LATTE,
      price: null,
      imageUrls: [],
      variations: [{ id: 'v1', name: 'Small', price: null }],
    });

    expect(view.imageUrl).toBeNull();
    expect(view.priceLabel).toBeNull();
    expect(view.variations[0]?.priceLabel).toBeNull();
  });
});
