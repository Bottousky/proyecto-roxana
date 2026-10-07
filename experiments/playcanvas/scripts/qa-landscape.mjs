// Capturas con el teléfono apaisado (la forma recomendada de jugar en el teléfono): título,
// diálogo, mundo, mapa (donde está el jugador y el reino entero), Bitácora y cinco bancos. Táctil emulado; sólo
// mira, no juega. Uso: GAME_URL=… SIZE=844x390 OUT=carpeta node scripts/qa-landscape.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { chromePath, gpuArgs } from './chrome.mjs';

const [w, h] = (process.env.SIZE || '844x390').split('x').map(Number), out = process.env.OUT || 'output/qa-landscape';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message));
const shot = name => page.screenshot({ path: `${out}/${w}x${h}-${name}.png` });
await page.goto(process.env.GAME_URL || 'http://127.0.0.1:4190/', { waitUntil: 'networkidle' });
await shot('01-titulo');
await page.locator('#new-game').tap();
await page.waitForFunction(() => window.__ohmdal?.mode === 'dialogue', {}, { timeout: 180000 });
await page.waitForTimeout(2500); await shot('02-dialogo');
for (let i = 0; i < 80 && await page.evaluate(() => window.__ohmdal.mode === 'dialogue'); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(150); }
await page.waitForTimeout(1200); await shot('03-mundo');
await page.keyboard.press('m');
await page.waitForFunction(() => document.querySelector('.kmap-base')?.complete && document.querySelector('.kmap-base').naturalWidth > 0, {}, { timeout: 30000 });
await page.waitForTimeout(800); await shot('04-mapa');
// The kingdom whole: zoom out with the map's own buttons, as a finger would.
for (let i = 0; i < 3; i++) { await page.locator('[data-kmap-zoom="-1"]').tap(); await page.waitForTimeout(300); }
await page.waitForTimeout(500); await shot('05-mapa-reino'); await page.keyboard.press('Escape');
await page.waitForTimeout(400); await page.keyboard.press('j'); await page.waitForTimeout(800); await shot('06-bitacora'); await page.keyboard.press('Escape');
for (const id of ['awaken', 'gate', 'irrigation', 'distribution', 'beacon_lens']) {
  await page.evaluate(id => { document.querySelector('#workbench').classList.remove('hidden'); window.__ohmdal.workbench.open(id, undefined); }, id);
  await page.waitForTimeout(500); await shot(`07-banco-${id}`);
  await page.evaluate(() => { window.__ohmdal.workbench.close(false); document.querySelector('#workbench').classList.add('hidden'); });
}
console.log(`capturas apaisadas ${w}×${h} en ${out} · errores de página ${errors.length}`);
await browser.close();
if (errors.length) process.exit(1);
