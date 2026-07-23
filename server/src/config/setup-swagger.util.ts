import type { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

import { buildOpenApiDocument } from './build-openapi-document.util';
import { SWAGGER } from './swagger.constants';

/** Mounts the browsable Swagger UI at `/docs` — a discoverable contract for reviewers. */
export function setupSwagger(app: INestApplication): void {
  SwaggerModule.setup(SWAGGER.PATH, app, buildOpenApiDocument(app));
}
