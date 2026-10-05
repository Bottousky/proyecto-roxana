// Rendimiento de la build de producción, por lugar. Declara equipo, navegador y resolución.
// En Chrome sin interfaz el ritmo de cuadros queda topado por la sincronía vertical (60 Hz), así
// que además del ritmo real se mide el costo de cada cuadro sin tope: la lógica del juego
// (world.update) y el render completo con su posproceso, esperando a que la GPU termine
// (readPixels). Un cuadro cabe en 60 FPS si update + render < 16,7 ms.
// También: tiempo de carga, bytes transferidos y memoria JS al recorrer los lugares tres veces.
// Abre una bitácora terminada y viaja con el mapa del juego: es medición, no prueba de recorrido.
// Uso: vite preview en 4191, luego GAME_URL=http://127.0.0.1:4191/ SIZE=1440x900 DPR=2 QUALITY=high node scripts/perf.mjs
import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import os from 'node:os';
import { chromePath, gpuArgs } from './chrome.mjs';

const url = process.env.GAME_URL || 'http://127.0.0.1:4191/';
const [width, height] = (process.env.SIZE || '1440x900').split('x').map(Number);
const dpr = Number(process.env.DPR || 1), quality = process.env.QUALITY || 'high';
const save = JSON.parse(await readFile(resolve(process.env.SAVE || 'output/scenes-cycle8/verified-save.json'), 'utf8'));
save.settings = { ...save.settings, quality };
const AREAS = ['portal', 'plaza', 'workshop', 'road', 'spring', 'castle', 'terraces', 'lake', 'lighthouse'];
const stats = list => { const s = [...list].sort((a, b) => a - b), at = q => s[Math.min(s.length - 1, Math.floor(s.length * q))]; return { mean: +(s.reduce((a, b) => a + b, 0) / s.length).toFixed(2), p50: +at(.5).toFixed(2), p95: +at(.95).toFixed(2), max: +s.at(-1).toFixed(2) }; };

const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: [...gpuArgs, '--enable-precise-memory-info', '--js-flags=--expose-gc'] });
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr });
const page = await context.newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.addInitScript(text => { if (!sessionStorage.getItem('perf')) { localStorage.setItem('ohmdal.playcanvas.arc1.v1', text); sessionStorage.setItem('perf', '1'); } }, JSON.stringify(save));

const t0 = Date.now();
await page.goto(url, { waitUntil: 'networkidle' });
const titleMs = Date.now() - t0;
const t1 = Date.now();
await page.locator('#continue').click();
await page.waitForFunction(() => window.__ohmdal?.mode && !['title', 'transition'].includes(window.__ohmdal.mode), {}, { timeout: 120000 });
const worldMs = Date.now() - t1;
const transfer = await page.evaluate(() => performance.getEntriesByType('resource').concat(performance.getEntriesByType('navigation')).reduce((a, e) => ({ wire: a.wire + (e.transferSize || 0), body: a.body + (e.decodedBodySize || 0) }), { wire: 0, body: 0 }));
const info = await page.evaluate(() => { const gl = window.__ohmdal.world.app.graphicsDevice.gl, d = gl.getExtension('WEBGL_debug_renderer_info'); return { renderer: d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : '?', canvas: [gl.drawingBufferWidth, gl.drawingBufferHeight], userAgent: navigator.userAgent }; });

