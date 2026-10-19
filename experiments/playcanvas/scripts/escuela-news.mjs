// Recorre la secuencia de novedades con una partida de prueba en un navegador aislado.
// Uso: node scripts/escuela-news.mjs [etapa]
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {previewState} from '../src/escuela/progress.js';
const base=process.env.ESCUELA_URL||'http://127.0.0.1:4192/',stage=Number(process.argv[2]||4);
const out=fileURLToPath(new URL('../output/escuela-review/',import.meta.url));mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>console.log('pageerror:',e.message));
await page.addInitScript(save=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('ohmdal.playcanvas.arc1.v1',save);sessionStorage.setItem('seeded','1');}},JSON.stringify(previewState(stage)));
await page.goto(base+'escuela.html?hora=tarde');
await page.waitForSelector('#news:not(.hidden)',{timeout:120000});
await page.waitForTimeout(800);await page.screenshot({path:out+'news-card.png'});
await page.click('#news-show');
for(let i=0;i<stage;i++){await page.waitForTimeout(3200);await page.screenshot({path:out+`news-${i+1}.png`});console.log('toma',i+1);}
await page.waitForFunction(()=>!document.body.classList.contains('showcasing'),null,{timeout:60000});
const fps=await page.evaluate(()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<3000)requestAnimationFrame(f);else r(n/3);};requestAnimationFrame(f);}));
console.log('fps',fps.toFixed(1));
await page.screenshot({path:out+'news-end.png'});
await browser.close();
