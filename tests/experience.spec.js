import { test, expect } from '@playwright/test';

test('homepage keeps the original circles, typography, and light loading path', async ({ page }) => {
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#home-title')).toHaveAccessibleName('Endy J');
  await expect(page.locator('#home-title')).toHaveCSS('font-size', '151.2px');
  await expect(page.locator('#playground')).toBeVisible();
  await expect(page.locator('.chrome-canvas,.hero-ticker,.sculpture-hint,.hero .project-sculpture')).toHaveCount(0);
  expect(requests.some(url => /sculpture/.test(url))).toBe(false);
});

test('project WebGL fallback keeps the original interactive visualizer usable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (type.startsWith('webgl') || type === 'experimental-webgl') return null;
      return original.call(this, type, ...args);
    };
  });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#project/orbit');
  await expect(page.locator('.demo-stage>canvas')).toBeVisible();
  const canvas = page.locator('.demo-stage>canvas');
  const original = await canvas.evaluate(el => el.toDataURL());
  await page.getByRole('button', { name: 'Remix shape' }).click();
  expect(await canvas.evaluate(el => el.toDataURL())).not.toBe(original);
  await page.getByRole('button', { name: 'Close project' }).click();
  await expect(page.locator('.portal-ghost')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('3D is limited to projects and ceramic finish changes the rendered material', async ({ page }) => {
  test.setTimeout(45000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#project/form-and-field');
  await expect(page.locator('.demo-3d-ready')).toBeVisible({ timeout: 20000 });
  const canvas = page.locator('.project-sculpture');
  const sand = await canvas.screenshot();
  await page.getByRole('button', { name: 'Clay finish' }).click();
  const clay = await canvas.screenshot();
  expect(clay.equals(sand)).toBe(false);
  await page.getByRole('slider', { name: 'Turn ceramics' }).focus();
  await page.keyboard.press('End');
  expect((await canvas.screenshot()).equals(clay)).toBe(false);
  await page.getByRole('button', { name: 'Close project' }).click();
  await expect(page.locator('.project-sculpture')).toHaveCount(0);
  expect(errors).toEqual([]);
});
