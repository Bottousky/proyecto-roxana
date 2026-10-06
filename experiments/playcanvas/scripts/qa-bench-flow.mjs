// Recorre bancos con el mouse real, como un jugador nuevo: lee el objetivo y lo que dice Ohm,
// usa el instrumento que pide el paso, tiende un cable arrastrando, y comprueba que el tablero
// marque cada paso cumplido y que un solo botón siga la historia. Abre cada banco con el acceso
// de depuración (no recorre el mundo). Uso: GAME_URL=… SIZE=1440x900 SHOTS=carpeta node scripts/qa-bench-flow.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromePath, gpuArgs } from './chrome.mjs';

const url = process.env.GAME_URL || 'http://127.0.0.1:4190/';
const [width, height] = (process.env.SIZE || '1440x900').split('x').map(Number);
const shots = process.env.SHOTS; if (shots) await mkdir(shots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width, height } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.locator('#new-game').click();
await page.waitForFunction(() => window.__ohmdal?.mode === 'dialogue', {}, { timeout: 60000 });
const shot = async name => { if (shots) await page.screenshot({ path: `${shots}/${width}x${height}-${name}.png` }); };
const open = id => page.evaluate(id => { document.querySelector('#dialogue')?.classList.add('hidden'); document.querySelector('#workbench').classList.remove('hidden'); window.__ohmdal.workbench.open(id, undefined); }, id);
const closeBench = () => page.evaluate(() => { window.__ohmdal.workbench.close?.(false); document.querySelector('#workbench').classList.add('hidden'); });
const bench = () => page.evaluate(() => { const w = window.__ohmdal.workbench; return { state: JSON.parse(JSON.stringify(w.state)), mode: w.mode, solved: w.result.solved, commissionable: w.result.commissionable, checks: w.result.checks }; });
const say = () => page.locator('.wb-say p').innerText();
const steps = () => page.locator('.wb-checks li').evaluateAll(li => li.map(l => l.className.trim()));
const drag = async (a, b) => {
  const from = await page.locator(`.wb-terminal[data-port="${a}"]`).boundingBox(), to = await page.locator(`.wb-terminal[data-port="${b}"]`).boundingBox();
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2); await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(from.x + from.width / 2 + (to.x - from.x) * i / 8, from.y + from.height / 2 + (to.y - from.y) * i / 8);
  await page.mouse.up();
};
const log = (...a) => console.log(...a);

// Taller: el paso 1 pide el probador; cada tramo probado queda marcado sobre el tablero.
await open('workshop');
log('workshop', '·', await say());
assert.match(await page.locator('[data-mode="continuity"]').getAttribute('class'), /wb-next-step/, 'the instrument the step asks for is highlighted');
await page.locator('[data-mode="continuity"]').click();
assert.equal((await bench()).state.sourceOn, false, 'the continuity probe switches the bench off by itself');
for (const [a, b] of [['s1a', 's1b'], ['s2a', 's2b'], ['s3a', 's3b']]) { await page.locator(`.wb-terminal[data-port="${a}"]`).click(); await page.locator(`.wb-terminal[data-port="${b}"]`).click(); }
const marks = await page.locator('.wb-plate .wb-state:not([hidden])').allInnerTexts();
log('  marcas', marks.join(' | '));
assert.ok(marks.some(m => /Sin camino/.test(m)) && marks.filter(m => /Hay camino/.test(m)).length === 2, 'each tested section keeps its reading');
assert.deepEqual((await steps()).map(c => /met/.test(c)), [true, false], 'Lumen saw the break: step 1 ticked');
await shot('workshop-probed');
log('  después de probar ·', await say());
assert.match(await page.locator('[data-mode="wire"]').getAttribute('class'), /wb-next-step/, 'step 2 points back to the cables');
await page.locator('[data-mode="wire"]').click();
await drag('s2a', 's2b');
let b = await bench();
assert.equal(b.solved, true, 'a dragged cable bridges the cut');
assert.equal(b.state.sourceOn, true);
await page.locator('.wb-success').waitFor({ state: 'visible' });
assert.equal(await page.locator('[data-action="commission"]').count(), 1, 'one button carries the story on');
assert.equal(await page.evaluate(() => document.activeElement?.dataset.action), 'commission', 'the success card takes focus');
await shot('workshop-success');
log('  éxito ·', (await page.locator('.wb-success').innerText()).replace(/\s+/g, ' '));
await page.locator('[data-action="stay"]').click();
assert.equal(await page.locator('.wb-commission-top').count(), 1, 'after looking around, the way forward stays in the header');
await closeBench();

