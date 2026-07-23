import { ApiProperty } from '@nestjs/swagger';

import { ItemResponseDto } from './item-response.dto';
import { ItemVariationResponseDto } from './item-variation-response.dto';

/**
 * The item-detail payload (`GET /items/:id`). Extends {@link ItemResponseDto} (DRY — id, name,
 * description, category, "from" price, imageIds) and adds the resolved image URLs and the full
 * variation list the detail view renders.
 */
export class ItemDetailResponseDto extends ItemResponseDto {
  @ApiProperty({
    type: [String],
    description: 'Square-hosted image URLs resolved from imageIds (empty when the item has none).',
  })
  imageUrls!: string[];

  @ApiProperty({ type: [ItemVariationResponseDto], description: 'Purchasable variations.' })
  variations!: ItemVariationResponseDto[];
}
