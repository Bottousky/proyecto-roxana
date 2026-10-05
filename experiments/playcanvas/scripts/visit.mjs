// Visita para revisión visual: abre una bitácora guardada (por defecto la de la última partida
// automatizada), viaja con el mapa del juego al lugar pedido y camina con el teclado hasta un
// punto. No sirve como prueba de progresión: sólo para mirar escenas ya alcanzadas.
// Uso: node scripts/visit.mjs plaza 9.8,1.8 [nombre] [más paradas: lugar x,z nombre ...]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromePath, gpuArgs } from './chrome.mjs';

const url = process.env.GAME_URL || 'http://127.0.0.1:4190/';
const save = readFileSync(resolve(process.env.SAVE || 'output/playcanvas-playthrough/verified-save.json'), 'utf8');
const stops = [];
for (let i = 2; i < process.argv.length; i += 3) stops.push({ area: process.argv[i], at: process.argv[i + 1]?.split(',').map(Number), name: process.argv[i + 2] || `${process.argv[i]}` });
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width: Number(process.env.WIDTH || 1440), height: Number(process.env.HEIGHT || 900) } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(text => { if (!sessionStorage.getItem('visit')) { localStorage.setItem('ohmdal.playcanvas.arc1.v1', text); sessionStorage.setItem('visit', '1'); } }, save);
await page.goto(url, { waitUntil: 'networkidle' });
await page.locator('#continue').click();
const game = () => page.evaluate(() => ({ mode: window.__ohmdal?.mode, area: window.__ohmdal?.state.area, p: window.__ohmdal?.world.getPlayerPosition() }));
const settle = async () => { for (let i = 0; i < 400; i++) { const g = await game(); if (g.mode === 'world') return g; if (g.mode === 'dialogue') await page.keyboard.press('Enter'); else if (g.mode === 'modal') await page.keyboard.press('Escape'); await page.waitForTimeout(80); } };
await page.waitForFunction(() => window.__ohmdal?.mode && window.__ohmdal.mode !== 'title', {}, { timeout: 60000 });
await settle();
for (const stop of stops) {
  if ((await game()).area !== stop.area) { await page.keyboard.press('m'); const travel = page.locator('details:has([data-area]) > summary').first(); if (await travel.count()) await travel.click(); await page.locator(`[data-area="${stop.area}"]`).first().click(); await page.waitForTimeout(400); await settle(); }
  if (stop.at?.length === 2) for (let i = 0; i < 160; i++) {
    const g = await game(), dx = stop.at[0] - g.p[0], dz = stop.at[1] - g.p[1];
    if (Math.hypot(dx, dz) < .35) break;
    const keys = [...(Math.abs(dx) > .2 ? [dx > 0 ? 'd' : 'a'] : []), ...(Math.abs(dz) > .2 ? [dz > 0 ? 's' : 'w'] : [])];
    for (const k of keys) await page.keyboard.down(k); await page.waitForTimeout(110); for (const k of keys) await page.keyboard.up(k);
    if ((await game()).mode !== 'world') await settle();
  }
  await page.waitForTimeout(1200);
  if (process.env.FRAMES) {
    const frames = await page.evaluate(n => new Promise(done => { const t = []; let last = performance.now(); const step = now => { t.push(now - last); last = now; if (t.length < n) requestAnimationFrame(step); else done(t); }; requestAnimationFrame(step); }), Number(process.env.FRAMES));
    const sorted = [...frames].sort((a, b) => a - b), mean = frames.reduce((a, b) => a + b) / frames.length;
    console.log(stop.name, 'cuadros', frames.length, 'media', mean.toFixed(2), 'ms · p95', sorted[Math.floor(frames.length * .95)].toFixed(2), 'ms · máx', sorted.at(-1).toFixed(2), 'ms');
  }
  const file = resolve('output', `visit-${stop.name}.png`);
  await page.screenshot({ path: file });
  console.log(file, JSON.stringify((await game()).p));
}
if (errors.length) console.log('errores', errors);
await browser.close();
