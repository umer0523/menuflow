/**
 * Placeholder env so e2e specs can boot `AppModule`'s fail-fast `ConfigModule` without real
 * credentials. Square is always mocked at the `SquareService` boundary in e2e — nothing here
 * ever contacts the sandbox. Loaded via `setupFiles` in `jest-e2e.json`.
 */
process.env.SQUARE_ACCESS_TOKEN ??= 'e2e-placeholder';
process.env.SQUARE_ENV ??= 'sandbox';
process.env.SQUARE_BASE_URL ??= 'https://connect.squareupsandbox.com';
process.env.PORT ??= '3001';
process.env.CLIENT_ORIGIN ??= 'http://localhost:3000';
