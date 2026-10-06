import {chromium} from 'playwright';
import {startServer} from './serve.mjs';
// Regresión de teclado y pausa (revisión funcional): Enter tras cerrar la pausa avanza; Tab no sale de la pausa.
const server = await startServer(4777);
const b = await chromium.launch({channel: 'chrome'});
const p = await b.newPage({viewport: {width: 1280, height: 800}});
await p.goto('http://127.0.0.1:4777/?seg=c1.puerta');
await p.waitForFunction(() => window.__ready);
const st = () => p.evaluate(() => ({paused: window.__game.paused, waiting: !!window.__game.ui.waiting, line: document.querySelector('#caption .line').textContent, spots: [...document.querySelectorAll('#spots .spot')].map(x => x.dataset.id), active: document.activeElement?.id || document.activeElement?.tagName}));
// llegar a la puerta y cruzarla con teclado
await p.waitForFunction(() => document.querySelectorAll('#spots .spot').length > 0, null, {timeout: 20000});
await p.keyboard.press('Tab'); await p.keyboard.press('Enter');
await p.waitForFunction(() => !!window.__game.ui.waiting && !window.__game.ui.typing, null, {timeout: 30000});
const before = (await st()).line;
await p.keyboard.press('Escape'); await p.waitForTimeout(150);
const r1 = await st();
await p.keyboard.press('Escape'); await p.waitForTimeout(150);
await p.keyboard.press('Enter'); await p.waitForTimeout(400);
const r2 = await st();
const ok1 = r1.paused && !r2.paused && (r2.line !== before || !r2.waiting);
console.log(JSON.stringify({before, pausedAfterEsc: r1.paused, afterEnter: {paused: r2.paused, waiting: r2.waiting, line: r2.line, active: r2.active}, enterAdvancesAfterPause: ok1}));
// foco atrapado: abrir pausa y tabular 25 veces
await p.keyboard.press('Escape'); await p.waitForTimeout(150);
let escaped = 0;
for (let i = 0; i < 25; i++) {
  await p.keyboard.press(i % 2 ? 'Shift+Tab' : 'Tab');
  const inside = await p.evaluate(() => !!document.activeElement?.closest('#pause'));
  if (!inside) escaped++;
}
console.log(JSON.stringify({focusEscapedPause: escaped}));
await b.close(); server.close();
process.exit(ok1 && escaped === 0 ? 0 : 1);
