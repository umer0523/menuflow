import type { ItemVariationModel, MoneyModel } from './square.types';

/** The subset of Square's `Money` we read — amount is a bigint in the current SDK. */
interface RawMoney {
  amount?: bigint | number | null;
  currency?: string | null;
}

/**
 * Normalize a Square `Money` into our `MoneyModel`, carrying integer cents + currency
 * unchanged (formatting happens on the client via `Intl.NumberFormat` — never string math).
 * Returns `null` when either field is absent so callers model "no price" explicitly.
 */
export function toMoney(money: RawMoney | null | undefined): MoneyModel | null {
  if (!money) {
    return null;
  }
  const { amount, currency } = money;
  if (amount === null || amount === undefined || !currency) {
    return null;
  }
  // Square returns integer cents; menu prices are far below Number.MAX_SAFE_INTEGER, so a
  // bigint→number cast is safe here. (Documented assumption, not a silent precision risk.)
  return { amount: Number(amount), currency };
}

/**
 * An item's display price is the cheapest of its variations (the "from" price). Variations
 * without a price are ignored; an item with no priced variation resolves to `null`.
 */
export function resolveItemPrice(item: { variations: ItemVariationModel[] }): MoneyModel | null {
  const prices = item.variations
    .map((variation) => variation.price)
    .filter((price): price is MoneyModel => price !== null);
  if (prices.length === 0) {
    return null;
  }
  return prices.reduce((cheapest, price) => (price.amount < cheapest.amount ? price : cheapest));
}
