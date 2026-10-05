// Partida en un teléfono emulado (390×844, táctil) sólo con toques reales del protocolo de
// Chrome: abrir el juego, leer, caminar tocando el suelo y con la cruceta, tocar personas e
// instalaciones, resolver el primer banco, cruzar a la Plaza, entrar al taller, medir con Ohm,
// resolver su banco y abrir mapa, Bitácora y pausa. La inspección sólo observa posiciones.
// Es emulación: no prueba hardware táctil real. Uso: GAME_URL=… node scripts/qa-touch.mjs
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { chromePath, gpuArgs } from './chrome.mjs';

const out = resolve(process.env.OUT || 'output/qa-touch');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
const errors = [], log = [];
page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const note = (step, data = {}) => { log.push({ step, ...data }); console.log(step, JSON.stringify(data)); };
let shot = 0; const capture = name => page.screenshot({ path: resolve(out, `${String(++shot).padStart(2, '0')}-${name}.png`) });
const game = () => page.evaluate(() => { const g = window.__ohmdal; return { mode: g?.mode, area: g?.state.area, p: g?.world?.getPlayerPosition(), near: g?.nearby?.id, flags: { ...g?.state.flags }, puzzle: g?.workbench?.active ? { solved: g.workbench.result.solved } : null }; });
const touch = async (x, y, ms = 60) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await page.waitForTimeout(ms); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
// Scroll without waiting for stillness: interaction prompts follow their object every frame.
const tapEl = async selector => { await page.locator(selector).first().evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'nearest' })); const box = await page.locator(selector).first().boundingBox(); assert.ok(box, `${selector} está en pantalla`); await touch(box.x + box.width / 2, box.y + box.height / 2); };
const read = async () => { for (let i = 0; i < 200; i++) { const g = await game(); if (g.mode !== 'dialogue') return g; await tapEl('#dialogue-next'); await page.waitForTimeout(110); } };
// Where a player taps: the thing itself when it is on screen; otherwise the ground a few metres
// toward it, as anyone would walk toward something they cannot see yet.
const aim = id => page.evaluate(id => {
  const w = window.__ohmdal.world, o = w.getInteractions().find(i => i.id === id), r = w.canvas.getBoundingClientRect(), [px, pz] = w.getPlayerPosition();
  const inside = p => p.visible && p.x > 30 && p.x < r.width - 30 && p.y > 190 && p.y < r.height - 230;
  const own = w.getScreenPosition(o); if (inside(own)) return { x: own.x + r.left, y: own.y + r.top, direct: true };
  const dx = o.x - px, dz = o.z - pz, d = Math.hypot(dx, dz), k = Math.min(1, 3.5 / d), spot = w.getScreenPosition({ x: px + dx * k, z: pz + dz * k, ground: true });
  return { x: Math.max(30, Math.min(r.width - 30, spot.x)) + r.left, y: Math.max(190, Math.min(r.height - 230, spot.y)) + r.top, direct: false };
}, id);
async function reach(id, { until = g => g.near === id || g.mode !== 'world', tries = 30 } = {}) {
  for (let i = 0; i < tries; i++) {
    const g = await game(); if (until(g)) return g;
    if (g.mode === 'dialogue') { await read(); continue; }
    const s = await aim(id); await touch(s.x, s.y);
    // Like a player, wait while the traveller is still walking where they were sent.
    await page.waitForTimeout(300);
    for (let k = 0; k < 40 && await page.evaluate(() => { const w = window.__ohmdal.world; return !!(w.target || w.route?.length); }); k++) await page.waitForTimeout(150);
  }
  throw new Error(`No se llegó a ${id}: ${JSON.stringify(await game())}`);
}

await page.goto(process.env.GAME_URL || 'http://127.0.0.1:4190/', { waitUntil: 'networkidle' });
await capture('titulo');
await tapEl('#new-game');
await page.waitForFunction(() => window.__ohmdal?.mode === 'dialogue', {}, { timeout: 60000 });
await capture('llegada');
await read(); note('llegada-leida');

// Cruceta: mantener «arriba» medio segundo mueve al viajero.
const before = (await game()).p;
const up = await page.locator('[data-dir="up"]').boundingBox();
await touch(up.x + up.width / 2, up.y + up.height / 2, 600);
const after = (await game()).p;
assert.ok(Math.hypot(after[0] - before[0], after[1] - before[1]) > .4, 'la cruceta mueve al viajero');
note('cruceta', { before, after });

