import { isAvailableNow, isItemVisibleAtLocation } from './availability.util';
import type { AvailabilityFields, AvailabilityPeriodModel } from './square.types';

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

// Deterministic Monday 09:30 AM in America/New_York (UTC-5 in January → 14:30 UTC).
const MONDAY_0930_NY = new Date('2024-01-08T14:30:00Z');
const TZ_NY = 'America/New_York';

function period(overrides: Partial<AvailabilityPeriodModel> = {}): AvailabilityPeriodModel {
  return {
    id: 'p1',
    dayOfWeek: 'MON',
    startLocalTime: '08:00:00',
    endLocalTime: '11:00:00',
    ...overrides,
  };
}

function periodMap(...ps: AvailabilityPeriodModel[]): Record<string, AvailabilityPeriodModel> {
  return Object.fromEntries(ps.map((p) => [p.id, p]));
}

describe('isAvailableNow', () => {
  it('returns true when there are no availability periods (unrestricted)', () => {
    expect(isAvailableNow([], {}, TZ_NY, MONDAY_0930_NY)).toBe(true);
  });

  it('returns true when within the window on the correct day', () => {
    const p = period();
    expect(isAvailableNow([p.id], periodMap(p), TZ_NY, MONDAY_0930_NY)).toBe(true);
  });

  it('returns false when the day does not match', () => {
    const p = period({ dayOfWeek: 'TUE' });
    expect(isAvailableNow([p.id], periodMap(p), TZ_NY, MONDAY_0930_NY)).toBe(false);
  });

  it('returns false when before the window on the correct day', () => {
    // 06:30 NY = 11:30 UTC on the same Monday
    const before = new Date('2024-01-08T11:30:00Z');
    const p = period();
    expect(isAvailableNow([p.id], periodMap(p), TZ_NY, before)).toBe(false);
  });

  it('returns false when at the end boundary (end-exclusive)', () => {
    // 11:00:00 NY = 16:00 UTC
    const atEnd = new Date('2024-01-08T16:00:00Z');
    const p = period();
    expect(isAvailableNow([p.id], periodMap(p), TZ_NY, atEnd)).toBe(false);
  });

  it('returns true when exactly at the start boundary (start-inclusive)', () => {
    // 08:00:00 NY = 13:00 UTC
    const atStart = new Date('2024-01-08T13:00:00Z');
    const p = period();
    expect(isAvailableNow([p.id], periodMap(p), TZ_NY, atStart)).toBe(true);
  });

  it('skips unknown period IDs gracefully and returns false', () => {
    expect(isAvailableNow(['unknown-id'], {}, TZ_NY, MONDAY_0930_NY)).toBe(false);
  });

  it('returns true when at least one of multiple periods matches', () => {
    const p1 = period({ id: 'p1', dayOfWeek: 'TUE' });
    const p2 = period({ id: 'p2', dayOfWeek: 'MON' });
    expect(isAvailableNow([p1.id, p2.id], periodMap(p1, p2), TZ_NY, MONDAY_0930_NY)).toBe(true);
  });

  it('honours the location timezone (same instant, different local day)', () => {
    // 2024-01-08T05:00:00Z is Monday 00:00 in New York but still Sunday in Los Angeles
    // (UTC-8 in January → 2024-01-07T21:00 LA time).
    const midnight_ny = new Date('2024-01-08T05:00:00Z');
    const p = period({ dayOfWeek: 'MON', startLocalTime: '00:00:00', endLocalTime: '01:00:00' });
    expect(isAvailableNow([p.id], periodMap(p), TZ_NY, midnight_ny)).toBe(true);
    expect(isAvailableNow([p.id], periodMap(p), 'America/Los_Angeles', midnight_ny)).toBe(false);
  });
});
