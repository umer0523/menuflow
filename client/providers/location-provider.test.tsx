import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { STORAGE_KEYS } from '@/constants/storage.constants';
import { LocationProvider, useSelectedLocation } from './location-provider';

function Consumer() {
  const { selectedLocationId, setSelectedLocationId } = useSelectedLocation();
  return (
    <div>
      <span data-testid="selected">{selectedLocationId ?? 'none'}</span>
      <button type="button" onClick={() => setSelectedLocationId('loc-airport')}>
        select airport
      </button>
    </div>
  );
}

describe('LocationProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    window.localStorage.clear();
  });

  it('starts with no selection and persists a chosen location', async () => {
    render(
      <LocationProvider>
        <Consumer />
      </LocationProvider>,
    );

    expect(screen.getByTestId('selected')).toHaveTextContent('none');

    await userEvent.click(screen.getByRole('button', { name: /select airport/i }));

    expect(screen.getByTestId('selected')).toHaveTextContent('loc-airport');
    expect(window.localStorage.getItem(STORAGE_KEYS.SELECTED_LOCATION)).toBe('loc-airport');
  });

  it('restores a persisted selection on mount', () => {
    window.localStorage.setItem(STORAGE_KEYS.SELECTED_LOCATION, 'loc-downtown');

    render(
      <LocationProvider>
        <Consumer />
      </LocationProvider>,
    );

    expect(screen.getByTestId('selected')).toHaveTextContent('loc-downtown');
  });

  it('throws when used outside the provider', () => {
    expect(() => render(<Consumer />)).toThrow(/must be used within a LocationProvider/i);
  });
});
