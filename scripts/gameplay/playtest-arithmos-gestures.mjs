import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const url=process.env.ARITHMOS_URL || 'http://127.0.0.1:5197/src/experiences/arithmos/';
const out='output/arithmos-gestures'; await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(url); await page.waitForFunction(()=>Boolean(window.__arithmos));
 await page.locator('[data-do="start"]').click(); await page.locator('[data-do="quiet"]').click();
 await page.waitForTimeout(400);
 const point=(x,z)=>page.evaluate(([x,z])=>window.__arithmos.project(x,z),[x,z]);
 const state=()=>page.evaluate(()=>window.__arithmos.state);
 const first=await point(-1,3); await page.touchscreen.tap(first.x,first.y);
 await page.locator('[data-do="widen"]').tap();
 await page.locator('[data-do="deselect"]').tap();
 const cdp=await context.newCDPSession(page);
 const dispatch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map((p,i)=>({...p,id:i,radiusX:2,radiusY:2,force:1}))});
 const from=await point(-1,3),to=await point(-1,-2);
 await dispatch('touchStart',[from]);
 for(let i=1;i<=12;i++){
  await dispatch('touchMove',[{x:from.x+(to.x-from.x)*i/12,y:from.y+(to.y-from.y)*i/12}]);
  await page.waitForTimeout(30);
 }
 await dispatch('touchEnd',[]);
 assert.equal((await state()).evaluation.solved,true,'real touch drag restores bridge');
 await page.locator('[data-do="deselect"]').tap();
 await page.locator('[data-do="recenter"]').tap();
 await page.waitForTimeout(200);
 const span=async()=>{const a=await point(0,0),b=await point(1,0);return Math.hypot(a.x-b.x,a.y-b.y);};
 const before=await span();
 await dispatch('touchStart',[{x:365,y:215},{x:465,y:215}]);
 await dispatch('touchMove',[{x:315,y:215},{x:515,y:215}]);
 await page.waitForTimeout(300);
 const after=await span(); assert.ok(after/before>1.8 && after/before<2.2,'two fingers magnify actual world');
 const panBefore=await point(0,0);
 await dispatch('touchMove',[{x:355,y:235},{x:555,y:235}]);
 await page.waitForTimeout(300);
 const panAfter=await point(0,0);
 assert.ok(panAfter.x-panBefore.x>25,'two-finger pan translates world');
 await dispatch('touchEnd',[]);
 assert.equal((await state()).evaluation.solved,true,'camera gesture never moves matter');
 assert.deepEqual(errors,[]);
 await page.screenshot({path:`${out}/touch-drag-pinch-pan.png`});
 await writeFile(`${out}/evidence.json`,JSON.stringify({result:'PASS',errors,zoomRatio:after/before,pan:{x:panAfter.x-panBefore.x,y:panAfter.y-panBefore.y}},null,2));
 console.log('PASS: touch drag, two-finger zoom/pan, board unchanged by camera.');
}catch(error){console.error(error); await page.screenshot({path:`${out}/failure.png`}).catch(()=>{}); process.exitCode=1;}
finally{await browser.close();}
