// The Orilla side at the play camera, driven with real keys: what the player sees at each
// support (which sphere a prompt refers to), at the plumb mast, and at the lip with a sphere in
// hand (the chain is not offered then). Development inspection; teleports only set up the start.
//   node scripts/orilla.mjs [url] [outDir] [prefix]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:4210/';
const out = process.argv[3] || 'orilla-out';
const prefix = process.argv[4] || 'orilla';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto(url + (url.includes('?') ? '&' : '?') + 'nopause&fresh&nointro');
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60);
const wait = ms => page.waitForTimeout(ms);
const tap = async key => { await page.keyboard.down(key); await wait(80); await page.keyboard.up(key); };
const x = () => page.evaluate(() => window.__physica.world.avatar.x);
const walkTo = async tx => {
  const dir = (await x()) < tx ? 'ArrowRight' : 'ArrowLeft';
  await page.keyboard.down(dir);
  for (let i = 0; i < 300; i++) { const v = await x(); if (dir === 'ArrowRight' ? v >= tx : v <= tx) break; await wait(15); }
  await page.keyboard.up(dir); await wait(700);
};
const prompt = () => page.evaluate(() => {
  const el = document.getElementById('prompt'); if (!el || el.hidden) return null;
  const r = el.getBoundingClientRect();
  return { verb: document.getElementById('prompt-verb').textContent, hint: document.getElementById('prompt-hint').textContent, x: Math.round(r.x + r.width / 2), y: Math.round(r.bottom) };
});
const log = [];
const shot = async (name, note) => {
  const p = await prompt();
  await page.screenshot({ path: join(out, `${prefix}-${name}.png`) });
  log.push({ name, note, prompt: p });
};
await page.evaluate(() => { const a = window.__physica.world.avatar; a.x = a.px = -8; a.y = a.py = a.hh; });
await wait(1200);
await walkTo(-2.85); await shot('1-soporte-A', 'al lado del soporte A (orilla)');
await walkTo(-1.05); await shot('2-soporte-B', 'al lado del soporte B (borde)');
await page.evaluate(() => window.__physica.inspect(-0.2, 2.9, 9)); await wait(2200);
await shot('3-mastil', 'el mástil de plomadas, de cerca'); await page.evaluate(() => window.__physica.inspect(null));
// A sphere from the table, carried to the lip: the chain is not offered while holding it.
await page.evaluate(() => { const a = window.__physica.world.avatar; a.x = a.px = -6.6; a.y = a.py = a.hh; window.__physica.world.shortSeen = true; });
await wait(900);
await walkTo(-5.85); await tap('KeyE'); await wait(400);
const holding = await page.evaluate(() => !!window.__physica.world.avatar.holding);
await walkTo(-0.35); await shot('4-borde-con-esfera', `en el labio con una esfera en la mano (holding=${holding})`);
await tap('KeyE'); await wait(600); await shot('5-borde-sin-esfera', 'la misma posición, después de soltarla');
writeFileSync(join(out, `${prefix}.json`), JSON.stringify(log, null, 1));
console.log(JSON.stringify(log));
console.log('errors', errors);
await browser.close();
