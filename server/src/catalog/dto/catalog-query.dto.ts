import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Query for the location-scoped catalog reads (`/catalog`, `/categories`). `locationId` is
 * required because availability is undefined without a location — an item's visibility is only
 * meaningful relative to one (core requirement #3). Validated by the global `ValidationPipe`.
 */
export class CatalogQueryDto {
  @ApiProperty({ description: 'Square location the menu is scoped to.', example: 'L1ABCXYZ' })
  @IsString()
  @IsNotEmpty()
  locationId!: string;
}
