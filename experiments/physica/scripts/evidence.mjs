// End-to-end evidence run with real keyboard events (CDP), from a clean start:
// familiar fall at support A, release inside the region at support B, reel, the explorer's
// own crossing onto the Terraza, Bitácora, reload (save/load), pause/resume, frame times.
// Writes contact sheets (frame sequences), trajectories and a report to an output folder.
//   node scripts/evidence.mjs [url] [outDir]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadavg, cpus } from 'node:os';

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
const report = { url, started: new Date().toISOString(), steps: [], machine: { cores: cpus().length, loadavgAtStart: loadavg() } };
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
await page.evaluate(() => { localStorage.removeItem('physica.v1'); localStorage.removeItem('physica.v2'); });
await page.reload();
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 30);
await page.mouse.click(640, 360);
await sleep(600);
writeFileSync(join(out, '00-inicio.png'), await page.screenshot());
step('inicio', { state: await state() });

const standX = await page.evaluate(() => Object.fromEntries(window.__physica.world.stands.map(s => [s.id, s.x])));
// 1 — familiar fall at support A.
let s = await walkTo(standX.A - 0.05);
step('en soporte A', { x: s.avatar.x });
await page.keyboard.press('e');
const fallA = await capture(8, 70, (st, i) => `A t≈${(st.t).toFixed(2)}s y=${st.stands[0].y.toFixed(2)}`);
await sheet('01-caida-familiar', fallA.shots, 4, 'Soporte A, fuera de la región, a 1,8 m: la esfera cae (marcas cada 0,1 s)');
await sleep(800);
const trA = await page.evaluate(() => window.__physica.world.traces.find(t => t.source === 'A'));
step('traza A', { marks: trA.marks.length, end: trA.end, y: trA.marks.map(m => +m.y.toFixed(3)) });

// 2 — B inside the region from the same height: rises, no bell.
s = await walkTo(standX.B + 0.05);
step('en soporte B', { x: s.avatar.x });
await page.keyboard.press('e');
const riseB = await capture(10, 160, st => `B y=${st.stands[1].y.toFixed(2)} vy=${st.stands[1].vy.toFixed(2)}`);
await sheet('02-subida-desde-2m', riseB.shots, 5, 'Soporte B desde 2,0 m (misma altura que A), dentro de la región: sube, no llega a la campana');
let bells = await page.evaluate(() => window.__physica.events.filter(e => e.type === 'bell').length);
const trB = await page.evaluate(() => window.__physica.world.traces.find(t => t.source === 'B'));
step('traza B desde 2 m', { peak: Math.max(...trB.marks.map(m => m.y)), bells });
// Reel back, then lower the clamp to −1 m (six steps of 0.5 m) and release again.
await page.keyboard.press('e'); await sleep(1800);
for (let i = 0; i < 6; i++) { await page.keyboard.press('ArrowDown'); await sleep(120); }
const clampB = await page.evaluate(() => window.__physica.world.stands[1].clampY);
step('pinza B bajada', { clampY: clampB, state: (await state()).stands[1].state });
await page.keyboard.press('e');
const riseB2 = await capture(10, 200, st => `B y=${st.stands[1].y.toFixed(2)} vy=${st.stands[1].vy.toFixed(2)}`);
await sheet('02b-subida-desde-menos-1m', riseB2.shots, 5, 'Soporte B desde −1,0 m: sube más alto y hace sonar la campana a la altura de la Terraza');
bells = await page.evaluate(() => window.__physica.events.filter(e => e.type === 'bell').length);
const trB2 = await page.evaluate(() => { const ts = window.__physica.world.traces.filter(t => t.source === 'B'); return ts[ts.length - 1]; });
step('traza B desde −1 m', { from: trB2.marks[0].y, peak: Math.max(...trB2.marks.map(m => m.y)), bells });
// Repeatability: reel, release again from the same place, compare the first marks.
await page.keyboard.press('e'); await sleep(2600);
await page.keyboard.press('e'); await sleep(1400);
const trB3 = await page.evaluate(() => { const ts = window.__physica.world.traces.filter(t => t.source === 'B'); return ts[ts.length - 1]; });
step('repetición B', { identicalFirst8: trB3.marks.slice(0, 8).every((m, i) => Math.abs(m.y - trB2.marks[i].y) < 1e-9) });

