import { test, expect } from '@playwright/test';

const names = ['Orbit®', 'Form & Field', 'Offgrid', 'Good Noise'];

test('desktop: wheel, arrows, and keyboard navigate the horizontal gallery', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Endy J', exact: true })).toBeVisible();
  await page.mouse.move(800, 600);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.locator('#work-track').evaluate(el => el.scrollLeft)).toBeGreaterThan(400);
  await page.getByRole('link', { name: 'Scroll to explore' }).click();
  await expect.poll(() => page.locator('#selected').evaluate(el => Math.abs(el.getBoundingClientRect().left))).toBeLessThan(2);
  await page.getByRole('button', { name: 'Next section', exact: true }).click();
  await expect.poll(() => page.locator('#orbit').evaluate(el => Math.abs(el.getBoundingClientRect().left))).toBeLessThan(2);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => page.locator('#form-and-field').evaluate(el => Math.abs(el.getBoundingClientRect().left))).toBeLessThan(2);
  await page.getByRole('button', { name: 'Previous section', exact: true }).click();
  await expect.poll(() => page.locator('#orbit').evaluate(el => Math.abs(el.getBoundingClientRect().left))).toBeLessThan(2);
});

test('all project dialogs open, dismiss with Escape, and restore focus', async ({ page }) => {
  await page.goto('/');
  for (const name of names) {
    const trigger = page.locator('.project-hit').filter({ has: page.locator('span') }).and(page.getByRole('button', { name: `View ${name} project`, exact: true }));
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#detail-title')).toHaveText(name);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(page.locator('body')).not.toHaveClass(/is-dialog-open/);
  }
});

test('project deep links, next project, focus trap, and browser Back work', async ({ page }) => {
  await page.goto('/#project/offgrid');
  await expect(page.locator('#detail-title')).toHaveText('Offgrid');
  await page.getByRole('dialog').getByRole('button', { name: 'Good Noise', exact: true }).click();
  await expect(page.locator('#detail-title')).toHaveText('Good Noise');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Good Noise', exact: true })).not.toBeVisible();
  expect(await page.evaluate(() => !!document.activeElement.closest('dialog'))).toBe(true);
  await page.goBack();
  await expect(page.locator('#detail-title')).toHaveText('Offgrid');
  await page.getByRole('button', { name: 'Close project' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page).toHaveURL(/#work$/);
});

test('about navigation, biography, contact, clipboard, and return to work', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).click();
  await expect(page.locator('#about-track')).toBeVisible();
  await expect(page.locator('#work-track')).not.toBeVisible();
  await page.getByRole('link', { name: 'A little about me' }).click();
  await expect.poll(() => page.locator('#bio').evaluate(el => Math.abs(el.getBoundingClientRect().left))).toBeLessThan(2);
  await page.getByRole('button', { name: 'Next section', exact: true }).click();
  await page.getByRole('button', { name: 'Copy email to clipboard' }).click();
  await expect(page.getByRole('status')).toHaveText('Email copied. Say hello!');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('endyj@dev.com');
  await page.getByRole('navigation').getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page.locator('#work-track')).toBeVisible();
});

test('reduced motion stops Canvas animation; regular animation can be paused', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const canvas = page.locator('#playground');
  const first = await canvas.evaluate(el => el.toDataURL());
  await page.waitForTimeout(180);
  expect(await canvas.evaluate(el => el.toDataURL())).toBe(first);
  await expect(page.locator('.hero .play-toggle')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const pause = page.locator('.hero .play-toggle');
  await expect(pause).toHaveAttribute('aria-label', 'Pause background animation');
  await pause.click();
  await expect(pause).toHaveAttribute('aria-pressed', 'true');
  const frozen = await canvas.evaluate(el => el.toDataURL());
  await page.waitForTimeout(180);
  expect(await canvas.evaluate(el => el.toDataURL())).toBe(frozen);
});

test('mobile: vertical layout, unclipped project titles, dialogs, and about', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Scroll to explore' }).click();
  await expect.poll(() => page.locator('#selected').evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(2);
  for (const panel of await page.locator('.project-panel').all()) {
    for (const line of await panel.locator('.project-heading span').all()) {
      const right = await line.evaluate(el => el.getBoundingClientRect().right);
      expect(right).toBeLessThanOrEqual(391);
    }
  }
  await page.locator('#good-noise .project-hit').click();
  await expect(page.locator('#detail-title')).toHaveText('Good Noise');
  await page.getByRole('button', { name: 'Close project' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).click();
  await page.getByRole('link', { name: 'A little about me' }).click();
  await expect.poll(() => page.locator('#bio').evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('runtime is self-contained: no external assets or browser errors', async ({ page }) => {
  const errors = [], external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', request => {
    if (!new URL(request.url()).hostname.match(/^(localhost|127\.0\.0\.1)$/)) external.push(request.url());
  });
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Work', exact: true }).click();
  await page.locator('#orbit .project-hit').click();
  await expect(page.locator('#detail-title')).toHaveText('Orbit®');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
