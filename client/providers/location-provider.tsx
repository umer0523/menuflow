'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { STORAGE_KEYS } from '@/constants/storage.constants';

interface LocationContextValue {
  /** The location the menu is scoped to; `null` until locations load and one is chosen. */
  selectedLocationId: string | null;
  setSelectedLocationId: (id: string) => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

/**
 * Holds the selected location as **UI state** (never server state — that stays in TanStack Query)
 * and persists it to localStorage so a reload keeps the choice. Menu queries (M4+) key off
 * `selectedLocationId`, so switching location re-fetches the correct availability set.
 */
export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocationId, setSelected] = useState<string | null>(null);

  // Restore on mount only (client-side) to avoid an SSR/localStorage hydration mismatch.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEYS.SELECTED_LOCATION);
    if (stored) {
      setSelected(stored);
    }
  }, []);

  const setSelectedLocationId = useCallback((id: string) => {
    setSelected(id);
    window.localStorage.setItem(STORAGE_KEYS.SELECTED_LOCATION, id);
  }, []);

  return (
    <LocationContext.Provider value={{ selectedLocationId, setSelectedLocationId }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useSelectedLocation(): LocationContextValue {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useSelectedLocation must be used within a LocationProvider');
  }
  return context;
}
