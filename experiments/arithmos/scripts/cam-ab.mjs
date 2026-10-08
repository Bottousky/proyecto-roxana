// A/B de la cámara en escenas reales del juego: con y sin ?anim=2, registra la cámara cuadro a cuadro y mide cada viaje.
// Uso: node scripts/cam-ab.mjs <salida.json> <escena> [segundos=40] [--q=anim=2]
// Por viaje: duración, rapidez pico del centro en anchos de plano por segundo (lo que el ojo percibe al panear) y
// cuánto cambia esa rapidez entre cuadros relativo al pico (arranques y frenadas secos ≈ 1). El tiempo es el del juego
// (camera.time, dt acumulado): con performance.now los cuadros irregulares del navegador daban picos falsos.
import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
import {startServer} from './serve.mjs';

const args = process.argv.slice(2);
const [out, seg, secs = '40'] = args.filter(a => !a.startsWith('--'));
const extra = (args.find(a => a.startsWith('--q=')) || '').slice(4);
const server = await startServer(0); // puerto libre que elige el sistema
const port = server.address().port;
const browser = await chromium.launch({channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu']});
const page = await browser.newPage({viewport: {width: 1600, height: 900}});
const errors = [];
page.on('pageerror', e => errors.push(String(e.stack || e)));
await page.goto(`http://127.0.0.1:${port}/?seg=${seg}${extra ? '&' + extra : ''}`);
await page.waitForFunction(() => window.__ready === true, null, {timeout: 20000});
await page.evaluate(() => {
  window.__camLog = [];
  const g = window.__game;
  const tick = () => { const c = g.camera.current; window.__camLog.push([g.camera.time, c.x + c.w / 2, c.y + c.h / 2, c.w, g.camera.moving ? 1 : 0]); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
const end = Date.now() + Number(secs) * 1000;
while (Date.now() < end) {
  // avanza el texto como alguien que lee rápido; elige la última opción si hay que elegir
  await page.evaluate(() => {
    const g = window.__game;
    if (g?.ui.waiting && !g.ui.typing) g.ui.advance();
    const opts = [...document.querySelectorAll('#choices button:not([disabled])')];
    if (opts.length) opts.at(-1).click();
  }).catch(() => {});
  await page.waitForTimeout(250);
}
const log = await page.evaluate(() => window.__camLog);
await browser.close(); server.close();
// viajes: tramos con camera.moving
const moves = [];
let cur = null;
for (let i = 1; i < log.length; i++) {
  const [t, x, y, w, m] = log[i];
  if (m && !cur) cur = {i0: i - 1};
  if (!m && cur) { cur.i1 = i; moves.push(cur); cur = null; }
}
const res = moves.map(({i0, i1}) => {
  const s = log.slice(i0, i1 + 1);
  const v = s.slice(1).map((p, k) => { const dt = p[0] - s[k][0] || 1 / 60; return Math.hypot(p[1] - s[k][1], p[2] - s[k][2]) / dt / ((p[3] + s[k][3]) / 2); });
  const pk = Math.max(...v, 1e-9);
  return {t0: +(s[0][0] - log[0][0]).toFixed(2), dur: +(s.at(-1)[0] - s[0][0]).toFixed(2), peakScreensPerSec: +pk.toFixed(2),
    maxStepRel: +Math.max(0, ...v.slice(1).map((x, k) => Math.abs(x - v[k]) / pk)).toFixed(2), w0: Math.round(s[0][3]), w1: Math.round(s.at(-1)[3])};
});
await writeFile(out, JSON.stringify({seg, extra, errors, frames: log.length, moves: res, log}));
console.log(JSON.stringify({seg, extra, errors: errors.length, moves: res}));
