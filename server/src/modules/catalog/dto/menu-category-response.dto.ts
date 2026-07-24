import { ApiProperty } from '@nestjs/swagger';

import { AvailabilityWindowDto } from './availability-window-response.dto';
import { CategoryResponseDto } from './category-response.dto';
import { ItemResponseDto } from './item-response.dto';

/**
 * A category grouped with its location-visible items — the `GET /catalog` payload for the grouped
 * menu view. Extends {@link CategoryResponseDto} (DRY) with the items. Empty groups are never
 * emitted (core requirement #4: hide empty categories).
 */
export class MenuCategoryResponseDto extends CategoryResponseDto {
  @ApiProperty({ type: [ItemResponseDto], description: 'Items visible at the requested location.' })
  items!: ItemResponseDto[];

  @ApiProperty({
    description:
      'Whether this category is currently orderable based on its time-of-day / day-of-week ' +
      'periods evaluated in the location timezone. Always true for categories with no periods.',
  })
  available!: boolean;

  @ApiProperty({
    description:
      "Today's time windows when this category is orderable, in the location's timezone. " +
      'null means no time restriction (always available). Empty array means has periods but none apply today.',
    nullable: true,
    type: [AvailabilityWindowDto],
  })
  availabilityWindows!: AvailabilityWindowDto[] | null;
}
