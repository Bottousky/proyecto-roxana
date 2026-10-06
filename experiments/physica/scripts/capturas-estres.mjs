// Screenshot stress: many captures in a row at a given spot, with each one's latency, to tell a
// rendering stall from machine noise. Variants are switched at runtime. Development tool.
//   node scripts/capturas-estres.mjs [url] [n=120] [variant=base|sin-a2c-musgo|sin-musgo]
import { chromium } from 'playwright';
import os from 'node:os';
const url = process.argv[2] || 'http://127.0.0.1:4210/', N = +(process.argv[3] || 120), variant = process.argv[4] || 'base';
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
let crashed = false; page.on('crash', () => { crashed = true; });
const out = { variant, load0: os.loadavg()[0].toFixed(1) };
try {
  await page.goto(url + '?nopause&fresh&nointro');
  await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60, null, { timeout: 60000 });
  await page.evaluate(v => {
    const m = window.__physica.view.moss.mesh;
    if (v === 'sin-a2c-musgo') { m.material.alphaToCoverage = false; m.material.needsUpdate = true; }
    if (v === 'sin-musgo') m.visible = false;
    const a = window.__physica.world.avatar; a.x = a.px = -0.4; a.y = a.py = a.hh;
  }, variant);
  await page.waitForTimeout(2000);
  const lat = [];
  for (let i = 0; i < N && !crashed; i++) {
    const t0 = Date.now();
    try { await page.screenshot({ timeout: 30000 }); }
    catch (e) {
      // A hung capture: is the game itself still running (simulation steps advancing)?
      const s0 = await page.evaluate(() => window.__physica.world.stepCount);
      await page.waitForTimeout(1000);
      const s1 = await page.evaluate(() => window.__physica.world.stepCount);
      out.hungAt = i; out.gameStepsPerSecondWhileHung = s1 - s0; throw e;
    }
    lat.push(Date.now() - t0);
  }
  lat.sort((a, b) => a - b);
  Object.assign(out, { n: lat.length, p50: lat[lat.length >> 1], p95: lat[Math.floor(lat.length * 0.95)], max: lat[lat.length - 1], over2s: lat.filter(v => v > 2000).length });
} catch (e) { out.error = String(e).split('\n')[0]; }
out.crashed = crashed; out.load1 = os.loadavg()[0].toFixed(1);
console.log(JSON.stringify(out));
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 10000))]);
process.exit(0);
