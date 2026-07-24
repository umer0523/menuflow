import { ApiProperty } from '@nestjs/swagger';

/**
 * A single time window during which a category (and the items inheriting from it) is orderable —
 * local to the location's timezone. Shared by the category and item response DTOs so both expose
 * the same availability shape (DRY).
 */
export class AvailabilityWindowDto {
  @ApiProperty({ description: 'Window open time — HH:MM:SS in the location timezone.' })
  startLocalTime!: string;

  @ApiProperty({
    description: 'Window close time (exclusive) — HH:MM:SS in the location timezone.',
  })
  endLocalTime!: string;
}
