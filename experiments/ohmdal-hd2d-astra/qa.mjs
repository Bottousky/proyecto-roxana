import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const output=path.resolve('output/astra-hd2d');await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-gpu','--ignore-gpu-blocklist','--enable-accelerated-2d-canvas','--enable-gpu-rasterization','--use-angle=d3d11']});
const mobile=process.argv.includes('--mobile');
const context=await browser.newContext(mobile?{viewport:{width:430,height:932},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:960},deviceScaleFactor:1});
const page=await context.newPage();const errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const snap=()=>page.evaluate(()=>window.__ohmdal.snapshot());
const click=async(x,y)=>mobile?page.touchscreen.tap(x,y):page.mouse.click(x,y);
async function target(id){
  let s=await snap(),t=s.targets.find(t=>t.id===id);
  // On a portrait viewport, explore toward an off-screen object by tapping visible ground.
  for(let i=0;i<12&&(t.screen.x<40||t.screen.x>page.viewportSize().width-40||t.screen.y<200||t.screen.y>page.viewportSize().height-180);i++){
    const width=page.viewportSize().width,height=page.viewportSize().height;
    await click(Math.max(55,Math.min(width-55,t.screen.x)),Math.max(250,Math.min(height-220,t.screen.y+70)));
    await page.waitForFunction(()=>window.__ohmdal.snapshot().walking===0,{},{timeout:20000});await page.waitForTimeout(650);
    s=await snap();t=s.targets.find(t=>t.id===id);
  }
  await click(t.screen.x,t.screen.y);
  await page.waitForFunction(()=>window.__ohmdal.snapshot().walking===0,{},{timeout:20000});
  await page.waitForTimeout(180);
}
async function closeDialog(){for(let i=0;i<8;i++){if(!await page.locator('#dialog').isVisible())return;const next=page.getByRole('button',{name:'Seguir leyendo →',exact:true});if(await next.isVisible())await next.click();else{const close=page.getByRole('button',{name:'Volver a la plaza',exact:true});if(await close.isVisible()){await close.click();return;}return;}}}
try{
  await page.goto('http://127.0.0.1:54322/');await page.waitForFunction(()=>!!window.__ohmdal);await page.waitForTimeout(1700);
  await page.screenshot({path:path.join(output,mobile?'mobile-arrival.png':'arrival.png')});
  await page.getByRole('button',{name:'Entrar en la plaza'}).click();await page.waitForTimeout(1200);
  await page.screenshot({path:path.join(output,mobile?'mobile-plaza.png':'plaza.png')});
  if(process.argv.includes('--look')){console.log(JSON.stringify({errors,viewport:await page.evaluate(()=>({innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,coarse:matchMedia('(pointer:coarse)').matches,header:document.querySelector('.masthead').getBoundingClientRect().toJSON()})),snapshot:await snap()},null,2));}
  else{
    const initialPosition=(await snap()).state.player;
    if(mobile){
      const control=await page.locator('#joystick').boundingBox();
      const client=await context.newCDPSession(page);
      await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:control.x+50,y:control.y+50}]});
      await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:control.x+80,y:control.y+50}]});await page.waitForTimeout(300);
      await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await client.detach();
    }else{await page.keyboard.down('ArrowUp');await page.waitForTimeout(300);await page.keyboard.up('ArrowUp');}
    const moved=(await snap()).state.player;assert.ok(Math.hypot(moved[0]-initialPosition[0],moved[1]-initialPosition[1])>.3,'movement control moves the player');
    await page.getByRole('button',{name:'Pausar',exact:true}).click();const paused=(await snap()).state.player;await page.waitForTimeout(250);assert.deepEqual((await snap()).state.player,paused,'pause stops movement');await page.getByRole('button',{name:'Volver al mundo',exact:true}).click();
    await page.getByRole('button',{name:'Activar sonido',exact:true}).click();assert.equal(await page.locator('#sound-button').getAttribute('aria-pressed'),'true');await page.getByRole('button',{name:'Desactivar sonido',exact:true}).click();
    await target('ohm');assert.equal((await snap()).modal,'dialog','Ohm reachable');await closeDialog();
    await target('switch');assert.equal((await snap()).state.switchClosed,true);assert.equal((await snap()).electrical.current,0);
    await target('return');assert.equal((await snap()).modal,'dialog','Broken return reachable');await closeDialog();
    await target('lumen');await page.getByRole('button',{name:'Seguir leyendo →'}).click();await page.getByRole('button',{name:'Tomar la tira de cobre'}).click();assert.equal((await snap()).state.hasStrap,true);
    await target('return');await page.getByRole('button',{name:'Ajustar la tira de cobre'}).click();await page.waitForTimeout(1200);assert.equal((await snap()).state.awakened,true);
    // Ohm's first response may be opened by the restoration event.
    if((await snap()).modal!=='dialog')await target('ohm');
    await page.getByRole('button',{name:'Seguir leyendo →'}).click();await page.getByRole('button',{name:'Mostrarle el puente que reparaste'}).click();
    await page.getByRole('button',{name:'Seguir leyendo →'}).click();await page.getByRole('button',{name:'Anotarlo en la bitácora'}).click();
    assert.match(await page.locator('#journal-entries').innerText(),/circuito cerrado/);await page.getByRole('button',{name:'Cerrar bitácora'}).click();
    await page.screenshot({path:path.join(output,mobile?'mobile-restored.png':'restored.png')});
    await target('switch');assert.equal((await snap()).electrical.current,0);await target('switch');assert.equal((await snap()).electrical.current,.5);
    await target('edda');await closeDialog();await target('bridge');await page.getByRole('button',{name:'Seguir leyendo →'}).click();await page.getByRole('button',{name:'Seguir explorando la plaza'}).click();assert.equal((await snap()).state.crossed,true);
    const beforeReload=(await snap()).state;await page.reload();await page.waitForFunction(()=>!!window.__ohmdal);assert.equal((await snap()).state.crossed,true);assert.equal((await snap()).state.returnRepaired,true);
    await page.waitForTimeout(5500);await page.screenshot({path:path.join(output,mobile?'mobile-complete.png':'complete.png')});
    const report={mode:mobile?'mobile-emulation':'desktop',errors,beforeReload,snapshot:await snap()};
    if(mobile){await page.setViewportSize({width:932,height:430});await page.waitForTimeout(600);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),932);await page.screenshot({path:path.join(output,'mobile-landscape.png')});await page.setViewportSize({width:430,height:932});}
    await page.getByRole('button',{name:'Pausar',exact:true}).click();await page.getByRole('button',{name:'Comenzar un recorrido nuevo',exact:true}).click();assert.equal((await snap()).state.crossed,true,'first reset press preserves the save');await page.getByRole('button',{name:'Borrar este recorrido y comenzar',exact:true}).click();assert.equal((await snap()).state.started,false);assert.equal((await snap()).state.returnRepaired,false);
    await fs.writeFile(path.join(output,mobile?'mobile-report.json':'desktop-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));assert.deepEqual(errors,[]);
  }
}catch(error){await page.screenshot({path:path.join(output,mobile?'mobile-failure.png':'failure.png')});console.error(error);console.log(JSON.stringify({errors,snapshot:await snap()},null,2));process.exitCode=1;}
finally{await browser.close();}
