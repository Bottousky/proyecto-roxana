// Chrome performance trace of the game left running, to find what fills the long gaps between
// frames (A25): for each gap > 100 ms between animation frames on the renderer's main thread, the
// events that ran inside it (garbage collection, script, layout, GPU waits), by total time.
// Development tool.
//   node scripts/traza-tirones.mjs [url] [seconds=60] [x=-1.2] [trace.json]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const url = process.argv[2] || 'http://127.0.0.1:4210/', secs = +(process.argv[3] || 60), X = +(process.argv[4] || -1.2);
const traceFile = process.argv[5] || 'traza.json';
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
await page.goto(url + '?nopause&fresh&nointro');
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60, null, { timeout: 60000 });
await page.evaluate(x => { const a = window.__physica.world.avatar; a.x = a.px = x; a.y = a.py = a.hh; }, X);
await page.waitForTimeout(2500);
await browser.startTracing(page, { path: traceFile, categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'v8', 'disabled-by-default-v8.gc', 'blink.user_timing', 'gpu', 'viz', 'cc'] });
await page.waitForTimeout(secs * 1000);
await browser.stopTracing();
const fromGame = await page.evaluate(() => window.__physica.longFrames);
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 10000))]);

const ev = JSON.parse(readFileSync(traceFile, 'utf8')).traceEvents;
const names = {}; for (const e of ev) if (e.ph === 'M' && e.name === 'thread_name') names[`${e.pid}:${e.tid}`] = e.args.name;
const main = Object.entries(names).filter(([, n]) => n === 'CrRendererMain').map(([k]) => k);
const onMain = e => main.includes(`${e.pid}:${e.tid}`);
const frames = ev.filter(e => onMain(e) && e.name === 'FireAnimationFrame' && e.ph === 'X').sort((a, b) => a.ts - b.ts);
const gaps = [];
for (let i = 1; i < frames.length; i++) {
  const g = (frames[i].ts - frames[i - 1].ts) / 1000;
  if (g > 100) gaps.push({ from: frames[i - 1].ts + (frames[i - 1].dur || 0), to: frames[i].ts, ms: +g.toFixed(1) });
}
const report = gaps.map(g => {
  const inside = {}, otherThreads = {};
  for (const e of ev) {
    if (e.ph !== 'X' || !e.dur || e.ts + e.dur < g.from || e.ts > g.to) continue;
    const ov = (Math.min(e.ts + e.dur, g.to) - Math.max(e.ts, g.from)) / 1000; if (ov < 2) continue;
    const bucket = onMain(e) ? inside : otherThreads, key = onMain(e) ? e.name : `${names[`${e.pid}:${e.tid}`] || e.tid}: ${e.name}`;
    bucket[key] = +((bucket[key] || 0) + ov).toFixed(1);
  }
  const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 6);
  return { gapMs: g.ms, mainThread: top(inside), otherThreads: top(otherThreads) };
});
console.log(JSON.stringify({ frames: frames.length, gaps: report, fromGame }, null, 1));
