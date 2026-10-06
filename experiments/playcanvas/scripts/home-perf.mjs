// Medición de laboratorio de la home sobre la build (`vite preview`), perfil aislado.
// Registra: primer pintado y LCP, campus listo, distribución de tiempos de cuadro en reposo y con una sala
// abierta, draw calls y triángulos, memoria JS, texturas y entidades antes/después de 10 ciclos de
// abrir/cerrar salas, novedades y gestos de artefactos (fugas). No es medición de campo.
// Uso: node scripts/home-perf.mjs [url] [salida.json]   (W, H, DPR)
import {chromium} from 'playwright';
import {writeFileSync,existsSync} from 'node:fs';
import {cpus,totalmem} from 'node:os';

const url=process.argv[2]||'http://127.0.0.1:4197/escuela.html?hora=tarde';
const outFile=process.argv[3]||'output/home/perf.json';
const width=Number(process.env.W||1440),height=Number(process.env.H||900),dpr=Number(process.env.DPR||1);
const chrome=['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync);
const browser=await chromium.launch({headless:true,executablePath:chrome,args:[process.platform==='darwin'?'--use-angle=metal':'--use-angle=d3d11','--ignore-gpu-blocklist','--js-flags=--expose-gc','--enable-precise-memory-info']});
const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr});page.setDefaultTimeout(60000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(()=>{window.__lcp=0;new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
  window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
// QUALITY=low|high fixes the profile through the school's own settings (isolated profile).
if(process.env.QUALITY)await page.addInitScript(q=>{try{localStorage.setItem('roxana.escuela.v1',JSON.stringify({version:1,welcomed:true,settings:{muted:true,reducedMotion:false,quality:q}}));}catch{}},process.env.QUALITY);
const t0=Date.now();
await page.goto(url);
await page.waitForFunction(()=>window.__escuela&&document.body.classList.contains('ready'),null,{timeout:120000});
const ready=Date.now()-t0;
await page.waitForTimeout(3000);

const frames=ms=>page.evaluate(ms=>new Promise(r=>{const d=[];let last=performance.now();const t0=last;const f=t=>{d.push(t-last);last=t;if(t-t0<ms)requestAnimationFrame(f);else{d.sort((a,b)=>a-b);const q=p=>+d[Math.min(d.length-1,Math.floor(d.length*p))].toFixed(2);r({frames:d.length,fps:+(d.length/(ms/1000)).toFixed(1),p50:q(.5),p95:q(.95),p99:q(.99),max:+d.at(-1).toFixed(2),over33:d.filter(x=>x>33.4).length});}};requestAnimationFrame(f);}),ms);
const snapshot=()=>page.evaluate(()=>{globalThis.gc?.();const d=window.__escuela.diorama,dev=d.app.graphicsDevice,st=d.app.stats;let ents=0;const walk=e=>{ents++;e.children.forEach(walk);};walk(d.app.root);
  return {heapMB:performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(1):null,textures:dev.textures?.length??null,entities:ents,drawCalls:st?.drawCalls?.total??dev._drawCallsPerFrame??null,triangles:st?.frame?.triangles??null,canvas:[dev.width,dev.height],pixelRatio:dev.maxPixelRatio};});

const web=await page.evaluate(()=>{const p=performance.getEntriesByType('paint');return {fcp:Math.round(p.find(x=>x.name==='first-contentful-paint')?.startTime||0),lcp:Math.round(window.__lcp),cls:+window.__cls.toFixed(3)};});
const idle=await frames(8000);
const before=await snapshot();
await page.evaluate(()=>window.__escuela.openRoom('electronica'));await page.waitForTimeout(2000);
const room=await frames(5000);
await page.evaluate(()=>window.__escuela.closeRoom());await page.waitForTimeout(1500);
// Ten cycles through rooms, news and the artifacts' gestures.
for(let i=0;i<10;i++){
  for(const id of ['direccion','fisica','anfiteatro','trofeos']){await page.evaluate(id=>window.__escuela.openRoom(id),id);await page.waitForTimeout(500);await page.evaluate(()=>window.__escuela.closeRoom());await page.waitForTimeout(250);}
  await page.evaluate(()=>window.__escuela.openNews());await page.waitForTimeout(500);await page.evaluate(()=>window.__escuela.closeRoom());await page.waitForTimeout(250);
  await page.evaluate(w=>window.__escuela.diorama.reactArtifact(w,{onEnd:()=>{}}),['ohmdal','physica','bitland','arithmos'][i%4]);await page.waitForTimeout(400);await page.evaluate(()=>window.__escuela.diorama.endReaction());
}
await page.waitForTimeout(2500);
const after=await snapshot();
const idleAfter=await frames(5000);
const ua=await page.evaluate(()=>navigator.userAgent);
const result={date:new Date().toISOString(),url,quality:process.env.QUALITY||'por defecto',viewport:{width,height,dpr},ua,host:{cpu:cpus()[0]?.model,cores:cpus().length,memGB:Math.round(totalmem()/2**30)},
  web,readyMs:ready,idle,room,idleAfter,before,after,leak:{heapMB:+(after.heapMB-before.heapMB).toFixed(1),textures:after.textures-before.textures,entities:after.entities-before.entities},errors};
writeFileSync(outFile,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
await browser.close();
