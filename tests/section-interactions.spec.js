import { test, expect } from '@playwright/test';

async function drag(page, locator, distance, touch) {
  const r = await locator.boundingBox();
  const x = r.x + r.width * .4, y = r.y + r.height * .5;
  if (touch) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{ x, y, id:1 }] });
    for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{ x:x+distance*i/8, y, id:1 }] });
    await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
    await cdp.detach();
  } else {
    await page.mouse.move(x,y); await page.mouse.down(); await page.mouse.move(x+distance,y,{ steps:8 }); await page.mouse.up();
  }
}

for (const width of [1440,390]) {
  test(`project gestures and keyboard alternatives work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height:1000 });
    await page.emulateMedia({ reducedMotion:'reduce' });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('/#project/orbit');
    await expect(page.locator('.demo-3d-ready')).toBeVisible();
    const canvas = page.locator('.project-sculpture');
    const before = await canvas.screenshot();
    await page.getByRole('button',{ name:'Pulse signal', exact:true }).click();
    expect((await canvas.screenshot()).equals(before)).toBe(false);
    const pulse = await canvas.screenshot();
    await page.locator('.demo-stage').focus(); await page.keyboard.press('ArrowRight');
    expect((await canvas.screenshot()).equals(pulse)).toBe(false);
    await page.getByRole('button',{ name:'Close project' }).click();

    await page.goto('/#project/form-and-field');
    await expect(page.locator('.demo-3d-ready')).toBeVisible();
    await page.locator('.demo-stage').scrollIntoViewIfNeeded();
    await drag(page,page.locator('.demo-stage'),90,false);
    await expect(page.getByRole('slider',{ name:'Turn ceramics' })).not.toHaveValue('0');
    const collection = await page.locator('.project-sculpture').screenshot();
    await page.getByRole('button',{ name:'Inspect form', exact:true }).click();
    await expect(page.getByRole('button',{ name:'View collection', exact:true })).toHaveAttribute('aria-pressed','true');
    expect((await page.locator('.project-sculpture').screenshot()).equals(collection)).toBe(false);
    await page.getByRole('button',{ name:'View collection', exact:true }).click();
    await page.getByRole('button',{ name:'Close project' }).click();

    await page.goto('/#project/offgrid');
    await page.locator('.demo-stage').focus(); await page.keyboard.press('End');
    await expect(page.getByRole('slider',{ name:'Landscape time of day' })).toHaveValue('100');
    await expect(page.locator('.landscape-hour')).toContainText('NIGHTFALL');
    await expect(page.locator('.landscape-moon')).toHaveCSS('opacity','1');
    await page.getByRole('button',{ name:'Day', exact:true }).click();
    await page.locator('.demo-stage').scrollIntoViewIfNeeded();
    await drag(page,page.locator('.demo-stage'),70,false);
    expect(Number(await page.getByRole('slider',{ name:'Landscape time of day' }).inputValue())).toBeGreaterThan(35);
    await page.locator('#interactive-demo').screenshot({ path:`/tmp/sections-offgrid-${width}.png` });
    await page.getByRole('button',{ name:'Close project' }).click();

    await page.goto('/#project/good-noise');
    const rotation = page.getByRole('slider',{ name:'Record rotation' });
    await rotation.focus(); await page.keyboard.press('ArrowRight');
    await expect(rotation).toHaveAttribute('aria-valuenow','15');
    await page.getByRole('button',{ name:'Flip sleeve', exact:true }).click();
    await expect(page.getByRole('button',{ name:'Back to artwork', exact:true })).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('.demo-record')).toHaveAttribute('inert','');
    await expect(page.locator('.record-sleeve-back')).toHaveAttribute('aria-hidden','false');
    await page.locator('.record-tracks [data-track="2"]').click();
    await expect(page.locator('.record-sleeve-back h3')).toHaveText('ELECTRIC FEEL');
    await page.locator('#interactive-demo').screenshot({ path:`/tmp/sections-sleeve-${width}.png` });
    await page.getByRole('button',{ name:'Back to artwork', exact:true }).click();
    await expect(rotation).not.toHaveAttribute('inert','');
    await expect(page.getByRole('button',{ name:'Enable sound', exact:true })).toHaveAttribute('aria-pressed','false');
    await page.getByRole('button',{ name:'Close project' }).click();
    expect(errors).toEqual([]);
  });
}

test('real touch gestures rotate ceramics, scrub the horizon and spin vinyl without horizontal overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport:{ width:390,height:900 },isMobile:true,hasTouch:true,reducedMotion:'reduce' });
  const page = await context.newPage();
  await page.goto('http://localhost:5173/#project/form-and-field');
  await page.locator('.demo-stage').scrollIntoViewIfNeeded();
  await drag(page,page.locator('.demo-stage'),90,true);
  await expect(page.getByRole('slider',{ name:'Turn ceramics' })).not.toHaveValue('0');
  await page.getByRole('button',{ name:'Close project' }).click();
  await page.goto('http://localhost:5173/#project/offgrid');
  await page.locator('.demo-stage').scrollIntoViewIfNeeded();
  await drag(page,page.locator('.demo-stage'),80,true);
  expect(Number(await page.getByRole('slider',{ name:'Landscape time of day' }).inputValue())).toBeGreaterThan(35);
  // A vertical swipe remains native scrolling, rather than being swallowed by the horizontal gesture.
  await page.locator('dialog').evaluate(el => { el.scrollTop = 0; });
  const box = await page.locator('.demo-stage').boundingBox();
  const cdp = await context.newCDPSession(page);
  const x = box.x + box.width * .5, y = box.y + box.height * .5;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:2}]});
  for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*18,id:2}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect.poll(()=>page.locator('dialog').evaluate(el=>el.scrollTop)).toBeGreaterThan(10);
  await cdp.detach();
  await page.getByRole('button',{ name:'Close project' }).click();
  await page.goto('http://localhost:5173/#project/good-noise');
  await page.locator('.record-vinyl').scrollIntoViewIfNeeded();
  await drag(page,page.locator('.record-vinyl'),55,true);
  expect(Number(await page.getByRole('slider',{ name:'Record rotation' }).getAttribute('aria-valuenow'))).toBeGreaterThan(0);
  expect(await page.locator('#interactive-demo').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await context.close();
});
