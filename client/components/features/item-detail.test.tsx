import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ITEM_DETAIL } from '@/constants/menu.constants';
import { useItem } from '@/hooks/use-item';
import type { ItemDetailResponseDto } from '@/lib/api/generated/menuFlowAPI.schemas';
import { useSelectedLocation } from '@/providers/location-provider';

import { ItemDetail } from './item-detail';

vi.mock('@/hooks/use-item', () => ({ useItem: vi.fn() }));
vi.mock('@/providers/location-provider', () => ({ useSelectedLocation: vi.fn() }));

const useItemMock = vi.mocked(useItem);
const useSelectedLocationMock = vi.mocked(useSelectedLocation);

type ItemQuery = ReturnType<typeof useItem>;

// The query's `error` is typed `void` (the endpoint's only documented failure is 404), so the
// override bag is loosely typed and cast once — the component reads only these fields.
function mockItemQuery(overrides: Record<string, unknown>): ItemQuery {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ItemQuery;
}

function notFoundError(): AxiosError {
  const error = new AxiosError('Request failed with status code 404');
  error.response = {
    data: { message: 'Item not found' },
    status: 404,
    statusText: 'Not Found',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

const LATTE: ItemDetailResponseDto = {
  id: 'item-latte',
  name: 'Latte',
  description: 'Espresso with steamed milk',
  categoryId: 'cat-coffee',
  price: { amount: 500, currency: 'USD' },
  imageIds: ['img-latte'],
  imageUrls: ['https://img/latte.png'],
  available: true,
  availabilityWindows: null,
  variations: [{ id: 'v1', name: 'Small', price: { amount: 500, currency: 'USD' } }],
};

describe('ItemDetail', () => {
  beforeEach(() => {
    useSelectedLocationMock.mockReturnValue({
      selectedLocationId: 'loc-1',
      setSelectedLocationId: vi.fn(),
    });
  });

  it('renders the item with its image, price, and variations', () => {
    useItemMock.mockReturnValue(mockItemQuery({ data: LATTE }));
    render(<ItemDetail itemId="item-latte" />);

    expect(screen.getByRole('heading', { level: 2, name: 'Latte' })).toBeInTheDocument();
    // The "from" price and the single variation's price both render as $5.00.
    expect(screen.getAllByText('$5.00')).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'Latte' })).toBeInTheDocument();
    expect(screen.getByText('Small')).toBeInTheDocument();
  });

  it('shows an availability badge when the item is out of its time window', () => {
    useItemMock.mockReturnValue(
      mockItemQuery({
        data: {
          ...LATTE,
          available: false,
          availabilityWindows: [{ startLocalTime: '07:00:00', endLocalTime: '11:00:00' }],
        },
      }),
    );
    render(<ItemDetail itemId="item-latte" />);

    expect(screen.getByText('Available 7 AM–11 AM')).toBeInTheDocument();
  });

  it('shows a placeholder when the item has no image', () => {
    useItemMock.mockReturnValue(mockItemQuery({ data: { ...LATTE, imageUrls: [] } }));
    render(<ItemDetail itemId="item-latte" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText(ITEM_DETAIL.NO_IMAGE)).toBeInTheDocument();
  });

  it('shows a clean not-found message on a 404', () => {
    useItemMock.mockReturnValue(mockItemQuery({ isError: true, error: notFoundError() }));
    render(<ItemDetail itemId="item-missing" />);

    expect(screen.getByText(ITEM_DETAIL.NOT_FOUND)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error with a working Retry on a non-404 failure', async () => {
    const refetch = vi.fn();
    useItemMock.mockReturnValue(
      mockItemQuery({ isError: true, error: new Error('Network down'), refetch }),
    );
    render(<ItemDetail itemId="item-latte" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Network down');
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
