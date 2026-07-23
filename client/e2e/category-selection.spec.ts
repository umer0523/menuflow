import { test, expect } from '@playwright/test';

/**
 * Journey: category grouping / selection (core requirement #4).
 * TODO(M5): select a category and assert the list narrows to it; empty categories
 * never appear in the filter.
 */
test.describe('category selection', () => {
  test.skip('filters the menu to the chosen category', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MenuFlow/i);
  });
});
