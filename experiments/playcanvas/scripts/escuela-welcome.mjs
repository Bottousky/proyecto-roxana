// Primera visita sin partida: tarjeta de bienvenida, Taller y cruce del Portal hasta Ohmdal.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const base=process.env.ESCUELA_URL||'http://127.0.0.1:4192/',out=fileURLToPath(new URL('../output/escuela-review/',import.meta.url));
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>console.log('pageerror:',e.message));page.on('console',m=>{if(m.type()==='error')console.log('console:',m.text().slice(0,200));});
await page.goto(base+'escuela.html?hora=manana');
await page.waitForSelector('#news:not(.hidden)',{timeout:120000});await page.waitForTimeout(1500);
await page.screenshot({path:out+'welcome.png'});console.log('bienvenida');
await page.click('#welcome-taller');await page.waitForTimeout(3500);await page.screenshot({path:out+'welcome-taller.png'});console.log('taller');
await page.click('#enter-portal');await page.waitForTimeout(700);await page.screenshot({path:out+'portal-flash.png'});
await page.waitForURL(/index\.html/,{timeout:15000});console.log('juego',page.url());
await page.waitForSelector('.to-instituto',{timeout:60000});await page.waitForTimeout(2500);
await page.screenshot({path:out+'game-title.png'});console.log('título del juego con vuelta al Instituto');
await browser.close();
