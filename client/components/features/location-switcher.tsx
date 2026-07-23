'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

import { LOCATION_SWITCHER } from '@/constants/location.constants';
import { MENU_COPY } from '@/constants/menu.constants';
import { useLocations } from '@/hooks/use-locations';
import { cn } from '@/lib/utils';
import { useSelectedLocation } from '@/providers/location-provider';
import { getErrorMessage } from '@/utils/get-error-message';

/** Segmented location picker (core requirement #1) with explicit loading / empty / error states. */
export function LocationSwitcher() {
  const { data: locations, isPending, isError, error, refetch } = useLocations();
  const { selectedLocationId, setSelectedLocationId } = useSelectedLocation();

  // Once locations load, default to the first if nothing valid is selected (e.g. first visit or a
  // stale stored id). Keeps the menu scoped to a real location at all times.
  useEffect(() => {
    const firstLocation = locations?.[0];
    if (!firstLocation) {
      return;
    }
    const hasValidSelection = locations.some((location) => location.id === selectedLocationId);
    if (!hasValidSelection) {
      setSelectedLocationId(firstLocation.id);
    }
  }, [locations, selectedLocationId, setSelectedLocationId]);

  if (isPending) {
    return (
      <div className="flex gap-2" aria-busy="true" aria-label={LOCATION_SWITCHER.LOADING_LABEL}>
        <span className="h-9 w-24 animate-pulse rounded-md bg-muted" />
        <span className="h-9 w-24 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="flex items-center gap-3 text-sm text-destructive">
        <span>{getErrorMessage(error)}</span>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 font-medium text-foreground hover:bg-accent"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          {MENU_COPY.RETRY}
        </button>
      </div>
    );
  }

  if (locations.length === 0) {
    return <p className="text-sm text-muted-foreground">{LOCATION_SWITCHER.EMPTY}</p>;
  }

  return (
    <div
      role="group"
      aria-label={LOCATION_SWITCHER.GROUP_LABEL}
      className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1"
    >
      {locations.map((location) => {
        const isSelected = location.id === selectedLocationId;
        return (
          <button
            key={location.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => setSelectedLocationId(location.id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isSelected
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {location.name}
          </button>
        );
      })}
    </div>
  );
}