// 3 — the explorer from the lip: rises, falls short (chalk mark), R returns to footing.
s = await walkTo(-2.0);
await page.evaluate(() => window.__physica.resetFrames());
await page.keyboard.down('ArrowRight');
const shortShots = [], shortTraj = [];
let t0 = Date.now(), k = 0, simStart = (await state()).t;
// Windows are measured in simulated time: screenshots stall the page, the simulation does not catch up.
while ((await state()).t - simStart < 3.6 && Date.now() - t0 < 30000) {
  const st = await state(); shortTraj.push({ ms: Date.now() - t0, simT: st.t - simStart, ...st.avatar });
  if (k++ % 4 === 0 && shortShots.length < 10) shortShots.push({ buf: await page.screenshot(), label: `pies=${(st.avatar.y - 0.55).toFixed(2)} vy=${st.avatar.vy.toFixed(2)}` });
  await sleep(20);
}
await page.keyboard.up('ArrowRight');
await sheet('03a-desde-el-borde-no-alcanza', shortShots, 5, 'Desde el borde: la región levanta al explorador, pero sus pies no llegan a la Terraza (4,4 m); queda una marca de tiza');
const apexes = await page.evaluate(() => window.__physica.events.filter(e => e.type === 'apex').map(e => ({ feet: +e.y.toFixed(2), centre: +e.centre.toFixed(2), from: e.from })));
await page.evaluate(() => window.__physica.inspect(3.6, 3.6, 6)); await sleep(1800);
writeFileSync(join(out, '03a2-tiza-y-linea-de-campana.png'), await page.screenshot());
await page.evaluate(() => window.__physica.inspect(null));
await sleep(300);
await page.keyboard.press('r'); await sleep(700);
s = await state();
step('desde el borde', { apexFeet: apexes, footingAfterR: s.avatar });
writeFileSync(join(out, 'trayectoria-desde-borde.json'), JSON.stringify(shortTraj));

// 3b — down the chain to −1.5 m (centre), let go, steer to the Terraza.
s = await walkTo(-0.35);
const offered = await page.evaluate(() => window.__physica.world.interactables().map(i => i.kind));
await page.keyboard.press('e'); await sleep(200);
const onChain = (await page.evaluate(() => window.__physica.world.avatar.heldBy?.type));
await page.keyboard.down('ArrowDown');
t0 = Date.now(); while (Date.now() - t0 < 4000) { const st = await state(); if (st.avatar.y <= -1.5) break; await sleep(16); }
await page.keyboard.up('ArrowDown');
await sleep(200);
const letGoAt = (await state()).avatar.y;
writeFileSync(join(out, '03b-en-la-cadena.png'), await page.screenshot());
await page.keyboard.press('e');
await page.keyboard.down('ArrowRight');
const traj = [], crossShots = [];
t0 = Date.now(); k = 0; simStart = (await state()).t;
while ((await state()).t - simStart < 6 && Date.now() - t0 < 40000) {
  const st = await state();
  traj.push({ ms: Date.now() - t0, simT: st.t - simStart, ...st.avatar });
  if (k++ % 4 === 0 && crossShots.length < 15) crossShots.push({ buf: await page.screenshot(), label: `x=${st.avatar.x.toFixed(2)} pies=${(st.avatar.y - 0.55).toFixed(2)} vy=${st.avatar.vy.toFixed(2)}` });
  if (st.avatar.x > 6 && st.avatar.grounded) break;
  await sleep(20);
}
await page.keyboard.up('ArrowRight');
await sleep(800);
await sheet('03c-cruce-por-la-cadena', crossShots, 5, 'Cadena: soltarse con el centro a −1,5 m; la región lo lleva más alto y llega a la Terraza');
s = await state();
step('cruce por la cadena', { offeredAtLip: offered, onChain, letGoCentreY: letGoAt, final: s.avatar, landedOnTerrace: s.avatar.x > 4.6 && Math.abs(s.avatar.y - 0.55 - 4.4) < 0.02 && s.avatar.grounded,
  mantles: await page.evaluate(() => window.__physica.events.filter(e => e.type === 'mantle').length) });
writeFileSync(join(out, 'trayectoria-cruce.json'), JSON.stringify(traj));

