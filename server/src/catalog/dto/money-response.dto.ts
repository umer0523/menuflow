import { ApiProperty } from '@nestjs/swagger';

/**
 * Money as Square sends it: integer amount in the smallest currency unit (cents) + ISO 4217
 * currency. The client formats it with `Intl.NumberFormat` — the backend never string-maths prices.
 */
export class MoneyResponseDto {
  @ApiProperty({ description: 'Amount in the smallest currency unit (e.g. cents).', example: 500 })
  amount!: number;

  @ApiProperty({ description: 'ISO 4217 currency code.', example: 'USD' })
  currency!: string;
}
