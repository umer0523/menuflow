import { test, expect } from '@playwright/test';

/**
 * Journey: location switching (core requirement #1). Runs locally against the real client +
 * server + Square sandbox (needs `server/.env`). Selectors are role-based so it doesn't depend
 * on specific seed data names.
 */
test.describe('location switching', () => {
  test('switches location and persists the selection across reload', async ({ page }) => {
    await page.goto('/');

    const group = page.getByRole('group', { name: /select location/i });
    await expect(group).toBeVisible();

    const options = group.getByRole('button');
    const count = await options.count();
    expect(count).toBeGreaterThan(0);

    // A location is selected by default.
    await expect(group.getByRole('button', { pressed: true })).toHaveCount(1);

    // With more than one location, switching sticks through a reload.
    test.skip(count < 2, 'needs at least two seeded locations to exercise switching');
    const second = options.nth(1);
    const secondName = (await second.textContent())?.trim() ?? '';
    await second.click();
    await expect(second).toHaveAttribute('aria-pressed', 'true');

    await page.reload();
    const reloadedSelected = group.getByRole('button', { pressed: true });
    await expect(reloadedSelected).toHaveText(secondName);
  });
});
