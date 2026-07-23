import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCatalog } from '@/hooks/use-catalog';
import type { MenuCategoryResponseDto } from '@/lib/api/generated/menuFlowAPI.schemas';
import { useSelectedLocation } from '@/providers/location-provider';

import { MenuBrowser } from './menu-browser';

vi.mock('@/hooks/use-catalog', () => ({ useCatalog: vi.fn() }));
vi.mock('@/providers/location-provider', () => ({ useSelectedLocation: vi.fn() }));

const useCatalogMock = vi.mocked(useCatalog);
const useSelectedLocationMock = vi.mocked(useSelectedLocation);

type CatalogQuery = ReturnType<typeof useCatalog>;

function mockCatalogQuery(overrides: Partial<CatalogQuery>): CatalogQuery {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as CatalogQuery;
}

const MENU: MenuCategoryResponseDto[] = [
  {
    id: 'cat-coffee',
    name: 'Coffee',
    items: [
      { id: 'item-latte', name: 'Latte', price: { amount: 500, currency: 'USD' }, imageIds: [] },
    ],
  },
  {
    id: 'cat-pastry',
    name: 'Pastry',
    items: [
      {
        id: 'item-croissant',
        name: 'Croissant',
        price: { amount: 375, currency: 'USD' },
        imageIds: [],
      },
    ],
  },
];

describe('MenuBrowser filtering', () => {
  beforeEach(() => {
    useSelectedLocationMock.mockReturnValue({
      selectedLocationId: 'loc-1',
      setSelectedLocationId: vi.fn(),
    });
    useCatalogMock.mockReturnValue(mockCatalogQuery({ data: MENU }));
  });

  it('shows every category, then narrows to the chosen one', async () => {
    render(<MenuBrowser />);

    // All categories visible by default.
    expect(screen.getByText('Latte')).toBeInTheDocument();
    expect(screen.getByText('Croissant')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Pastry' }));

    // Only the Pastry category's items remain.
    expect(screen.queryByText('Latte')).not.toBeInTheDocument();
    expect(screen.getByText('Croissant')).toBeInTheDocument();
  });
});
