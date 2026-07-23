import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { CatalogQueryDto } from './catalog-query.dto';

/**
 * Query for `GET /items`. Extends {@link CatalogQueryDto} (DRY — same required `locationId`) and
 * adds an optional `categoryId` so the flat item list can be narrowed to one category.
 */
export class ItemsQueryDto extends CatalogQueryDto {
  @ApiPropertyOptional({ description: 'Restrict items to this category.', example: 'cat-coffee' })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
