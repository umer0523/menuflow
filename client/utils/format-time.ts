/** Converts a Square local-time string (HH:MM:SS) to a short display form like "7 AM" or "11:30 AM". */
export function formatLocalTime(hhmmss: string): string {
  const [hourStr = '0', minuteStr = '00'] = hhmmss.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 || 12;
  return minute === 0 ? `${displayHour} ${period}` : `${displayHour}:${minuteStr} ${period}`;
}
