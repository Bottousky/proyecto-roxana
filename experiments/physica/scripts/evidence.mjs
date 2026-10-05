// End-to-end evidence run with real keyboard events (CDP), from a clean start:
// familiar fall at support A, release inside the region at support B, reel, the explorer's
// own crossing onto the Terraza, Bitácora, reload (save/load), pause/resume, frame times.
// Writes contact sheets (frame sequences), trajectories and a report to an output folder.
//   node scripts/evidence.mjs [url] [outDir]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:4210/';
const out = process.argv[3] || 'evidence-out';
mkdirSync(out, { recursive: true });
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [], logs = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', e => errors.push(String(e)));
const report = { url, started: new Date().toISOString(), steps: [] };
const step = (name, data = {}) => { report.steps.push({ name, ...data }); console.log('·', name, JSON.stringify(data).slice(0, 220)); };
const state = () => page.evaluate(() => window.__physica.state());
const sleep = ms => page.waitForTimeout(ms);

async function sheet(name, shots, cols = 4, label = '') {
  const w = 1280 / 2, h = 720 / 2, rows = Math.ceil(shots.length / cols);
  const b64 = shots.map(s => s.buf.toString('base64'));
  const p2 = await ctx.newPage();
  const png = await p2.evaluate(async ({ b64, cols, rows, w, h, labels, label }) => {
    const c = document.createElement('canvas'); c.width = cols * w; c.height = rows * h + 34; const k = c.getContext('2d');
    k.fillStyle = '#1b120d'; k.fillRect(0, 0, c.width, c.height);
    k.fillStyle = '#f6ecd8'; k.font = '600 18px sans-serif'; k.fillText(label, 10, 23);
    for (let i = 0; i < b64.length; i++) {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64[i]; await img.decode();
      const x = (i % cols) * w, y = Math.floor(i / cols) * h + 34;
      k.drawImage(img, x, y, w, h);
      k.fillStyle = 'rgba(0,0,0,.6)'; k.fillRect(x + 6, y + 6, 230, 22); k.fillStyle = '#fff'; k.font = '14px monospace'; k.fillText(labels[i], x + 12, y + 22);
    }
    return c.toDataURL('image/png').split(',')[1];
  }, { b64, cols, rows, w, h, labels: shots.map(s => s.label), label });
  await p2.close();
  writeFileSync(join(out, `${name}.png`), Buffer.from(png, 'base64'));
}

async function walkTo(x, { tolerance = 0.15, max = 12000 } = {}) {
  let s = await state();
  const key = s.avatar.x < x ? 'ArrowRight' : 'ArrowLeft', dir = Math.sign(x - s.avatar.x);
  await page.keyboard.down(key);
  const t0 = Date.now();
  while (Date.now() - t0 < max) { s = await state(); if ((s.avatar.x - x) * dir >= -tolerance) break; await sleep(16); }
  await page.keyboard.up(key);
  await sleep(350);
  return state();
}

async function capture(n, every, labelFn) {
  const shots = [], samples = [];
  for (let i = 0; i < n; i++) {
    const s = await state();
    samples.push(s);
    shots.push({ buf: await page.screenshot(), label: labelFn(s, i) });
    await sleep(every);
  }
  return { shots, samples };
}

await page.goto(url + (url.includes('?') ? '&' : '?') + 'nopause');
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 30);
await page.evaluate(() => localStorage.removeItem('physica.v1'));
await page.reload();
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 30);
await page.mouse.click(640, 360);
await sleep(600);
writeFileSync(join(out, '00-inicio.png'), await page.screenshot());
step('inicio', { state: await state() });

// 1 — familiar fall at support A.
let s = await walkTo(-11.1);
step('en soporte A', { x: s.avatar.x });
await page.keyboard.press('e');
const fallA = await capture(8, 70, (st, i) => `A t≈${(st.t).toFixed(2)}s y=${st.stands[0].y.toFixed(2)}`);
await sheet('01-caida-familiar', fallA.shots, 4, 'Soporte A, fuera de la región: la esfera cae (marcas cada 0,1 s)');
await sleep(800);
const trA = await page.evaluate(() => window.__physica.world.traces.find(t => t.source === 'A'));
step('traza A', { marks: trA.marks.length, end: trA.end, y: trA.marks.map(m => +m.y.toFixed(3)) });

