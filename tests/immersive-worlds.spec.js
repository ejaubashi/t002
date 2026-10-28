import { test, expect } from '@playwright/test';

test('full-screen gallery worlds mount graphics on demand and release them behind project views',async({page})=>{
  const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{
    const get=HTMLCanvasElement.prototype.getContext;window.__worldContexts=[];
    HTMLCanvasElement.prototype.getContext=function(type,...args){const context=get.call(this,type,...args);if(context&&type.startsWith('webgl')&&!window.__worldContexts.some(s=>s.context===context))window.__worldContexts.push({context,canvas:this});return context;};
  });
  await page.goto('/');
  expect(requests.some(url=>url.includes('/src/sculpture.js'))).toBe(false);
  await page.locator('#orbit').evaluate(el=>el.scrollIntoView({behavior:'instant',inline:'start',block:'start'}));
  await expect(page.locator('#orbit [data-graphics-owner=gallery]')).toBeVisible();
  const bounds=await page.locator('#orbit .project-preview').boundingBox();expect(bounds.width).toBe(1440);expect(bounds.height).toBe(1000);
  await page.locator('#orbit .project-hit').click();
  await expect(page.locator('#interactive-demo [data-graphics-owner=project]')).toBeVisible();
  await expect(page.locator('[data-graphics-owner=gallery]')).toHaveCount(0);
  const view=await page.getByRole('dialog').boundingBox();expect(view.x).toBe(0);expect(view.y).toBe(0);expect(view.width).toBe(1440);
  await page.getByRole('button',{name:'Close project'}).click();
  await expect(page.locator('#orbit [data-graphics-owner=gallery]')).toBeVisible();
  await page.locator('#offgrid').evaluate(el=>el.scrollIntoView({behavior:'instant',inline:'start',block:'start'}));
  await expect(page.locator('[data-graphics-owner=gallery]')).toHaveCount(0);
  await expect.poll(()=>page.evaluate(()=>window.__worldContexts.every(s=>s.context.isContextLost()))).toBe(true);
});

test('native scrolling unfolds the scene and title while keeping controls available',async({page})=>{
  await page.goto('/#project/orbit');
  await expect(page.locator('.demo-3d-ready')).toBeVisible();
  await page.getByRole('button',{name:'Pause motion',exact:true}).click();
  const canvas=page.locator('#interactive-demo .project-sculpture');
  const first=await canvas.screenshot();
  await page.getByRole('dialog').evaluate(el=>{el.scrollTop=380;});
  await expect.poll(()=>page.locator('.world-hero').evaluate(el=>Number(el.style.getPropertyValue('--journey')))).toBeGreaterThan(.5);
  await expect.poll(()=>page.locator('.orbit-demo-title').evaluate(el=>Number(getComputedStyle(el).opacity))).toBeLessThan(.25);
  await expect.poll(()=>page.locator('.world-scroll-copy').evaluate(el=>Number(getComputedStyle(el).opacity))).toBeGreaterThan(.5);
  expect((await canvas.screenshot()).equals(first)).toBe(false);
  await expect(page.getByRole('button',{name:'Pulse signal',exact:true})).toBeInViewport();
  await page.getByRole('button',{name:'Close project'}).click();
  await expect(page.locator('#interactive-demo .project-sculpture')).toHaveCount(0);
});

test('reduced motion presents the narrative in normal flow without scroll-driven graphics',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:390,height:844});
  await page.goto('/#project/form-and-field');await expect(page.locator('.demo-3d-ready')).toBeVisible();
  await expect(page.locator('.world-scene')).toHaveCSS('position','relative');
  await page.getByRole('dialog').evaluate(el=>{el.scrollTop=330;});
  await expect(page.locator('.world-hero')).toHaveCSS('--journey','0');
  await expect(page.locator('.world-scroll-copy')).toHaveCSS('opacity','1');
  expect(await page.locator('#interactive-demo').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
});
