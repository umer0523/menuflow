import { test, expect } from '@playwright/test';

/**
 * Journey: menu filtering by location availability (core requirements #2, #3).
 * TODO(M4): assert items visible at the selected location match the `present_at_*`
 * rule — including an item that appears at only one of the two locations.
 */
test.describe('menu filtering', () => {
  test.skip('shows only items available at the selected location', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MenuFlow/i);
  });
});
