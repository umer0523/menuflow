import { Logger, type INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '../src/app.module';
import { SquareService } from '../src/square/square.service';

/**
 * Sandbox-connectivity smoke check. Boots a standalone Nest context (no HTTP server), resolves
 * the real `SquareService`, and logs what it fetched from the Square sandbox — proving the
 * token, pagination, and mapping work end-to-end without a live endpoint. Also doubles as the
 * README's "confirm your sandbox is wired" onboarding step. Needs `server/.env` credentials.
 * (Missing/invalid env fails fast via the same startup validation the real app uses.)
 *
 * Run: `pnpm --filter @menuflow/server smoke:square`
 */
async function main(): Promise<void> {
  const logger = new Logger('SquareSmoke');
  const app: INestApplicationContext = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: false,
  });
  try {
    const square = app.get(SquareService);
    const [locations, catalog] = await Promise.all([square.getLocations(), square.getCatalog()]);
    logger.log(
      `Square sandbox OK — ${locations.length} location(s), ${catalog.items.length} item(s), ` +
        `${catalog.categories.length} category(-ies).`,
    );
    for (const location of locations) {
      logger.log(`• ${location.name} (${location.id}) — ${location.timezone}`);
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void main();
