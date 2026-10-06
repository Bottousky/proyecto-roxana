// El mapa del reino en pantalla: lo abre con M desde una partida nueva o desde una bitácora
// avanzada (IMPORT=archivo.json), y comprueba y captura la vista inicial, el reino entero y un
// acercamiento, en escritorio y en el teléfono. Uso: GAME_URL=… SIZES=1440x900,844x390 OUT=carpeta node scripts/qa-map.mjs
import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromePath, gpuArgs } from './chrome.mjs';

const url = process.env.GAME_URL || 'http://127.0.0.1:4190/', out = process.env.OUT || 'output/qa-map';
await mkdir(out, { recursive: true });
const sizes = (process.env.SIZES || '1440x900,844x390,390x844').split(',');
const save = process.env.IMPORT ? await readFile(process.env.IMPORT, 'utf8') : null;
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
for (const size of sizes) {
  const [width, height] = size.split('x').map(Number), phone = width < 900 || height < 600;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, ...(phone ? { isMobile: true, hasTouch: true } : {}) });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  if (save) await context.addInitScript(text => { localStorage.setItem('ohmdal.playcanvas.arc1.v1', text); }, save);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator(save ? '#continue' : '#new-game').click();
  await page.waitForFunction(() => ['dialogue', 'world'].includes(window.__ohmdal?.mode), {}, { timeout: 180000 });
  for (let i = 0; i < 100 && await page.evaluate(() => window.__ohmdal.mode !== 'world'); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(140); }
  await page.keyboard.press('m');
  await page.waitForSelector('.kmap-base');
  await page.waitForFunction(() => document.querySelector('.kmap-base')?.complete && document.querySelector('.kmap-base').naturalWidth > 0, {}, { timeout: 30000 });
  await page.waitForTimeout(500);
  const check = await page.evaluate(() => {
    const vp = document.querySelector('.kmap-viewport').getBoundingClientRect(), player = document.querySelector('.kmap-player').getBoundingClientRect();
    return { marks: document.querySelectorAll('.kmap-mark:not([hidden])').length, playerInView: player.left >= vp.left && player.right <= vp.right && player.top >= vp.top && player.bottom <= vp.bottom, objective: !!document.querySelector('.kmap-objective'), travel: document.querySelectorAll('[data-area]').length, zoom: document.querySelector('.kmap').dataset.zoom };
  });
  console.log(size, JSON.stringify(check));
  assert.ok(check.playerInView, `${size}: the map opens on the traveller`);
  assert.ok(check.objective, `${size}: the next step is marked`);
  await page.screenshot({ path: `${out}/${size}-1-inicio.png` });
  await page.locator('.kmap-viewport').focus();
  for (let i = 0; i < 6; i++) { await page.keyboard.press('-'); await page.waitForTimeout(60); }
  await page.waitForTimeout(300); await page.screenshot({ path: `${out}/${size}-2-reino.png` });
  await page.keyboard.press('c');
  for (let i = 0; i < 9; i++) { await page.keyboard.press('+'); await page.waitForTimeout(60); }
  await page.waitForTimeout(300); await page.screenshot({ path: `${out}/${size}-3-cerca.png` });
  assert.deepEqual(errors, [], `${size}: no page errors`);
  await page.keyboard.press('Escape');
  await context.close();
}
console.log('mapa: OK');
await browser.close();
