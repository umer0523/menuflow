import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright is a **local development aid only** — no CI, no production E2E (per CLAUDE.md).
 * It boots the real client + server so the primary user journeys can be exercised without
 * manual clicking. Journey specs live in `e2e/` and are unlocked as features ship (M3–M7).
 *
 * A full run needs `server/.env` (Square sandbox creds) so the backend can boot; until then
 * the specs are skipped. `reuseExistingServer` lets `pnpm dev` (already running) be reused.
 */

const CLIENT_URL = 'http://localhost:3000';
const SERVER_HEALTH_URL = 'http://localhost:8080/health';
const SERVER_BOOT_TIMEOUT_MS = 120_000;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: true,
  reporter: 'html',
  use: {
    baseURL: CLIENT_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm --filter @menuflow/server dev',
      url: SERVER_HEALTH_URL,
      timeout: SERVER_BOOT_TIMEOUT_MS,
      reuseExistingServer: true,
    },
    {
      command: 'pnpm --filter @menuflow/client dev',
      url: CLIENT_URL,
      timeout: SERVER_BOOT_TIMEOUT_MS,
      reuseExistingServer: true,
    },
  ],
});
