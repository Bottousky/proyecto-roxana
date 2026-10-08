// Captura de una prueba del Animation Lab: cuadros a tiempos exactos, hoja de contactos, recortes, métricas y sondas.
// Uso: node scripts/animlab-capture.mjs <test> <carpeta> [--frames=12] [--times=0.5,1,2] [--size=1600x900] [--dpr=1]
//      [--crop=x,y,w,h (px CSS del cuadro final, se capturan con dpr 3)] [--video]
import {chromium} from 'playwright';
import {mkdir, writeFile, readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {startServer} from './serve.mjs';

const [, , test = '01', out = '../../artifacts/arithmos/animlab/tmp', ...rest] = process.argv;
const opt = Object.fromEntries(rest.map(a => { const [k, v = 'true'] = a.replace(/^--/, '').split('='); return [k, v]; }));
const [W, H] = (opt.size || '1600x900').split('x').map(Number);
const dpr = Number(opt.dpr || 1);
await mkdir(join(out, 'frames'), {recursive: true});
const port = 4300 + Math.floor(Math.random() * 400);
const server = await startServer(port);
const browser = await chromium.launch({channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu']});
const errors = [];
const extra = opt.q ? `&${opt.q}` : '';
async function open(scale, video = false) {
  const ctx = await browser.newContext({viewport: {width: W, height: H}, deviceScaleFactor: scale, ...(video ? {recordVideo: {dir: join(out, 'video'), size: {width: W / 2, height: H / 2}}} : {})});
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${port}/animlab/?test=${test}&capture=1${video ? '&play=1' : '&t=0'}${extra}`);
  await page.waitForFunction(() => window.__ready === true, null, {timeout: 20000});
  return {ctx, page};
}
const {ctx, page} = await open(dpr);
// una escena interactiva que espera al jugador tiene duración infinita: se acota (último instante pedido + 1 s, o --maxdur)
const rawDur = await page.evaluate(() => window.__lab.duration);
const dur = Number.isFinite(rawDur) ? rawDur : Number(opt.maxdur || (opt.times ? Math.max(...opt.times.split(',').map(Number)) + 1 : 30));
const n = Number(opt.frames || 12);
const times = opt.times ? opt.times.split(',').map(Number) : Array.from({length: n}, (_, i) => +(dur * i / (n - 1)).toFixed(3));
const shots = [];
const ms = [];
for (const [i, t] of times.entries()) {
  ms.push(await page.evaluate(t => window.__lab.seek(t), t));
  const f = join(out, 'frames', `${String(i).padStart(2, '0')}-t${t.toFixed(2)}.png`);
  await page.screenshot({path: f});
  shots.push({t, f});
}
await page.evaluate(t => window.__lab.seek(t), dur);
await page.screenshot({path: join(out, 'final.png')});
const metrics = await page.evaluate(() => window.__lab.metrics());
// sondas a 60 Hz
const probes = await page.evaluate(d => { const o = []; for (let t = 0; t <= d; t += 1 / 60) o.push({t: +t.toFixed(4), p: window.__lab.probe(t)}); return o; }, dur);
await writeFile(join(out, 'probes.json'), JSON.stringify(probes));
await writeFile(join(out, 'metrics.json'), JSON.stringify({test, dur, times, renderMs: ms.map(m => +m.toFixed(2)), metrics, errors}, null, 1));
// sonido: partitura renderizada fuera de línea → WAV + envolvente RMS (para medir sincronía, no calidad)
if (opt.audio) {
  const a = await page.evaluate(() => window.__lab.audio());
  if (a) {
    await writeFile(join(out, 'score.wav'), Buffer.from(a.wav, 'base64'));
    await writeFile(join(out, 'rms.json'), JSON.stringify(a.rms));
  }
}
// recortes de detalle con más densidad
if (opt.crop) {
  const {ctx: c2, page: p2} = await open(3);
  for (const [k, spec] of opt.crop.split(';').entries()) {
    const [x, y, w, h, t] = spec.split(',').map(Number);
    await p2.evaluate(t => window.__lab.seek(t), Number.isFinite(t) ? t : dur);
    await p2.screenshot({path: join(out, `crop-${k}.png`), clip: {x, y, width: w, height: h}});
  }
  await c2.close();
}
// hoja de contactos
const cols = Number(opt.cols || 3);
const imgs = await Promise.all(shots.map(async s => `data:image/png;base64,${(await readFile(s.f)).toString('base64')}`));
const sheet = await browser.newPage({viewport: {width: 1800, height: 1000}});
await sheet.setContent(`<body style="margin:0;background:#111;color:#ccc;font:13px sans-serif"><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:4px;padding:4px">${shots.map((s, i) => `<figure style="margin:0;position:relative"><img src="${imgs[i]}" style="width:100%;display:block"><figcaption style="position:absolute;left:6px;top:4px;background:#000a;padding:1px 5px">t=${s.t.toFixed(2)}</figcaption></figure>`).join('')}</div></body>`);
await sheet.screenshot({path: join(out, 'sheet.png'), fullPage: true});
if (opt.video) {
  const v = await open(1, true);
  await v.page.waitForTimeout((dur + 1) * 1000);
  await v.ctx.close();
}
await ctx.close();
await browser.close();
server.close();
console.log(JSON.stringify({dur, frames: shots.length, errors, metrics}, null, 1));
