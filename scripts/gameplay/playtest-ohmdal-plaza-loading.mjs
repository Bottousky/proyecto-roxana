import { chromium } from 'playwright';
import { mkdir,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fastLaunchOptions, getCaptureShotSpec } from '../visual/ohmdal-capture-contract.mjs';

const base=process.env.OHMDAL_QA_URL??'http://127.0.0.1:54321';
const out=resolve('output/playwright/ohmdal-plaza-world-20260907/loading');
await mkdir(out,{recursive:true});
const browser=await chromium.launch(fastLaunchOptions());
const page=await browser.newPage({viewport:{width:1280,height:800}});
const errors=[];
let requests=0;
page.on('pageerror',error=>errors.push(error.message));
await page.route('**/plaza-planting.glb',async route=>{
  requests++;
  if(requests===1) await route.abort('failed');
  else await route.continue();
});
try {
  await page.goto(`${base}/ohmdal-playcanvas`,{waitUntil:'networkidle'});
  await page.locator('#plaza-enter').click();
  await page.waitForFunction(()=>Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__),null,{timeout:30000});
  const evidence=await page.evaluate(async()=>{
    const entry=performance.getEntriesByType('resource').find(e=>/\/playcanvas\.js\?/.test(e.name));
    if(!entry) throw new Error('Missing observed PlayCanvas module URL');
    const pc=await import(entry.name);
    const app=pc.Application.getApplication();
    const plaza=app.root.findByName('PlazaRoot');
    return {
      surroundings:plaza.children.filter(e=>e.name==='PlazaSurroundingsRoot').length,
      planting:plaza.children.filter(e=>e.name==='PlazaPlantingRoot').length,
      obsoleteSkirtsVisible:['PlazaPerimeterSkirtNear','PlazaPerimeterSkirtFar'].some(name=>plaza.findByName(name).enabled),
      diagnostics:window.__ROXANA_VISUAL_TEST_HOOKS__.getDiagnostics(),
    };
  });
  if(requests!==2 || evidence.surroundings!==1 || evidence.planting!==1 || evidence.obsoleteSkirtsVisible || errors.length) {
    throw new Error(JSON.stringify({requests,evidence,errors}));
  }
  const perimeter=[];
  for (const [name,position,yaw,axis,sign,limit] of [
    ['east',[16,1.7,0],-90,0,1,17.45],
    ['west',[-16,1.7,8],90,0,-1,17.45],
    ['south',[10,1.7,-13],0,2,-1,14.45],
    ['north',[10,1.7,13],180,2,1,14.45],
  ]) {
    const shot=structuredClone(getCaptureShotSpec('workshop-exterior'));
    shot.anchor={position,yaw,pitch:0}; shot.world.storyStep='portal_arrived';
    await page.evaluate(async s=>{
      const hooks=window.__ROXANA_VISUAL_TEST_HOOKS__;
      await hooks.setCaptureShot(s); hooks.setPausedForScreenshot(false);
    },shot);
    await page.keyboard.down('w');
    await page.waitForTimeout(1100);
    await page.keyboard.up('w');
    const state=await page.evaluate(()=>window.__ROXANA_VISUAL_TEST_HOOKS__.getPlaytestSnapshot());
    const value=state.position[axis]*sign;
    if(value>limit || value<Math.abs(position[axis])+.4) throw new Error(`Perimeter ${name}: ${JSON.stringify(state.position)}`);
    perimeter.push({name,position:state.position,passed:true});
  }
  const seam=[];
  for(const name of ['manantial-approach','workshop-exterior']) {
    await page.evaluate(async shot=>window.__ROXANA_VISUAL_TEST_HOOKS__.setCaptureShot(shot),getCaptureShotSpec(name));
    seam.push(await page.evaluate(async()=>{
      const url=performance.getEntriesByType('resource').find(e=>/\/playcanvas\.js\?/.test(e.name)).name;
      const pc=await import(url),root=pc.Application.getApplication().root;
      return {surroundings:root.findByName('PlazaSurroundingsRoot').enabled,planting:root.findByName('PlazaPlantingRoot').enabled};
    }));
  }
  if(seam[0].surroundings || seam[0].planting || !seam[1].surroundings || !seam[1].planting) throw new Error('Plaza scenic roots leaked across zone seam');
  await writeFile(resolve(out,'loading-run.json'),JSON.stringify({passed:true,requests,errors,evidence,perimeter,seam},null,2));
  console.log('PASS: transient load recovery, unique roots, four physical perimeter boundaries and Plaza/Manantial visibility.');
} finally { await browser.close(); }
