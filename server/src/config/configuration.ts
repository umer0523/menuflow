import { SquareEnvironment } from './square-environment.enum';
import type { AppConfig } from './app-config.types';

/**
 * Maps validated env vars into the typed config tree the app reads via `ConfigService`.
 * Runs after `validateEnv`, so every value here is guaranteed present and well-formed.
 */
export function configuration(): AppConfig {
  return {
    port: Number(process.env.PORT),
    clientOrigin: String(process.env.CLIENT_ORIGIN),
    square: {
      accessToken: String(process.env.SQUARE_ACCESS_TOKEN),
      environment: process.env.SQUARE_ENV as SquareEnvironment,
      baseUrl: String(process.env.SQUARE_BASE_URL),
    },
  };
}
