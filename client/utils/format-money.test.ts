import { describe, expect, it } from 'vitest';

import { formatMoney } from './format-money';

describe('formatMoney', () => {
  it('formats 2-decimal currency from minor units', () => {
    expect(formatMoney({ amount: 500, currency: 'USD' })).toBe('$5.00');
    expect(formatMoney({ amount: 375, currency: 'USD' })).toBe('$3.75');
  });

  it('handles zero', () => {
    expect(formatMoney({ amount: 0, currency: 'USD' })).toBe('$0.00');
  });

  it('respects a currency with no minor unit (no false /100)', () => {
    // JPY has 0 fraction digits, so 500 minor units is ¥500, not ¥5.
    expect(formatMoney({ amount: 500, currency: 'JPY' })).toBe('¥500');
  });
});
