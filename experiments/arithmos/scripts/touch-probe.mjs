// Sonda de toque preciso: en una escena, toca el centro dibujado de cada objeto y verifica
// que se seleccione ese y no otro. Uso: node scripts/touch-probe.mjs <escena> <AxB> [prefijo-id]
import {chromium} from 'playwright';
import {startServer} from './serve.mjs';

const [, , seg = 'c1.vuelven', size = '844x390', prefix = ''] = process.argv;
const [W, H] = size.split('x').map(Number);
const server = await startServer(4600 + Math.floor(Math.random() * 300));
const port = server.address().port;
const browser = await chromium.launch({channel: 'chrome'});
const ctx = await browser.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: W < 900});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.goto(`http://127.0.0.1:${port}/?seg=${seg}`);
await page.waitForFunction(() => window.__ready);
// avanzar textos hasta que haya objetos tocables
for (let i = 0; i < 400; i++) {
  const st = await page.evaluate(() => ({n: document.querySelectorAll('#spots .spot').length, w: !!window.__game.ui.waiting, rot: !document.getElementById('rotate').hidden}));
  if (st.rot) await page.click('#rotate [data-act=rotate-ok]');
  if (st.n > 3 && !st.w) break;
  if (st.w) await page.evaluate(() => { const u = window.__game.ui; u.typing && u.finishTyping(); u.advance(); });
  await page.waitForTimeout(120);
}
await page.waitForTimeout(800);
// los centros dibujados (no los del botón) según el estado del juego
const targets = await page.evaluate(pre => {
  const g = window.__game, cam = g.camera, view = g.view;
  return g.ui.spots.filter(s => s.kind !== 'word' && s.id.startsWith(pre)).map(s => {
    const r = s.rect();
    const [x, y] = cam.toScreen(view, r.x + r.w / 2, r.y + r.h / 2);
    return {id: s.id, x, y};
  });
}, prefix);
const results = [];
for (const t of targets) {
  // posición actual (los puntos se mueven)
  const now = await page.evaluate(id => {
    const g = window.__game, s = g.ui.spots.find(x => x.id === id);
    if (!s) return null;
    const r = s.rect();
    const [x, y] = g.camera.toScreen(g.view, r.x + r.w / 2, r.y + r.h / 2);
    return {x, y};
  }, t.id);
  if (!now) continue;
  await page.touchscreen.tap(now.x, now.y);
  await page.waitForTimeout(160);
  const sel = await page.evaluate(() => [...document.querySelectorAll('#spots .spot.selected')].map(b => b.dataset.id));
  results.push({id: t.id, selected: sel});
  // deseleccionar tocando lo mismo
  if (sel.length) {
    const again = await page.evaluate(id => {
      const g = window.__game, s = g.ui.spots.find(x => x.id === id);
      const r = s.rect();
      const [x, y] = g.camera.toScreen(g.view, r.x + r.w / 2, r.y + r.h / 2);
      return {x, y};
    }, sel[0]);
    await page.touchscreen.tap(again.x, again.y);
    await page.waitForTimeout(160);
  }
}
const wrong = results.filter(r => r.selected.length !== 1 || r.selected[0] !== r.id);
console.log(JSON.stringify({seg, size, probed: results.length, wrong, errors}, null, 1));
await browser.close();
server.close();
process.exit(wrong.length || errors.length ? 1 : 0);
