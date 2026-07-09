import { expect, test } from '@playwright/test';

test('renders the grid canvas and custom color picker', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Iso Grid Thing/);
  await expect(page.getByRole('heading', { name: /iso grid thing/i })).toBeVisible();

  const canvas = page.locator('#grid-aspect-container svg');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box?.width).toBeGreaterThan(100);
  expect(box?.height).toBeGreaterThan(100);

  await page.getByRole('button', { name: 'Change color for Line Color' }).click();
  await page.getByRole('button', { name: 'Set Line Color to #ef4444' }).click();

  await expect(page.getByLabel('Line Color hex value')).toHaveValue('#ef4444');
  await expect(page.getByLabel('Line Color r channel')).toBeVisible();
  await expect(page.getByLabel('Line Color g channel')).toBeVisible();
  await expect(page.getByLabel('Line Color b channel')).toBeVisible();
});
