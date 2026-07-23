import type { AvailabilityFields } from './square.types';

/**
 * Core requirement #3 — whether a catalog object is visible at a given location.
 *
 * Square's rule: an object is visible at location `L` iff
 * `(present_at_all_locations OR L ∈ present_at_location_ids) AND L ∉ absent_at_location_ids`.
 * `absent` always wins, even when `present_at_all_locations` is true.
 */
export function isItemVisibleAtLocation(item: AvailabilityFields, locationId: string): boolean {
  if (item.absentAtLocationIds.includes(locationId)) {
    return false;
  }
  return item.presentAtAllLocations || item.presentAtLocationIds.includes(locationId);
}
