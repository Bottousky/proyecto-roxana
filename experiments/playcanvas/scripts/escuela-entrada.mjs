// Captura cuadro a cuadro la vista previa de la entrada de un taller.
// Uso: node scripts/escuela-entrada.mjs [matematica|fisica|programacion]
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
const room=process.argv[2]||'matematica',base=process.env.ESCUELA_URL||'http://127.0.0.1:4192/',out=fileURLToPath(new URL('../output/escuela-review/',import.meta.url));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>console.log('pageerror:',e.message));page.on('console',m=>{if(m.type()==='error')console.log('console:',m.text().slice(0,200));});
await page.goto(base+'escuela.html?etapa=3&hora=tarde#'+room);
await page.waitForSelector('#preview-entry',{timeout:120000});await page.waitForTimeout(3000);
await page.click('#preview-entry');const t0=Date.now();
for(const at of [1.4,2.9,3.9,4.7,5.6,6.6,7.2]){await page.waitForTimeout(Math.max(0,at*1000-(Date.now()-t0)));await page.screenshot({path:out+`entrada-${room}-${at}.png`});}
await page.waitForTimeout(2500);await page.screenshot({path:out+`entrada-${room}-fin.png`});console.log('ok');
await browser.close();
