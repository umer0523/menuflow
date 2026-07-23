import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';

import { SWAGGER } from './swagger.constants';

/**
 * Builds the OpenAPI document from the app's decorated controllers/DTOs. Shared by the runtime
 * `/docs` UI and the `openapi:generate` script, so the served contract and the orval-consumed
 * spec never drift.
 */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle(SWAGGER.TITLE)
    .setDescription(SWAGGER.DESCRIPTION)
    .setVersion(SWAGGER.VERSION)
    .build();
  return SwaggerModule.createDocument(app, config);
}
