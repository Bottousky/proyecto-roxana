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
await p.waitForTimeout(7300);
await p.screenshot({path: `${out}/0-espera-a.png`});
await p.waitForTimeout(400);
const d0 = await p.evaluate(() => window.__lab.duration ?? null);
const st = await p.evaluate(() => ({t: window.__lab.now()}));
await p.screenshot({path: `${out}/1-esperando.png`});
// tocar los puntos en pantalla: se convierten coordenadas de mundo a pantalla con la vista actual
const DOTS = [[1500, 520], [1585, 470], [1640, 560], [1560, 615], [1710, 490], [1690, 615], [1770, 555]];
const order = [3, 0, 0, 5, 1, 6, 2, 4];
for (const [k, i] of order.entries()) {
  const [x, y] = DOTS[i];
  // de mundo a pantalla con la cámara actual (el plano puede haber cambiado)
  const [sx, sy] = await p.evaluate(([x, y]) => window.__lab.toScreen(x, y), [x, y]);
  await p.mouse.click(sx, sy);
  if (k === 2) { await p.waitForTimeout(820); await p.screenshot({path: `${out}/2-ya-contado.png`}); await p.waitForTimeout(600); }
  else await p.waitForTimeout(1100);
}
// el final: esperar a que la escena termine (duración ya finita tras contar los siete)
// (R11: antes cortaba a los 20 s, con la escena todavía a la mitad)
const ended = await p.waitForFunction(() => { const D = window.__lab.dur(); return Number.isFinite(D) && window.__lab.now() >= D - 0.15; }, null, {timeout: 45000}).then(() => true, () => false);
await p.screenshot({path: `${out}/3-final.png`});
const res = await p.evaluate(() => ({t: window.__lab.now(), dur: window.__lab.dur()}));
console.log(JSON.stringify({errors, ended, waitingAt: st, after: res}));
await b.close(); server.close();
