import { ApiProperty } from '@nestjs/swagger';

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
}
