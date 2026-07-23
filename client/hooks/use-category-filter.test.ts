import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CATEGORY_FILTER } from '@/constants/menu.constants';
import type { MenuCategoryView } from '@/lib/catalog/menu-view.types';

import { useCategoryFilter } from './use-category-filter';

function category(id: string, name: string): MenuCategoryView {
  return {
    id,
    name,
    items: [{ id: `${id}-item`, name: `${name} item`, priceLabel: null }],
  };
}

const COFFEE = category('cat-coffee', 'Coffee');
const PASTRY = category('cat-pastry', 'Pastry');

describe('useCategoryFilter', () => {
  it('defaults to All and returns every category', () => {
    const { result } = renderHook(() => useCategoryFilter([COFFEE, PASTRY]));

    expect(result.current.selectedKey).toBe(CATEGORY_FILTER.ALL_KEY);
    expect(result.current.filteredCategories).toHaveLength(2);
  });

  it('narrows to the selected category', () => {
    const { result } = renderHook(() => useCategoryFilter([COFFEE, PASTRY]));

    act(() => result.current.setSelectedKey('cat-pastry'));

    expect(result.current.filteredCategories.map((c) => c.id)).toEqual(['cat-pastry']);
  });

  it('resets to All when the selected category disappears (e.g. location switch)', () => {
    const { result, rerender } = renderHook(({ categories }) => useCategoryFilter(categories), {
      initialProps: { categories: [COFFEE, PASTRY] },
    });

    act(() => result.current.setSelectedKey('cat-pastry'));
    expect(result.current.selectedKey).toBe('cat-pastry');

    // The new location has no Pastry category — selection must fall back to All.
    rerender({ categories: [COFFEE] });

    expect(result.current.selectedKey).toBe(CATEGORY_FILTER.ALL_KEY);
    expect(result.current.filteredCategories.map((c) => c.id)).toEqual(['cat-coffee']);
  });
});
