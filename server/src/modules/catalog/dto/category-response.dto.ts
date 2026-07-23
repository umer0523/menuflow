import { ApiProperty } from '@nestjs/swagger';

/**
 * A menu category returned to the client. `id` is `null` for the defensive "Uncategorized" bucket
 * (visible items whose category is missing) — real Square categories always carry an id.
 */
export class CategoryResponseDto {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Square category id, or null for the Uncategorized bucket.',
    example: 'cat-coffee',
  })
  id!: string | null;

  @ApiProperty({ description: 'Category display name.', example: 'Coffee' })
  name!: string;
}
