import { test, expect } from '@playwright/test';

/**
 * Journey: location switching (core requirement #1).
 * TODO(M3): implement once the location switcher ships — pick a location, assert the
 * selection persists and the menu re-keys to that location's availability set.
 */
test.describe('location switching', () => {
  test.skip('switches location and re-keys the menu', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MenuFlow/i);
  });
});
