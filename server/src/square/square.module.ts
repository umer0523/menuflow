import { Module } from '@nestjs/common';

import { squareClientProvider } from './square-client.provider';
import { SquareService } from './square.service';

/**
 * Owns the Square boundary. Exports `SquareService` so feature modules (locations M3,
 * catalog M4) consume the normalized seam without importing the SDK themselves.
 */
@Module({
  providers: [squareClientProvider, SquareService],
  exports: [SquareService],
})
export class SquareModule {}
