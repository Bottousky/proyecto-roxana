// Capturas reproducibles de la home (Instituto Roxana) en un navegador aislado: nunca toca
// partidas personales. Cada toma es "nombre" o "nombre@etapa/hora".
// Uso: node scripts/home-shots.mjs vista,electronica,arrival@0/tarde [carpeta]
//   HOME_URL (por defecto http://127.0.0.1:4196/), W, H, DPR, MOBILE=1 (táctil),
//   SEED=n escribe una partida de PRUEBA (fixture, etapa n) en el perfil aislado: sirve para
//   mirar estados, no acredita progreso real. REDUCED=1 emula movimiento reducido.
import {chromium} from 'playwright';
import {mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {previewState} from '../src/escuela/progress.js';

const base=process.env.HOME_URL||'http://127.0.0.1:4196/';
const shots=(process.argv[2]||'vista').split(',');
const out=process.argv[3]||fileURLToPath(new URL('../output/home/',import.meta.url));
const width=Number(process.env.W||1440),height=Number(process.env.H||900),dpr=Number(process.env.DPR||1);
mkdirSync(out,{recursive:true});
const chrome=['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync);
const browser=await chromium.launch({headless:true,executablePath:chrome,args:[process.platform==='darwin'?'--use-angle=metal':'--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']});

for(const spec of shots){
  const [name,state='']=spec.split('@'),[stage,hour='tarde']=state.split('/');
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,isMobile:process.env.MOBILE==='1',hasTouch:process.env.MOBILE==='1',reducedMotion:process.env.REDUCED==='1'?'reduce':'no-preference'});
  const page=await context.newPage();
  page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.log('console:',m.type(),m.text().slice(0,240));});
  page.on('pageerror',e=>console.log('pageerror:',e.message));
  if(process.env.SEED)await page.addInitScript(save=>{try{if(!sessionStorage.getItem('seeded')){localStorage.setItem('ohmdal.playcanvas.arc1.v1',save);sessionStorage.setItem('seeded','1');}}catch{}},JSON.stringify(previewState(Number(process.env.SEED))));
  const query=new URLSearchParams();if(stage!=='')query.set('etapa',stage);query.set('hora',hour);
  const t0=Date.now();
  await page.goto(`${base}escuela.html?${query}`);
  if(name==='inicio'){await page.waitForTimeout(400);await page.screenshot({path:`${out}/${spec.replace(/[@/:]/g,'-')}-${width}.png`});console.log('captura',spec,'(primer cuadro)');await context.close();continue;}
  await page.waitForFunction(()=>window.__escuela,null,{timeout:120000});
  const ready=Date.now()-t0;
  await page.waitForTimeout(2600);
  if(name==='llegada'){await page.screenshot({path:`${out}/${spec.replace(/[@/:]/g,'-')}-${width}.png`});console.log('captura',spec,`listo ${ready} ms`);await context.close();continue;}
  await page.evaluate(name=>{
    const e=window.__escuela;document.querySelector('#news')?.classList.add('hidden');
    if(name==='vista')e.closeRoom();else if(name.startsWith('showcase:'))e.diorama.showcase(Number(name.split(':')[1]));else if(name.startsWith('pose:'))e.diorama.flyTo(JSON.parse(decodeURIComponent(name.slice(5))));else e.openRoom(name);
  },name);
  await page.waitForTimeout(Number(process.env.SETTLE||3600));
  const file=`${out}/${spec.replace(/[@/:]/g,'-').slice(0,80)}-${width}.png`;
  await page.screenshot({path:file});console.log('captura',file,`listo ${ready} ms`);
  await context.close();
}
await browser.close();
