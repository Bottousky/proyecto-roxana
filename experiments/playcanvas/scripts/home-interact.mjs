// Recorrido de interacción de la home en un perfil aislado (nunca toca partidas personales).
// Toca cada artefacto donde se proyecta en pantalla, captura su respuesta, comprueba que abre su
// taller, que Escape la saltea, y que «Cambió por tu aventura» aparece una sola vez (partida FIXTURE).
// Uso: node scripts/home-interact.mjs [carpeta]   (HOME_URL, por defecto http://127.0.0.1:4196/)
import {chromium} from 'playwright';
import {mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {previewState} from '../src/escuela/progress.js';
import {ARTIFACTS} from '../src/escuela/artifacts.js';

const base=process.env.HOME_URL||'http://127.0.0.1:4196/';
const out=process.argv[2]||fileURLToPath(new URL('../output/home/interact/',import.meta.url));mkdirSync(out,{recursive:true});
const chrome=['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync);
const browser=await chromium.launch({headless:true,executablePath:chrome,args:[process.platform==='darwin'?'--use-angle=metal':'--use-angle=d3d11','--ignore-gpu-blocklist']});
const results=[];const ok=(name,pass,info='')=>{results.push({name,pass,info});console.log(pass?'OK  ':'FALLA',name,info);};
const errors=[];

async function open(page,url){await page.goto(url);await page.waitForFunction(()=>window.__escuela,null,{timeout:120000});await page.waitForTimeout(1500);}
async function artifactPoint(page,world){
  const a=ARTIFACTS[world];return page.evaluate(([x,z])=>{const p=window.__escuela.diorama.project([x,1.6,z]);return p&&{x:p.x,y:p.y};},[a.x,a.z]);
}

// 1 · Cada artefacto responde y abre su taller. Fixture etapa 10: el Faro está encendido.
{
  const ctx=await browser.newContext({viewport:{width:1440,height:900}});const page=await ctx.newPage();page.setDefaultTimeout(30000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.addInitScript(save=>{try{if(!sessionStorage.getItem('seeded')){localStorage.setItem('ohmdal.playcanvas.arc1.v1',save);localStorage.setItem('roxana.escuela.v1',JSON.stringify({version:1,stageSeen:10,welcomed:true}));sessionStorage.setItem('seeded','1');}}catch{}},JSON.stringify(previewState(10)));
  await open(page,base+'escuela.html?hora=tarde');
  await page.click('#cta-explore');await page.waitForTimeout(1600);
  for(const world of Object.keys(ARTIFACTS)){
    await page.evaluate(()=>window.__escuela.closeRoom());await page.waitForTimeout(1800);
    const pt=await artifactPoint(page,world);
    if(!pt){ok(`${world}: visible en la vista general`,false,'fuera de cámara');continue;}
    await page.mouse.click(pt.x,pt.y);await page.waitForTimeout(250);
    const reacting=await page.evaluate(()=>Boolean(window.__escuela.diorama.reaction));
    ok(`${world}: tocar el artefacto inicia su respuesta`,reacting,`(${Math.round(pt.x)},${Math.round(pt.y)})`);
    await page.waitForTimeout(700);await page.screenshot({path:`${out}/${world}-respuesta.png`});
    const cap=await page.evaluate(()=>document.querySelector('#caption').innerText.replace(/\s+/g,' '));
    ok(`${world}: rótulo explicativo`,cap.length>10,cap.slice(0,90));
    await page.waitForTimeout(2200);
    const room=await page.evaluate(()=>document.querySelector('#panel').dataset.room);
    ok(`${world}: abre su taller`,room===ARTIFACTS[world].room,room);
  }
  // Escape saltea la respuesta y abre el taller enseguida.
  await page.evaluate(()=>window.__escuela.closeRoom());await page.waitForTimeout(1800);
  const pt=await artifactPoint(page,'physica');await page.mouse.click(pt.x,pt.y);await page.waitForTimeout(200);await page.keyboard.press('Escape');await page.waitForTimeout(300);
  ok('Escape saltea la respuesta',await page.evaluate(()=>!window.__escuela.diorama.reaction&&document.querySelector('#panel').dataset.room==='fisica'));
  // El botón del panel da el mismo gesto con teclado.
  await page.evaluate(()=>window.__escuela.openRoom('matematica'));await page.waitForTimeout(1500);
  await page.focus('#look-artifact');await page.keyboard.press('Enter');await page.waitForTimeout(300);
  ok('«Mirar…» desde el panel inicia la respuesta',await page.evaluate(()=>window.__escuela.diorama.reaction?.world==='arithmos'));
  await page.waitForTimeout(2600);
  await ctx.close();
}
// 2 · Faro apagado en la partida: el gesto lo dice y la linterna no se enciende. Fixture etapa 3.
{
  const ctx=await browser.newContext({viewport:{width:1440,height:900}});const page=await ctx.newPage();page.setDefaultTimeout(30000);
  await page.addInitScript(save=>{try{if(!sessionStorage.getItem('seeded')){localStorage.setItem('ohmdal.playcanvas.arc1.v1',save);localStorage.setItem('roxana.escuela.v1',JSON.stringify({version:1,stageSeen:3,welcomed:true}));sessionStorage.setItem('seeded','1');}}catch{}},JSON.stringify(previewState(3)));
  await open(page,base+'escuela.html?hora=noche');await page.click('#cta-explore');await page.waitForTimeout(1600);
  const pt=await artifactPoint(page,'ohmdal');await page.mouse.click(pt.x,pt.y);await page.waitForTimeout(900);
  const cap=await page.evaluate(()=>document.querySelector('#caption').innerText);
  ok('Faro sin encender: lo dice sin inventar',/sigue apagada/.test(cap),cap.replace(/\s+/g,' ').slice(0,80));
  await page.screenshot({path:`${out}/ohmdal-apagado.png`});
  await ctx.close();
}
// 3 · Cambió por tu aventura: campus ya transformado, tarjeta no bloqueante, una sola vez.
{
  const ctx=await browser.newContext({viewport:{width:1440,height:900}});const page=await ctx.newPage();page.setDefaultTimeout(30000);
  await page.addInitScript(save=>{try{if(!sessionStorage.getItem('seeded')){localStorage.setItem('ohmdal.playcanvas.arc1.v1',save);localStorage.setItem('roxana.escuela.v1',JSON.stringify({version:1,stageSeen:2,welcomed:true}));sessionStorage.setItem('seeded','1');}}catch{}},JSON.stringify(previewState(5)));
  await open(page,base+'escuela.html?hora=tarde');
  const shown=await page.evaluate(()=>!document.querySelector('#changes').classList.contains('hidden'));
  ok('la tarjeta de cambios aparece al volver',shown);
  const stage=await page.evaluate(()=>window.__escuela.diorama.stage);ok('el campus ya está transformado',stage===5,`etapa ${stage}`);
  await page.screenshot({path:`${out}/cambios-tarjeta.png`});
  const cta=await page.evaluate(()=>({href:document.querySelector('#cta-play').getAttribute('href'),label:document.querySelector('#cta-play').innerText}));
  ok('Continuar sigue disponible y dominante',/#continuar/.test(cta.href)&&/Continuar/.test(cta.label),cta.label);
  await page.reload();await page.waitForFunction(()=>window.__escuela,null,{timeout:120000});await page.waitForTimeout(1500);
  ok('tras recargar no se repite la celebración',await page.evaluate(()=>document.querySelector('#changes').classList.contains('hidden')));
  await ctx.close();
}
// 4 · Novedades no leídas (contenido de PRUEBA interceptado, no publicado): farolito y punto se encienden y se apagan al leer.
{
  const ctx=await browser.newContext({viewport:{width:1440,height:900}});const page=await ctx.newPage();page.setDefaultTimeout(30000);
  await page.route('**/escuela/novedades.json',r=>r.fulfill({json:{version:1,items:[{id:'qa-prueba',title:'Prueba de QA',summary:'Contenido interceptado por el script de pruebas.',date:'2026-10-06',published:true}]}}));
  await page.addInitScript(()=>{try{if(!sessionStorage.getItem('seeded')){localStorage.setItem('roxana.escuela.v1',JSON.stringify({version:1,welcomed:true,newsSeen:'2026-09-01'}));sessionStorage.setItem('seeded','1');}}catch{}});
  await open(page,base+'escuela.html?hora=noche');
  const before=await page.evaluate(()=>({dot:document.querySelector('#link-news').dataset.unread,lamp:window.__escuela.diorama.noticeUnread}));
  ok('no leído: punto en el enlace y farolito de la cartelera',before.dot==='1'&&before.lamp===1,JSON.stringify(before));
  await page.screenshot({path:`${out}/cartelera-no-leido.png`});
  await page.click('#link-news');await page.waitForTimeout(2500);
  const after=await page.evaluate(()=>({dot:document.querySelector('#link-news').dataset.unread,lamp:window.__escuela.diorama.noticeUnread,room:document.querySelector('#panel').dataset.room,focus:window.__escuela.diorama.focusId,text:document.querySelector('#news-body').innerText}));
  ok('leer apaga punto y farolito, la cámara va a la cartelera',!after.dot&&after.lamp===0&&after.room==='novedades'&&after.focus==='novedades',JSON.stringify({...after,text:undefined}));
  ok('el panel muestra la novedad en HTML legible',/Prueba de QA/.test(after.text));
  await page.screenshot({path:`${out}/cartelera-abierta.png`});
  await page.reload();await page.waitForFunction(()=>window.__escuela,null,{timeout:120000});await page.waitForTimeout(1200);
  ok('tras recargar sigue leída',await page.evaluate(()=>!document.querySelector('#link-news').dataset.unread));
  ok('la URL #novedades se restaura al recargar',await page.evaluate(()=>document.querySelector('#panel').dataset.room==='novedades'));
  // Tocar la cartelera en 3D abre el mismo panel.
  await page.evaluate(()=>window.__escuela.closeRoom());await page.waitForTimeout(2000);
  const pt=await page.evaluate(()=>{const b=window.__escuela.diorama.project([7.4,1.8,21.2]);return {x:b.x,y:b.y};});
  await page.mouse.click(pt.x,pt.y);await page.waitForTimeout(1200);
  ok('tocar la cartelera abre Novedades',await page.evaluate(()=>document.querySelector('#panel').dataset.room==='novedades'));
  await ctx.close();
}
ok('sin errores de página ni de consola',errors.length===0,errors.slice(0,3).join(' | '));
await browser.close();
const failed=results.filter(r=>!r.pass).length;console.log(`\n${results.length-failed}/${results.length} comprobaciones`);process.exit(failed?1:0);