// 4p — El Pozo (transfer): the same rule with two limits, all with the keyboard.
const solidUnder = () => page.evaluate(() => { const a = window.__physica.world.avatar; return a.supportSteps > 5 ? a.support?.solid?.id ?? null : null; });
async function holdUntil(key, pred, simSeconds = 8) {
  await page.keyboard.down(key);
  const t0s = (await state()).t, w0 = Date.now(); let ok = false;
  while ((await state()).t - t0s < simSeconds && Date.now() - w0 < 60000) { if (await pred()) { ok = true; break; } await sleep(20); }
  await page.keyboard.up(key); return ok;
}
async function wellAttempt(letGo, name, label) {
  await walkTo(10.65);
  await page.keyboard.press('e'); await sleep(150);
  const held = await page.evaluate(() => window.__physica.world.avatar.heldBy?.chain?.id);
  await holdUntil('ArrowDown', async () => (await state()).avatar.y <= letGo, 10);
  const at = (await state()).avatar.y;
  await page.keyboard.press('e');
  const shots = []; const t0s = (await state()).t; let outcome = null, k2 = 0;
  await page.keyboard.down('ArrowRight');
  while ((await state()).t - t0s < 6) {
    const st = await state(), on = await solidUnder();
    if (k2++ % 5 === 0 && shots.length < 10) shots.push({ buf: await page.screenshot(), label: `${label} hebilla=${st.avatar.y.toFixed(2)}` });
    if (on === 'mirador' || on === 'pozo-fondo') { outcome = on; break; }
    await sleep(20);
  }
  await page.keyboard.up('ArrowRight');
  if (!outcome) { // short: steer back to the Terraza
    await holdUntil('ArrowLeft', async () => (await solidUnder()) === 'terraza', 8);
    outcome = (await solidUnder()) === 'terraza' ? 'corto' : 'sin apoyo';
  }
  await sheet(name, shots, 5, `Pozo: ${label}`);
  return { held, letGoCentre: at, outcome };
}
// The Pozo's support first: the same instrument tells where the window is, before risking oneself.
await walkTo(10.1);
const pShots = [];
for (let i = 0; i < 2; i++) { await page.keyboard.press('ArrowDown'); await sleep(120); }
await page.keyboard.press('e');
let t0p = (await state()).t; while ((await state()).t - t0p < 1.6) { pShots.push({ buf: await page.screenshot(), label: `P desde 2,0 · y=${(await page.evaluate(() => window.__physica.world.stands.find(s => s.id === 'P').body.y)).toFixed(2)}` }); await sleep(250); if (pShots.length >= 5) break; }
const pBell = await page.evaluate(() => window.__physica.events.filter(e => e.type === 'bell' && e.bell === 'pozo').length);
await page.keyboard.press('e'); await sleep(2600);
for (let i = 0; i < 2; i++) { await page.keyboard.press('ArrowDown'); await sleep(120); }
await page.keyboard.press('e');
t0p = (await state()).t; while ((await state()).t - t0p < 1.6) { pShots.push({ buf: await page.screenshot(), label: `P desde 1,0 · y=${(await page.evaluate(() => window.__physica.world.stands.find(s => s.id === 'P').body.y)).toFixed(2)}` }); await sleep(250); if (pShots.length >= 10) break; }
const pEnd = await page.evaluate(() => window.__physica.world.stands.find(s => s.id === 'P').body.y);
await sheet('10-0-soporte-del-pozo', pShots, 5, 'Soporte P: desde 2,0 m sube y toca la campana del Mirador; desde 1,0 m cae al agua');
step('pozo: soporte P', { bellFrom2: pBell, endFrom1: pEnd, fellIntoWater: pEnd < -0.5 });
await page.keyboard.press('e'); await sleep(2000);
const wa = await wellAttempt(0.9, '10a-pozo-demasiado-abajo', 'soltarse a 0,9 m (debajo del fondo de la región)');
step('pozo: demasiado abajo', wa);
// Back up from the water: the chain from its foot.
await walkTo(11.5);
await page.keyboard.press('e'); await sleep(150);
await holdUntil('ArrowUp', async () => (await solidUnder()) === 'terraza', 10);
step('pozo: subir desde el agua', { on: await solidUnder(), avatar: (await state()).avatar });
const wb = await wellAttempt(2.5, '10b-pozo-demasiado-arriba', 'soltarse a 2,5 m');
step('pozo: demasiado arriba', wb);
const wc = await wellAttempt(1.5, '10c-pozo-en-la-ventana', 'soltarse a 1,5 m');
step('pozo: en la ventana', wc);
await sleep(1500);
writeFileSync(join(out, '10d-vista-desde-el-mirador.png'), await page.screenshot());
await sleep(5000);
// No dead end: down the steps and back up.
const down = await holdUntil('ArrowRight', async () => (await state()).avatar.x > 18.2, 8);
const up = await holdUntil('ArrowLeft', async () => (await state()).avatar.x < 15 && (await solidUnder()) === 'mirador', 8);
step('mirador: escalones', { down, up, avatar: (await state()).avatar, events: await page.evaluate(() => window.__physica.events.filter(e => e.type === 'step-up').length) });

