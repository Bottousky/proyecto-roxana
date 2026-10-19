// QA of the classic home (escuela-clasica.html) in an isolated browser profile: never touches personal saves.
// Seeded saves are TEST fixtures (previewState) written into the throwaway profile; they look at states, they are
// not progress. Usage: node scripts/clasica-check.mjs [evidence folder]   HOME_URL (default http://127.0.0.1:4196/)
import {chromium} from 'playwright';
import {mkdirSync,existsSync,readFileSync} from 'node:fs';
import {previewState} from '../src/escuela/progress.js';

const base=process.env.HOME_URL||'http://127.0.0.1:4196/';
const out=process.argv[2]||new URL('../output/home/clasica/',import.meta.url).pathname;
mkdirSync(out,{recursive:true});
const chrome=['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync);
const browser=await chromium.launch({headless:true,executablePath:chrome});
let failed=0;const ok=(cond,what)=>{console.log(`${cond?'OK  ':'FAIL'} ${what}`);if(!cond)failed++;};
const SAVE='ohmdal.playcanvas.arc1.v1',SCHOOL='roxana.escuela.v1';
// Link targets as the page was built (src/escuela/links.js): the published site uses ./ohmdal.html and ./
const PLAY=process.env.VITE_PLAY_URL||'./index.html',CAMPUS=process.env.VITE_CAMPUS_URL||'./escuela.html';

async function open({width=1440,height=900,dpr=1,mobile=false,js=true,scheme='light',seed=null,profile=null,query='hora=tarde'}={}){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,isMobile:mobile,hasTouch:mobile,javaScriptEnabled:js,colorScheme:scheme});
  const page=await context.newPage();const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('pageerror',e=>errors.push(e.message));
  // Lab layout shift and largest paint (indications, not field data).
  await page.addInitScript(()=>{window.__cls=0;try{new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value;}).observe({type:'layout-shift',buffered:true});
    new PerformanceObserver(l=>{const e=l.getEntries().at(-1);if(e)window.__lcp={t:Math.round(e.startTime),el:e.element?.id||e.element?.tagName||''};}).observe({type:'largest-contentful-paint',buffered:true});}catch{}});
  if(seed!==null||profile)await page.addInitScript(([k,save,sk,prof])=>{try{if(!sessionStorage.getItem('seeded')){if(save)localStorage.setItem(k,save);if(prof)localStorage.setItem(sk,prof);sessionStorage.setItem('seeded','1');}}catch{}},[SAVE,seed===null?null:JSON.stringify(previewState(seed)),SCHOOL,profile?JSON.stringify(profile):null]);
  await page.goto(`${base}escuela-clasica.html?${query}`,{waitUntil:'networkidle'});
  return {context,page,errors};
}
// Full page, after a slow scroll so the lazy plates load as they would for a reader.
// Without scripting there is nothing to scroll with, and browsers load lazy images eagerly anyway.
async function shot(page,name,{js=true}={}){
  if(js)await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=innerHeight*.8){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}scrollTo(0,0);});
  // The sticky masthead would be stamped mid-page by the stitched capture (addStyleTag needs scripting).
  if(js)await page.addStyleTag({content:'.masthead{position:static!important}'});
  await page.waitForLoadState('networkidle');await page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:72,fullPage:true});
}

