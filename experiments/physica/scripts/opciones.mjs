// The options panel, driven with the keyboard only: Esc opens it, Tab moves between controls,
// arrows move the volume, Space toggles reduced motion, Enter picks a text size, Esc closes it.
// Then a reload, to check the settings persist. Checks the game's state after each step.
// Development inspection.
//   node scripts/opciones.mjs [url] [outDir]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const url = process.argv[2] || 'http://127.0.0.1:4210/';
const out = process.argv[3] || 'opciones-out';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
const wait = ms => page.waitForTimeout(ms);
const tap = async key => { await page.keyboard.down(key); await wait(70); await page.keyboard.up(key); await wait(120); };
const state = () => page.evaluate(() => ({
  paused: !document.getElementById('pause').hidden, focus: document.activeElement?.id || document.activeElement?.dataset?.size || document.activeElement?.tagName,
  volume: +document.getElementById('opt-volume').value, focusName: document.activeElement?.name || '', reduced: window.__physica.reduced, ui: getComputedStyle(document.documentElement).getPropertyValue('--ui').trim(),
  stored: (() => { try { return localStorage.getItem('physica.ajustes.v1'); } catch { return 'n/a'; } })(), step: window.__physica.world.stepCount,
  hintFont: getComputedStyle(document.getElementById('hint')).fontSize,
}));
const log = [];
const note = async (what) => { const s = await state(); log.push({ what, ...s }); return s; };
await page.goto(url + '?nopause&fresh&nointro');
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60);
await page.evaluate(() => { try { localStorage.removeItem('physica.ajustes.v1'); } catch {} });
await page.reload(); await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60); await wait(800);
await note('inicio');
await tap('Escape'); const s0 = await note('Esc: pausa abierta');
await page.screenshot({ path: join(out, '1-panel-de-opciones.png') });
const stepFrozen = (await state()).step === s0.step;
for (let i = 0; i < 6; i++) await tap('ArrowLeft'); await note('◀ ×6 en el volumen');
await tap('Tab'); await tap('Space'); await note('Tab, espacio: movimiento reducido');
await tap('Tab'); await tap('ArrowRight'); await tap('ArrowRight'); await note('Tab, ▶ ×2: «Muy grande»');
// Focus trap: ten more Tabs never leave the panel nor open the Bitácora behind it.
const trapped = [];
for (let i = 0; i < 10; i++) { await tap('Tab'); trapped.push(await page.evaluate(() => ({ inPanel: !!document.activeElement.closest('#pause'), journal: !!document.querySelector('.journal:not([hidden])') }))); }
log.push({ what: 'Tab ×10 (trampa de foco)', allInPanel: trapped.every(t => t.inPanel), journalOpened: trapped.some(t => t.journal) });
await page.screenshot({ path: join(out, '2-texto-muy-grande.png') });
await tap('Escape'); await wait(500); const s1 = await note('Esc: vuelve al juego');
await page.keyboard.down('ArrowRight'); await wait(600); await page.keyboard.up('ArrowRight'); await wait(400);
const moved = await page.evaluate(() => window.__physica.world.avatar.x);
await page.screenshot({ path: join(out, '3-juego-texto-muy-grande.png') });
await page.reload(); await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60); await wait(800);
await note('recarga: los ajustes persisten');
await tap('Escape'); await page.screenshot({ path: join(out, '4-tras-recargar.png') }); await tap('Escape');
// Narrow screens, with the largest text: the panel and the control bar must fit.
for (const [w, h, name] of [[900, 600, '5-ventana-900x600'], [390, 844, '6-telefono-390x844']]) {
  await page.setViewportSize({ width: w, height: h }); await wait(600);
  const fit = await page.evaluate(() => { const r = document.getElementById('hint').getBoundingClientRect(); return { hintLeft: Math.round(r.left), hintRight: Math.round(r.right), vw: innerWidth }; });
  await tap('Escape'); await wait(300);
  const panel = await page.evaluate(() => { const d = document.querySelector('#pause > div'), b = document.getElementById('resume').getBoundingClientRect(); return { scrolls: d.scrollHeight > d.clientHeight + 1, resumeVisible: b.bottom <= innerHeight && b.top >= 0 }; });
  await page.screenshot({ path: join(out, `${name}.png`) });
  log.push({ what: `${w}×${h}, texto muy grande`, ...fit, ...panel });
  await tap('Escape');
}
writeFileSync(join(out, 'opciones.json'), JSON.stringify({ log, stepFrozenWhilePaused: stepFrozen, explorerXAfterWalking: moved, errors }, null, 1));
console.log(JSON.stringify({ log, stepFrozenWhilePaused: stepFrozen, explorerXAfterWalking: moved, errors }));
await browser.close();
