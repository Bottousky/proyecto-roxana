// Tira de cuadros de un gesto de la home, con el tiempo de cada cuadro: sirve para revisar ritmo,
// anticipación y reposo cuando no hay grabación de video. Perfil aislado, partida FIXTURE.
// Uso: node scripts/home-strip.mjs ohmdal|physica|bitland|arithmos [etapa] [hora] [carpeta]
import {chromium} from 'playwright';
import {mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {previewState} from '../src/escuela/progress.js';
import {ARTIFACTS} from '../src/escuela/artifacts.js';

const [world='ohmdal',stage='10',hour='tarde']=process.argv.slice(2);
const out=process.argv[5]||fileURLToPath(new URL('../output/home/strips/',import.meta.url));mkdirSync(out,{recursive:true});
const base=process.env.HOME_URL||'http://127.0.0.1:4196/';
const chrome=['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync);
const browser=await chromium.launch({headless:true,executablePath:chrome,args:[process.platform==='darwin'?'--use-angle=metal':'--use-angle=d3d11','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:960,height:600}});page.setDefaultTimeout(30000);
await page.addInitScript(save=>{try{if(!sessionStorage.getItem('seeded')){localStorage.setItem('ohmdal.playcanvas.arc1.v1',save);localStorage.setItem('roxana.escuela.v1',JSON.stringify({version:1,stageSeen:10,welcomed:true}));sessionStorage.setItem('seeded','1');}}catch{}},JSON.stringify(previewState(Number(stage))));
await page.goto(`${base}escuela.html?hora=${hour}`);await page.waitForFunction(()=>window.__escuela,null,{timeout:120000});
await page.click('#cta-explore');await page.waitForTimeout(2200);
const a=ARTIFACTS[world],pt=await page.evaluate(([x,z])=>window.__escuela.diorama.project([x,1.6,z]),[a.x,a.z]);
const frames=[];const t0=Date.now();
await page.mouse.click(pt.x,pt.y);
while(Date.now()-t0<3000){const shot=await page.screenshot({type:'jpeg',quality:70});frames.push({t:Date.now()-t0,src:'data:image/jpeg;base64,'+shot.toString('base64')});}
// Compose the contact sheet in the same browser.
const sheet=await browser.newPage({viewport:{width:1440,height:900}});
await sheet.setContent(`<body style="margin:0;background:#111;color:#ddd;font:14px Inter,system-ui"><div style="padding:10px">${world} · etapa ${stage} · ${hour} · ${frames.length} cuadros en 3 s (fixture)</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:6px">${frames.filter((_,i)=>i%Math.max(1,Math.ceil(frames.length/12))===0).slice(0,12).map(f=>`<figure style="margin:0;position:relative"><img src="${f.src}" style="width:100%;display:block"><figcaption style="position:absolute;left:6px;top:4px;background:#000a;padding:2px 6px">${(f.t/1000).toFixed(2)} s</figcaption></figure>`).join('')}</div></body>`);
await sheet.waitForTimeout(300);
const file=`${out}/${world}-e${stage}-${hour}.png`;await sheet.screenshot({path:file,fullPage:true});console.log('tira',file,frames.length,'cuadros');
await browser.close();
