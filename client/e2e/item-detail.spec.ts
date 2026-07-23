import { test, expect } from '@playwright/test';

/**
 * Journey: item detail (core requirement #5).
 * TODO(M6): open an item and assert name, description, image (or placeholder), and the
 * price formatted from cents via `Intl.NumberFormat`.
 */
test.describe('item detail', () => {
  test.skip('opens an item and shows a correctly formatted price', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MenuFlow/i);
  });
});
