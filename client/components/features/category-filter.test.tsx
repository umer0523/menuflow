import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CATEGORY_FILTER } from '@/constants/menu.constants';
import type { MenuCategoryView } from '@/lib/catalog/menu-view.types';

import { CategoryFilter } from './category-filter';

const CATEGORIES: MenuCategoryView[] = [
  { id: 'cat-coffee', name: 'Coffee', available: true, items: [] },
  { id: 'cat-pastry', name: 'Pastry', available: true, items: [] },
];

describe('CategoryFilter', () => {
  it('renders All plus a chip per category, with All pressed by default', () => {
    render(
      <CategoryFilter
        categories={CATEGORIES}
        selectedKey={CATEGORY_FILTER.ALL_KEY}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Coffee' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Pastry' })).toBeInTheDocument();
  });

  it('reports the chosen category key on click', async () => {
    const onSelect = vi.fn();
    render(
      <CategoryFilter
        categories={CATEGORIES}
        selectedKey={CATEGORY_FILTER.ALL_KEY}
        onSelect={onSelect}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Pastry' }));

    expect(onSelect).toHaveBeenCalledWith('cat-pastry');
  });
});
