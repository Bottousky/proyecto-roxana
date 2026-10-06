// Turnaround of the 3D explorer next to its character sheet: the same four views (front,
// three-quarter, side, back) at the play camera's elevation, plus a close bust. Development
// inspection only.
//   node scripts/turnaround.mjs [url] [outDir] [prefix]
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:4210/';
const out = process.argv[3] || 'turnaround-out';
const prefix = process.argv[4] || 'modelo';
mkdirSync(out, { recursive: true });
const SHEET = resolve(import.meta.dirname, '../../../art-source/physica/explorer-sheet-v1.png');

// Yaw θ sends the face (+x local) to (cos θ, 0, −sin θ); the camera looks down −z.
const VIEWS = [
  { name: 'frente', yaw: -Math.PI / 2 },
  { name: 'tres-cuartos', yaw: -Math.PI / 4 },
  { name: 'perfil', yaw: 0 },
  { name: 'espalda', yaw: Math.PI / 2 },
];
const X = -9, DIST = 3.0;

const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto(url + (url.includes('?') ? '&' : '?') + 'nopause&fresh&nointro');
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60);
await page.addStyleTag({ content: '#hud, #prompt, #legend, #hint, #title { visibility: hidden !important; }' });
const shots = [];
const place = async (yaw, cx, cy, dist) => {
  await page.evaluate(({ X, yaw, cx, cy, dist }) => {
    const w = window.__physica.world, a = w.avatar;
    a.x = a.px = X; a.y = a.py = a.hh; a.vx = a.vy = 0;
    window.__physica.pose(yaw);
    window.__physica.inspect(cx, cy, dist);
  }, { X, yaw, cx, cy, dist });
  await page.waitForTimeout(2200);
};
// The frame is 1280×720 CSS px; the explorer stands at the centre. Crop a portrait window.
const clip = { x: 640 - 220, y: 70, width: 440, height: 580 };
for (const v of VIEWS) {
  await place(v.yaw, X, 0.58, DIST);
  const f = join(out, `${prefix}-${v.name}.png`);
  await page.screenshot({ path: f, clip });
  shots.push({ f, label: v.name });
}
await place(-Math.PI / 4 - 0.15, X, 0.84, 1.3);
const bust = join(out, `${prefix}-busto.png`);
await page.screenshot({ path: bust, clip: { x: 640 - 230, y: 360 - 230, width: 460, height: 440 } });
await page.evaluate(() => { window.__physica.pose(null); window.__physica.inspect(null); });

// Sheet: the reference on top, the model's views below in the same order.
const b64 = f => 'data:image/png;base64,' + readFileSync(f).toString('base64');
const p2 = await browser.newPage({ viewport: { width: 1536, height: 1700 } });
await p2.setContent(`<body style="margin:0;background:#1a120d;font:600 22px system-ui;color:#f4e6cf">
  <img src="${b64(SHEET)}" style="display:block;width:1536px">
  <div style="display:flex;gap:6px;padding:6px">
    ${shots.map(s => `<figure style="margin:0;text-align:center"><img src="${b64(s.f)}" style="width:300px;display:block">${s.label}</figure>`).join('')}
    <figure style="margin:0;text-align:center"><img src="${b64(bust)}" style="width:300px;display:block">busto</figure>
  </div></body>`);
await p2.waitForTimeout(300);
await p2.screenshot({ path: join(out, `${prefix}-vs-hoja.png`), fullPage: true });
await p2.close();
console.log('errors', errors);
await browser.close();
