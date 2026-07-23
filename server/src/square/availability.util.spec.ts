import { isItemVisibleAtLocation } from './availability.util';
import type { AvailabilityFields } from './square.types';

const DOWNTOWN = 'loc-downtown';
const AIRPORT = 'loc-airport';

function availability(overrides: Partial<AvailabilityFields> = {}): AvailabilityFields {
  return {
    presentAtAllLocations: true,
    presentAtLocationIds: [],
    absentAtLocationIds: [],
    ...overrides,
  };
}

describe('isItemVisibleAtLocation', () => {
  it('shows an item present at all locations', () => {
    expect(isItemVisibleAtLocation(availability({ presentAtAllLocations: true }), DOWNTOWN)).toBe(
      true,
    );
  });

  it('hides an all-locations item that is explicitly absent here', () => {
    const item = availability({
      presentAtAllLocations: true,
      absentAtLocationIds: [AIRPORT],
    });
    expect(isItemVisibleAtLocation(item, AIRPORT)).toBe(false);
    expect(isItemVisibleAtLocation(item, DOWNTOWN)).toBe(true);
  });

  it('shows a single-location item only at its present location', () => {
    const item = availability({
      presentAtAllLocations: false,
      presentAtLocationIds: [DOWNTOWN],
    });
    expect(isItemVisibleAtLocation(item, DOWNTOWN)).toBe(true);
    expect(isItemVisibleAtLocation(item, AIRPORT)).toBe(false);
  });

  it('lets absent win even when the location is also listed as present', () => {
    const item = availability({
      presentAtAllLocations: false,
      presentAtLocationIds: [DOWNTOWN],
      absentAtLocationIds: [DOWNTOWN],
    });
    expect(isItemVisibleAtLocation(item, DOWNTOWN)).toBe(false);
  });

  it('hides an item that is present at neither all nor this location', () => {
    const item = availability({ presentAtAllLocations: false });
    expect(isItemVisibleAtLocation(item, DOWNTOWN)).toBe(false);
  });
});
