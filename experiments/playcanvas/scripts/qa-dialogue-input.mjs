// Quien lee apurado no reabre la conversación que acaba de cerrar, y hablar otra vez después de
// una pausa sigue funcionando. Partida nueva, guardado aislado, sólo teclado.
// Uso: GAME_URL=http://127.0.0.1:4190/ node scripts/qa-dialogue-input.mjs
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { chromePath } from './chrome.mjs';

const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.goto(process.env.GAME_URL || 'http://127.0.0.1:4190/', { waitUntil: 'networkidle' });
await page.locator('#new-game').click();
const mode = () => page.evaluate(() => window.__ohmdal?.mode);
await page.waitForFunction(() => window.__ohmdal?.mode === 'dialogue', {}, { timeout: 60000 });
while (await mode() === 'dialogue') { await page.keyboard.press('Enter'); await page.waitForTimeout(90); }

// Caminar hasta Edda con las flechas de dirección.
for (let i = 0; i < 60; i++) {
  const s = await page.evaluate(() => { const g = window.__ohmdal, e = g.world.getInteractions().find(o => o.id === 'edda_portal'), p = g.world.getPlayerPosition(); return { e: [e.x, e.z], p, near: g.nearby?.id }; });
  if (s.near === 'edda_portal') break;
  const dx = s.e[0] - s.p[0], dz = s.e[1] - s.p[1], key = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'd' : 'a') : (dz > 0 ? 's' : 'w');
  await page.keyboard.down(key); await page.waitForTimeout(140); await page.keyboard.up(key);
}
assert.equal(await page.evaluate(() => window.__ohmdal.nearby?.id), 'edda_portal', 'no se llegó junto a Edda');

// Primera charla y luego Enter cada 40 ms durante dos segundos, sin pausa.
await page.keyboard.press('e');
const openings = [];
let previous = await mode();
for (let i = 0; i < 50; i++) {
  await page.keyboard.press('Enter'); await page.waitForTimeout(20);
  const now = await mode();
  if (now === 'dialogue' && previous === 'world') openings.push(i);
  previous = now;
}
await page.waitForTimeout(200);
assert.equal(await mode(), 'world', 'la conversación quedó abierta al terminar de apurar');
assert.deepEqual(openings, [], `Enter reabrió la conversación ${openings.length} veces`);

// Después de una pausa, hablar otra vez es una decisión y funciona.
await page.waitForTimeout(700);
await page.keyboard.press('e'); await page.waitForTimeout(200);
assert.equal(await mode(), 'dialogue', 'después de una pausa no se pudo volver a hablar');
// Otro objeto al alcance responde enseguida: cerrar la charla con Edda y, en menos de 450 ms,
// usar el pedestal. Para que sea determinista, el jugador se coloca junto al pedestal con el
// acceso de depuración: es una comprobación puntual, no un recorrido de aceptación.
await page.waitForTimeout(200);
while (await mode() === 'dialogue') { await page.keyboard.press('Enter'); await page.waitForTimeout(40); }
const closedAt = Date.now();
await page.evaluate(() => window.__ohmdal.world.setPlayerPosition([3.5, -1.9]));
await page.waitForFunction(() => window.__ohmdal.nearby?.id === 'ohm_pedestal', {}, { timeout: 2000 });
await page.keyboard.press('e'); await page.waitForTimeout(100);
assert.ok(Date.now() - closedAt < 450, `la prueba llegó tarde (${Date.now() - closedAt} ms)`);
assert.notEqual(await mode(), 'world', 'E sobre otro objeto, justo después de una charla, debe responder');
assert.deepEqual(errors, []);
console.log('Conversaciones: sin reaperturas al apurar, con respuesta tras una pausa y sin bloquear otro objeto.');
await browser.close();