// 1 · First visit, desktop.
{
  const {context,page,errors}=await open();
  const r=await page.evaluate(([PLAY,CAMPUS])=>({
    overflow:document.scrollingElement.scrollWidth-innerWidth,h1:document.querySelectorAll('h1').length,
    hashLinks:[...document.querySelectorAll('a')].filter(a=>a.getAttribute('href')==='#'||!a.getAttribute('href')).length,
    imgsNoAlt:[...document.images].filter(i=>!i.hasAttribute('alt')).length,
    worlds:document.querySelectorAll('.world').length,legend:document.querySelectorAll('.legend a').length,
    cta:document.querySelector('.hero .cta').innerText.trim(),ctaHref:document.querySelector('.hero .cta').getAttribute('href'),
    to3d:[...document.querySelectorAll('a[href]')].filter(a=>{const h=a.getAttribute('href');return h===CAMPUS||h.startsWith(CAMPUS+'#');}).length,
    headings:[...document.querySelectorAll('h1,h2,h3')].map(h=>Number(h.tagName[1])),
    still:document.querySelector('#campus-still')?.getAttribute('src'),changes:document.querySelector('.changes')!==null,
    lit:document.querySelectorAll('.plan .lamp.lit').length,
    links:[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).filter(h=>h.startsWith('./')).map(h=>h.split('#')[0]))],
    anchors:[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href').slice(1)).filter(id=>!document.getElementById(id)),
    plates:[...document.images].map(i=>i.getAttribute('src')),
  }),[PLAY,CAMPUS]);
  ok(r.overflow<=0,`1440: sin desborde horizontal (${r.overflow})`);
  {const m=await page.evaluate(()=>({cls:window.__cls,lcp:window.__lcp}));ok(m.cls<.1,`1440: CLS de laboratorio ${m.cls.toFixed(3)} (< 0,1)`);console.log(`info LCP de laboratorio 1440: ${m.lcp?.t} ms (${m.lcp?.el})`);}
  ok(r.h1===1,'un solo h1');
  ok(r.hashLinks===0,'ningún enlace vacío ni href="#"');
  ok(r.imgsNoAlt===0,'todas las imágenes con alt');
  ok(r.worlds===4&&r.legend===9,`cuatro mundos y nueve lugares en el plano (${r.worlds}/${r.legend})`);
  ok(r.cta==='Entrar a Ohmdal'&&r.ctaHref===PLAY,'primera visita: «Entrar a Ohmdal» sin continuar');
  ok(r.to3d>=10,`enlaces al campus 3D (${r.to3d})`);
  ok(r.headings.every((h,i)=>i===0||h<=r.headings[i-1]+1),'jerarquía de títulos sin saltos');
  ok(r.still==='./escuela/campus-tarde.jpg','lámina del campus: tarde, etapa 0');
  ok(!r.changes,'sin «Cambió por tu aventura» en la primera visita');
  ok(r.lit===0,'plano: faroles apagados en etapa 0');
  ok(r.anchors.length===0,`anclas internas existentes (${r.anchors.join(',')})`);
  for(const href of [...r.links,...r.plates.filter(Boolean)]){const res=await page.request.get(new URL(href,page.url()).href);ok(res.ok(),`responde ${href} (${res.status()})`);}
  // Keyboard: the skip link comes first and lands on the content.
  await page.keyboard.press('Tab');const first=await page.evaluate(()=>document.activeElement.className);ok(first==='skip','Tab: primero «Saltar al contenido»');
  await page.keyboard.press('Enter');await page.waitForTimeout(200);ok(await page.evaluate(()=>location.hash==='#contenido'),'el salto lleva al contenido');
  const stored=await page.evaluate(([k,s])=>({save:localStorage.getItem(k),school:localStorage.getItem(s)}),[SAVE,SCHOOL]);
  ok(stored.save===null,'no crea ninguna partida de Ohmdal');
  ok(errors.length===0,`sin errores de consola (${errors.join(' | ')})`);
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${out}/1440-primer-cuadro.jpg`,type:'jpeg',quality:72});
  await shot(page,'1440-primera-visita');await context.close();
}
// 2 · Without JavaScript: the served HTML alone.
{
  const {context,page}=await open({js:false});
  const r=await page.evaluate(()=>({worlds:document.querySelectorAll('.world').length,legend:document.querySelectorAll('.legend li').length,news:document.querySelector('#news').innerText.trim().length,still:document.querySelector('noscript')!==null,ledger:document.querySelectorAll('.ledger li').length,text:document.body.innerText.length}));
  ok(r.worlds===4&&r.legend===9&&r.ledger===10,`sin JS: mundos, plano y registro escritos en el HTML (${r.worlds}/${r.legend}/${r.ledger})`);
  ok(r.news>20,'sin JS: novedades (o su estado vacío) en el HTML');
  await shot(page,'1440-sin-js',{js:false});await context.close();
}
// 3 · Returning student (test fixture, stage 6) on a phone: Continuar first, changes presented once.
{
  const {context,page,errors}=await open({width:390,height:844,dpr:2,mobile:true,seed:6});
  const r=await page.evaluate(()=>({overflow:document.scrollingElement.scrollWidth-innerWidth,cta:document.querySelector('.hero .cta').innerText.trim(),href:document.querySelector('.hero .cta').getAttribute('href'),
    changes:document.querySelectorAll('.changes li').length,still:document.querySelector('#campus-still').getAttribute('src'),stats:document.querySelectorAll('.stats div').length,lit:document.querySelectorAll('.plan .lamp.lit').length,
    small:[...document.querySelectorAll('a,button,summary')].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.height>0&&b.height<40&&!e.closest('.plan')&&getComputedStyle(e).display!=='inline';}).map(e=>e.textContent.trim().slice(0,30))}));
  ok(r.overflow<=0,`390: sin desborde horizontal (${r.overflow})`);
  {const m=await page.evaluate(()=>({cls:window.__cls,lcp:window.__lcp}));ok(m.cls<.1,`390 con partida: CLS de laboratorio ${m.cls.toFixed(3)} (< 0,1)`);console.log(`info LCP de laboratorio 390: ${m.lcp?.t} ms (${m.lcp?.el})`);}
  ok(r.cta==='Continuar en Ohmdal'&&r.href===PLAY+'#continuar','con partida: «Continuar en Ohmdal» lleva a continuar');
  ok(r.changes===6,`«Cambió por tu aventura» con las seis restauraciones (${r.changes})`);
  ok(r.still==='./escuela/campus-tarde-e5.jpg','lámina del campus del tramo 2–6');
  ok(r.stats===6,'registro con sus seis cifras');
  ok(r.lit===16,`plano: faroles encendidos desde la etapa 5 (${r.lit})`);
  ok(r.small.length===0,`objetivos táctiles de al menos 40 px (${r.small.join(' · ')})`);
  ok(errors.length===0,`sin errores de consola (${errors.join(' | ')})`);
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${out}/390-con-partida-primer-cuadro.jpg`,type:'jpeg',quality:72});
  await shot(page,'390-con-partida');
  await page.reload({waitUntil:'networkidle'});
  ok(await page.evaluate(()=>!document.querySelector('.changes')),'al recargar, los cambios no se vuelven a celebrar');
  const save=await page.evaluate(k=>localStorage.getItem(k),SAVE);
  ok(save===JSON.stringify(previewState(6))||JSON.parse(save).flags.irrigation===true,'la partida de prueba queda intacta');
  await context.close();
}
// 4 · Preview of a stage (?etapa) never offers to continue and never writes the record.
{
  const {context,page}=await open({query:'etapa=10&hora=noche',scheme:'dark'});
  const r=await page.evaluate(k=>({cta:document.querySelector('.hero .cta').innerText.trim(),note:!document.querySelector('#preview-note').hidden,school:localStorage.getItem(k),still:document.querySelector('#campus-still').getAttribute('src'),bg:getComputedStyle(document.body).backgroundColor,lens:document.querySelector('#mundo-ohmdal img').getAttribute('src')}),SCHOOL);
  ok(r.cta==='Entrar a Ohmdal'&&r.note,'vista previa: rotulada y sin «Continuar»');
  ok(r.school===null,'vista previa: no escribe el registro del Instituto');
  ok(r.still==='./escuela/campus-noche-e10.jpg'&&r.lens.endsWith('mundo-ohmdal-luz.jpg'),'etapa 10 de noche: lámina restaurada y Faro encendido');
  ok(r.bg==='rgb(18, 26, 24)','modo oscuro por preferencia del sistema');
  await shot(page,'1440-etapa10-noche-oscuro');await context.close();
}
// 5 · Tablet width.
{
  const {context,page}=await open({width:820,height:1180,dpr:2});
  ok(await page.evaluate(()=>document.scrollingElement.scrollWidth<=innerWidth),'820: sin desborde horizontal');
  await shot(page,'820-primera-visita');await context.close();
}
// 6 · The page arrives unwritten (the build could not render it): the browser writes every part. Needs the dev
// server, which serves /src/ to the raw file (BUILT=1 skips it against a production build).
if(!process.env.BUILT){
  const context=await browser.newContext({viewport:{width:1440,height:900}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const raw=readFileSync(new URL('../escuela-clasica.html',import.meta.url),'utf8');
  await page.route(/escuela-clasica\.html/,route=>route.fulfill({contentType:'text/html',body:raw}));
  await page.goto(`${base}escuela-clasica.html?hora=tarde`,{waitUntil:'networkidle'});
  const r=await page.evaluate(()=>({worlds:document.querySelectorAll('.world').length,legend:document.querySelectorAll('.legend li').length,ledger:document.querySelectorAll('.ledger li').length,marks:document.body.innerHTML.includes('<!--clasica:')}));
  ok(r.worlds===4&&r.legend===9&&r.ledger===10&&errors.length===0,`servida sin escribir: el navegador completa mundos, plano y registro (${r.worlds}/${r.legend}/${r.ledger}) ${errors.join(' | ')}`);
  await context.close();
}
await browser.close();
console.log(failed?`\n${failed} comprobaciones fallaron`:'\nTodas las comprobaciones pasaron');
process.exit(failed?1:0);
