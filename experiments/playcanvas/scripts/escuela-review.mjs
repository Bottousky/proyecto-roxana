// Capturas del Instituto sin tocar partidas: cada toma usa ?etapa= (vista previa).
// Uso: node scripts/escuela-review.mjs [tomas] [etapa] [hora]
//   tomas: lista separada por comas de vista|patio|direccion|taller|trofeos|anfiteatro|mundos|showcase:N
//   ESCUELA_URL cambia la dirección (por defecto http://127.0.0.1:4192/).
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const base=process.env.ESCUELA_URL||'http://127.0.0.1:4192/';
const shots=(process.argv[2]||'vista').split(',');
const stage=process.argv[3]??'0';
const hour=process.argv[4]||'tarde';
const width=Number(process.env.W||1440),height=Number(process.env.H||900);
const out=fileURLToPath(new URL('../output/escuela-review/',import.meta.url));
mkdirSync(out,{recursive:true});

const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.log('console:',m.type(),m.text().slice(0,300));});
page.on('pageerror',e=>console.log('pageerror:',e.message));
await page.goto(`${base}escuela.html?etapa=${stage}&hora=${hour}`);
await page.waitForFunction(()=>window.__escuela,null,{timeout:120000});
await page.waitForTimeout(3500);
if(process.env.EVAL)console.log('eval:',JSON.stringify(await page.evaluate(process.env.EVAL)));
for(const shot of shots){
  await page.evaluate(shot=>{
    const e=window.__escuela;document.querySelector('#news')?.classList.add('hidden');
    if(shot==='libre'){}else if(shot.startsWith('film:')){e.openRoom('anfiteatro');setTimeout(()=>document.querySelector(`[data-film=${shot.split(':')[1]}]`)?.click(),1200);}else if(shot==='vista')e.closeRoom();else if(shot.startsWith('showcase:'))e.diorama.showcase(Number(shot.split(':')[1]));else e.openRoom(shot);
  },shot);
  await page.waitForTimeout(3800);
  const file=out+`${shot.replace(':','-')}-e${stage}-${hour}-${width}.png`;
  await page.screenshot({path:file});console.log('captura',file);
}
await browser.close();
