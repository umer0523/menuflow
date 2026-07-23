import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { MenuItemView } from '@/lib/catalog/menu-view.types';

import { MenuItemCard } from './menu-item-card';

const ITEM: MenuItemView = {
  id: 'item-latte',
  name: 'Latte',
  description: 'Espresso with steamed milk',
  priceLabel: '$5.00',
};

describe('MenuItemCard', () => {
  it('links to the item detail page and keeps its testid attributes', () => {
    render(<MenuItemCard item={ITEM} />);

    const link = screen.getByTestId('menu-item');
    expect(link).toHaveAttribute('href', '/items/item-latte');
    expect(link).toHaveAttribute('data-item-name', 'Latte');
    expect(screen.getByText('$5.00')).toBeInTheDocument();
  });
});
