// Recorrido de la home sólo con teclado, en un perfil aislado: orden de Tab, foco visible, abrir una sala con
// Enter, foco dentro del panel, Escape devuelve el foco a quien abrió, atajos numéricos, gesto con «Mirar…» y
// Atrás/Adelante del navegador. Imprime cada paso y termina con código ≠ 0 si algo falla.
// Uso: node scripts/home-keys.mjs [carpeta]   (HOME_URL, por defecto http://127.0.0.1:4196/)
import {chromium} from 'playwright';
import {mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const base=process.env.HOME_URL||'http://127.0.0.1:4196/';
// The campus page under HOME_URL: escuela.html in this package; HOME_PAGE='' on the published site (the root).
const PAGE=process.env.HOME_PAGE??'escuela.html';
const out=process.argv[2]||fileURLToPath(new URL('../output/home/keys/',import.meta.url));mkdirSync(out,{recursive:true});
const chrome=['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync);
const browser=await chromium.launch({headless:true,executablePath:chrome,args:[process.platform==='darwin'?'--use-angle=metal':'--use-angle=d3d11','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:900}});page.setDefaultTimeout(30000);
const results=[];const ok=(name,pass,info='')=>{results.push(pass);console.log(pass?'OK  ':'FALLA',name,info);};
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const active=()=>page.evaluate(()=>{const a=document.activeElement;if(!a||a===document.body)return 'body';const r=a.getBoundingClientRect(),cs=getComputedStyle(a);
  return {id:a.id||null,tag:a.tagName.toLowerCase(),text:(a.getAttribute('aria-label')||a.innerText||'').trim().slice(0,40),room:a.dataset?.room||null,visible:r.width>0&&r.height>0&&cs.visibility!=='hidden'&&Number(cs.opacity)>0.05,outline:cs.outlineStyle!=='none'||cs.boxShadow!=='none'};});

await page.goto(base+PAGE+'?hora=tarde');await page.waitForFunction(()=>window.__escuela,null,{timeout:120000});await page.waitForTimeout(1500);
// 1 · Tab order from the top: the way in comes first.
const order=[];for(let i=0;i<8;i++){await page.keyboard.press('Tab');order.push(await active());}
console.log('orden de Tab:',order.map(a=>a.id||a.room||a.text).join(' → '));
ok('la primera parada es la acción principal',order[0].id==='cta-play',order[0].text);
ok('ninguna parada invisible',order.every(a=>a.visible),order.filter(a=>!a.visible).map(a=>a.id||a.text).join(', '));
ok('todas las paradas muestran foco',order.every(a=>a.outline),order.filter(a=>!a.outline).map(a=>a.id||a.text).join(', '));
await page.screenshot({path:`${out}/foco-tab.png`});
// 2 · Open a room from the directory with Enter: focus goes into the panel; Escape returns it.
await page.focus('.directory button[data-room="trofeos"]');await page.keyboard.press('Enter');await page.waitForTimeout(1200);
const inPanel=await page.evaluate(()=>document.activeElement?.closest('#panel')!==null&&document.querySelector('#panel').getAttribute('aria-hidden')==='false');
ok('Enter abre la sala y el foco entra al panel',inPanel);
await page.keyboard.press('Escape');await page.waitForTimeout(900);
const back=await active();ok('Escape cierra y devuelve el foco al botón que la abrió',back.room==='trofeos',JSON.stringify(back));
// 3 · Numeric shortcut and the artifact gesture from the keyboard.
await page.keyboard.press('3');await page.waitForTimeout(1200);
ok('el atajo 3 abre el Taller de Física',await page.evaluate(()=>document.querySelector('#panel').dataset.room==='fisica'));
await page.focus('#look-artifact');await page.keyboard.press('Enter');await page.waitForTimeout(300);
ok('«Mirar…» con Enter inicia el gesto',await page.evaluate(()=>window.__escuela.diorama.reaction?.world==='physica'));
await page.keyboard.press('Escape');await page.waitForTimeout(600);
ok('Escape en un gesto iniciado desde el panel vuelve al panel',await page.evaluate(()=>!window.__escuela.diorama.reaction&&document.querySelector('#panel').dataset.room==='fisica'));
await page.keyboard.press('Escape');await page.waitForTimeout(700);
// 4 · Browser history: a room is a step back, and forward restores it.
await page.evaluate(()=>window.__escuela.openRoom('direccion'));await page.waitForTimeout(900);
await page.evaluate(()=>window.__escuela.openNews());await page.waitForTimeout(900);
await page.goBack();await page.waitForTimeout(1000);
const afterBack=await page.evaluate(()=>({url:location.href,room:document.querySelector('#panel').dataset.room||null}));
ok('Atrás cierra el panel sin salir de la home',new URL(afterBack.url).pathname.endsWith('/'+PAGE)&&!afterBack.room,JSON.stringify(afterBack));
await page.goForward();await page.waitForTimeout(1000);
ok('Adelante reabre la última sala',await page.evaluate(()=>document.querySelector('#panel').dataset.room==='novedades'));
// Closing from the interface steps back: Back afterwards must not reopen what was just closed.
await page.evaluate(()=>window.__escuela.closeRoom());await page.waitForTimeout(900);
const len=await page.evaluate(()=>history.length);
await page.evaluate(()=>window.__escuela.openRoom('trofeos'));await page.waitForTimeout(600);await page.evaluate(()=>window.__escuela.closeRoom());await page.waitForTimeout(900);
await page.evaluate(()=>window.__escuela.openRoom('fisica'));await page.waitForTimeout(600);await page.evaluate(()=>window.__escuela.closeRoom());await page.waitForTimeout(900);
ok('abrir y cerrar no hace crecer el historial',await page.evaluate(l=>history.length<=l+1,len),String(await page.evaluate(()=>history.length)));
await page.goBack();await page.waitForTimeout(1000);
{const st=await page.evaluate(()=>({url:location.href,room:document.querySelector('#panel')?.dataset.room??null}));ok('Atrás tras cerrar no reabre la sala cerrada (sale al paso anterior)',st.room!=='fisica',JSON.stringify(st));}
// Hidden controls are not tab stops: closed panel and folded intro.
await page.goto(base+PAGE+'?hora=tarde');await page.waitForFunction(()=>window.__escuela,null,{timeout:120000});await page.waitForTimeout(1200);
await page.click('#cta-explore');await page.waitForTimeout(900);
const stops=[];for(let i=0;i<14;i++){await page.keyboard.press('Tab');stops.push(await page.evaluate(()=>{const a=document.activeElement;return a?.closest('#intro')?'intro':a?.closest('#panel')?'panel':a?.id||a?.dataset?.room||a?.tagName;}));}
ok('explorando, ni la portada ni el panel cerrado reciben foco',!stops.includes('intro')&&!stops.includes('panel'),stops.join(' → '));
// Escape cancels an entry preview (a world still in preparation) and leaves its workshop open.
await page.evaluate(()=>window.__escuela.openRoom('matematica'));await page.waitForTimeout(1200);
await page.click('#preview-entry');await page.waitForTimeout(900);
const during=await page.evaluate(()=>document.body.classList.contains('previewing'));
await page.keyboard.press('Escape');await page.waitForTimeout(900);
const afterPrev=await page.evaluate(()=>({previewing:document.body.classList.contains('previewing'),room:document.querySelector('#panel').dataset.room||null,seq:!!window.__escuela.diorama.boardSeq}));
ok('Escape cancela la vista previa de entrada y deja el taller abierto',during&&!afterPrev.previewing&&!afterPrev.seq&&afterPrev.room==='matematica',JSON.stringify(afterPrev));
ok('sin errores de página',errors.length===0,errors.join(' | '));
await browser.close();
const failed=results.filter(x=>!x).length;console.log(`\n${results.length-failed}/${results.length} comprobaciones de teclado e historial`);process.exit(failed?1:0);
