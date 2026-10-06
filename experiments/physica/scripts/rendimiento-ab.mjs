// A/B frame times: the same scene with a switch on and off, alternated, in several windows, with
// the machine's load recorded. Development tool for telling a real cost from machine noise.
//   node scripts/rendimiento-ab.mjs [url] [windows] [vegetacion|musgo] [x]
import { chromium } from 'playwright';
import os from 'node:os';
const url = process.argv[2] || 'http://127.0.0.1:4210/', N = +(process.argv[3] || 3), X = +(process.argv[5] || -12);
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
await page.goto(url + '?nopause&fresh&nointro');
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60);
await page.waitForTimeout(3000);
const CASES = process.argv[4] || 'vegetacion';
const cases = CASES === 'musgo' ? {
  'musgo visible': () => { window.__physica.view.moss.mesh.visible = true; },
  'musgo oculto': () => { window.__physica.view.moss.mesh.visible = false; },
} : {
  'vegetación con sombra': () => { const v = window.__physica.view.veg.mesh; v.visible = true; v.castShadow = true; },
  'vegetación sin sombra': () => { const v = window.__physica.view.veg.mesh; v.visible = true; v.castShadow = false; },
  'sin vegetación': () => { const v = window.__physica.view.veg.mesh; v.visible = false; },
};
const rows = [];
for (let w = 0; w < N; w++) for (const [name, fn] of Object.entries(cases)) {
  await page.evaluate(fn);
  await page.evaluate(X => { const a = window.__physica.world.avatar; a.x = a.px = X; a.y = a.py = a.hh; }, X); // the start by default (the idle measurement's view)
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.__physica.resetFrames());
  await page.waitForTimeout(5000);
  const st = await page.evaluate(() => ({ ...window.__physica.stats(), slow: window.__physica.frames().filter(f => f > 17).length }));
  rows.push({ name, n: st.n, p99: +st.p99.toFixed(1), max: +st.max.toFixed(1), slow: st.slow, load: +os.loadavg()[0].toFixed(1) });
}
for (const r of rows) console.log(`${r.name.padEnd(24)} n ${r.n} p99 ${r.p99} max ${r.max} >17ms ${r.slow} load ${r.load}`);
await browser.close();
