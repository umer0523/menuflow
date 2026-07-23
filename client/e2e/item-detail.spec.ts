import { test, expect } from '@playwright/test';

/**
 * Journey: item detail (core requirement #5). Runs locally against the real client + server + Square
 * sandbox (needs `server/.env`). Seed-agnostic: opens the first menu item and asserts the detail
 * page shows its name, a formatted price, and an image or the placeholder, and that the back-link
 * returns to the menu.
 */
test.describe('item detail', () => {
  test('opens an item and shows a formatted price', async ({ page }) => {
    await page.goto('/');

    const firstItem = page.getByTestId('menu-item').first();
    await expect(firstItem).toBeVisible();
    const itemName = (await firstItem.getAttribute('data-item-name')) ?? '';

    await firstItem.click();
    await expect(page).toHaveURL(/\/items\/.+/);

    // Name shows as the detail heading.
    await expect(page.getByRole('heading', { level: 1, name: itemName })).toBeVisible();

    // A price formatted via Intl.NumberFormat (a currency symbol + digits), or the no-price copy.
    await expect(page.getByText(/[€£$¥]\s?\d|Price unavailable/).first()).toBeVisible();

    // Either the real image or the "No image available" placeholder is present — never nothing.
    const hasImage = (await page.getByRole('img', { name: itemName }).count()) > 0;
    const hasPlaceholder = (await page.getByText(/no image available/i).count()) > 0;
    expect(hasImage || hasPlaceholder).toBe(true);

    // Back-link returns to the menu.
    await page.getByRole('link', { name: /back to menu/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('menu-item').first()).toBeVisible();
  });
});
