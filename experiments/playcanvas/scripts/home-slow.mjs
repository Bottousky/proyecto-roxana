// Slow arrivals of the 3D home, deterministic, in an isolated profile: (1) a campus texture that takes 20 s, (2) the
// main script never arrives. The intro must offer the classic version after 12 s and take the offer back once the
// campus is up. Uso: node scripts/home-slow.mjs [carpeta]   (HOME_URL, por defecto http://127.0.0.1:4196/;
// NOTHROTTLE=1 desactiva el ahorro de Chrome en segundo plano; POLL=ms consulta por temporizador en vez de cuadros)
import {chromium} from 'playwright';
import {mkdirSync,existsSync} from 'node:fs';
const out=process.argv[2]||new URL('../output/home/lento/',import.meta.url).pathname,base=process.env.HOME_URL||'http://127.0.0.1:4196/';mkdirSync(out,{recursive:true});
// The campus page under HOME_URL: escuela.html in this package; HOME_PAGE='' on the published site (the root).
const PAGE=process.env.HOME_PAGE??'escuela.html';let failed=0;const ok=(c,w)=>{console.log(`${c?'OK  ':'FAIL'} ${w}`);if(!c)failed++;};
const b=await chromium.launch({headless:true,executablePath:['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync),args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist',...(process.env.NOTHROTTLE?['--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']:[])]});
const state=page=>page.evaluate(()=>({slow:!document.querySelector('#intro-slow').hidden,ready:document.body.classList.contains('ready'),href:document.querySelector('#intro-slow a')?.getAttribute('href')}));
{ const page=await b.newPage({viewport:{width:1440,height:900}});
  await page.route(/meadow\.webp/,async r=>{await new Promise(x=>setTimeout(x,20000));await r.continue();});
  await page.goto(base+PAGE+'?etapa=0&hora=tarde',{waitUntil:'commit'});
  await page.waitForTimeout(8000);ok(!(await state(page)).slow,'a los 8 s todavía no se ofrece nada');
  await page.waitForTimeout(6000);const s=await state(page);ok(s.slow&&!s.ready&&s.href==='./escuela-clasica.html','a los 14 s, con el campus cargando, se ofrece la versión clásica');
  await page.screenshot({path:`${out}/arranque-lento-1440.png`});
  await page.waitForFunction(()=>document.body.classList.contains('ready'),null,{timeout:90000,polling:Number(process.env.POLL)||'raf'});await page.waitForTimeout(400);
  ok(!(await state(page)).slow,'cuando el campus está listo, el aviso se retira');await page.close(); }
{ const page=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await page.route(/src\/escuela\/main\.js/,r=>r.abort());
  await page.goto(base+PAGE+'?etapa=0&hora=tarde');await page.waitForTimeout(13000);
  const s=await state(page);ok(s.slow,'sin el script principal, a los 13 s se ofrece la versión clásica (390)');
  await page.screenshot({path:`${out}/sin-script-390.png`});await page.close(); }
await b.close();console.log(failed?`${failed} fallaron`:'Todas pasaron');process.exit(failed?1:0);
