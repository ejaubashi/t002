import {chromium,expect} from '@playwright/test';

const browser=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
  let fresh=false;
  for(let attempt=0;attempt<6;attempt++){
   await page.goto('https://ejaubashi.github.io/t002/?v=perception-'+Date.now()+'#project/orbit');
   if((await page.locator('.demo-stage').getAttribute('data-artwork'))==='tension'){fresh=true;break;}
   await page.waitForTimeout(10000);
  }
  expect(fresh).toBe(true);
  await expect(page.locator('#interactive-demo .project-sculpture')).toBeVisible();
  await page.getByRole('button',{name:'Wave',exact:true}).click();
  await expect(page.getByRole('button',{name:'Wave',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.locator('.detail-next').click();
  await expect(page.locator('.world-form-title')).toContainText('Quiet');
  await expect(page.locator('.demo-stage')).toHaveAttribute('data-artwork','interval');
  await expect(page.locator('.vase')).toHaveCount(0);
  await expect(page.locator('#interactive-demo .project-sculpture')).toBeVisible();
  await page.getByRole('button',{name:'Sage finish',exact:true}).click();
  await expect(page.locator('.demo-stage')).toHaveAttribute('data-finish','sage');
  await page.getByRole('slider',{name:'Turn artwork'}).focus();await page.keyboard.press('End');
  await expect(page.getByRole('slider',{name:'Turn artwork'})).toHaveValue('30');
  await page.locator('.detail-next').click();
  await page.getByRole('button',{name:'Night',exact:true}).click();
  await expect(page.locator('.landscape-hour')).toContainText('NIGHTFALL');
  await page.locator('.detail-next').click();
  await expect(page.getByRole('button',{name:'Enable sound',exact:true})).toHaveAttribute('aria-pressed','false');
  await page.locator('.record-tracks [data-track="1"]').click();
  await expect(page.locator('.record-copy')).toContainText('soft');
  await page.locator('.record-tracks [data-track="2"]').click();
  await page.getByRole('button',{name:'Reverse artwork',exact:true}).click();
  await expect(page.locator('.record-sleeve-back h3')).toHaveText('ELECTRIC FEEL');
  expect(await page.locator('#interactive-demo').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.getByRole('button',{name:'Close project'}).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(errors).toEqual([]);
  console.log(JSON.stringify({width,production:'passed',signal:'passed',ceramicFinish:'passed',landscape:'passed',recordSelection:'passed',audioDefault:'off',errors}));
  await context.close();
 }
}finally{await browser.close();}
