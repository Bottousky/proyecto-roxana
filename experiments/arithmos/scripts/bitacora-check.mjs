// Prueba de la Bitácora en el navegador: una partida completa (state.json de un bot) a nombre de un alumno de Dirección,
// con fotos reales de la pizarra de algunos capítulos; abre el cuaderno, lo captura en escritorio y en teléfono acostado,
// y descarga los dos PDF (pliegos A4 y libro A5). También prueba el nombre al empezar.
// Uso: node scripts/bitacora-check.mjs <salida> <state.json> [--fotos=1,6,12] [--nombre=Manuel]
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {launch} from './browser.mjs';
import {startServer} from './serve.mjs';

const args = process.argv.slice(2);
const [out, statePath] = args.filter(a => !a.startsWith('--'));
const val = (k, d) => (args.find(a => a.startsWith(`--${k}=`)) || '').split('=')[1] ?? d;
const fotos = (val('fotos', '1,6,12') || '').split(',').filter(Boolean).map(Number);
const nombre = val('nombre', 'Manuel');
await mkdir(out, {recursive: true});
const state = JSON.parse(await readFile(statePath, 'utf8'));
state.notes = {c1: 'Me pregunto si con colecciones que no se terminan también se puede emparejar.', c6: 'Creo que sumar lo mismo a los dos lados es como mover la balanza sin que se incline.'};
const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await launch();
const errors = [];
const SCHOOL = JSON.stringify({version: 1, name: nombre, crest: 'compas', createdAt: Date.now(), rooms: ['direccion'], watched: [], stageSeen: 0, welcomed: true, settings: {}});

// 1. fotos reales: el último segmento de cada capítulo pedido, unos segundos, y la pizarra como la guardaría addJournal
const photos = {};
for (const n of fotos) {
  const page = await browser.newPage({viewport: {width: 1600, height: 900}});
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(base);
  await page.waitForFunction(() => window.__ready === true);
  const last = await page.evaluate(async n => (await import('/src/chapters.js')).CHAPTERS[n].segments.at(-1).id, n);
  await page.goto(`${base}?seg=${last}`);
  await page.waitForFunction(() => window.__ready === true);
  const end = Date.now() + 25000;
  while (Date.now() < end) {
    await page.evaluate(() => { const g = window.__game; if (g?.ui.waiting && !g.ui.typing) g.ui.advance(); const o = [...document.querySelectorAll('#choices button:not([disabled])')]; if (o.length) o[0].click(); }).catch(() => {});
    await page.waitForTimeout(300);
  }
  photos[`c${n}`] = await page.evaluate(() => window.__game.photographBoard());
  await page.close();
}

// 2. el cuaderno con la partida completa
async function open(viewport, shots) {
  const context = await browser.newContext({viewport, acceptDownloads: true});
  await context.addInitScript(([s, school, ph]) => {
    localStorage.setItem('roxana.arithmos.v1', s);
    localStorage.setItem('roxana.escuela.v1', school);
    localStorage.setItem('roxana.arithmos.fotos.v1', ph);
  }, [JSON.stringify(state), SCHOOL, JSON.stringify(photos)]);
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base);
  await page.waitForFunction(() => window.__ready === true);
  // desde el título (la partida está terminada): Opciones → Bitácora
  await page.evaluate(() => window.__game.ui.showPause(true, 'journal'));
  await page.waitForTimeout(400);
  for (const [name, id] of shots) {
    await page.click(`.bt-tab[data-bt-page="${id}"]`);
    await page.waitForTimeout(500);
    await page.screenshot({path: `${out}/${name}.png`});
  }
  return {context, page};
}
const {context, page} = await open({width: 1600, height: 900}, [['escritorio-portada', 'portada'], ['escritorio-c1', 'c1'], ['escritorio-c6', 'c6'], ['escritorio-c12', 'c12'], ['escritorio-c3-sin-foto', 'c3']]);
// la nota propia se escribe y se guarda en la partida
await page.click('.bt-tab[data-bt-page="c2"]');
await page.fill('textarea[data-note-for="c2"]', 'El cero guarda el lugar: ¿y si no hubiera cero?');
await page.waitForTimeout(500);
const savedNote = await page.evaluate(() => JSON.parse(localStorage.getItem('roxana.arithmos.v1')).notes?.c2);
const pdfs = {};
for (const layout of ['pliegos', 'libro']) {
  const t0 = Date.now();
  const [dl] = await Promise.all([page.waitForEvent('download', {timeout: 600000}), page.click(`[data-bt-download="${layout}"]`)]);
  const file = `${out}/${dl.suggestedFilename()}`;
  await dl.saveAs(file);
  const bytes = await readFile(file);
  pdfs[layout] = {file, kb: Math.round(bytes.length / 1024), pages: (bytes.toString('latin1').match(/\/Type \/Page\b/g) || []).length, seconds: Math.round((Date.now() - t0) / 1000)};
}
await context.close();
await (await open({width: 844, height: 390}, [['telefono-c1', 'c1'], ['telefono-portada', 'portada']])).context.close();

// 3. el nombre al empezar: viene el de Dirección; si se cambia, cambia también allá
const ctx2 = await browser.newContext({viewport: {width: 1600, height: 900}});
await ctx2.addInitScript(school => { if (!sessionStorage.getItem('x')) { localStorage.setItem('roxana.escuela.v1', school); sessionStorage.setItem('x', '1'); } }, SCHOOL);
const p2 = await ctx2.newPage();
await p2.goto(base);
await p2.waitForFunction(() => window.__ready === true);
await p2.click('#title [data-act=new]');
const prefilled = await p2.inputValue('#owner-name');
await p2.screenshot({path: `${out}/nombre-al-empezar.png`});
await p2.fill('#owner-name', `${nombre} G.`);
await p2.click('#title .owner-form button[type=submit]');
await p2.waitForTimeout(800);
const after = await p2.evaluate(() => ({owner: window.__game.state.owner, school: JSON.parse(localStorage.getItem('roxana.escuela.v1')).name, shown: window.__game.owner()}));
await ctx2.close();

await browser.close();
server.close();
const summary = {errors, savedNote, pdfs, prefilled, after, photos: Object.keys(photos)};
await writeFile(`${out}/summary.json`, JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary, null, 1));