const mode = () => page.evaluate(() => window.__ohmdal?.mode);
const settle = async () => { for (let i = 0; i < 400; i++) { const m = await mode(); if (m === 'world') return; if (m === 'dialogue') await page.keyboard.press('Enter'); else if (m === 'modal') await page.keyboard.press('Escape'); await page.waitForTimeout(80); } };
async function travel(area) {
  if (await page.evaluate(() => window.__ohmdal.state.area) === area) return;
  await page.keyboard.press('m');
  const list = page.locator('details:has([data-area]) > summary').first(); if (await list.count()) await list.click();
  await page.locator(`[data-area="${area}"]`).first().click();
  await page.waitForFunction(a => window.__ohmdal.state.area === a && window.__ohmdal.mode !== 'transition', area, { timeout: 60000 });
  await settle();
}
// Costs without the vsync cap, inside one task: the game's own rAF loop is held meanwhile.
const frameCost = () => page.evaluate(() => {
  const g = window.__ohmdal, w = g.world, app = w.app, gl = app.graphicsDevice.gl, px = new Uint8Array(4), update = [], render = [];
  const sync = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
  for (let i = 0; i < 8; i++) { app.render(); sync(); }
  for (let i = 0; i < 90; i++) {
    let t = performance.now(); w.update(1 / 60, g.state, { x: 0, z: 0, run: false, paused: false }); update.push(performance.now() - t);
    t = performance.now(); app.render(); sync(); render.push(performance.now() - t);
  }
  return { update, render };
});
const paced = (n = 180, walk = null) => page.evaluate(async ([n, walk]) => {
  if (walk) dispatchEvent(new KeyboardEvent('keydown', { key: walk }));
  const t = []; let last = performance.now();
  await new Promise(r => { const f = now => { t.push(now - last); last = now; t.length < n ? requestAnimationFrame(f) : r(); }; requestAnimationFrame(f); });
  if (walk) dispatchEvent(new KeyboardEvent('keyup', { key: walk }));
  return t.slice(2);
}, [n, walk]);
const heap = async () => { await page.evaluate(() => globalThis.gc?.()); return page.evaluate(() => +(performance.memory.usedJSHeapSize / 1048576).toFixed(1)); };

await settle();
const zones = [];
for (const area of AREAS) {
  await travel(area);
  await page.waitForTimeout(1500);
  const idle = await paced(), walking = await paced(150, area === 'workshop' ? 'ArrowUp' : 'ArrowDown'), cost = await frameCost();
  const total = cost.update.map((u, i) => u + cost.render[i]);
  zones.push({ area, pacedIdleMs: stats(idle), pacedWalkingMs: stats(walking), updateMs: stats(cost.update), renderMs: stats(cost.render), frameCostMs: stats(total), fitsIn60: stats(total).p95 < 16.7 });
  process.stdout.write(`${area.padEnd(11)} costo/cuadro p50 ${stats(total).p50} ms · p95 ${stats(total).p95} ms (update ${stats(cost.update).p50} + render ${stats(cost.render).p50}) · ritmo real p95 ${stats(walking).p95} ms caminando\n`);
}
const heapAfterFirstLap = await heap();
for (let lap = 0; lap < 2; lap++) for (const area of [...AREAS].reverse().concat(AREAS)) await travel(area);
const heapAfterThreeLaps = await heap();

const revision = execSync('git rev-parse --short HEAD').toString().trim() + (execSync('git status --porcelain -- src public').toString().trim() ? '+cambios' : '');
const report = { revision, date: new Date().toISOString(), machine: { cpu: os.cpus()[0].model, cores: os.cpus().length, memoryGB: Math.round(os.totalmem() / 2 ** 30), os: `${os.type()} ${os.release()}` }, browser: info, viewport: { width, height, dpr }, quality, url,
  load: { titleNetworkIdleMs: titleMs, continueToWorldMs: worldMs, transferredMB: +(transfer.wire / 1048576).toFixed(1), decodedMB: +(transfer.body / 1048576).toFixed(1) }, memory: { heapAfterFirstLapMB: heapAfterFirstLap, heapAfterThreeLapsMB: heapAfterThreeLaps }, zones, errors };
await mkdir('output/perf', { recursive: true });
const file = resolve(`output/perf/perf-${width}x${height}@${dpr}-${quality}.json`);
await writeFile(file, JSON.stringify(report, null, 2));
console.log(`carga: título ${titleMs} ms, mundo ${worldMs} ms, ${report.load.transferredMB} MB transferidos (${report.load.decodedMB} MB decodificados) · memoria JS ${heapAfterFirstLap} → ${heapAfterThreeLaps} MB tras tres vueltas · ${info.canvas.join('×')} px · ${errors.length} errores`);
console.log(file);
await browser.close();
