import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MoneyResponseDto } from './money-response.dto';

/** A single purchasable variation of an item (e.g. a size), with its own price. */
export class ItemVariationResponseDto {
  @ApiProperty({ description: 'Square variation id.', example: 'var-latte-large' })
  id!: string;

  @ApiPropertyOptional({ description: 'Variation name.', example: 'Large' })
  name?: string;

  @ApiProperty({
    type: MoneyResponseDto,
    nullable: true,
    description: 'Variation price, or null when unpriced.',
  })
  price!: MoneyResponseDto | null;
}
