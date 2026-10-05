// El despertar de Ohm en movimiento: partida nueva, despertar por el banco y capturas de la
// escena cada 300 ms. Uso: GAME_URL=… OUT=carpeta node scripts/qa-awaken-scene.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromePath, gpuArgs } from './chrome.mjs';

const out = resolve(process.env.OUT || 'output/awaken-scene');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.goto(process.env.GAME_URL || 'http://127.0.0.1:4190/', { waitUntil: 'networkidle' });
await page.locator('#new-game').click();
const mode = () => page.evaluate(() => window.__ohmdal?.mode);
await page.waitForFunction(() => window.__ohmdal?.mode === 'dialogue', {}, { timeout: 60000 });
while (await mode() === 'dialogue') { await page.keyboard.press('Enter'); await page.waitForTimeout(90); }
for (let i = 0; i < 60; i++) {
  const s = await page.evaluate(() => { const g = window.__ohmdal, o = g.world.getInteractions().find(o => o.id === 'ohm_pedestal'), p = g.world.getPlayerPosition(); return { o: [o.x, o.z], p, near: g.nearby?.id }; });
  if (s.near === 'ohm_pedestal') break;
  const dx = s.o[0] - s.p[0], dz = s.o[1] - s.p[1], key = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'd' : 'a') : (dz > 0 ? 's' : 'w');
  await page.keyboard.down(key); await page.waitForTimeout(140); await page.keyboard.up(key);
}
await page.waitForTimeout(600);
await page.keyboard.press('e');
for (let i = 0; i < 80 && await mode() !== 'puzzle'; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(90); }
await page.locator('button[data-port="heartOut"]').click(); await page.locator('button[data-port="negative"]').click();
await page.locator('.wb-success [data-action="commission"]').first().click();
await page.waitForFunction(() => window.__ohmdal?.mode === 'cinematic', {}, { timeout: 6000 });
let n = 0;
for (const started = Date.now(); Date.now() - started < 6000; n++) { await page.screenshot({ path: resolve(out, `awaken-${String(n).padStart(2, '0')}.png`) }); await page.waitForTimeout(300); }
console.log(out, n, 'capturas', errors.length ? errors : 'sin errores');
await browser.close();
