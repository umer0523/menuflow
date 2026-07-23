import type { MoneyResponseDto } from '@/lib/api/generated/menuFlowAPI.schemas';

/**
 * Format Square money (integer minor units + ISO 4217 currency) for display with
 * `Intl.NumberFormat` — the client is the only place prices are formatted; the backend never
 * string-maths them. The currency's own fraction-digit count drives the minor→major conversion,
 * so 2-decimal (USD `500`→`$5.00`) and 0-decimal (JPY `500`→`¥500`) currencies both format right.
 */
export function formatMoney(money: MoneyResponseDto): string {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: money.currency,
  });
  const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  return formatter.format(money.amount / 10 ** fractionDigits);
}
