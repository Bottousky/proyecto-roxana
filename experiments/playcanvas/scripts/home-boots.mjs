// Boots the 3D home N times in fresh isolated contexts (never touches saves) and, when one takes longer than LIMIT,
// says where it stopped: loading bar, pending requests, and whether timers, frames and messages still answer.
// Uso: N=30 LIMIT=30000 node scripts/home-boots.mjs   (HOME_URL, por defecto http://127.0.0.1:4196/; NOTHROTTLE=1
// desactiva el ahorro de Chrome en segundo plano; W, H, DPR, MOBILE como en home-shots.mjs)
import {chromium} from 'playwright';
import {existsSync} from 'node:fs';
const base=process.env.HOME_URL||'http://127.0.0.1:4196/',N=Number(process.env.N||30),limit=Number(process.env.LIMIT||45000);
// The campus page under HOME_URL: escuela.html in this package; HOME_PAGE='' on the published site (the root).
const PAGE=process.env.HOME_PAGE??'escuela.html';
const browser=await chromium.launch({headless:true,executablePath:['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync),args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist',...(process.env.NOTHROTTLE?['--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']:[])]});
const times=[];let stalls=0,navStalls=0;
for(let i=0;i<N;i++){
  const ctx=await browser.newContext({viewport:{width:Number(process.env.W||1440),height:Number(process.env.H||900)},deviceScaleFactor:Number(process.env.DPR||1),isMobile:process.env.MOBILE==='1',hasTouch:process.env.MOBILE==='1'});
  const page=await ctx.newPage();const pending=new Map(),log=[];
  page.on('request',r=>pending.set(r,Date.now()));page.on('requestfinished',r=>pending.delete(r));page.on('requestfailed',r=>{log.push('falló '+r.url());pending.delete(r);});
  page.on('console',m=>log.push(m.type()+': '+m.text().slice(0,200)));page.on('pageerror',e=>log.push('pageerror: '+e.message));
  const t0=Date.now();let navOk=true;await page.goto(`${base}${PAGE}?etapa=${i%11}&hora=${['manana','tarde','noche'][i%3]}`,{waitUntil:'commit',timeout:limit}).catch(()=>{navOk=false;});
  if(!navOk){navStalls++;console.log(`#${i} la navegación no recibió respuesta en ${limit} ms`);await ctx.close();continue;}
  try{await page.waitForFunction(()=>window.__escuela||document.body.classList.contains('light'),null,{timeout:limit});times.push(Date.now()-t0);}
  catch{stalls++;const st=await page.evaluate(()=>({bar:document.querySelector('#loading-bar')?.style.width,ready:document.body.classList.contains('ready'),light:document.body.classList.contains('light'),explore:document.querySelector('#cta-explore')?.textContent})).catch(e=>({err:e.message}));
    const probe=(fn)=>Promise.race([page.evaluate(fn).catch(e=>'error '+e.message),new Promise(r=>setTimeout(()=>r('SIN RESPUESTA en 3 s'),3000))]);
    st.vis=await page.evaluate(()=>document.visibilityState+' hidden='+document.hidden);
    st.timer=await probe(()=>new Promise(r=>setTimeout(()=>r('temporizador ok'),200)));
    st.raf=await probe(()=>new Promise(r=>requestAnimationFrame(()=>r('rAF ok'))));
    st.msg=await probe(()=>new Promise(r=>{const c=new MessageChannel();c.port1.onmessage=()=>r('mensaje ok');c.port2.postMessage(0);}));
    await page.waitForFunction(()=>window.__escuela,null,{timeout:30000}).then(()=>st.late='apareció dentro de 30 s más').catch(()=>st.late='sigue sin __escuela 30 s después');
    console.log(`#${i} COLGADO tras ${limit} ms`,JSON.stringify(st));console.log('  pendientes:',[...pending].map(([r,t])=>`${r.url().replace(base,'')} (${Date.now()-t} ms)`).slice(0,12).join(' | '));console.log('  consola:',log.filter(l=>!l.startsWith('warning')).slice(-8).join(' | '));}
  await ctx.close();
}
await browser.close();
times.sort((a,b)=>a-b);console.log(`${N} arranques · navegación sin respuesta ${navStalls} · colgados ${stalls} · mediana ${times[times.length>>1]} ms · máx ${times.at(-1)} ms`);
