// The explorer at the play camera, in the states the player sees most: standing, walking
// (a real key held), rising inside the cascade's region (scarf tails and curl in the field),
// hanging on the chain. Each shot is the full frame plus a crop around the explorer.
// Development inspection only.
//   node scripts/poses.mjs [url] [outDir] [prefix]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:4210/';
const out = process.argv[3] || 'poses-out';
const prefix = process.argv[4] || 'pose';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto(url + (url.includes('?') ? '&' : '?') + 'nopause&fresh&nointro');
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60);
const put = (x, y, vx = 0, vy = 0) => page.evaluate(({ x, y, vx, vy }) => {
  const a = window.__physica.world.avatar; a.x = a.px = x; a.y = a.py = y + a.hh; a.vx = vx; a.vy = vy;
}, { x, y, vx, vy });
await page.addStyleTag({ content: '#pause { display: none !important; }' });
const shot = async (name, w = 260, h = 260, dy = 0) => {
  // Freeze first: the explorer and the camera move between measuring and capturing.
  await page.evaluate(() => window.__physica.setPaused(true)); await page.waitForTimeout(150);
  const c = await page.evaluate(dy => { const a = window.__physica.world.avatar; return window.__physica.screenOf(a.x, a.y + dy); }, dy);
  await page.screenshot({ path: join(out, `${prefix}-${name}-cuadro.png`) });
  const x = Math.max(0, Math.min(1280 - w, c.x - w / 2)), y = Math.max(0, Math.min(720 - h, c.y - h / 2));
  await page.screenshot({ path: join(out, `${prefix}-${name}.png`), clip: { x, y, width: w, height: h } });
  await page.evaluate(() => window.__physica.setPaused(false));
};
const close = async name => { // the same close camera in every field, for comparing the chains
  await page.evaluate(() => { const a = window.__physica.world.avatar; window.__physica.inspect(a.x, a.y + 0.05, 3.0); });
  await page.waitForTimeout(1800); await shot(name, 440, 600, 0.06);
  await page.evaluate(() => window.__physica.inspect(null));
};
await put(-9, 0); await page.waitForTimeout(2500); await shot('de-pie');
await close('cerca-campo-normal');
await page.keyboard.down('ArrowRight'); await page.waitForTimeout(700); await shot('caminando'); await page.keyboard.up('ArrowRight');
await page.waitForTimeout(800);
// Inside the cascade's region, rising: the field there points up.
await put(1.6, -2.2, 0, 1.5); await page.waitForTimeout(1100); await shot('subiendo-en-la-region');
await page.waitForTimeout(1500);
// Walk to the Orilla's lip and take the chain (E), then climb down into the region (▼).
// The chain is offered once the explorer has fallen short once; this inspection skips that.
await page.evaluate(() => { window.__physica.world.shortSeen = true; });
await put(-0.3, 0); await page.waitForTimeout(600);
await page.keyboard.press('KeyE'); await page.waitForTimeout(400);
await page.keyboard.down('ArrowDown'); await page.waitForTimeout(2600); await page.keyboard.up('ArrowDown');
await page.waitForTimeout(1500); await shot('en-la-cadena', 170, 170);
await close('cerca-en-la-region');
console.log('tails on the chain (height of each point above the feet; anchor at 0.725):', await page.evaluate(() => {
  const e = window.__physica.explorer, feet = e.root.position.y;
  return JSON.stringify(e.tails.map(t => t.c.pts.map(p => +(p.y - feet).toFixed(2))));
}));
console.log('onChain?', await page.evaluate(() => JSON.stringify(window.__physica.state().avatar)));
console.log('errors', errors);
await browser.close();
