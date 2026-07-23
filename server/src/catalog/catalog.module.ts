import { Module } from '@nestjs/common';

import { SquareModule } from '../square/square.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

/** Wires the catalog/categories/items endpoints onto the exported `SquareService` seam. */
@Module({
  imports: [SquareModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
