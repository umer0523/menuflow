import { ApiProperty } from '@nestjs/swagger';

/**
 * The location shape returned to the client — a normalized projection of the internal
 * `SquareLocationModel`. Documented with `@ApiProperty` so the OpenAPI spec (and the orval
 * client generated from it) carry real types, never `any`.
 */
export class LocationResponseDto {
  @ApiProperty({ description: 'Square location id.', example: 'L1ABCXYZ' })
  id!: string;

  @ApiProperty({ description: 'Display name for the location switcher.', example: 'Downtown' })
  name!: string;

  @ApiProperty({
    description: 'IANA timezone (drives time-of-day availability later).',
    example: 'America/New_York',
  })
  timezone!: string;

  @ApiProperty({ description: 'ISO 4217 currency code used to format prices.', example: 'USD' })
  currency!: string;

  @ApiProperty({ description: 'Location status as reported by Square.', example: 'ACTIVE' })
  status!: string;
}
