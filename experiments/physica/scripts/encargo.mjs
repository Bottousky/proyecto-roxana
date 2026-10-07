// The jalón and the neighbour's errand (Hito B, B3, D23), driven with real keys: E to talk to the
// neighbour at the east stop; ◀ to the jalones' rack, E to take one; ▶ to the kerb's 10 m, E to plant
// it on the platform; to the west stop, ▲ aboard, E to set the recorder, a trip east standing in the
// car's middle (attempt 1: it misses); back west aboard; ▶ along the deck to 2.5 m of the tape,
// E to set the recorder, a trip east (attempt 2); J for the Bitácora. Setup only (declared): the
// city seen, the arch and the street's gate open, the explorer beside the neighbour.
//   node scripts/encargo.mjs [url] [outDir]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const url = process.argv[2] || 'http://127.0.0.1:4210/';
const out = process.argv[3] || 'encargo-out';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto(url + '?nopause&fresh&nointro');
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60);
const wait = ms => page.waitForTimeout(ms);
const st = () => page.evaluate(() => { const w = window.__physica.world, a = w.avatar, k = w.carriers[0]; return { t: +w.t.toFixed(2), x: +a.x.toFixed(2), z: +a.z.toFixed(2), on: a.support?.solid?.id || null, car: +k.x.toFixed(2), phase: k.phase, tape: +(a.x - (k.x - k.len / 2)).toFixed(2), rec: w.recorder.state, jalon: w.jalon.state, errand: w.errand.state, tries: w.errand.tries.length, prompt: document.getElementById('prompt').hidden ? null : document.getElementById('prompt-key').textContent + ' ' + document.getElementById('prompt-verb').textContent }; });
const frames = [];
const shot = async label => { const s = await st(), f = { label, ...s, file: `${String(frames.length).padStart(2, '0')}.png` }; frames.push(f); for (let k = 0; k < 2; k++) { try { await page.screenshot({ path: join(out, f.file), timeout: 10000 }); return; } catch { await wait(300); } } f.file = null; };
const until = async (key, cond, max = 2500) => { if (key) await page.keyboard.down(key); for (let k = 0; !cond(await st()) && k < max; k++) await wait(20); if (key) await page.keyboard.up(key); await wait(150); };
const tap = async (key, ms = 90) => { await page.keyboard.down(key); await wait(ms); await page.keyboard.up(key); await wait(200); };
const L = await page.evaluate(() => { const w = window.__physica.world, a = w.avatar, k = w.carriers[0], E = w.level.encargo; w.citySeen = true; for (const d of [w.doors[0], w.gates[0]]) { d.open = true; d.openT = d.swing; } a.x = a.px = E.vecina.x - 0.9; a.z = a.pz = E.vecina.z + 0.5; a.y = a.py = 4.4 + a.hh; a.vx = a.vy = a.vz = 0; return { stops: k.stops, len: k.len, rack: w.level.jalones, kerb0: k.kerb0 }; });
await wait(1200);
await shot('junto a la vecina');
await tap('KeyE'); await wait(400); await shot('el encargo');
await until('ArrowLeft', s => s.x < L.rack.x + 0.5); await shot('en el soporte de jalones');
await tap('KeyE'); await shot('con el jalón en la mano');
await until('ArrowRight', s => s.x > L.kerb0 + 10 - 0.35); await shot('junto al 10 del cordón');
await tap('KeyE'); await wait(300); await shot('jalón clavado en el andén');
// to the west stop; wait for the car there; aboard
await until(L.stops[0] < (await st()).x ? 'ArrowLeft' : 'ArrowRight', s => Math.abs(s.x - L.stops[0]) < 0.3);
await until(null, s => s.phase === 'parada' && Math.abs(s.car - L.stops[0]) < 0.01, 4000);
await until('ArrowUp', s => s.on === 'carro'); await wait(800);
await shot('a bordo, intento 1 (en el medio del carro)');
await tap('KeyE'); await shot('registrador armado');
await until(null, s => s.rec === 'on', 4000);
for (let i = 0; i < 12; i++) { await wait(1000); if ((await st()).rec === 'done') break; if (i % 3 === 0) await shot('viaje 1'); }
await until(null, s => s.rec === 'done', 4000); await wait(500);
await shot('llegada del intento 1: la tiza no queda en el jalón de la vecina');
await tap('KeyJ'); await wait(500); await shot('Bitácora tras el intento 1'); await tap('KeyJ');
// back west aboard, unrecorded
await until(null, s => s.phase !== 'parada', 4000);
await until(null, s => s.phase === 'parada' && Math.abs(s.car - L.stops[0]) < 0.01, 4000); await wait(300);
await shot('de vuelta en la parada oeste');
// ▶ along the deck to 2.5 m of the tape (short taps near the end)
await until('ArrowRight', s => s.tape > 2.3, 400);
for (let i = 0; i < 20 && (await st()).tape < 2.45; i++) await tap('ArrowRight', 40);
await shot('parado en 2,5 de la cinta');
await tap('KeyE'); await shot('registrador armado, intento 2');
await until(null, s => s.rec === 'on', 4000);
for (let i = 0; i < 12; i++) { await wait(1000); if ((await st()).rec === 'done') break; if (i % 3 === 0) await shot('viaje 2'); }
await until(null, s => s.rec === 'done', 4000); await wait(500);
await shot('llegada del intento 2: la tiza al pie del jalón');
await wait(1500); await shot('«¿y ahora?»: su jalón sigue en 21,5 mientras el carro espera');
// round 2: back west, ◀ along the deck to 1.3 m of the tape (her jalón now at 20.3)
await until(null, s => s.phase !== 'parada', 4000);
await until(null, s => s.phase === 'parada' && Math.abs(s.car - L.stops[0]) < 0.01, 4000); await wait(300);
await until('ArrowLeft', s => s.tape < 1.5, 400);
for (let i = 0; i < 20 && (await st()).tape > 1.35; i++) await tap('ArrowLeft', 40);
await shot('parado en 1,3 de la cinta');
await tap('KeyE');
await until(null, s => s.rec === 'on', 4000);
for (let i = 0; i < 12; i++) { await wait(1000); if ((await st()).rec === 'done') break; if (i % 4 === 0) await shot('viaje 3'); }
await until(null, s => s.rec === 'done', 4000); await wait(500);
await shot('llegada de la ronda 2');
await tap('KeyJ'); await wait(500); await shot('Bitácora: encargo cumplido');
await page.evaluate(() => { const el = document.querySelector('.journal'); if (el) el.scrollTop = el.scrollHeight; }); await wait(300); await shot('Bitácora: el final');
await tap('KeyJ');
const s = await page.evaluate(() => ({ journal: window.__physica.state().journal, errand: window.__physica.world.errand, last: window.__physica.world.recorder.marks.at(-1) }));
// inspection: the kerb at the east stop from above, the chalk at her jalón
await page.evaluate(({ x }) => window.__physica.look([x, 8.2, -36.6], [x, 4.4, -40.3]), { x: L.kerb0 + 21.5 });
await wait(1500); await page.screenshot({ path: join(out, 'vista-jalon-de-la-vecina.png') });
await page.evaluate(() => window.__physica.look(null));
writeFileSync(join(out, 'encargo.json'), JSON.stringify({ frames, ...s, errors }, null, 1));
for (const f of frames) console.log(f.file, f.label, '| x', f.x, 'z', f.z, f.on, '| carro', f.car, f.phase, 'cinta', f.tape, '| reg', f.rec, 'jalón', f.jalon, 'encargo', f.errand, f.tries, '|', f.prompt);
console.log('journal', JSON.stringify(s.journal)); console.log('errand', JSON.stringify(s.errand)); console.log('errors', errors);
await browser.close();
