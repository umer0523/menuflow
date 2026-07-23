import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SquareClient } from 'square';

import type { AppConfig } from '../config/app-config.types';

/** DI token for the single Square SDK client — injected into `SquareService`, mockable in tests. */
export const SQUARE_CLIENT = Symbol('SQUARE_CLIENT');

/**
 * Builds the one `SquareClient` from validated config. The token stays backend-side only
 * (read via `ConfigService`, never `process.env`). The SDK retries transient failures with
 * backoff by default; `SquareService` maps any final error to a typed client error.
 */
export const squareClientProvider: Provider = {
  provide: SQUARE_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService<AppConfig, true>): SquareClient => {
    const square = config.get('square', { infer: true });
    return new SquareClient({
      token: square.accessToken,
      // `baseUrl` carries the sandbox origin; the SDK accepts it as the environment.
      environment: square.baseUrl,
    });
  },
};
