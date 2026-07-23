import { test, expect } from '@playwright/test';

/**
 * Journey: loading / empty / error + retry states (core requirement #6).
 * TODO(M7): assert every data view renders an explicit loading and error+retry state —
 * no bare infinite spinners.
 */
test.describe('loading and error states', () => {
  test.skip('renders explicit loading and error+retry states', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MenuFlow/i);
  });
});
