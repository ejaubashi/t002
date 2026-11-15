import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

await mkdir('review',{recursive:true});
const current=await createServer({server:{host:'127.0.0.1',port:5173,strictPort:true}});
const baseline=await createServer({root:'/tmp/perception-baseline',cacheDir:'/tmp/perception-baseline-vite',server:{host:'127.0.0.1',port:5174,strictPort:true,fs:{allow:[process.cwd(),'/tmp/perception-baseline']}}});
await current.listen();await baseline.listen();
const browser=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader']});
const projects=['orbit','form-and-field','offgrid','good-noise'];
const report={homepage:[],views:[],errors:[]},sheets={};
try{
 for(const width of [1440,390]){
  const height=width===390?844:1000;
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('console',msg=>{if(msg.type()==='error')report.errors.push(msg.text());});
  const before=await context.newPage();
  await before.goto('http://127.0.0.1:5174/');
  await before.evaluate(()=>document.fonts.ready);
  await before.waitForTimeout(180);
  const original=await before.screenshot();
  await page.goto('http://127.0.0.1:5173/');
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(180);
  const updated=await page.screenshot();
  assert(original.equals(updated),'Homepage pixels changed at '+width);
  report.homepage.push({width,pixelIdentical:true});await before.close();
  const gallery=[],projectShots=[];
  for(const [i,id] of projects.entries()){
   await page.goto('http://127.0.0.1:5173/');
   await page.locator('#'+id).evaluate(el=>el.scrollIntoView({behavior:'instant',inline:'start',block:'start'}));
   if(i<2)await page.locator('#'+id+' .project-sculpture').waitFor({state:'visible'});
   await page.waitForTimeout(250);
   assert(await page.locator('#'+id+' .project-heading').evaluate(el=>el.getBoundingClientRect().right<=innerWidth+1),'Gallery type exceeds viewport '+id);
   const g=await page.screenshot();gallery.push(g);
   await page.locator('#'+id+' .project-hit').click();
   if(i<2)await page.locator('#interactive-demo .project-sculpture').waitFor({state:'visible'});
   await page.waitForTimeout(250);
   assert(await page.locator('#interactive-demo').evaluate(el=>el.scrollWidth<=el.clientWidth),'Project overflow '+id);
   const p=await page.screenshot();projectShots.push(p);
   await writeFile('review/'+id+'-'+width+'.png',p);
   await page.keyboard.press('Escape');
   report.views.push({width,project:id,overflow:false,closed:true});
  }
  sheets['gallery-'+width]=gallery;sheets['projects-'+width]=projectShots;
  await context.close();
 }
 assert.deepEqual(report.errors,[]);
 for(const [name,shots] of Object.entries(sheets)){
  const mobile=name.endsWith('390'),cols=mobile?4:2;
  const thumb=mobile?250:500,ratio=mobile?844/390:1000/1440;
  const sheet=await browser.newPage({viewport:{width:1000,height:Math.ceil((4/cols)*thumb*ratio)}});
  await sheet.setContent('<body style="margin:0;display:grid;grid-template-columns:repeat('+cols+',1fr);background:#29251f">'+shots.map(s=>'<img style="display:block;width:100%" src="data:image/png;base64,'+s.toString('base64')+'">').join('')+'</body>');
  await sheet.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
  const jpeg=await sheet.screenshot({type:'jpeg',quality:58});
  await writeFile('review/'+name+'.jpg',jpeg);
  const b64=jpeg.toString('base64');
  console.log('VISUAL_BEGIN '+name);
  for(let n=0;n<b64.length;n+=1000)console.log('VISUAL_DATA '+b64.slice(n,n+1000));
  console.log('VISUAL_END '+name);await sheet.close();
 }
 await writeFile('review/results.json',JSON.stringify(report,null,2));
 console.log('PERCEPTION_REVIEW '+JSON.stringify(report));
}finally{await browser.close();await current.close();await baseline.close();}
