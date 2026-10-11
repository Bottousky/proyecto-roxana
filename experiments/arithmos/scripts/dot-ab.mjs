// A/B de Punto en escenas reales del juego: con y sin ?anim=2, registra su posición DIBUJADA (con salto y aterrizaje)
// cuadro a cuadro y mide cada movimiento. Uso: node scripts/dot-ab.mjs <salida.json> <escena> [segundos=40] [--q=anim=2] [--id=punto]
// Por viaje: duración, rapidez pico del centro en anchos de plano por segundo (lo que el ojo percibe al panear) y
// cuánto cambia esa rapidez entre cuadros relativo al pico (arranques y frenadas secos ≈ 1). El tiempo es el del juego
// (camera.time, dt acumulado): con performance.now los cuadros irregulares del navegador daban picos falsos.
import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
import {startServer} from './serve.mjs';

const args = process.argv.slice(2);
const [out, seg, secs = '40'] = args.filter(a => !a.startsWith('--'));
const extra = (args.find(a => a.startsWith('--q=')) || '').slice(4);
const id = (args.find(a => a.startsWith('--id=')) || '--id=punto').slice(5);
const server = await startServer(0); // puerto libre que elige el sistema
const port = server.address().port;
const browser = await chromium.launch({channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu']});
const page = await browser.newPage({viewport: {width: 1600, height: 900}});
const errors = [];
page.on('pageerror', e => errors.push(String(e.stack || e)));
await page.goto(`http://127.0.0.1:${port}/?seg=${seg}${extra ? '&' + extra : ''}`);
await page.waitForFunction(() => window.__ready === true, null, {timeout: 20000});
await page.evaluate(id => {
  window.__camLog = [];
  const g = window.__game;
  // [tiempo del juego, x dibujada, y dibujada, aplastamiento, ¿existe?]
  const tick = () => { const o = g.world.get(id); if (o) { const so = o.settleNow; const sl = o.deform?.sl ?? (so ? so[2] : 1); window.__camLog.push([g.camera.time, o.x + (so ? so[0] : 0), o.y - (o.lift || 0) + (so ? so[1] : 0), sl, 1]); } requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}, id);
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
// movimientos: tramos con velocidad > 8 px/s (se unen huecos ≤ 3 cuadros)
const sp = log.slice(1).map((p, k) => Math.hypot(p[1] - log[k][1], p[2] - log[k][2]) / Math.max(1e-3, p[0] - log[k][0]));
const runs = []; let cur = null, gap = 0;
sp.forEach((v, k) => { if (v > 8) { if (!cur) cur = {i0: k}; cur.i1 = k + 1; gap = 0; } else if (cur && ++gap > 3) { runs.push(cur); cur = null; } });
if (cur) runs.push(cur);
const res = runs.filter(r => r.i1 - r.i0 > 4).map(({i0, i1}) => {
  const s = log.slice(i0, i1 + 1);
  const vx = s.slice(1).map((p, k) => (p[1] - s[k][1]) / Math.max(1e-3, p[0] - s[k][0]));
  const v = s.slice(1).map((p, k) => Math.hypot(p[1] - s[k][1], p[2] - s[k][2]) / Math.max(1e-3, p[0] - s[k][0]));
  const pk = Math.max(...v, 1e-9), pkx = Math.max(...vx.map(Math.abs), 1e-9);
  const sl = s.map(p => p[3]);
  return {t0: +(s[0][0] - log[0][0]).toFixed(2), dur: +(s.at(-1)[0] - s[0][0]).toFixed(2), peak: Math.round(pk),
    maxStepVxRel: +Math.max(0, ...vx.slice(1).map((x, k) => Math.abs(x - vx[k]) / pkx)).toFixed(2), slMin: +Math.min(...sl).toFixed(2), slMax: +Math.max(...sl).toFixed(2)};
});
await writeFile(out, JSON.stringify({seg, extra, id, errors, frames: log.length, moves: res, log}));
console.log(JSON.stringify({seg, extra, errors: errors.length, moves: res}));
