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
    available: true,
    availabilityWindows: null,
    items: [
      {
        id: 'item-latte',
        name: 'Latte',
        price: { amount: 500, currency: 'USD' },
        imageIds: [],
        available: true,
        availabilityWindows: null,
      },
    ],
  },
  {
    id: 'cat-pastry',
    name: 'Pastry',
    available: true,
    availabilityWindows: null,
    items: [
      {
        id: 'item-croissant',
        name: 'Croissant',
        price: { amount: 375, currency: 'USD' },
        imageIds: [],
        available: true,
        availabilityWindows: null,
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

  it('shows an unavailable category with a per-card time badge and excludes it from the filter', () => {
    const windows = [{ startLocalTime: '07:00:00', endLocalTime: '11:00:00' }];
    useCatalogMock.mockReturnValue(
      mockCatalogQuery({
        data: [
          MENU[0],
          {
            ...MENU[1],
            available: false,
            availabilityWindows: windows,
            // Items inherit the closed category's availability (as the backend sends them).
            items: MENU[1].items.map((item) => ({
              ...item,
              available: false,
              availabilityWindows: windows,
            })),
          },
        ],
      }),
    );

    render(<MenuBrowser />);

    // Items from both categories are rendered (unavailable is disabled-looking, not hidden).
    expect(screen.getByText('Latte')).toBeInTheDocument();
    expect(screen.getByText('Croissant')).toBeInTheDocument();

    // The out-of-window item shows its schedule badge on the card.
    expect(screen.getByText('Available 7 AM–11 AM')).toBeInTheDocument();

    // Unavailable category is excluded from filter chips (only 1 available → no filter rendered).
    expect(screen.queryByRole('button', { name: 'Pastry' })).not.toBeInTheDocument();
  });
});
