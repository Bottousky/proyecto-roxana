// Captura una URL del juego con Chrome del sistema. Uso: node scripts/shot.mjs <ruta> <salida.png> [ancho] [alto]
import {chromium} from 'playwright';
import {startServer} from './serve.mjs';
const [, , path = 'lab/', out = 'shot.png', w = '1600', h = '900'] = process.argv;
const server = await startServer(4196);
const browser = await chromium.launch({channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu']});
const page = await browser.newPage({viewport: {width: +w, height: +h}, deviceScaleFactor: Number(process.env.DPR || 1)});
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));
await page.goto(`http://127.0.0.1:4196/${path}`);
await page.waitForFunction(() => window.__ready === true, null, {timeout: 15000}).catch(() => errors.push('timeout __ready'));
await page.waitForTimeout(300);
await page.screenshot({path: out});
console.log(errors.length ? 'ERRORES:\n' + errors.join('\n') : 'sin errores');
await browser.close();
server.close();
