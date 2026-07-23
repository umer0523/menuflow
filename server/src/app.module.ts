import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { configuration } from './config/configuration';
import { validateEnv } from './config/env.validation';
import { HealthController } from './health/health.controller';
import { LocationsModule } from './locations/locations.module';
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
  ],
  controllers: [HealthController],
})
export class AppModule {}
