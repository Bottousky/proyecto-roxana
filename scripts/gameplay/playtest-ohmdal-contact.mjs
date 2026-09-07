import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fastLaunchOptions, getCaptureShotSpec } from '../visual/ohmdal-capture-contract.mjs';
import { createArc1GreyboxState, enterArc1Region } from '../../src/experiences/ohmdal-playcanvas/systems/campaign/arc1GreyboxModel.ts';
import { createArc1SaveData, captureArc1CircuitState, serializeArc1SaveData } from '../../src/experiences/ohmdal-playcanvas/systems/campaign/arc1Save.ts';
import { createInitialCircuit } from '../../src/experiences/ohmdal-plaza/simulation/circuitSolver.ts';
import { BitacoraManager } from '../../src/experiences/ohmdal-plaza/journal/bitacora.ts';

const base = process.env.OHMDAL_QA_URL ?? 'http://127.0.0.1:54321';
const out = resolve('output/playwright/ohmdal-plaza-world-20260907/contact');
await mkdir(out,{recursive:true});
const browser = await chromium.launch(fastLaunchOptions());
const results = [], errors = [];
const assert = (ok,message) => { if (!ok) throw new Error(message); };
const frames = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
function save(brush) {
  let arc1=createArc1GreyboxState();
  if(brush) { arc1=enterArc1Region(arc1,'taller'); arc1=enterArc1Region(arc1,'plaza'); }
  return serializeArc1SaveData(createArc1SaveData({
    arc1,storyStep:brush?'returned_to_plaza':'portal_arrived',ohmAwake:brush,
    inventory:{jumper:brush,brush},circuit:captureArc1CircuitState(createInitialCircuit()),
    bitacora:new BitacoraManager().getStatuses(),safeAnchor:{zone:'plaza',anchorId:brush?'workshop-to-plaza':'portal-to-plaza'},
    b2:{coveredIds:brush?['g1','g5','g4']:[]},
  }));
}
try {
  for (const mobile of [false,true]) {
    for(const brush of [false,true]) {
      const id=`${mobile?'mobile':'desktop'}-${brush?'brush':'no-brush'}`;
      const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1440,height:900},
        isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
      const page=await context.newPage();
      page.on('pageerror',e=>errors.push(`${id}: ${e.message}`));
      await page.addInitScript(serialized=>{
        localStorage.setItem('ohmdal_intro_seen','true');
        if(!sessionStorage.getItem('contact-fixture')) {
          localStorage.setItem('ohmdal-playcanvas-arc1-v1',serialized);
          sessionStorage.setItem('contact-fixture','1');
        }
      },save(brush));
      await page.goto(`${base}/ohmdal-playcanvas?visualTest=1`,{waitUntil:'networkidle'});
      await page.locator('#plaza-enter').click();
      await page.waitForFunction(()=>Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__?.getPlaytestSnapshot()));
      const snapshot=()=>page.evaluate(()=>window.__ROXANA_VISUAL_TEST_HOOKS__.getPlaytestSnapshot());
      const label=page.locator('#ohmdal-contact-target-label');
      async function view(anchor) {
        const shot=structuredClone(getCaptureShotSpec('workshop-exterior'));
        shot.anchor=anchor; shot.world.storyStep=brush?'returned_to_plaza':'portal_arrived';
        shot.hideUi=false;
        await page.evaluate(async s=>{
          const hooks=window.__ROXANA_VISUAL_TEST_HOOKS__;
          await hooks.setCaptureShot(s); hooks.setPausedForScreenshot(false); hooks.hideDebugUi(false);
        },shot);
        await frames(page);
      }
      const close={position:[-2.6,1.7,-6.1],yaw:-90,pitch:-39};
      await view(close);
      await label.waitFor({state:'visible',timeout:8000});
      const before=await snapshot();
      assert(before.nearestInteractable==='moho_oxido',`${id}: wrong nearest target`);
      assert(!before.circuit.corrosionClosed,`${id}: pre-action circuit mutated`);
      const text=await label.textContent();
      assert(text.includes(brush?'Limpiar contacto':'necesita cepillo'),`${id}: incorrect tool hint`);
      const bounds=await label.boundingBox();
      assert(bounds && bounds.x>=0 && bounds.y>=0 && bounds.x+bounds.width<=(mobile?844:1440),`${id}: label clipped`);
      await page.screenshot({path:resolve(out,`${id}.png`)});
      // Camera-driven views are diagnostic positioning only. The action itself
      // is the real E / touch handler; the full Golden Path verifies walking.
      if(mobile) await page.locator('#touch-interact').tap();
      else await page.keyboard.press('e');
      await frames(page);
      const after=await snapshot();
      assert(after.circuit.corrosionClosed===brush,`${id}: cleaning prerequisite ignored`);
      if(brush) {
        assert(Math.abs(after.circuit.corrosionResistance-.05)<.0001,`${id}: wrong resistance`);
        await label.waitFor({state:'hidden'});
        await page.screenshot({path:resolve(out,`${id}-clean.png`)});
      } else {
        if(mobile) {
          await page.setViewportSize({width:390,height:844});
          await label.waitFor({state:'hidden'});
          await page.screenshot({path:resolve(out,'mobile-portrait-gate.png')});
          await page.setViewportSize({width:844,height:390});
          await label.waitFor({state:'visible'});
        }
        await view({...close,yaw:90});
        await label.waitFor({state:'hidden'});
        await view({...close,position:[-8,1.7,-6.1]});
        await label.waitFor({state:'hidden'});
        await view(close);
        await label.waitFor({state:'visible'});
        if(mobile) await page.locator('#btn-bitacora').tap();
        else await page.keyboard.press('Tab');
        await label.waitFor({state:'hidden'});
      }
      results.push({id,passed:true,text,bounds,before,after});
      if (!mobile && !brush) {
        await page.keyboard.press('Tab');
        for (const [name,anchor] of [
          ['world-east',{position:[6,1.7,-8],yaw:-145,pitch:0}],
          ['world-west',{position:[-5,1.7,6],yaw:60,pitch:0}],
          ['world-return',{position:[10,1.7,7],yaw:30,pitch:0}],
        ]) {
          await view(anchor);
          await page.screenshot({path:resolve(out,`${name}.png`)});
        }
      }
      await context.close();
    }
  }
  assert(errors.length===0,errors.join('\n'));
} finally {
  await writeFile(resolve(out,'contact-run.json'),JSON.stringify({results,errors},null,2));
  await browser.close();
}
console.log(`PASS ${results.length} contact cases (desktop / touch, with / without brush).`);
