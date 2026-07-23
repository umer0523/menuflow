import type { AvailabilityFields, AvailabilityPeriodModel } from './square.types';

/** Returns today's time windows for display, or null when the category has no restrictions. */
export function getTodayWindows(
  periodIds: string[],
  periods: Record<string, AvailabilityPeriodModel>,
  timezone: string,
  now: Date = new Date(),
): Array<{ startLocalTime: string; endLocalTime: string }> | null {
  if (periodIds.length === 0) return null;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  }).formatToParts(now);
  const currentDay = (parts.find((p) => p.type === 'weekday')?.value ?? '').toUpperCase();

  return periodIds
    .map((id) => periods[id])
    .filter((p): p is AvailabilityPeriodModel => p !== undefined && p.dayOfWeek === currentDay)
    .map((p) => ({ startLocalTime: p.startLocalTime, endLocalTime: p.endLocalTime }));
}

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

/**
 * Bonus — time-of-day / day-of-week availability.
 *
 * A category is available "now" if it has no periods (unrestricted) OR at least one period
 * matches the current day-of-week AND the current local time falls in [start, end) in the
 * location's IANA timezone.
 *
 * Time comparison is lexicographic on zero-padded HH:MM:SS — valid because Square guarantees
 * RFC 3339 partial-time format (`HH:MM:SS`) on both sides.
 *
 * @param now - injectable for deterministic tests; defaults to the current instant.
 */
export function isAvailableNow(
  periodIds: string[],
  periods: Record<string, AvailabilityPeriodModel>,
  timezone: string,
  now: Date = new Date(),
): boolean {
  if (periodIds.length === 0) {
    return true;
  }

  // Use Node 22's built-in full-ICU Intl to derive local time in the location's timezone
  // without adding a date-library dependency.
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short',
  });

  const parts = formatter.formatToParts(now);
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? '';

  const currentTime = `${get('hour').padStart(2, '0')}:${get('minute').padStart(2, '0')}:${get('second').padStart(2, '0')}`;
  // 'en-US' weekday 'short' → 'Mon', 'Tue', ..., 'Sun' → 'MON', 'TUE', ..., 'SUN'
  // Square's DayOfWeek enum uses the same three-letter uppercase format.
  const currentDay = get('weekday').toUpperCase();

  for (const id of periodIds) {
    const period = periods[id];
    if (period === undefined) {
      continue;
    }
    if (period.dayOfWeek !== currentDay) {
      continue;
    }
    if (currentTime >= period.startLocalTime && currentTime < period.endLocalTime) {
      return true;
    }
  }

  return false;
}
