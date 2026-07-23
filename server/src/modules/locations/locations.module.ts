import { Module } from '@nestjs/common';

import { SquareModule } from '../../square/square.module';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

/** Wires the locations endpoint onto the exported `SquareService` seam. */
@Module({
  imports: [SquareModule],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