// Cerrojo: retirar con la × del cable, tender con dos toques, girar el freno.
await open('gate');
log('gate', '·', await say());
const chips = page.locator('.wb-wire-chip');
assert.equal(await chips.count(), 2, 'each hand cable has its remove button');
await chips.first().click(); await page.locator('.wb-wire-chip').first().click();
assert.equal((await bench()).state.wires.length, 1);
await page.locator('.wb-terminal[data-port="trimB"]').click(); await page.locator('.wb-terminal[data-port="latchIn"]').click();
await drag('latchOut', 'negative');
b = await bench();
log('  pasos', (await steps()).join(' / '), '·', await say());
assert.equal(b.checks[0].met, true, 'it pushes toward the mark');
await shot('gate-direction');
for (let i = 0; i < 2 && !(await bench()).solved; i++) await page.locator('.wb-plate [data-action="knob"][data-delta="1"]').click();
assert.equal((await bench()).solved, true, 'two notches of brake: firm');
await page.locator('.wb-success').waitFor({ state: 'visible' });
await shot('gate-success');
await closeBench();

// Terrazas: tres mandos sobre sus piezas; el cable de la ladera dice si se calienta.
await open('irrigation');
const turn = async (key, notches) => { const input = page.locator(`.wb-plate input[data-knob="${key}"]`); await input.focus(); await input.press('Home'); for (let i = 0; i < notches; i++) await input.press('ArrowRight'); };
await turn('warmth', 2); await turn('flow', 2);
log('irrigation', (await page.locator('.wb-plate .wb-state:not([hidden])').allInnerTexts()).join(' | '));
await shot('irrigation-two-dials');
await turn('forge', 1);
assert.equal((await bench()).solved, true);
await page.locator('.wb-success').waitFor({ state: 'visible' });
await shot('irrigation-success');
await closeBench();

// Castillo: el paso de Ivara aparece como pedido, con la llave sobre la cocina.
await open('distribution');
await page.locator('.wb-wire-chip').first().click();
await drag('clinicOut', 'negative'); await drag('positive', 'kitchenIn');
log('distribution', (await steps()).join(' / '), '·', await say());
assert.equal(await page.locator('.wb-say.wb-proof').count(), 1, "Ivara's request is what Ohm says");
await page.locator('.wb-plate [data-action="switch"][data-key="kitchen"]').click();
await page.locator('.wb-plate [data-action="switch"][data-key="kitchen"]').click();
await page.locator('.wb-success').waitFor({ state: 'visible' });
await shot('distribution-success');
await closeBench();

// Un cortocircuito: la protección salta, Ohm lo explica y el próximo cambio vuelve a encender.
await open('awaken');
await drag('positive', 'negative');
assert.equal((await bench()).state.tripped, true);
log('awaken corto ·', await say());
await shot('awaken-short');
await page.locator('.wb-wire-chip').first().click();
assert.equal((await bench()).state.tripped, false);
await drag('heartOut', 'negative');
await page.locator('.wb-success').waitFor({ state: 'visible' });
await shot('awaken-success');
await closeBench();

assert.deepEqual(errors, [], 'no page errors');
log('flujo de bancos: OK');
await browser.close();
