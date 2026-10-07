// The car's recorder (Hito B, B3, D22), driven with real keys: aboard at a stop, E sets the recorder;
// a trip standing still (chalk spreads along the kerb, ink stays in one place on the car's tape);
// at the other stop E again, and on the way back ◀ for a moment (walking on the running car); J for
// the Bitácora; ▼ off and ◀ along the platform to look at the chalk. A free-camera view of the whole
// kerb at the end (inspection). Setup only (declared): the city seen, the arch and the street's gate
// open, the explorer on the platform.
//   node scripts/registro.mjs [url] [outDir]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const url = process.argv[2] || 'http://127.0.0.1:4210/';
const out = process.argv[3] || 'registro-out';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto(url + '?nopause&fresh&nointro');
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60);
const wait = ms => page.waitForTimeout(ms);
const st = () => page.evaluate(() => { const w = window.__physica.world, a = w.avatar, k = w.carriers[0], r = w.recorder; return { t: +w.t.toFixed(2), x: +a.x.toFixed(2), z: +a.z.toFixed(2), on: a.support?.solid?.id || null, car: +k.x.toFixed(2), phase: k.phase, rec: r.state, marks: r.marks.length, prompt: document.getElementById('prompt').hidden ? null : document.getElementById('prompt-key').textContent + ' ' + document.getElementById('prompt-verb').textContent }; });
const frames = [];
const shot = async label => { const s = await st(), f = { label, ...s, file: `${String(frames.length).padStart(2, '0')}.png` }; frames.push(f); for (let k = 0; k < 2; k++) { try { await page.screenshot({ path: join(out, f.file), timeout: 10000 }); return; } catch { await wait(300); } } f.file = null; };
const until = async (key, cond, max = 1500) => { if (key) await page.keyboard.down(key); for (let k = 0; !cond(await st()) && k < max; k++) await wait(20); if (key) await page.keyboard.up(key); await wait(150); };
const tap = async key => { await page.keyboard.down(key); await wait(90); await page.keyboard.up(key); await wait(200); };
// setup: city seen, arch and gate open; the explorer on the platform at the first stop
const stops = await page.evaluate(() => { const w = window.__physica.world, a = w.avatar, k = w.carriers[0]; w.citySeen = true; for (const d of [w.doors[0], w.gates[0]]) { d.open = true; d.openT = d.swing; } a.x = a.px = k.stops[0]; a.z = a.pz = -38.6; a.y = a.py = 4.4 + a.hh; a.vx = a.vy = a.vz = 0; return k.stops; });
await wait(1200);
// the car waiting at the first stop (it waits there at the start; or comes back to it)
await until(null, s => s.phase === 'parada' && Math.abs(s.car - stops[0]) < 0.01);
await until('ArrowUp', s => s.on === 'carro'); await wait(900);
await shot('a bordo: «E Registrar el viaje»');
await tap('KeyE'); await shot('registrador listo (luz ámbar)');
await until(null, s => s.rec === 'on');
for (let i = 0; i < 12; i++) { await wait(1000); await shot('viaje registrado, parado'); if ((await st()).rec === 'done') break; }
await until(null, s => s.rec === 'done');
await shot('llegada: la tinta en un lugar, la tiza a lo largo del cordón');
await wait(600);
await tap('KeyE'); await shot('registrar la vuelta (el registro anterior sigue a la vista)');
await page.keyboard.down('ArrowLeft'); await wait(1700); await page.keyboard.up('ArrowLeft'); // to the deck's west end, while it waits
await until(null, s => s.rec === 'on');
await wait(2500); await shot('vuelta, antes de caminar');
// ▶ against the car (going west), at the careful pace aboard: as fast as the car, the other way
await page.keyboard.down('ArrowRight'); await wait(900); await shot('▶ caminando contra la marcha'); await wait(900); await shot('▶ caminando contra la marcha'); await page.keyboard.up('ArrowRight');
for (let i = 0; i < 10; i++) { await wait(1000); await shot('vuelta registrada'); if ((await st()).rec === 'done') break; }
await until(null, s => s.rec === 'done'); await wait(400);
await shot('llegada de la vuelta: la tinta corrida, la tiza');
await tap('KeyJ'); await wait(500); await shot('la Bitácora'); await tap('KeyJ');
await until('ArrowDown', s => s.on === 'anden'); await wait(300);
await until('ArrowRight', s => s.x > stops[0] + 4.5, 600); await shot('▶ por el andén: la tiza en el cordón');
await until('ArrowRight', s => s.x > stops[0] + 9, 600); await shot('▶ por el andén: la tiza en el cordón');
const rec = await page.evaluate(() => window.__physica.world.recorder);
const journal = await page.evaluate(() => window.__physica.state().journal);
// inspection: the whole kerb from above
await page.evaluate(({ a, b }) => window.__physica.look([(a + b) / 2, 10.5, -34.2], [(a + b) / 2, 4.4, -40.4]), { a: stops[0], b: stops[1] });
await wait(1500); await page.screenshot({ path: join(out, 'vista-cordon-con-tiza.png') });
await page.evaluate(() => window.__physica.look(null));
writeFileSync(join(out, 'registro.json'), JSON.stringify({ frames, lastRecord: rec, journal, errors }, null, 1));
for (const f of frames) console.log(f.file, f.label, '| x', f.x, 'z', f.z, f.on, '| carro', f.car, f.phase, '| reg', f.rec, f.marks, '|', f.prompt);
console.log('journal', JSON.stringify(journal)); console.log('errors', errors);
await browser.close();
