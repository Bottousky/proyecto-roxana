// Costo de preparar cada objeto con ?anim=2 en una escena (armar el plan de depósito y el mapa de bits): para encontrar
// trabas. Uso: node scripts/anim2-cost.mjs <escena> [segundos=6]
import {chromium} from 'playwright';
import {startServer} from './serve.mjs';
const [seg, secs = '6'] = process.argv.slice(2);
const server = await startServer(0);
const b = await chromium.launch({channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu']});
const p = await b.newPage({viewport: {width: 1600, height: 900}});
await p.goto(`http://127.0.0.1:${server.address().port}/?seg=${seg}&anim=2`);
await p.waitForFunction(() => window.__ready === true);
// tiempo de dibujo por objeto en cada cuadro (se envuelve render de cada objeto que aparece)
await p.evaluate(() => {
  const g = window.__game; window.__rt = {};
  const wrap = o => { if (o.__w || typeof o.render !== "function") return; o.__w = true; const r = o.render.bind(o); o.render = (...a) => { const t0 = performance.now(); r(...a); const dt = performance.now() - t0; const e = window.__rt[o.id] ??= {max: 0, sum: 0, n: 0, kind: o.constructor.name}; e.max = Math.max(e.max, dt); e.sum += dt; e.n++; }; };
  const tick = () => { for (const o of g.world.objects) wrap(o); requestAnimationFrame(tick); };
  tick();
});
const end = Date.now() + Number(secs) * 1000;
while (Date.now() < end) { await p.evaluate(() => { const g = window.__game; if (g?.ui.waiting && !g.ui.typing) g.ui.advance(); const o = [...document.querySelectorAll('#choices button:not([disabled])')]; if (o.length) o.at(-1).click(); }); await p.waitForTimeout(250); }
const rt = await p.evaluate(() => Object.entries(window.__rt).map(([id, e]) => ({id, kind: e.kind, maxMs: +e.max.toFixed(1), meanMs: +(e.sum / e.n).toFixed(2), frames: e.n})).sort((a, b) => b.maxMs - a.maxMs).slice(0, 10));
console.log('dibujo por objeto (ms):'); console.table(rt);
const r = await p.evaluate(() => {
  const g = window.__game, out = [];
  for (const o of g.world.objects) {
    if (typeof o.planDuration !== 'function') continue;
    o.dep = null; o.gplan = null; o.cache = null;
    const t0 = performance.now(); const T = o.planDuration(); const t1 = performance.now();
    const n = o.strokes ? o.strokes.length : (o.text || '').length;
    const dabs = o.dep ? o.dep.list.reduce((a, e) => a + e.st.dabs.length, 0) : 0;
    out.push({id: o.id, kind: o.constructor.name, n, dabs, T: T && +T.toFixed(2), planMs: +(t1 - t0).toFixed(1)});
  }
  return out.sort((a, b) => b.planMs - a.planMs).slice(0, 12);
});
console.table(r);
await b.close(); server.close();
