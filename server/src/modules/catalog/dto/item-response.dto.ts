import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AvailabilityWindowDto } from './availability-window-response.dto';
import { MoneyResponseDto } from './money-response.dto';

/**
 * A menu item as returned to the client — a normalized projection of the internal
 * `CatalogItemModel`. `price` is the cheapest variation ("from" price) resolved server-side;
 * `null` when the item has no priced variation, so the client models "no price" explicitly.
 */
export class ItemResponseDto {
  @ApiProperty({ description: 'Square catalog item id.', example: 'item-latte' })
  id!: string;

  @ApiProperty({ description: 'Item display name.', example: 'Latte' })
  name!: string;

  @ApiPropertyOptional({ description: 'Item description.', example: 'Espresso with steamed milk' })
  description?: string;

  @ApiPropertyOptional({ description: 'Owning category id.', example: 'cat-coffee' })
  categoryId?: string;

  @ApiProperty({
    type: MoneyResponseDto,
    nullable: true,
    description: 'Cheapest variation price, or null when no variation is priced.',
  })
  price!: MoneyResponseDto | null;

  @ApiProperty({
    type: [String],
    description: 'Square image ids (resolved to URLs on the item-detail view).',
  })
  imageIds!: string[];

  @ApiProperty({
    description:
      "Whether this item is currently orderable, inherited from its category's time-of-day / " +
      'day-of-week availability evaluated in the location timezone. True for items with no ' +
      'category or a category without periods.',
  })
  available!: boolean;

  @ApiProperty({
    description:
      "Today's orderable windows (location timezone) inherited from the item's category. " +
      'null = no time restriction; empty array = has periods but none apply today.',
    nullable: true,
    type: [AvailabilityWindowDto],
  })
  availabilityWindows!: AvailabilityWindowDto[] | null;
}
