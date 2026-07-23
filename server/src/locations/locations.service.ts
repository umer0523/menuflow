import { Injectable } from '@nestjs/common';

import { SquareService } from '../square/square.service';
import type { SquareLocationModel } from '../square/square.types';
import { LocationResponseDto } from './dto/location-response.dto';

/**
 * Business layer for locations. Today it only maps the internal `SquareLocationModel` to the
 * response DTO — the boundary that keeps Square/internal shapes from leaking to clients — but
 * it's the home for any location-specific rules (sorting, filtering inactive) as they arise.
 */
@Injectable()
export class LocationsService {
  constructor(private readonly square: SquareService) {}

  async getLocations(): Promise<LocationResponseDto[]> {
    const locations = await this.square.getLocations();
    return locations.map((location) => this.toDto(location));
  }

  private toDto(location: SquareLocationModel): LocationResponseDto {
    return {
      id: location.id,
      name: location.name,
      timezone: location.timezone,
      currency: location.currency,
      status: location.status,
    };
  }
}
