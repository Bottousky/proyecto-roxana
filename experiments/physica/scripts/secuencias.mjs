// Pose sequences of the explorer at the play camera, driven with real keys: walking and
// braking, walking off the Orilla's lip (falling, the startle, suspended in the region), going
// down the chain against the pull and letting go, carrying and pushing a sphere, treading
// water in the Pozo. Each frame is a crop around the explorer at the real play scale (1x),
// labelled with the pose the model chose. Teleports only set up each sequence's start
// (development inspection); the motion in each sequence comes from the keys.
//   node scripts/secuencias.mjs [url] [outDir]
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:4210/';
const out = process.argv[3] || 'secuencias-out';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto(url + (url.includes('?') ? '&' : '?') + 'nopause&fresh&nointro');
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60);
await page.addStyleTag({ content: '#pause { display: none !important; }' });
const wait = ms => page.waitForTimeout(ms);
// A press as long as a finger's (a down and up within one frame can fall between two samples).
const tap = async key => { await page.keyboard.down(key); await wait(80); await page.keyboard.up(key); };
const put = (x, y) => page.evaluate(({ x, y }) => {
  const w = window.__physica.world, a = w.avatar; a.heldBy = null; a.x = a.px = x; a.y = a.py = y + a.hh; a.vx = a.vy = 0;
}, { x, y });
const state = () => page.evaluate(() => { const a = window.__physica.world.avatar, e = window.__physica.explorer; return { pose: e.poseState + (e.poseOverlay || ''), x: a.x, y: a.y, vx: a.vx, vy: a.vy, t: window.__physica.world.t }; });
const simT = () => page.evaluate(() => window.__physica.world.t);
const seqs = [];
let cur = null;
const begin = (title) => { cur = { title, frames: [] }; seqs.push(cur); };
// A frame is taken with the simulation paused, so it shows exactly the state it is labelled with.
const frame = async () => {
  await page.evaluate(() => window.__physica.setPaused(true)); await wait(60);
  const st = await state();
  const c = await page.evaluate(() => { const a = window.__physica.world.avatar; return window.__physica.screenOf(a.x, a.y); });
  const W = 200, H = 200, x = Math.round(Math.max(0, Math.min(1280 - W, c.x - W / 2))), y = Math.round(Math.max(0, Math.min(720 - H, c.y - H / 2)));
  const buf = await page.screenshot({ clip: { x, y, width: W, height: H } });
  cur.frames.push({ b64: buf.toString('base64'), pose: st.pose, info: `t ${st.t.toFixed(2)} vx ${st.vx.toFixed(1)} vy ${st.vy.toFixed(1)}` });
  await page.evaluate(() => window.__physica.setPaused(false));
};
// n frames, one every `dt` seconds of simulated time (independent of how slow the capture is).
const film = async (n, dt) => {
  for (let i = 0; i < n; i++) {
    await frame();
    if (i < n - 1) { const t0 = await simT(); while ((await simT()) < t0 + dt) await wait(8); }
  }
};
const until = async (cond, maxMs = 6000) => { const t0 = Date.now(); while (Date.now() - t0 < maxMs) { if (await page.evaluate(cond)) return true; await wait(30); } return false; };

// 1. Walking, braking (reversing at full speed), standing.
begin('Orilla: caminar, frenar en seco, quedarse quieto');
await put(-12, 0); await wait(900);
await page.keyboard.down('ArrowRight'); await wait(500); await film(2, 0.15);
await page.keyboard.up('ArrowRight'); await page.keyboard.down('ArrowLeft'); await film(4, 0.06);
await page.keyboard.up('ArrowLeft'); await wait(500); await film(1, 0);

// 1b. A landing: dropped from 1.6 m onto the Orilla, filmed around the touchdown.
begin('Aterrizaje: caer 1,6 m sobre la Orilla');
await put(-12, 1.6); await page.evaluate(() => { const a = window.__physica.world.avatar; a.supportSteps = 0; });
await wait(40); // one rendered frame first: while paused the model is not updated
await film(14, 0.06);
await wait(500);

