// Los minijuegos del Manantial jugados con clics (ciclo 29): con el agua cortada, Tala y Marín
// esperan en el Manantial; la caja de la bomba espera la respuesta de Tala; Edda tiene su baliza en
// la Calzada. Abre una partida guardada en ese momento (no es el recorrido completo).
// Uso: GAME_URL=… SIZE=1440x900 OUT=carpeta node scripts/qa-minijuegos.mjs
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromePath, gpuArgs, nameTraveller } from './chrome.mjs';
import { freshState } from '../src/game/state.js';

const url = process.env.GAME_URL || 'http://127.0.0.1:4190/', out = process.env.OUT || 'output/qa-minijuegos';
const [width, height] = (process.env.SIZE || '1440x900').split('x').map(Number), phone = width < 900;
await mkdir(out, { recursive: true });
const save = { ...freshState(), area: 'spring', playerName: 'Ensayo', known: ['edda', 'ohm', 'lumen', 'vega', 'marin', 'tala'],
  flags: { awaken: true, workshop: true, bridge_ready: true, gate: true, spring_sluice: true, spring_coupling: true, spring_drive: true },
  seen: ['spring_arrival', 'vega_spring'], visited: ['portal', 'plaza', 'workshop', 'road', 'spring'] };
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width, height }, ...(phone ? { isMobile: true, hasTouch: true } : {}) });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
await page.addInitScript(text => { if (!sessionStorage.getItem('mini')) { localStorage.setItem('ohmdal.playcanvas.arc1.v1', text); sessionStorage.setItem('mini', '1'); } }, JSON.stringify(save));
const tag = `${width}x${height}`, shot = name => page.screenshot({ path: `${out}/${tag}-${name}.png` });
const game = () => page.evaluate(() => ({ mode: window.__ohmdal.mode, area: window.__ohmdal.state.area, flags: window.__ohmdal.state.flags, near: window.__ohmdal.world?.getNearby?.()?.id ?? null }));
const lines = [];
// Read a conversation to its end, keeping what was said.
const read = async () => { for (let i = 0; i < 80 && (await game()).mode === 'dialogue'; i++) { lines.push(await page.locator('#dialogue-text').innerText().catch(() => '')); await page.locator('#dialogue-next').click(); await page.waitForTimeout(140); } };
// Stand beside something and use it, as the interaction key does.
const use = async id => {
  await page.evaluate(id => { const w = window.__ohmdal.world, o = w.getInteractions().find(i => i.id === id); const a = w.actorFor?.(o) ?? null; const x = o.x, z = o.z; w.player.position.set(x, 0, z + .9); }, id);
  await page.waitForTimeout(250);
  for (let i = 0; i < 10 && (await game()).near !== id; i++) await page.waitForTimeout(150);
  assert.equal((await game()).near, id, `junto a ${id}`);
  await page.keyboard.press('e'); await page.waitForTimeout(300);
};
const tool = async mode => { await page.locator(`.wb-tools button[data-mode="${mode}"]`).click(); await page.waitForTimeout(120); };
const touch = async port => { const t = page.locator(`.wb-board [data-port="${port}"]`).first(); await t.scrollIntoViewIfNeeded(); await t.click(); await page.waitForTimeout(160); };
const finish = async name => {
  await page.waitForFunction(() => { const c = document.querySelector('.wb-success'); return !!c && getComputedStyle(c).visibility === 'visible' && +getComputedStyle(c).opacity > .95; }, {}, { timeout: 8000 });
  await shot(`${name}-resuelto`);
  await page.locator('.wb-success [data-action="commission"]').click();
  await page.waitForTimeout(700); await read();
};

await page.goto(url, { waitUntil: 'networkidle' });
await page.locator('#continue').click(); await nameTraveller(page);
await page.waitForFunction(() => window.__ohmdal?.mode && !['title', 'transition'].includes(window.__ohmdal.mode), {}, { timeout: 120000 });
await read();
const present = await page.evaluate(() => window.__ohmdal.world.getInteractions().map(o => o.id));
assert.ok(present.includes('tala_spring') && present.includes('marin_spring'), `Tala y Marín en el Manantial (${present.join(', ')})`);
await page.waitForTimeout(1200); await shot('1-manantial');

// The pump's box waits for Tala.
await use('pump_panel'); assert.equal((await game()).mode, 'dialogue', 'la caja de la bomba responde con un diálogo');
await read(); assert.match(lines.at(-1), /Tala tiene una pregunta/, 'Vega manda a ver a Tala');

// Tala's lantern: two readings.
await use('tala_spring'); await read();
assert.equal((await game()).mode, 'puzzle', 'hablar con Tala abre su farol');
await shot('2-farol-de-tala');
await tool('voltage'); await touch('lampIn'); await touch('lampOut'); await touch('cordA'); await touch('cordB');
await finish('3-farol');
assert.equal((await game()).flags.tala_lantern, true);
assert.match(lines.join(' '), /casi nada/, 'Tala dice lo que vio');

// Now the pump's box opens; leave it as it is.
await use('pump_panel'); await read();
assert.equal((await game()).mode, 'puzzle', 'con la respuesta de Tala, la caja de la bomba se abre');
await page.keyboard.press('Escape'); await page.waitForTimeout(400);

// Marín's cart: the sum.
await use('marin_spring'); await read();
assert.equal((await game()).mode, 'puzzle', 'hablar con Marín abre su carro');
await shot('4-carro-de-marin');
await tool('voltage'); await touch('frontIn'); await touch('frontOut'); await touch('rearIn'); await touch('rearOut');
await finish('5-carro');
assert.equal((await game()).flags.marin_cart, true);

// After their minijuegos, Tala and Marín just talk.
await use('tala_spring'); assert.equal((await game()).mode, 'dialogue'); await read();

// Edda's beacon, on the Calzada.
await page.evaluate(() => { window.__ohmdal.world.player.position.set(0, 0, 11); });
await page.keyboard.press('m'); await page.locator('details.kmap-travel > summary').click(); await page.locator('[data-area="road"]').click();
await page.waitForFunction(() => window.__ohmdal.state.area === 'road' && window.__ohmdal.mode !== 'transition', {}, { timeout: 60000 }); await read();
await use('edda_post'); await read();
assert.equal((await game()).mode, 'puzzle', 'la baliza del costado abre su mesa');
await shot('6-baliza-de-edda');
await tool('voltage'); await touch('postA'); await touch('postB');
await tool('wire'); await touch('postA'); await touch('postB');
await finish('7-baliza');
assert.equal((await game()).flags.edda_contact, true);

assert.deepEqual(errors, [], 'sin errores');
await writeFile(`${out}/${tag}-dialogos.txt`, lines.filter(Boolean).join('\n'));
console.log(`${tag}: Tala abre la bomba; el carro de Marín y la baliza de Edda se resuelven; sin errores.`);
await browser.close();
