// The cable car (Hito B, B3 «Introducción», D21), driven with real keys: from the square's north
// side, ▲ to the street's gate, E to open it, ▲ down the street to the platform, ◀▶ to where the
// car waits, ▲ to board it, a ride (frames while the kerb's marks go by), ▼ to step off at the other
// stop. Setup only (declared): the city seen and the arch open; the explorer placed in the square.
//   node scripts/carro.mjs [url] [outDir]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const url = process.argv[2] || 'http://127.0.0.1:4210/';
const out = process.argv[3] || 'carro-out';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto(url + '?nopause&fresh&nointro');
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60);
const wait = ms => page.waitForTimeout(ms);
const st = () => page.evaluate(() => { const w = window.__physica.world, a = w.avatar, k = w.carriers[0]; return { t: +w.t.toFixed(2), x: +a.x.toFixed(2), z: +a.z.toFixed(2), on: a.support?.solid?.id || null, car: +k.x.toFixed(3), phase: k.phase, gate: w.gates[0].open, prompt: document.getElementById('prompt').hidden ? null : document.getElementById('prompt-key').textContent + ' ' + document.getElementById('prompt-verb').textContent }; });
const frames = [];
const shot = async label => { const s = await st(), f = { label, ...s, file: `${String(frames.length).padStart(2, '0')}.png` }; frames.push(f); for (let k = 0; k < 2; k++) { try { await page.screenshot({ path: join(out, f.file), timeout: 10000 }); return; } catch { await wait(300); } } f.file = null; };
const until = async (key, cond, every = 25, max = 900) => { if (key) await page.keyboard.down(key); for (let k = 0; !cond(await st()) && k < max; k++) { if (every && k % every === 0) await shot(key || 'espera'); await wait(20); } if (key) await page.keyboard.up(key); await wait(200); };
const tap = async key => { await page.keyboard.down(key); await wait(90); await page.keyboard.up(key); await wait(150); };
// setup: the city seen, the arch open; the explorer at the square's north side, on the street's axis
await page.evaluate(() => { const w = window.__physica.world, a = w.avatar, d = w.doors[0]; w.citySeen = true; d.open = true; d.openT = d.swing; a.x = a.px = 11.05; a.z = a.pz = -19.5; a.y = a.py = 4.4 + a.hh; a.vx = a.vy = a.vz = 0; });
await wait(1500);
await shot('en la plaza, frente a la reja');
await until('ArrowUp', s => s.prompt?.includes('reja'), 15);
await shot('junto a la reja (aviso)');
await tap('KeyE');
for (let i = 0; i < 3; i++) { await wait(450); await shot('E: la reja se abre'); }
await until('ArrowUp', s => s.z < -37.5, 30);
await shot('en el andén');
// to the stop where the car is (or will be next)
const stops = await page.evaluate(() => window.__physica.world.carriers[0].stops), car0 = (await st()).car;
const stop = Math.abs(car0 - stops[0]) < Math.abs(car0 - stops[1]) ? stops[0] : stops[1]; // (the nearer stop to where the car is now)
await until(stop < (await st()).x ? 'ArrowLeft' : 'ArrowRight', s => Math.abs(s.x - stop) < 0.4, 20);
await shot('en la parada');
await until(null, s => s.phase === 'parada' && Math.abs(s.car - stop) < 0.01, 0, 2000);
await shot('el carro espera');
await until('ArrowUp', s => s.on === 'carro', 10);
await shot('a bordo');
await until(null, s => s.phase !== 'parada', 0, 2000);
for (let i = 0; i < 16; i++) { await wait(500); await shot('viaje'); if ((await st()).phase === 'parada') break; }
await until(null, s => s.phase === 'parada', 0, 2000);
await shot('llegó');
await until('ArrowDown', s => s.on === 'anden', 10);
await shot('abajo, en la otra parada');
writeFileSync(join(out, 'carro.json'), JSON.stringify({ frames, errors }, null, 1));
for (const f of frames) console.log(f.file, f.label, '| x', f.x, 'z', f.z, f.on, '| carro', f.car, f.phase, '|', f.prompt);
console.log('errors', errors);
await browser.close();