// 2. Off the lip: the familiar fall, the startle at the edge of the region, suspended inside it.
begin('Desde el borde: cae, se sobresalta al entrar a la región, queda suspendido');
await put(-1.4, 0); await wait(900);
await page.keyboard.down('ArrowRight');
await until(() => window.__physica.world.avatar.x > 0.1);
await page.keyboard.up('ArrowRight');
await film(12, 0.16);
await tap('KeyR'); await wait(800);

// 3. The chain: pulling down against the upward pull (effort), letting go, rising, landing.
begin('La cadena: bajar contra la región (esfuerzo), soltarse, subir, aterrizar en la Terraza');
await page.evaluate(() => { window.__physica.world.shortSeen = true; });
await put(-0.3, 0); await wait(700);
await tap('KeyE'); await wait(300);
await page.keyboard.down('ArrowDown'); await wait(900); await film(4, 0.25);
await until(() => window.__physica.world.avatar.y < -1.6, 4000);
await page.keyboard.up('ArrowDown'); await wait(200);
// Let go and steer toward the Terraza, as a player does.
await tap('KeyE'); await page.keyboard.down('ArrowRight');
await film(9, 0.17);
await until(() => window.__physica.world.avatar.supportSteps > 0, 3000); await film(2, 0.08);
await page.keyboard.up('ArrowRight'); await wait(400);

// 4. Carrying a sphere from the table, dropping it, pushing it.
begin('Una esfera: tomarla, llevarla, soltarla y empujarla');
await put(-6.3, 0); await wait(800);
await page.keyboard.down('ArrowRight'); await until(() => window.__physica.world.avatar.x > -5.6, 3000); await page.keyboard.up('ArrowRight'); await wait(300);
await tap('KeyE'); await wait(400);
await page.keyboard.down('ArrowRight'); await wait(300); await film(2, 0.2); await page.keyboard.up('ArrowRight');
await wait(400); await tap('KeyE'); await wait(900); // dropped while standing: it lands in front
await page.keyboard.down('ArrowRight'); await until(() => window.__physica.explorer.poseState === 'empujar', 2500); await film(3, 0.12); await page.keyboard.up('ArrowRight');

// 5. The Pozo's water: not footing; the explorer treads water.
begin('El agua del Pozo: flotar (no es apoyo firme)');
await put(11.8, -0.95); await wait(1200); await film(3, 0.3);
await tap('KeyR'); await wait(500);

const log = await page.evaluate(() => window.__physica.explorer.poseLog);
// Sheet: one row per sequence; frames at 2× with pixelated scaling (the real 1× pixels).
const p2 = await browser.newPage({ viewport: { width: 2300, height: 400 } });
const rows = seqs.map(s => `<h2>${s.title}</h2><div class="row">${s.frames.map(f => `<figure><img src="data:image/png;base64,${f.b64}"><figcaption><b>${f.pose}</b> ${f.info}</figcaption></figure>`).join('')}</div>`).join('');
await p2.setContent(`<html><body style="margin:0;padding:10px;background:#1a120d;color:#f4e6cf;font:15px system-ui">
  <style>h2{font-size:18px;margin:14px 0 6px} .row{display:flex;gap:6px;flex-wrap:wrap} figure{margin:0} img{width:400px;height:400px;image-rendering:pixelated;display:block} figcaption{font-size:14px;padding:2px 0} b{color:#ffd27a}</style>
  ${rows}</body></html>`);
await p2.waitForTimeout(300);
await p2.screenshot({ path: join(out, 'secuencias.png'), fullPage: true });
await p2.close();
for (const s of seqs) writeFileSync(join(out, `${s.title.split(':')[0].replace(/\s+/g, '-').toLowerCase()}.json`), JSON.stringify(s.frames.map(f => ({ pose: f.pose, info: f.info }))));
console.log(JSON.stringify(seqs.map(s => ({ title: s.title, poses: s.frames.map(f => f.pose) })), null, 1));
console.log('pose time (s):', JSON.stringify(Object.fromEntries(Object.entries(log).map(([k, v]) => [k, +v.toFixed(2)]))));
console.log('errors', errors);
await browser.close();
