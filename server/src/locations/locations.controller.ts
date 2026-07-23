import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { LocationResponseDto } from './dto/location-response.dto';
import { LocationsService } from './locations.service';

/** Thin controller for core requirement #1 — errors propagate to the global exception filter. */
@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locations: LocationsService) {}

  @Get()
  @ApiOkResponse({ type: [LocationResponseDto], description: 'Locations for the switcher.' })
  getLocations(): Promise<LocationResponseDto[]> {
    return this.locations.getLocations();
  }
}
