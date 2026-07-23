import { test, expect } from '@playwright/test';

/**
 * Journey: loading / empty / error + retry states (core requirement #6). Runs locally against the
 * real client + server (needs `server/.env`). Uses `page.route()` interception to inject slow /
 * failed responses so loading skeletons and error+retry states are reliably observable — no
 * special seed data, no timing races. Seed-agnostic: acts on the first available item.
 */
test.describe('loading and error states', () => {
  test('shows loading skeletons while fetching data', async ({ page }) => {
    await page.route('http://localhost:3001/**', async (route) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));
      await route.continue();
    });

    await page.goto('/');

    await expect(page.getByLabel('Loading locations')).toBeVisible();
    await expect(page.getByLabel('Loading menu')).toBeVisible();

    await page.waitForLoadState('networkidle');
  });

  test('shows error state with retry when catalog request fails then recovers', async ({
    page,
  }) => {
    let failCatalog = true;

    await page.route('http://localhost:3001/**', async (route) => {
      if (route.request().url().includes('/locations')) {
        await route.continue();
      } else if (failCatalog) {
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });

    await page.goto('/');

    await expect(page.getByRole('group', { name: /select location/i })).toBeVisible();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();

    failCatalog = false;
    await page.getByRole('button', { name: /retry/i }).click();
    await expect(page.getByTestId('menu-item').first()).toBeVisible();
  });

  test('shows not-found when navigating to a nonexistent item', async ({ page }) => {
    await page.goto('/items/nonexistent-item-id-99999');

    await expect(page.getByText(/isn't on the menu/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /back to menu/i })).toBeVisible();
  });

  test('shows error state with retry on item detail when request fails then recovers', async ({
    page,
  }) => {
    await page.goto('/');
    const firstItem = page.getByTestId('menu-item').first();
    await expect(firstItem).toBeVisible();
    await firstItem.click();
    await expect(page).toHaveURL(/\/items\/.+/);

    let failItem = true;
    await page.route('http://localhost:3001/items/**', async (route) => {
      if (failItem) {
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });
    await page.reload();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();

    failItem = false;
    await page.getByRole('button', { name: /retry/i }).click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
