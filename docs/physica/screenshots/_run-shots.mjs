import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const outDir = process.argv[2];
const targetsJson = fs.readFileSync(process.argv[3], 'utf8');
const targets = JSON.parse(targetsJson);

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();

page.on('console', (msg) => {
  if (msg.type() === 'error') console.log('PAGE-ERR:', msg.text());
});
page.on('pageerror', (err) => console.log('PAGE-EXC:', err.message));

await page.goto('http://127.0.0.1:5180/src/experiences/physica/?auto=1&clean=1', { waitUntil: 'domcontentloaded', timeout: 20000 });
console.log('URL AFTER NAV:', page.url());
await page.waitForFunction(() => {
  const c = document.querySelector('canvas');
  if (!c) return false;
  return c.width > 100 && c.height > 100;
}, { timeout: 25000 });
await page.waitForTimeout(6000);
console.log('URL AFTER WAIT:', page.url());
console.log('PROBES:', await page.evaluate(() => ({
  tele: typeof window.__pxTeleport,
  press: typeof window.__pxPress,
  snap: typeof window.__pxSnapshot,
  render: typeof window.render_game_to_text,
  hasCanvas: !!document.querySelector('canvas'),
  canvasW: document.querySelector('canvas')?.width,
  canvasH: document.querySelector('canvas')?.height,
  pxApp: !!document.getElementById('px-app'),
  pxGame: !!document.getElementById('px-game'),
  pxContinue: !!document.getElementById('px-continue'),
  hasBack: !!document.getElementById('px-back'),
})));
const sample = await page.evaluate(() => {
  try { return window.render_game_to_text ? window.render_game_to_text().slice(0, 500) : 'NO'; }
  catch (e) { return 'ERR: ' + e.message; }
});
console.log('SAMPLE:', sample);
const out0 = path.join(outDir, 'shot-00-initial.png');
await page.screenshot({ path: out0, fullPage: false });
console.log('OK initial ->', out0);

for (const t of targets) {
  try {
    const tele = await page.evaluate(({x, y}) => {
      const fn = window.__pxTeleport;
      if (typeof fn === 'function') { fn(x, y); return 'ok'; }
      return 'no-teleport';
    }, t.teleport);
    if (tele !== 'ok') { console.log('SKIP', t.name, tele); continue; }
    await page.waitForTimeout(t.waitMs);
    const safeName = String(t.name).replace(/[^a-z0-9_\-]/gi, '_');
    const out = path.join(outDir, 'shot-' + safeName + '.png');
    await page.screenshot({ path: out, fullPage: false });
    console.log('OK', t.name, '->', out);
  } catch (e) {
    console.log('ERR', t.name, e.message);
  }
}
await browser.close();
