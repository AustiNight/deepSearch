import { test, expect } from '@playwright/test';
import { SYSTEM_TEST_PHRASE } from '../constants';

test('system test flow runs with minimal tokens across viewports', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.getByTestId('search-input').fill(`System Test ${SYSTEM_TEST_PHRASE}`);
  await page.getByTestId('start-search').click();

  await expect(page.getByText('System Test Report')).toBeVisible();
  await expect(
    page.getByText('Agents spawned: Overseer Alpha, System Test Researcher, System Test Critic, System Test Synthesizer.').first()
  ).toBeVisible();

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

  expect(errors).toEqual([]);
});
