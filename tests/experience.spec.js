import { test, expect } from '@playwright/test';

test('WebGL failure preserves the Canvas fallback and project navigation', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (type.startsWith('webgl') || type === 'experimental-webgl') return null;
      return original.call(this, type, ...args);
    };
  });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.hero-ticker')).toBeVisible();
  await expect(page.locator('#home-title')).toHaveAccessibleName('Endy J');
  await page.locator('#orbit .project-hit').click();
  await expect(page.locator('#detail-title')).toHaveText('Orbit®');
  await page.getByRole('button', { name: 'Close project' }).click();
  await expect(page.locator('.portal-ghost')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('sculpture renders, motion can pause, and project flight dismisses cleanly', async ({ page }) => {
  test.setTimeout(45000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.hero.sculpture-ready')).toBeVisible({ timeout: 25000 });
  const canvas = page.locator('.chrome-canvas');
  expect(await canvas.evaluate(el => el.width)).toBeGreaterThan(100);
  await page.mouse.move(950, 420);
  await page.mouse.down(); await page.mouse.move(1050, 480, { steps: 4 }); await page.mouse.up();
  await page.locator('.hero .play-toggle').click();
  await expect(page.locator('body')).toHaveClass(/motion-paused/);
  await page.locator('#orbit .project-hit').click();
  await expect(page.locator('#detail-title')).toHaveText('Orbit®');
  await page.getByRole('button', { name: 'Close project' }).click();
  await expect(page.locator('.portal-ghost')).toHaveCount(0);
  expect(errors).toEqual([]);
});
