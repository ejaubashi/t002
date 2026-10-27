import { test, expect } from '@playwright/test';

for (const width of [1440, 390]) test(`shader modes and record compositions work at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors=[];
  page.on('console', message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('pageerror', error=>errors.push(error.message));
  await page.goto('/#project/orbit');
  await expect(page.locator('.demo-3d-ready')).toBeVisible();
  const canvas=page.locator('.project-sculpture');
  const original=await canvas.screenshot();
  await page.getByRole('button',{name:'Wave',exact:true}).click();
  await expect(page.getByRole('button',{name:'Wave',exact:true})).toHaveAttribute('aria-pressed','true');
  const wave=await canvas.screenshot();expect(wave.equals(original)).toBe(false);
  await page.getByRole('button',{name:'Interference',exact:true}).click();
  expect((await canvas.screenshot()).equals(wave)).toBe(false);
  await page.getByRole('button',{name:'Orbit',exact:true}).click();
  await expect(page.locator('.orbit-demo-title')).toContainText('SOUND, REIMAGINED.');
  await page.locator('#interactive-demo').screenshot({path:`/tmp/orbit-modes-${width}.png`});
  await page.getByRole('button',{name:'Close project'}).click();
  await page.goto('/#project/good-noise');
  const composition=await page.locator('.record-artwork').innerHTML();
  await expect(page.getByRole('button',{name:'Enable sound',exact:true})).toHaveAttribute('aria-pressed','false');
  await page.getByRole('group',{name:'Visual record selection'}).getByRole('button',{name:'02',exact:true}).click();
  await expect(page.getByRole('group',{name:'Visual record selection'}).getByRole('button',{name:'02',exact:true})).toHaveAttribute('aria-pressed','true');
  expect(await page.locator('.record-artwork').innerHTML()).not.toBe(composition);
  await expect(page.locator('.record-copy')).toContainText('soft');
  await page.getByRole('button',{name:'Enable sound',exact:true}).click();
  await expect(page.getByRole('button',{name:'Mute sound',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Mute sound',exact:true}).click();
  await expect(page.getByRole('button',{name:'Enable sound',exact:true})).toHaveAttribute('aria-pressed','false');
  await page.locator('#interactive-demo').screenshot({path:`/tmp/noise-art-${width}.png`});
  await page.getByRole('button',{name:'Close project'}).click();
  expect(errors).toEqual([]);
});

test('wave mode still works without WebGL',async({page})=>{
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.startsWith('webgl'))return null;return original.call(this,type,...args);};});
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#project/orbit');
  const canvas=page.locator('.demo-stage>canvas:not(.project-sculpture)');const first=await canvas.evaluate(el=>el.toDataURL());
  await page.getByRole('button',{name:'Wave',exact:true}).click();expect(await canvas.evaluate(el=>el.toDataURL())).not.toBe(first);
});
