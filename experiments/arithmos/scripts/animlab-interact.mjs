// Prueba de interacción real de la microescena (TEST 10): espera, toques (uno repetido), final. Uso: node scripts/animlab-interact.mjs <carpeta>
import {chromium} from 'playwright';
import {startServer} from './serve.mjs';
const out = process.argv[2];
const port = 4788; const server = await startServer(port);
const b = await chromium.launch({channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu']});
const p = await b.newPage({viewport: {width: 1600, height: 900}});
const errors = []; p.on('pageerror', e => errors.push(String(e)));
await p.goto(`http://127.0.0.1:${port}/animlab/?test=10&play=1&interactive=1&capture=1`);
await p.waitForFunction(() => window.__ready === true);
await p.waitForTimeout(7500);
const d0 = await p.evaluate(() => window.__lab.duration ?? null);
const st = await p.evaluate(() => ({t: window.__lab.now()}));
await p.screenshot({path: `${out}/1-esperando.png`});
// tocar los puntos en pantalla: se convierten coordenadas de mundo a pantalla con la vista actual
const DOTS = [[1500, 520], [1585, 470], [1640, 560], [1560, 615], [1710, 490], [1690, 615], [1770, 555]];
const order = [3, 0, 0, 5, 1, 6, 2, 4];
for (const [k, i] of order.entries()) {
  const [x, y] = DOTS[i];
  // la cámara está fija en el plano medio: cx 1440, w 1250 → escala 1600/1250
  const s = 1600 / 1250, vx = 1440 - 625, vy = 600 - 1250 * 9 / 32;
  await p.mouse.click((x - vx) * s, (y - vy) * s);
  await p.waitForTimeout(k === 2 ? 1400 : 1100);
  if (k === 2) await p.screenshot({path: `${out}/2-ya-contado.png`});
}
await p.waitForTimeout(6000);
await p.screenshot({path: `${out}/3-final.png`});
const res = await p.evaluate(() => ({t: window.__lab.now()}));
console.log(JSON.stringify({errors, waitingAt: st, after: res}));
await b.close(); server.close();
