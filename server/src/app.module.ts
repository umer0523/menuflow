import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CatalogModule } from './modules/catalog/catalog.module';
import { configuration } from './config/configuration';
import { validateEnv } from './config/env.validation';
import { HealthController } from './health/health.controller';
import { LocationsModule } from './modules/locations/locations.module';
import { SquareModule } from './square/square.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
      load: [configuration],
    }),
    SquareModule,
    LocationsModule,
    CatalogModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
