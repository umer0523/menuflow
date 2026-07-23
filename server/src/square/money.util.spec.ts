import { resolveItemPrice, toMoney } from './money.util';
import type { ItemVariationModel } from './square.types';

describe('toMoney', () => {
  it('carries integer cents and currency unchanged (no string math)', () => {
    expect(toMoney({ amount: 500n, currency: 'USD' })).toEqual({ amount: 500, currency: 'USD' });
  });

  it('converts a bigint amount to a safe number', () => {
    const result = toMoney({ amount: 123_456n, currency: 'EUR' });
    expect(result).toEqual({ amount: 123_456, currency: 'EUR' });
    expect(typeof result?.amount).toBe('number');
  });

  it('returns null when amount is missing', () => {
    expect(toMoney({ currency: 'USD' })).toBeNull();
    expect(toMoney({ amount: null, currency: 'USD' })).toBeNull();
  });

  it('returns null when currency is missing', () => {
    expect(toMoney({ amount: 500n })).toBeNull();
  });

  it('returns null for null/undefined money', () => {
    expect(toMoney(null)).toBeNull();
    expect(toMoney(undefined)).toBeNull();
  });
});

describe('resolveItemPrice', () => {
  function variation(price: ItemVariationModel['price'], id = 'var'): ItemVariationModel {
    return { id, price };
  }

  it('picks the cheapest priced variation', () => {
    const item = {
      variations: [
        variation({ amount: 700, currency: 'USD' }, 'large'),
        variation({ amount: 500, currency: 'USD' }, 'small'),
      ],
    };
    expect(resolveItemPrice(item)).toEqual({ amount: 500, currency: 'USD' });
  });

  it('ignores variations without a price', () => {
    const item = {
      variations: [variation(null, 'no-price'), variation({ amount: 300, currency: 'USD' }, 'ok')],
    };
    expect(resolveItemPrice(item)).toEqual({ amount: 300, currency: 'USD' });
  });

  it('returns null when no variation has a price', () => {
    expect(resolveItemPrice({ variations: [variation(null), variation(null, 'b')] })).toBeNull();
    expect(resolveItemPrice({ variations: [] })).toBeNull();
  });
});
