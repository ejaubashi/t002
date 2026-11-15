import { test, expect } from '@playwright/test';

for(const width of [1440,390])test('art entrances stay interactive and cancel at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:1000});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/#project/orbit');
  await expect(page.locator('.world-scene>.art-entry>i')).toHaveCount(12);
  await page.getByRole('button',{name:'Wave',exact:true}).click();
  await expect(page.getByRole('button',{name:'Wave',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.world-scene')).not.toHaveClass(/art-entering/);
  await page.getByRole('button',{name:'Close project'}).click();
  await page.goto('/#project/good-noise');
  await expect(page.locator('.world-scene>.art-entry>i')).toHaveCount(6);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.art-entry').last()).not.toBeVisible();
  await expect(page.locator('.record-copy')).toHaveCSS('opacity','1');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#interactive-demo .project-sculpture')).toHaveCount(0);
  expect(errors).toEqual([]);
});
