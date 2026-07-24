import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

/**
 * Emits `server/openapi.json` (the file `client/orval.config.ts` reads) by introspecting the
 * decorated controllers/DTOs — no HTTP server, no Square calls. Regenerating the typed client
 * must not require real credentials, so placeholder env vars are injected **only when missing**
 * purely to satisfy startup validation; nothing here contacts Square.
 *
 * Run: `pnpm --filter @menuflow/server openapi:generate`
 */
const PLACEHOLDER_ENV: Record<string, string> = {
  SQUARE_ACCESS_TOKEN: 'openapi-generation-placeholder',
  SQUARE_ENV: 'sandbox',
  SQUARE_BASE_URL: 'https://connect.squareupsandbox.com',
  PORT: '8080',
  CLIENT_ORIGIN: 'http://localhost:3000',
};

for (const [key, value] of Object.entries(PLACEHOLDER_ENV)) {
  process.env[key] ??= value;
}

const OUTPUT_PATH = resolve(__dirname, '../openapi.json');

async function main(): Promise<void> {
  const logger = new Logger('OpenApiGenerate');
  const { AppModule } = await import('../src/app.module');
  const { buildOpenApiDocument } = await import('../src/config/build-openapi-document.util');

  const app = await NestFactory.create(AppModule, { logger: false });
  try {
    const document = buildOpenApiDocument(app);
    writeFileSync(OUTPUT_PATH, `${JSON.stringify(document, null, 2)}\n`);
    logger.log(`Wrote ${OUTPUT_PATH}`);
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  new Logger('OpenApiGenerate').error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