// 3c — stepping back into the region from the Terraza, then holding ▶ (regression of iter 1).
await walkTo(5.6);
await page.keyboard.down('ArrowLeft'); await sleep(450); await page.keyboard.up('ArrowLeft');
await sleep(900);
await page.keyboard.down('ArrowRight');
const back = [];
for (let i = 0; i < 220; i++) { const st = await state(); back.push(st.avatar); if (st.avatar.x > 4.7 && st.avatar.grounded) break; await sleep(25); }
await page.keyboard.up('ArrowRight');
const bl = back[back.length - 1];
step('volver a la Terraza', { samples: back.length, final: bl, onTerrace: bl.x > 4.7 && bl.grounded && Math.abs(bl.y - 0.55 - 4.4) < 0.02 });
await page.evaluate(() => window.__physica.inspect(12.0, 2.2, 9)); await sleep(2200);
writeFileSync(join(out, '11-pozo-instrumentos.png'), await page.screenshot());
await page.evaluate(() => window.__physica.inspect(null));

// 4 — Bitácora and save/load.
writeFileSync(join(out, '04-terraza.png'), await page.screenshot());
await page.keyboard.press('j'); await sleep(400);
writeFileSync(join(out, '05-bitacora.png'), await page.screenshot());
await page.keyboard.press('j');
const before = (await state()).journal;
await page.reload();
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 30);
const reloaded = await state();
const after = reloaded.journal;
step('guardado', { before, after, persisted: JSON.stringify(before) === JSON.stringify(after), explorerAfterReload: reloaded.avatar, resumedOnTerrace: reloaded.avatar.x > 4.6 && reloaded.avatar.y > 4.4 });

// 5 — pause and resume: the simulation must not jump.
await page.evaluate(() => window.__physica.setPaused(true));
const p0 = (await state()).step; await sleep(1500); const p1 = (await state()).step;
await page.evaluate(() => window.__physica.setPaused(false));
await sleep(300); const p2 = (await state()).step;
step('pausa', { stepsWhilePaused: p1 - p0, stepsAfterResume300ms: p2 - p1 });

// 6 — frame times at the cascade, idle, 6 s.
await page.evaluate(() => { const w = window.__physica.world; w.avatar.x = -1.2; w.avatar.px = -1.2; w.avatar.y = 0.55; w.avatar.py = 0.55; });
await sleep(1500);
await page.evaluate(() => window.__physica.resetFrames());
await sleep(6000);
const stats = await page.evaluate(() => window.__physica.stats());
const gl = await page.evaluate(() => { const c = document.createElement('canvas').getContext('webgl2'); const d = c.getExtension('WEBGL_debug_renderer_info'); return d ? c.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown'; });
step('rendimiento', { stats, renderer: gl, viewport: '1280x720', note: 'headless Chrome; frame interval includes vsync wait' });
writeFileSync(join(out, '06-cascada.png'), await page.screenshot());
// 6b — frame times during a real crossing with no screenshots (worst case of this scene).
await page.evaluate(() => { const w = window.__physica.world, a = w.avatar; a.x = a.px = -3; a.y = a.py = 0.55; a.vx = a.vy = 0; });
await sleep(800);
await page.evaluate(() => window.__physica.resetFrames());
await page.keyboard.down('ArrowRight'); await sleep(4500); await page.keyboard.up('ArrowRight');
step('rendimiento-cruce', { stats: await page.evaluate(() => window.__physica.stats()), traces: (await state()).traces.length, final: (await state()).avatar, note: 'walk off the lip with no screenshots (the failing branch; the camera follows the full rise)' });
// Close-ups (inspection camera): instruments at the lip, moss on the chasm walls.
await page.evaluate(() => window.__physica.inspect(0.3, 2.6, 5.5)); await sleep(2500);
writeFileSync(join(out, '07-plomadas.png'), await page.screenshot());
await page.evaluate(() => window.__physica.inspect(2.2, -1.2, 9)); await sleep(2500);
writeFileSync(join(out, '08-sima-cadena-riel.png'), await page.screenshot());
await page.evaluate(() => window.__physica.inspect(2.5, 1.5, 22)); await sleep(2500);
writeFileSync(join(out, '09-plano-general.png'), await page.screenshot());
await page.evaluate(() => window.__physica.inspect(null));

report.errors = errors; report.consoleWarnings = logs; report.finished = new Date().toISOString(); report.machine.loadavgAtEnd = loadavg();
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log('errors', errors.length, 'warnings', logs.length);
await browser.close();
