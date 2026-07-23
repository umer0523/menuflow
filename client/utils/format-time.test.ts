import { describe, expect, it } from 'vitest';

import { formatLocalTime } from './format-time';

describe('formatLocalTime', () => {
  it('formats a whole-hour AM time without minutes', () => {
    expect(formatLocalTime('07:00:00')).toBe('7 AM');
  });

  it('formats noon correctly', () => {
    expect(formatLocalTime('12:00:00')).toBe('12 PM');
  });

  it('formats a PM time with minutes', () => {
    expect(formatLocalTime('13:30:00')).toBe('1:30 PM');
  });

  it('formats midnight as 12 AM', () => {
    expect(formatLocalTime('00:00:00')).toBe('12 AM');
  });

  it('formats 11 PM correctly', () => {
    expect(formatLocalTime('23:00:00')).toBe('11 PM');
  });
});
