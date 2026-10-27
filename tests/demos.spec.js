import { test, expect } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`interactive concept controls work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/#project/orbit');
    const demo = page.locator('#interactive-demo');
    await expect(demo).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play motion' })).toBeVisible();
    const canvas = demo.locator('canvas');
    const initial = await canvas.evaluate(el => el.toDataURL());
    await page.getByRole('button', { name: 'Remix shape' }).click();
    expect(await canvas.evaluate(el => el.toDataURL())).not.toBe(initial);
    await page.getByRole('slider', { name: 'Orbit tempo' }).focus();
    await page.keyboard.press('End');
    await expect(page.getByRole('slider', { name: 'Orbit tempo' })).toHaveValue('2');
    await page.getByRole('dialog').getByRole('button', { name: 'Form & Field', exact: true }).click();
    await page.getByRole('button', { name: 'Sage finish' }).click();
    await expect(demo.locator('.demo-stage')).toHaveAttribute('data-finish', 'sage');
    await expect(demo.locator('output')).toHaveText('Sage / 01');
    await expect(page.getByRole('button', { name: 'Sage finish' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('slider', { name: 'Turn ceramics' }).focus();
    await page.keyboard.press('End');
    await expect(page.getByRole('slider', { name: 'Turn ceramics' })).toHaveValue('30');
    expect(await demo.locator('.v1').evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
    await page.getByRole('dialog').getByRole('button', { name: 'Offgrid', exact: true }).click();
    await page.getByRole('button', { name: 'Night', exact: true }).click();
    await expect(demo.locator('.landscape-hour')).toHaveText('23:00 / NIGHTFALL');
    expect(await demo.locator('.landscape-stars').evaluate(el => getComputedStyle(el).opacity)).toBe('1');
    await page.getByRole('button', { name: 'Dawn', exact: true }).click();
    await expect(demo.locator('.landscape-hour')).toContainText('DAWN');
    await page.getByRole('dialog').getByRole('button', { name: 'Good Noise', exact: true }).click();
    await page.getByRole('group', { name: 'Visual record selection' }).getByRole('button', { name: '02', exact: true }).click();
    await expect(demo.locator('.record-caption')).toHaveText('02 — SOFT SIGNAL');
    await page.getByRole('button', { name: 'Play motion' }).click();
    await expect.poll(() => demo.locator('.demo-stage').evaluate(el => Number.parseFloat(el.style.getPropertyValue('--record-angle')))).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Pause motion' }).click();
    const angle = await demo.locator('.demo-stage').evaluate(el => el.style.getPropertyValue('--record-angle'));
    await page.waitForTimeout(120);
    expect(await demo.locator('.demo-stage').evaluate(el => el.style.getPropertyValue('--record-angle'))).toBe(angle);
    expect(await demo.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/endy-demo-noise-${width}.png` });
    await page.getByRole('button', { name: 'Close project' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('reduced motion keeps demo frames still until an explicit interaction', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#project/orbit');
  const canvas = page.locator('#interactive-demo canvas');
  await expect(canvas).toBeVisible();
  const first = await canvas.evaluate(el => el.toDataURL());
  await page.waitForTimeout(200);
  expect(await canvas.evaluate(el => el.toDataURL())).toBe(first);
  await page.getByRole('button', { name: 'Remix shape' }).click();
  expect(await canvas.evaluate(el => el.toDataURL())).not.toBe(first);
  await page.screenshot({ path: '/tmp/endy-demo-orbit.png' });
});
