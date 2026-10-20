// La apariencia del viajero: elegirla al dar el nombre, verla en el dibujo, cambiarla en el camino
// desde Opciones y verla en la figura 3D; queda en el registro del Instituto junto al nombre.
// Uso: GAME_URL=… SIZE=1440x900 OUT=carpeta node scripts/qa-look.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromePath, gpuArgs } from './chrome.mjs';

const url = process.env.GAME_URL || 'http://127.0.0.1:4190/', out = process.env.OUT || 'output/qa-look';
const [width, height] = (process.env.SIZE || '1440x900').split('x').map(Number), phone = width < 900;
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width, height }, ...(phone ? { isMobile: true, hasTouch: true } : {}) });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
const tag = `${width}x${height}`, shot = name => page.screenshot({ path: `${out}/${tag}-${name}.png` });
const click = sel => page.locator(sel).first().click();
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.removeItem('roxana.escuela.v1'));
await page.reload({ waitUntil: 'networkidle' });
await click('#new-game');
await page.locator('#player-name').fill('Ensayo');
assert.equal(await page.locator('#name-form .look-swatch').count(), 24, 'el registro ofrece 24 colores');
await click('#name-form [data-look-key="pelo"][data-look-value="rubio"]');
await click('#name-form [data-look-key="piel"][data-look-value="4"]');
assert.equal(await page.locator('#name-form [data-part="pelo"]').first().getAttribute('fill'), '#d2a95a', 'el dibujo toma el pelo elegido');
await shot('1-registro');
await click('#name-form button[type="submit"]');
await page.waitForFunction(() => window.__ohmdal?.mode === 'dialogue', {}, { timeout: 60000 });
for (let i = 0; i < 60 && await page.evaluate(() => window.__ohmdal.mode === 'dialogue'); i++) { await click('#dialogue-next'); await page.waitForTimeout(120); }
await page.waitForFunction(() => !!window.__ohmdal.world.playerActor?.figure?.setAppearance, {}, { timeout: 30000 });
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('roxana.escuela.v1')));
assert.deepEqual([saved.name, saved.apariencia.pelo, saved.apariencia.piel], ['Ensayo', 'rubio', '4'], 'nombre y apariencia en el registro');
await page.waitForTimeout(800); await shot('2-en-el-camino');
await click('#pause-button'); await click('#look-option');
await click('.look-modal [data-look-key="ropa"][data-look-value="granate"]');
await click('.look-modal [data-look-key="bufanda"][data-look-value="celeste"]');
await page.waitForTimeout(1500); await shot('3-cambiando');
// The traveller must stand where the panel leaves the world in view.
const where = await page.evaluate(() => { const w = window.__ohmdal.world, [x, z] = w.getPlayerPosition(), feet = w.getScreenPosition({ x, z, ground: true }), panel = document.querySelector('.look-modal').getBoundingClientRect(); return { feet: [Math.round(feet.x), Math.round(feet.y)], panel: [Math.round(panel.left), Math.round(panel.top), Math.round(panel.right), Math.round(panel.bottom)], shift: w.portraitShift, aim: w.portraitAim }; });
const clear = where.feet[0] < where.panel[0] - 20 || where.feet[1] - 110 > where.panel[3];
console.log('viajero mientras elige', JSON.stringify(where));
assert.ok(clear, 'el viajero se ve al costado o debajo del panel');
assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('roxana.escuela.v1')).apariencia.ropa), 'granate', 'el cambio queda guardado');
await click('.look-done');
await page.waitForTimeout(300); await shot('4-listo');
assert.deepEqual(errors, [], 'sin errores');
console.log(`${tag}: apariencia elegida al dar el nombre, guardada y cambiada en vivo sin errores.`);
await browser.close();
