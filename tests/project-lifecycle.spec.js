import { test, expect } from '@playwright/test';

async function trackGPU(page) {
  await page.addInitScript(() => {
    window.__projectGPU = [];
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      const context = original.call(this, type, ...args);
      if (context && type.startsWith('webgl') && !window.__projectGPU.some(item => item.context === context)) {
        const stats = { context, canvas: this, draws: 0 };
        window.__projectGPU.push(stats);
        for (const name of ['drawElements', 'drawArrays']) {
          const draw = context[name].bind(context);
          context[name] = (...values) => { stats.draws++; return draw(...values); };
        }
      }
      return context;
    };
  });
}
const drawCount = page => page.evaluate(() => window.__projectGPU.at(-1)?.draws || 0);

for (const width of [1440, 390]) {
  test(`Orbit GPU pauses, resumes, falls back after context loss, and releases at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await trackGPU(page);
    await page.goto('/#project/orbit');
    await expect(page.locator('.demo-3d-ready')).toBeVisible();
    await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
    const paused = await drawCount(page);
    await page.waitForTimeout(180);
    expect(await drawCount(page)).toBe(paused);
    await page.getByRole('button', { name: 'Play motion', exact: true }).click();
    await expect.poll(() => drawCount(page)).toBeGreaterThan(paused);
    // Scroll the project artwork away: the GPU must stop without a user pause.
    await page.setViewportSize({ width, height: 300 });
    await page.locator('dialog').evaluate(el => { el.scrollTop = el.scrollHeight; });
    await expect.poll(() => page.locator('.demo-stage').evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThan(0);
    await page.waitForTimeout(200);
    const offscreen = await drawCount(page);
    await page.waitForTimeout(180);
    expect(await drawCount(page)).toBe(offscreen);
    await page.setViewportSize({ width, height: 900 });
    await page.locator('.demo-stage').scrollIntoViewIfNeeded();
    await expect.poll(() => drawCount(page)).toBeGreaterThan(offscreen);
    await page.evaluate(() => window.__projectGPU.at(-1).context.getExtension('WEBGL_lose_context').loseContext());
    await expect(page.locator('.project-sculpture')).toHaveCount(0);
    const fallback = page.locator('.demo-stage>canvas');
    await expect(fallback).toBeVisible();
    await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
    const before = await fallback.evaluate(el => el.toDataURL());
    await page.getByRole('button', { name: 'Wave', exact: true }).click();
    expect(await fallback.evaluate(el => el.toDataURL())).not.toBe(before);
    await page.getByRole('button', { name: 'Close project' }).click();
    expect(await page.evaluate(() => window.__projectGPU.every(item => item.context.isContextLost()))).toBe(true);
  });
}

test('ceramic rendering settles, finishes interpolate, and motion preference changes are respected', async ({ page }) => {
  await trackGPU(page);
  await page.goto('/#project/form-and-field');
  await expect(page.locator('.demo-3d-ready')).toBeVisible();
  const stage = page.locator('.demo-stage');
  await page.getByRole('button', { name: 'Ink finish' }).click();
  await expect.poll(() => stage.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(189, 204, 208)');
  // Wait for the physical material to settle as well as the CSS background.
  await expect.poll(async () => {
    const before = await drawCount(page);
    await page.waitForTimeout(250);
    return await drawCount(page) === before;
  }, { timeout: 10000 }).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Clay finish' }).focus();
  await page.keyboard.press('Enter');
  await expect(stage).toHaveCSS('background-color', 'rgb(230, 203, 188)');
  const still = await drawCount(page);
  await page.waitForTimeout(180);
  expect(await drawCount(page)).toBe(still);
  await page.getByRole('button', { name: 'Close project' }).click();
  expect(await page.evaluate(() => window.__projectGPU.every(item => item.context.isContextLost()))).toBe(true);
});

test('all record states bind artwork, typography and rhythm, with audio off after reopening', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/#project/good-noise');
  const stage = page.locator('.demo-stage');
  for (const [n, title, movement] of [[0, 'AFTER HOURS', 'ribbon'], [1, 'SOFT SIGNAL', 'rosette'], [2, 'ELECTRIC FEEL', 'signal']]) {
    await page.locator(`.record-tracks [data-track="${n}"]`).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.record-caption')).toContainText(title);
    await expect(page.locator(`.record-layer.is-selected .cover-${movement}`)).toHaveCount(1);
    const before = await stage.evaluate(el => el.style.getPropertyValue('--cover-sway'));
    await page.waitForTimeout(100);
    expect(await stage.evaluate(el => el.style.getPropertyValue('--cover-sway'))).toBe(before);
  }
  expect(await page.locator('#interactive-demo').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  expect(requests.some(url => /sculpture|record-audio/.test(url))).toBe(false);
  await page.getByRole('button', { name: 'Play motion', exact: true }).click();
  await expect.poll(() => stage.evaluate(el => parseFloat(el.style.getPropertyValue('--record-angle')))).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Enable sound', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mute sound', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Close project' }).click();
  await page.goto('/#project/good-noise');
  await expect(page.getByRole('button', { name: 'Enable sound', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: 'Play motion', exact: true })).toBeVisible();
});
