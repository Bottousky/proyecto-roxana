// Fixed, comparable shots for visual before/after (development inspection camera; not a route).
//   node scripts/shots.mjs [url] [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:4210/';
const out = process.argv[3] || 'shots-out';
mkdirSync(out, { recursive: true });
const SETS = {
  agua: [
    { name: 'w1-afloramiento', explorer: [-1.2, 0], cam: [2.6, -3.0, 6] },
    { name: 'w2-columna', explorer: [-1.2, 0], cam: [2.8, 0.6, 10] },
    { name: 'w3-cresta', explorer: [-1.2, 0], cam: [4.3, 4.6, 6] },
    { name: 'w4-llegada', explorer: [-1.2, 0], cam: [6.0, 4.4, 6] },
    { name: 'w5-caida-izquierda', explorer: [-16, 0], cam: [-19.5, 3, 9] },
    { name: 'w6-juego', explorer: [-1.2, 0], cam: null },
  ],
};
const SHOTS = SETS[process.argv[4]] || [
  { name: 'a-inicio', explorer: [-16, 0], cam: null },
  { name: 'b-cascada', explorer: [-1.2, 0], cam: null },
  { name: 'c-pozo', explorer: [10.5, 4.4], cam: null },
  { name: 'd-roca-orilla-5m', explorer: [-9, 0], cam: [-7, -1.4, 5] },
  { name: 'e-roca-terraza-6m', explorer: [-1.2, 0], cam: [7.5, 1.6, 6] },
  { name: 'f-sima', explorer: [-1.2, 0], cam: [2.3, -1.6, 8] },
];
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto(url + (url.includes('?') ? '&' : '?') + 'nopause&fresh&nointro');
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60);
for (const s of SHOTS) {
  await page.evaluate(({ e, c }) => {
    const w = window.__physica.world, a = w.avatar;
    a.x = a.px = e[0]; a.y = a.py = e[1] + a.hh; a.vx = a.vy = 0;
    window.__physica.inspect(...(c || [null]));
  }, { e: s.explorer, c: s.cam });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: join(out, `${s.name}.png`) });
}
console.log('errors', errors);
await browser.close();
