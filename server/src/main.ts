import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import type { AppConfig } from './config/app-config.types';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);

  // Whitelist + forbid unknown props so request DTOs are the single source of truth;
  // transform enables type coercion + class instances for validated payloads.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({ origin: config.get('clientOrigin', { infer: true }) });

  const port = config.get('port', { infer: true });
  await app.listen(port);
  Logger.log(`MenuFlow API listening on port ${port}`, 'Bootstrap');
}

void bootstrap();