// Tocar el pedestal: el viajero se acerca solo y lo usa.
await reach('ohm_pedestal', { until: g => g.mode !== 'world' });
let g = await read();
for (let i = 0; i < 20 && g.mode !== 'puzzle'; i++) { await page.waitForTimeout(200); g = await read(); }
assert.equal(g.mode, 'puzzle', 'tocar el pedestal abre su banco');
await capture('banco-ohm');
await tapEl('button[data-port="heartOut"]'); await tapEl('button[data-port="negative"]');
await page.waitForTimeout(400);
assert.equal((await game()).puzzle?.solved, true, 'dos toques en los bornes despiertan a Ohm');
await tapEl('.wb-success [data-action="commission"]');
note('ohm-despierto');
for (let i = 0; i < 80; i++) { g = await game(); if (g.mode === 'cinematic') { await page.waitForTimeout(300); continue; } if (g.mode === 'dialogue') { await read(); continue; } if (g.mode === 'world') break; await page.waitForTimeout(200); }
assert.equal((await game()).flags.awaken, true);
await capture('ohm-en-el-mundo');

// Botón de interactuar: acercarse a Edda tocando el suelo junto a ella y usar el botón.
await reach('edda_portal', { until: g => g.near === 'edda_portal' });
assert.equal(await page.locator('#touch-interact').isDisabled(), false, 'el botón se habilita cerca de alguien');
await tapEl('#touch-interact'); await page.waitForTimeout(300);
assert.equal((await game()).mode, 'dialogue', 'el botón de interactuar abre la conversación'); await read();
note('boton-interactuar');

// Mapa, Bitácora y pausa desde el HUD, cerrados con su botón.
for (const button of ['#map-button', '#journal-button', '#pause-button']) {
  await tapEl(button); await page.waitForTimeout(400);
  assert.equal((await game()).mode, 'modal', `${button} abre su página`);
  await capture(button.slice(1)); await tapEl('.modal-close'); await page.waitForTimeout(300);
  assert.equal((await game()).mode, 'world', `${button} se cierra con su botón`);
}
note('hud');

