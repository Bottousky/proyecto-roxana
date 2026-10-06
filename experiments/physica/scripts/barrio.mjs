// The transition 2.5D → 3D (Hito B, B2), driven with real keys: to the walled arch, E to open it,
// ▲ through the passage into the neighbourhood, ◀▶▲▼ around the square, ▼ back to the Terraza and
// ◀ along it as before. Frames every few tenths of simulated time, with the explorer's state.
// Setup only (declared): the explorer is placed on the Mirador (the city seen) and then on the
// Terraza west of the arch; everything after that is keys.
//   node scripts/barrio.mjs [url] [outDir]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const url = process.argv[2] || 'http://127.0.0.1:4210/';
const out = process.argv[3] || 'barrio-out';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto(url + '?nopause&fresh&nointro');
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60);
const wait = ms => page.waitForTimeout(ms);
const st = () => page.evaluate(() => { const w = window.__physica.world, a = w.avatar; return { t: w.t, x: +a.x.toFixed(2), z: +a.z.toFixed(2), feet: +(a.y - a.hh).toFixed(2), on: a.support?.solid?.id || null, door: w.doors[0]?.open, prompt: document.getElementById('prompt').hidden ? null : document.getElementById('prompt-key').textContent + ' ' + document.getElementById('prompt-verb').textContent }; });
const put = (x, y) => page.evaluate(({ x, y }) => { const a = window.__physica.world.avatar; a.x = a.px = x; a.y = a.py = y + a.hh; a.vx = a.vy = 0; }, { x, y });
const frames = [];
const shot = async (label) => { const s = await st(); frames.push({ label, ...s, file: `${String(frames.length).padStart(2, '0')}.png` }); await page.screenshot({ path: join(out, frames.at(-1).file) }); };
const simWait = async dt => { const t0 = (await st()).t; while ((await st()).t < t0 + dt) await wait(10); };
const hold = async (key, secs, every, label) => { await page.keyboard.down(key); for (let k = 0; k * every < secs; k++) { await simWait(every); await shot(`${label} ${((k + 1) * every).toFixed(1)} s`); } await page.keyboard.up(key); };
// setup: the city seen from the Mirador; then on the Terraza, west of the arch
await put(14, 5.15); await wait(800);
await put(5.4, 4.4); await wait(1500);
await shot('Terraza: el arco tapiado');
await page.keyboard.down('ArrowRight'); while ((await st()).x < 6.25) await wait(10); await page.keyboard.up('ArrowRight'); await wait(500);
await shot('junto a la palanca (aviso)');
await page.keyboard.down('KeyE'); await wait(80); await page.keyboard.up('KeyE');
for (let k = 0; k < 3; k++) { await simWait(0.6); await shot(`E: la palanca abre el arco ${(0.6 * (k + 1)).toFixed(1)} s`); }
await hold('ArrowUp', 5.4, 0.6, '▲ entrar');
await hold('ArrowLeft', 1.6, 0.8, '◀ en la plaza');
await hold('ArrowUp', 1.2, 0.6, '▲ hacia el observatorio');
await hold('ArrowRight', 2.4, 0.8, '▶ en la plaza');
await hold('ArrowDown', 7.2, 0.9, '▼ volver');
await hold('ArrowLeft', 1.2, 0.6, '◀ por la Terraza');
// Frame times inside the square and in the passage (6 s each), walking with the keys.
// (setup: back at the arch, which stays open; from there, keys)
await put(7.6, 4.4); await wait(800);
const perf = {};
for (const [name, key, hold] of [['plaza', 'ArrowUp', 5.0], ['pasaje', 'ArrowDown', 3.0]]) {
  await page.keyboard.down(key); await simWait(hold); await page.keyboard.up(key); await wait(300);
  await page.evaluate(() => window.__physica.resetFrames()); await wait(6000);
  perf[name] = await page.evaluate(() => { const s = window.__physica.stats(), a = window.__physica.world.avatar; return { ...s, z: +a.z.toFixed(2) }; });
}
console.log('perf', JSON.stringify(perf));
writeFileSync(join(out, 'barrio.json'), JSON.stringify({ frames, perf, errors }, null, 1));
for (const f of frames) console.log(f.file, f.label, '| x', f.x, 'z', f.z, 'pies', f.feet, f.on, f.door ? 'abierto' : 'cerrado', '|', f.prompt);
console.log('errors', errors);
await browser.close();
