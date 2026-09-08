import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { initialState, SAVE_KEY } from './circuit.js';
import { REGIONS, arcAction } from './arc-state.js';

const mobile=process.argv.includes('--mobile'),gallery=process.argv.includes('--gallery');
const output=path.resolve('output/astra-hd2d-arc');await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-gpu','--ignore-gpu-blocklist','--enable-accelerated-2d-canvas','--enable-gpu-rasterization','--use-angle=d3d11']});
const context=await browser.newContext(mobile?{viewport:{width:430,height:932},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:960},deviceScaleFactor:1});
const page=await context.newPage(),errors=[],report={mode:mobile?'touch emulation':'desktop',regions:[],errors};
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const snapshot=()=>page.evaluate(()=>window.__ohmdal.snapshot());
const tap=async(x,y)=>mobile?page.touchscreen.tap(x,y):page.mouse.click(x,y);
const waitWalk=async()=>{await page.waitForFunction(()=>window.__ohmdal.snapshot().walking===0,null,{timeout:25000});await page.waitForTimeout(450);};
async function target(id){
  let s=await snapshot(),t=s.targets.find(t=>t.id===id);assert.ok(t,`target ${id} exists`);
  for(let i=0;i<14&&(t.screen.x<40||t.screen.x>page.viewportSize().width-40||t.screen.y<210||t.screen.y>page.viewportSize().height-180);i++){
    const {width,height}=page.viewportSize();await tap(Math.max(55,Math.min(width-55,t.screen.x)),Math.max(245,Math.min(height-220,t.screen.y+65)));await waitWalk();s=await snapshot();t=s.targets.find(t=>t.id===id);
  }
  await tap(t.screen.x,t.screen.y);await waitWalk();
}
async function advance(){const b=page.getByRole('button',{name:'Seguir leyendo →',exact:true});while(await b.isVisible())await b.click();}
async function closeDialog(){if(!await page.locator('#dialog').isVisible())return;await advance();const close=page.getByRole('button',{name:'Volver a la plaza',exact:true});if(await close.isVisible())await close.click();}
async function action(name,value){await page.locator(`#machine [data-action="${name}"]${value===undefined?'':`[data-value="${value}"]`}`).click();}
async function capture(name){await page.screenshot({path:path.join(output,`${mobile?'touch-':''}${name}.png`)});}
async function visit(region){await page.waitForFunction(region=>window.__ohmdal.snapshot().state.arc.region===region&&window.__ohmdal.snapshot().modal!=='travel',region);await closeDialog();await page.waitForTimeout(1300);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),page.viewportSize().width);}
try{
  if(gallery){
    await page.addInitScript(key=>{const fixture=sessionStorage.getItem('arc-visual-fixture');if(fixture)localStorage.setItem(key,fixture);},SAVE_KEY);
    for(const region of REGIONS.slice(1)){
      const state=initialState();for(const k of ['started','inspected','talkedLumen','returnRepaired','switchClosed','awakened','verified','crossed'])state[k]=true;for(const r of REGIONS.slice(1))state.arc[r].verified=true;state.arc.region=region;state.arc.visited=[...REGIONS];state.player=[-4,4];
      if(region==='faro'){state.arc.faro={on:true,coil:2,focus:62,tripped:false,verified:true};}
      await page.goto('http://127.0.0.1:54322/');await page.evaluate(state=>sessionStorage.setItem('arc-visual-fixture',JSON.stringify(state)),state);await page.reload();await page.waitForFunction(()=>!!window.__ohmdal);assert.equal((await snapshot()).state.arc.region,region);await page.waitForTimeout(1600);await capture(`gallery-${region}`);report.regions.push({region,render:(await snapshot()).render});console.log(`Gallery: ${region}`);
    }
  }else{
    await page.goto('http://127.0.0.1:54322/');await page.waitForFunction(()=>!!window.__ohmdal);await page.getByRole('button',{name:'Entrar en la plaza'}).click();await page.waitForTimeout(1000);
    await target('ohm');await closeDialog();await target('switch');assert.equal((await snapshot()).electrical.current,0);
    await target('lumen');await advance();await page.getByRole('button',{name:'Tomar la tira de cobre'}).click();
    await target('return');await page.getByRole('button',{name:'Ajustar la tira de cobre'}).click();await page.waitForTimeout(1100);if((await snapshot()).modal!=='dialog')await target('ohm');await advance();await page.getByRole('button',{name:'Mostrarle el puente que reparaste'}).click();await closeDialog();
    await target('bridge');await advance();await page.getByRole('button',{name:'Seguir hacia La Calzada'}).click();
    for(const region of REGIONS.slice(1)){
      await visit(region);console.log(`Entered ${region}`);await capture(`${region}-arrival`);
      if(mobile&&region==='castillo'){await target('previous');await visit('calzada');assert.equal((await snapshot()).machine.ready,true);await target('next');await visit('castillo');}
      await target('resident');await closeDialog();await target('clue');await closeDialog();await target('memory');await closeDialog();await target('machine');assert.equal((await snapshot()).modal,'machine');
      if(region==='calzada'){
        await action('power');await action('probe',0);assert.equal((await snapshot()).machine.probeVoltage,0);await action('probe',1);assert.equal((await snapshot()).machine.probeVoltage,12);assert.equal(await page.locator('[data-action="repair"]').isDisabled(),true);await action('power');await action('repair');await action('power');
      }
      if(region==='castillo'){
        await action('power');assert.equal((await snapshot()).machine.ready,false);await action('power');await action('topology');await action('power');assert.equal((await snapshot()).state.arc.castillo.tripped,true);await action('branch',2);await action('reset');await action('power');await action('branch',0);assert.equal((await snapshot()).machine.ready,false);await action('branch',0);
      }
      if(region==='forja'){
        await action('power');assert.equal((await snapshot()).state.arc.forja.tripped,true);await action('coil',1);await action('reset');await action('power');assert.equal((await snapshot()).machine.power,48);await action('pump');assert.equal((await snapshot()).machine.ready,false);await action('pump');
      }
      if(region==='terrazas'){
        await action('power');assert.equal((await snapshot()).machine.current,0);await action('power');await action('cable',1);await action('polarity');await action('power');assert.equal((await snapshot()).machine.voltage,9);assert.equal((await snapshot()).machine.ready,false);await action('power');await action('cable',2);await action('power');
      }
      if(region==='faro'){
        await action('power');assert.equal((await snapshot()).state.arc.faro.tripped,true);await action('coil',2);await action('reset');await action('power');assert.equal((await snapshot()).machine.voltage,12);assert.equal((await snapshot()).machine.ready,false);
        if(mobile){const slider=page.locator('#lens-range');await slider.scrollIntoViewIfNeeded();const b=await slider.boundingBox(),client=await context.newCDPSession(page);await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+8+(b.width-16)*.25,y:b.y+b.height/2}]});await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+8+(b.width-16)*.62,y:b.y+b.height/2}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await client.detach();}
        else{await page.locator('#lens-range').focus();await page.keyboard.press('Home');for(let i=0;i<62;i++)await page.keyboard.press('ArrowRight');}
      }
      assert.equal((await snapshot()).machine.ready,true,`${region} is physically ready`);await capture(`${region}-mechanism`);await page.locator('#machine-verify').click();assert.equal((await snapshot()).state.arc[region].verified,true);await advance();
      if(region==='faro'){await page.getByRole('button',{name:'Anotar la experiencia'}).click();await page.getByRole('button',{name:'Cerrar bitácora'}).click();}
      else await page.getByRole('button',{name:'Volver al camino',exact:true}).click();
      await page.waitForTimeout(2200);await capture(`${region}-restored`);report.regions.push({region,render:(await snapshot()).render,reading:(await snapshot()).machine});
      if(region==='castillo'){await page.reload();await page.waitForFunction(()=>!!window.__ohmdal);assert.equal((await snapshot()).state.arc.castillo.verified,true);await page.waitForTimeout(500);}
      if(region!=='faro')await target('next');
    }
    await page.getByRole('button',{name:'Abrir mapa',exact:true}).click();await page.locator('#map-places button').filter({hasText:'Forja'}).click();await visit('forja');assert.equal((await snapshot()).machine.ready,true,'revisited machinery keeps its configuration');
    await page.getByRole('button',{name:'Abrir mapa',exact:true}).click();await page.locator('#map-places button').filter({hasText:'Plaza'}).click();await visit('plaza');await target('edda');await advance();await page.getByRole('button',{name:'Observar la primera clase'}).click();
    await page.waitForFunction(()=>window.__ohmdal.snapshot().state.lessonTime>2.6);assert.equal((await snapshot()).electrical.current,0);assert.equal((await snapshot()).electrical.companionPowered,true);await capture('first-class-open-circuit');
    await page.getByRole('button',{name:'Pausar',exact:true}).click();const paused=(await snapshot()).state.lessonTime;await page.waitForTimeout(300);assert.equal((await snapshot()).state.lessonTime,paused);await page.getByRole('button',{name:'Volver al mundo',exact:true}).click();
    await page.waitForFunction(()=>window.__ohmdal.snapshot().state.arc.complete,null,{timeout:13000});await capture('epilogue');await advance();await page.getByRole('button',{name:'Seguir habitando Ohmdal'}).click();await page.reload();await page.waitForFunction(()=>!!window.__ohmdal);assert.equal((await snapshot()).state.arc.complete,true);assert.deepEqual((await snapshot()).state.arc.visited,REGIONS);await page.waitForTimeout(1200);await capture('plaza-complete');report.final=(await snapshot()).state;
  }
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(output,`${mobile?'touch':'desktop'}-${gallery?'gallery':'journey'}.json`),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}catch(e){await capture('failure');console.error(e);console.log(JSON.stringify({errors,snapshot:await snapshot()},null,2));process.exitCode=1;}
finally{await browser.close();}
