import { test, expect } from '@playwright/test';

/**
 * Journey: category grouping / selection (core requirement #4). Runs locally against the real
 * client + server + Square sandbox (needs `server/.env`). Selectors are role/testid-based so it
 * doesn't depend on specific seed names — it asserts the *behavior*: selecting a category narrows
 * the menu to it, every offered category has items (empty categories never appear), and "All"
 * restores the full grouped menu.
 */
test.describe('category selection', () => {
  test('filters the menu to the chosen category', async ({ page }) => {
    await page.goto('/');

    // The grouped menu renders first (depends on M4).
    await expect(page.getByTestId('menu-item').first()).toBeVisible();

    const filter = page.getByTestId('category-filter');
    // The filter only shows with ≥2 categories; skip the strict claim on a single-category sandbox.
    const options = filter.getByTestId('category-filter-option');
    const optionCount = await options.count();
    test.skip(optionCount < 3, 'needs ≥2 real categories (plus All) to exercise filtering');

    // Every offered category must yield at least one item — proves empty categories are never
    // offered in the filter (core requirement #4).
    const totalItems = await page.getByTestId('menu-item').count();
    for (let index = 1; index < optionCount; index += 1) {
      const option = options.nth(index);
      const label = (await option.textContent())?.trim() ?? '';
      await option.click();
      await expect(option).toHaveAttribute('aria-pressed', 'true');

      const items = page.getByTestId('menu-item');
      await expect(items.first()).toBeVisible();
      const count = await items.count();
      expect(count).toBeGreaterThan(0);
      // Narrowing to one category shows no more than the full (All) menu.
      expect(count).toBeLessThanOrEqual(totalItems);

      // Exactly the chosen category's section is shown.
      await expect(page.getByRole('heading', { level: 2 })).toHaveText(label);
    }

    // "All" restores the full grouped menu (multiple category headings return).
    await options.first().click();
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
    expect(await page.getByRole('heading', { level: 2 }).count()).toBeGreaterThan(1);
  });
});