// 2 — release inside the region at support B.
s = await walkTo(-1.15);
step('en soporte B', { x: s.avatar.x });
await page.keyboard.press('e');
const riseB = await capture(12, 180, st => `B t≈${st.t.toFixed(2)}s y=${st.stands[1].y.toFixed(2)} vy=${st.stands[1].vy.toFixed(2)}`);
await sheet('02-subida-en-region', riseB.shots, 4, 'Soporte B, dentro de la región: soltada en reposo, sube, sale por arriba, frena y vuelve a entrar');
const trB = await page.evaluate(() => window.__physica.world.traces.find(t => t.source === 'B'));
step('traza B', { marks: trB.marks.length, y: trB.marks.map(m => +m.y.toFixed(3)), vy: trB.marks.map(m => +m.vy.toFixed(3)) });
// Reel back.
await page.keyboard.press('e');
await sleep(2500);
s = await state();
step('carrete', { standB: s.stands[1].state });
// Release again: the same path?
await page.keyboard.press('e');
await sleep(2000);
const trB2 = await page.evaluate(() => { const ts = window.__physica.world.traces.filter(t => t.source === 'B'); return ts[ts.length - 1]; });
const same = trB2.marks.slice(0, 15).every((m, i) => Math.abs(m.y - trB.marks[i].y) < 1e-9);
step('repetición B', { identicalFirst15: same });

// 3 — the explorer's own crossing, walking off the lip.
s = await walkTo(-2.0);
await page.keyboard.down('ArrowRight');
const traj = [], crossShots = [];
const t0 = Date.now();
let k = 0;
while (Date.now() - t0 < 4200) {
  const st = await state();
  traj.push({ ms: Date.now() - t0, ...st.avatar });
  if (k++ % 4 === 0 && crossShots.length < 16) crossShots.push({ buf: await page.screenshot(), label: `x=${st.avatar.x.toFixed(2)} y=${(st.avatar.y - 0.55).toFixed(2)} vy=${st.avatar.vy.toFixed(2)}` });
  await sleep(20);
}
await page.keyboard.up('ArrowRight');
await sleep(800);
await sheet('03-cruce', crossShots, 4, 'Cruce: caminar fuera del borde, la región eleva al explorador, sale por arriba y baja en la Terraza');
s = await state();
step('cruce', { final: s.avatar, landedOnTerrace: s.avatar.x > 4.6 && Math.abs(s.avatar.y - 0.55 - 3) < 0.02 && s.avatar.grounded });
writeFileSync(join(out, 'trayectoria-cruce.json'), JSON.stringify(traj));

// 4 — Bitácora and save/load.
writeFileSync(join(out, '04-terraza.png'), await page.screenshot());
await page.keyboard.press('j'); await sleep(400);
writeFileSync(join(out, '05-bitacora.png'), await page.screenshot());
await page.keyboard.press('j');
const before = (await state()).journal;
await page.reload();
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 30);
const after = (await state()).journal;
step('guardado', { before, after, persisted: JSON.stringify(before) === JSON.stringify(after) });

// 5 — pause and resume: the simulation must not jump.
await page.evaluate(() => window.__physica.setPaused(true));
const p0 = (await state()).step; await sleep(1500); const p1 = (await state()).step;
await page.evaluate(() => window.__physica.setPaused(false));
await sleep(300); const p2 = (await state()).step;
step('pausa', { stepsWhilePaused: p1 - p0, stepsAfterResume300ms: p2 - p1 });

// 6 — frame times at the cascade, idle, 6 s.
await page.evaluate(() => { const w = window.__physica.world; w.avatar.x = -1.2; w.avatar.px = -1.2; w.avatar.y = 0.55; });
await sleep(1500);
await page.evaluate(() => window.__physica.resetFrames());
await sleep(6000);
const stats = await page.evaluate(() => window.__physica.stats());
const gl = await page.evaluate(() => { const c = document.createElement('canvas').getContext('webgl2'); const d = c.getExtension('WEBGL_debug_renderer_info'); return d ? c.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown'; });
step('rendimiento', { stats, renderer: gl, viewport: '1280x720', note: 'headless Chrome; frame interval includes vsync wait' });
writeFileSync(join(out, '06-cascada.png'), await page.screenshot());
// Close-ups (inspection camera): instruments at the lip, moss on the chasm walls.
await page.evaluate(() => window.__physica.inspect(0.3, 2.6, 5.5)); await sleep(2500);
writeFileSync(join(out, '07-plomadas.png'), await page.screenshot());
await page.evaluate(() => window.__physica.inspect(2.2, -2.2, 7)); await sleep(2500);
writeFileSync(join(out, '08-musgo-sima.png'), await page.screenshot());
await page.evaluate(() => window.__physica.inspect(null));

report.errors = errors; report.consoleWarnings = logs; report.finished = new Date().toISOString();
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log('errors', errors.length, 'warnings', logs.length);
await browser.close();
