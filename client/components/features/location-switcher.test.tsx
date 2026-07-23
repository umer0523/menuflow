import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '@/constants/storage.constants';
import { useLocations } from '@/hooks/use-locations';
import type { LocationResponseDto } from '@/lib/api/generated/menuFlowAPI.schemas';
import { LocationProvider } from '@/providers/location-provider';
import { LocationSwitcher } from './location-switcher';

vi.mock('@/hooks/use-locations', () => ({ useLocations: vi.fn() }));

const useLocationsMock = vi.mocked(useLocations);

type LocationsQuery = ReturnType<typeof useLocations>;

/** One controlled cast: the component consumes only these query fields. */
function mockLocationsQuery(overrides: Partial<LocationsQuery>): LocationsQuery {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as LocationsQuery;
}

const LOCATIONS: LocationResponseDto[] = [
  {
    id: 'loc-downtown',
    name: 'Downtown',
    timezone: 'America/New_York',
    currency: 'USD',
    status: 'ACTIVE',
  },
  {
    id: 'loc-airport',
    name: 'Airport',
    timezone: 'America/Chicago',
    currency: 'USD',
    status: 'ACTIVE',
  },
];

function renderSwitcher() {
  return render(
    <LocationProvider>
      <LocationSwitcher />
    </LocationProvider>,
  );
}

describe('LocationSwitcher', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('shows a loading state while pending', () => {
    useLocationsMock.mockReturnValue(mockLocationsQuery({ isPending: true }));
    renderSwitcher();
    expect(screen.getByLabelText(/loading locations/i)).toBeInTheDocument();
  });

  it('renders locations and defaults selection to the first', async () => {
    useLocationsMock.mockReturnValue(mockLocationsQuery({ data: LOCATIONS }));
    renderSwitcher();

    const downtown = await screen.findByRole('button', { name: 'Downtown' });
    expect(downtown).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Airport' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(window.localStorage.getItem(STORAGE_KEYS.SELECTED_LOCATION)).toBe('loc-downtown');
  });

  it('selects and persists a clicked location', async () => {
    useLocationsMock.mockReturnValue(mockLocationsQuery({ data: LOCATIONS }));
    renderSwitcher();

    await userEvent.click(screen.getByRole('button', { name: 'Airport' }));

    expect(screen.getByRole('button', { name: 'Airport' })).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem(STORAGE_KEYS.SELECTED_LOCATION)).toBe('loc-airport');
  });

  it('shows an error with a working Retry', async () => {
    const refetch = vi.fn();
    useLocationsMock.mockReturnValue(
      mockLocationsQuery({ isError: true, error: new Error('Network down'), refetch }),
    );
    renderSwitcher();

    expect(screen.getByRole('alert')).toHaveTextContent('Network down');
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state when there are no locations', () => {
    useLocationsMock.mockReturnValue(mockLocationsQuery({ data: [] }));
    renderSwitcher();
    expect(screen.getByText(/no locations available/i)).toBeInTheDocument();
  });
});
