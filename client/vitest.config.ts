import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Unit tests are `*.test.ts(x)`; `*.spec.ts` under `e2e/` belongs to Playwright.
    include: ['**/*.test.{ts,tsx}'],
    // Never assert on generated API code, Playwright specs, or reach the network.
    exclude: ['node_modules', '.next', 'lib/api/generated', 'e2e'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