// Hacia la Plaza tocando el camino; el cruce es continuo.
await reach('portal_to_plaza', { until: g => g.area === 'plaza', tries: 45 });
await read(); note('plaza', { p: (await game()).p });
await capture('plaza');
await reach('plaza_to_workshop', { until: g => g.area === 'workshop', tries: 45 });
for (let i = 0; i < 30 && (await game()).mode !== 'world'; i++) { await page.waitForTimeout(200); await read(); }
note('taller');
await reach('lumen', { until: g => g.flags.workshop_feed === true, tries: 40 }); await read();
note('lumen', { feed: (await game()).flags.workshop_feed });
// Tocar el cierre derecho lleva al viajero hasta él y lo usa; después, medir con Ohm (botón táctil).
await reach('workshop_return', { until: g => g.flags.workshop_return === true });
assert.equal((await game()).near, 'workshop_return', 'tocar el cierre lleva al viajero hasta él');
await tapEl('#field-measure'); await page.waitForTimeout(300);
assert.equal(await page.locator('#field-meter').isVisible(), true, 'el botón de medir abre el instrumento de Ohm');
await capture('medir');
// Lumen answers the latch a second later; while anyone speaks the instrument steps aside and
// comes back after. Read first, then put the instrument away and check it stays away.
await page.waitForTimeout(1300); await read();
assert.equal(await page.locator('#field-meter').isVisible(), true, 'el instrumento vuelve después de la conversación');
await tapEl('#close-field-meter'); await page.waitForTimeout(600);
assert.equal(await page.locator('#field-meter').isVisible(), false, 'el instrumento de Ohm se guarda con su botón');
await page.evaluate(() => { window.__meter = []; const m = document.querySelector('#field-meter'); new MutationObserver(() => { if (!m.classList.contains('hidden')) window.__meter.push({ t: Math.round(performance.now()), mode: window.__ohmdal.mode, near: window.__ohmdal.nearby?.id, lastTouch: window.__lastTouch }); }).observe(m, { attributes: true, attributeFilter: ['class'] }); document.querySelector('#field-measure').addEventListener('click', e => window.__meter.push({ measureClick: Math.round(performance.now()), at: [Math.round(e.clientX), Math.round(e.clientY)], mode: window.__ohmdal.mode }), true); addEventListener('keydown', e => window.__meter.push({ key: e.key, t: Math.round(performance.now()) }), true); addEventListener('pointerdown', e => { window.__lastTouch = [Math.round(e.clientX), Math.round(e.clientY), e.target.id || e.target.className, window.__ohmdal.mode]; }, true); });
note('cierre-y-medicion', { flag: (await game()).flags.workshop_return });
note('antes-del-banco', await page.evaluate(() => { const g = window.__ohmdal, w = g.world, o = w.getInteractions().find(i => i.id === 'workbench'), r = w.canvas.getBoundingClientRect(), p = w.getScreenPosition(o), hit = document.elementFromPoint(p.x + r.left, p.y + r.top); return { hit: hit?.id || hit?.className || hit?.tagName, hitText: hit?.textContent?.slice(0, 40), prompt: (() => { const b = document.querySelector('#interaction')?.getBoundingClientRect(); return b && [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; })(), p: w.getPlayerPosition(), screen: [Math.round(p.x), Math.round(p.y), p.visible], picked: w.pickInteraction(p.x + r.left, p.y + r.top)?.id, flags: { feed: g.state.flags.workshop_feed, ret: g.state.flags.workshop_return, ready: g.state.flags.bench_ready } }; }));
await reach('workbench', { until: g => g.mode === 'puzzle' });
g = await read(); for (let i = 0; i < 20 && g.mode !== 'puzzle'; i++) { await page.waitForTimeout(200); g = await read(); }
if (g.mode !== 'puzzle') { await capture('banco-no-abre'); note('banco-no-abre', { g, bubble: await page.locator('#ohm-bubble p').textContent(), lines: await page.evaluate(() => document.querySelector('#dialogue-announcement').textContent) }); }
assert.equal(g.mode, 'puzzle', 'tocar la mesa abre el banco del taller');
await capture('banco-taller');
// Con el tablero que se desplaza: continuidad tramo por tramo, con la mesa apagada.
if (await page.locator('[data-action="power"].on').count()) await tapEl('[data-action="power"]');
const tools = page.locator('[data-drawer="tools"] summary'); if (await tools.count() && await tools.isVisible()) await tapEl('[data-drawer="tools"] summary');
await tapEl('[data-action="mode"][data-mode="continuity"]');
for (const [a, b] of [['s1a', 's1b'], ['s2a', 's2b']]) { for (const p of [a, b]) { const t = page.locator(`.wb-board button[data-port="${p}"]`); await t.scrollIntoViewIfNeeded(); const box = await t.boundingBox(); await touch(box.x + box.width / 2, box.y + box.height / 2); await page.waitForTimeout(150); } }
await tapEl('[data-action="mode"][data-mode="wire"]');
for (const p of ['s2a', 's2b']) { const t = page.locator(`.wb-board button[data-port="${p}"]`); await t.scrollIntoViewIfNeeded(); const box = await t.boundingBox(); await touch(box.x + box.width / 2, box.y + box.height / 2); await page.waitForTimeout(150); }
await tapEl('[data-action="power"]'); await page.waitForTimeout(400);
assert.equal((await game()).puzzle?.solved, true, 'el banco del taller se resuelve tocando');
await tapEl('.wb-success [data-action="commission"]');
for (let i = 0; i < 80; i++) { g = await game(); if (g.mode === 'cinematic') { await page.waitForTimeout(300); continue; } if (g.mode === 'dialogue') { await read(); continue; } if (g.mode === 'world') break; await page.waitForTimeout(200); }
assert.equal((await game()).flags.workshop, true, 'el taller quedó en servicio');
await capture('taller-encendido');
const reopened = await page.evaluate(() => window.__meter.filter(e => e.mode)); assert.deepEqual(reopened, [], 'el instrumento guardado no reaparece solo');
note('taller-en-servicio');

assert.deepEqual(errors, [], 'sin errores de página ni de consola');
await writeFile(resolve(out, 'report.json'), JSON.stringify({ viewport: '390x844 táctil emulado', log, errors }, null, 2));
console.log('Táctil: título, lectura, cruceta, toque en el suelo y en objetos, dos bancos, medición, mapa, Bitácora y pausa sin errores.');
await browser.close();
