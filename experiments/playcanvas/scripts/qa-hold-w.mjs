// Con W sola se sigue el camino: desde el centro del Portal, manteniendo W, el viajero dobla con el
// camino y llega a la Plaza (guía de caminos para teclado, ciclo 20; ajustada en el ciclo 26 para
// no arrastrar a quien entra a un lugar). Parte de una bitácora terminada.
// Uso: GAME_URL=… IMPORT=bitácora.json node scripts/qa-hold-w.mjs
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { chromePath, gpuArgs, nameTraveller } from './chrome.mjs';

const url = process.env.GAME_URL || 'http://127.0.0.1:4190/';
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.locator('#title-settings').click();
await page.locator('#import-save').setInputFiles(process.env.IMPORT || 'output/playcanvas-playthrough/verified-save.json');
await page.locator('#transition').waitFor({ state: 'hidden', timeout: 120000 });
await nameTraveller(page);
const toWorld = async () => { for (let i = 0; i < 100 && await page.evaluate(() => window.__ohmdal.mode !== 'world'); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(140); } };
await toWorld();
await page.keyboard.press('m'); await page.locator('details.kmap-travel > summary').click(); await page.locator('[data-area="portal"]').click();
await page.waitForFunction(() => window.__ohmdal.state.area === 'portal' && window.__ohmdal.mode === 'world', {}, { timeout: 60000 });
await page.waitForTimeout(1200);
const start = await page.evaluate(() => window.__ohmdal.world.player.position.toArray());
// Hold W, in game time: up to 40 s of walking.
const t0 = await page.evaluate(() => window.__ohmdal.world.clock ?? 0);
await page.keyboard.down('w');
let area = 'portal';
for (let i = 0; i < 400 && area === 'portal'; i++) {
  await page.waitForTimeout(200);
  const s = await page.evaluate(() => ({ area: window.__ohmdal.state.area, mode: window.__ohmdal.mode, clock: window.__ohmdal.world.clock ?? 0 }));
  area = s.area; if (s.clock - t0 > 40) break;
}
await page.keyboard.up('w');
const end = await page.evaluate(() => window.__ohmdal.world.player.position.toArray());
console.log(`W sola desde el Portal ${start.map(v => v.toFixed(1))}: ${area === 'plaza' ? 'llegó a la Plaza' : `quedó en ${area} ${end.map(v => v.toFixed(1))}`}`);
assert.equal(area, 'plaza', 'holding W from the Portal reaches the Plaza');
assert.deepEqual(errors, []);
await browser.close();
