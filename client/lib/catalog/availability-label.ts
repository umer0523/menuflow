import { formatLocalTime } from '@/utils/format-time';

type AvailabilityWindow = { startLocalTime: string; endLocalTime: string };

/**
 * Builds the human-readable availability label shown on a dimmed category section or item detail
 * (e.g. "Available 7 AM–11 AM"). The wire contract carries structured windows; the display string
 * is composed here on the client, mirroring how prices are formatted client-side.
 */
export function buildAvailabilityLabel(windows: AvailabilityWindow[] | null): string {
  const [window] = windows ?? [];
  if (!window) return 'Not available today';
  return `Available ${formatLocalTime(window.startLocalTime)}–${formatLocalTime(window.endLocalTime)}`;
}
