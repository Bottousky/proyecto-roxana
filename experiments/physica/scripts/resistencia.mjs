// Soak test: the game left running at a spot for a while, watching for page crashes, JS heap
// growth and frame times (the A25 criterion: p99 ≤ 17 ms and max ≤ 34 ms over 60 s). Development tool.
//   node scripts/resistencia.mjs [url] [seconds=60] [x=-1.2]
import { chromium } from 'playwright';
import os from 'node:os';
const url = process.argv[2] || 'http://127.0.0.1:4210/', secs = +(process.argv[3] || 60), X = +(process.argv[4] || -1.2);
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal', '--enable-precise-memory-info'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
let crashed = false; const errors = [];
page.on('crash', () => { crashed = true; });
page.on('pageerror', e => errors.push(String(e)));
const out = { url, secs, x: X, loadStart: os.loadavg().map(v => +v.toFixed(1)) };
try {
  await page.goto(url + '?nopause&fresh&nointro');
  await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60, null, { timeout: 60000 });
  await page.evaluate(x => { const a = window.__physica.world.avatar; a.x = a.px = x; a.y = a.py = a.hh; }, X);
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.__physica.resetFrames());
  const heap = [], frames = [], works = [];
  for (let t = 0; t < secs && !crashed; t += 5) {
    await page.waitForTimeout(5000);
    const s = await page.evaluate(() => ({ heap: performance.memory ? performance.memory.usedJSHeapSize : 0, f: window.__physica.frames(), w: window.__physica.works ? window.__physica.works() : [] }));
    heap.push(+(s.heap / 1048576).toFixed(1)); frames.push(...s.f); works.push(...s.w);
    await page.evaluate(() => window.__physica.resetFrames());
  }
  const a = frames.slice().sort((p, q) => p - q), q = p => a[Math.min(a.length - 1, Math.floor(p * a.length))];
  const w = works.slice().sort((p, q) => p - q), wq = p => +(w[Math.min(w.length - 1, Math.floor(p * w.length))] ?? 0).toFixed(2);
  const longFrames = await page.evaluate(() => window.__physica.longFrames || []);
  Object.assign(out, { crashed, n: a.length, p50: q(0.5), p99: q(0.99), max: +a[a.length - 1].toFixed(1), over17: a.filter(f => f > 17).length, over34: a.filter(f => f > 34).length,
    work: { p50: wq(0.5), p99: wq(0.99), max: wq(1) }, longFrames, heapMB: heap });
} catch (e) { out.error = String(e).split('\n')[0]; out.crashed = crashed; }
out.errors = errors; out.loadEnd = os.loadavg().map(v => +v.toFixed(1));
console.log(JSON.stringify(out));
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 10000))]);
process.exit(0);
