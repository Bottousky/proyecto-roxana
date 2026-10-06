// Partida automatizada del capítulo 1 usando sólo la interfaz (clics y teclado).
// Valida el sistema, no la comprensión de nadie.
//
//   node scripts/playthrough.mjs <salida> [--watch] [--video] [--reload] [--size=1600x900] [--touch] [--route=errores|directa]
//
// --watch: no salta animaciones (para video y ritmo). --reload: recarga la página en varias
// escenas y continúa desde el título. --route=errores provoca errores del jugador a propósito.

import {chromium} from 'playwright';
import {mkdir, writeFile} from 'node:fs/promises';
import {startServer} from './serve.mjs';

const args = process.argv.slice(2);
const out = args.find(a => !a.startsWith('--')) || 'out';
const opt = name => args.includes(`--${name}`);
const val = (name, d) => (args.find(a => a.startsWith(`--${name}=`)) || '').split('=')[1] || d;
const [W, H] = val('size', '1600x900').split('x').map(Number);
const route = val('route', 'errores');
const watch = opt('watch');
await mkdir(out, {recursive: true});

const port = 4300 + Math.floor(Math.random() * 300);
const server = await startServer(port);
const browser = await chromium.launch({channel: 'chrome'});
const context = await browser.newContext({
  viewport: {width: W, height: H}, deviceScaleFactor: 1, hasTouch: opt('touch'), isMobile: opt('touch') && W < 900,
});
const page = await context.newPage();
// Película: cuadros del screencast de Chrome con su tiempo real (sin ffmpeg).
const film = [];
if (opt('film')) {
  await mkdir(`${out}/film`, {recursive: true});
  const cdp = await context.newCDPSession(page);
  let last = 0;
  cdp.on('Page.screencastFrame', async f => {
    cdp.send('Page.screencastFrameAck', {sessionId: f.sessionId}).catch(() => {});
    const t = f.metadata.timestamp;
    if (t - last < 0.3) return;
    last = t;
    const name = `${String(film.length).padStart(5, '0')}.jpg`;
    film.push({name, t});
    await writeFile(`${out}/film/${name}`, Buffer.from(f.data, 'base64'));
  });
  await cdp.send('Page.startScreencast', {format: 'jpeg', quality: 55, maxWidth: 800, maxHeight: 450, everyNthFrame: 2});
}
const log = [];
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e.stack || e)));
const url = `http://127.0.0.1:${port}/`;
const startSeg = val('start', '');
await page.goto(startSeg ? `${url}?seg=${startSeg}` : url);
await page.waitForFunction(() => window.__ready === true, null, {timeout: 20000});
const t0 = Date.now();
const note = s => { const line = `[${((Date.now() - t0) / 1000).toFixed(1)}s] ${s}`; log.push(line); console.log(line); };
let shots = 0;
const shot = async name => {
  shots++;
  await page.screenshot({path: `${out}/${String(shots).padStart(3, '0')}-${name}.png`});
};

const read = () => page.evaluate(() => {
  const g = window.__game;
  const vis = el => el && !el.hidden;
  return {
    mode: g.mode,
    seg: g.state?.segment,
    paused: g.paused,
    waiting: !!g.ui.waiting,
    typing: !!g.ui.typing,
    caption: vis(document.querySelector('#caption')) ? document.querySelector('#caption .line').textContent : '',
    choices: vis(document.querySelector('#choices')) ? [...document.querySelectorAll('#choices button')].map(b => b.textContent) : [],
    prompt: document.querySelector('#choices .prompt')?.textContent || '',
    spots: [...document.querySelectorAll('#spots .spot')].map(b => ({id: b.dataset.id, label: b.getAttribute('aria-label'), disabled: b.getAttribute('aria-disabled') === 'true', selected: b.classList.contains('selected')})),
    skip: vis(document.querySelector('#skip-btn')),
    cinematic: g.cinematic,
    titleVisible: vis(document.querySelector('#title')),
    fatal: vis(document.querySelector('#fatal')) ? document.querySelector('#fatal').textContent : '',
    flags: g.state?.flags,
    fps: (() => { const f = g.frameTimes.slice(-120); return f.length ? f.length / f.reduce((a, b) => a + b, 0) : 0; })(),
  };
});

const clickSpot = async id => {
  await page.click(`#spots [data-id="${id}"]`, {timeout: 5000, force: true});
};

// Política de elecciones: primero errores plausibles, después lo coherente.
const tried = new Set();
function pickChoice(prompt, options) {
  const pref = route === 'errores' ? [
    ['espía', 'Quedarte'], ['te mira', 'Acercarte'],
    ['vuelven todos', 'Contarlos'],
    ['marca sola', 'sobra un punto', 'hice una marca de más', 'falta uno'],
    ['en fila, ¿alcanzan', 'No alcanzan'],
    ['Cómo lo sabés', 'Por cómo se ve'],
    ['asiento libre', 'más en la fila', 'misma cantidad', 'más asientos que en la fila'],
    ['apretados', 'Ninguno', 'Uno.'],
    ['decís a Punto', 'catorce cosas', 'nombra a dos', 'nombra a catorce'],
    ['', '¿Quién sos?'],
    ['Dos hileras', 'Hoy llegó más'],
    ['cuarto vacío', 'Nada:', 'espacio', 'Un 0'],
    ['entre el 3 y el 2', 'Es una mancha'],
    ['Qué número es', 'Treinta y dos', 'Trescientos dos'],
    ['ningún cuarto a la izquierda', 'Dejar los diez', 'Tirar un palito', 'dibujar un cuarto'],
    ['lo que debe Curva', 'Un 0', 'Un 3.', 'palabras'],
    ['tiene Curva ahora', '1', '5', '−1'],
    ['le queda a Recta', 'Tiene 5', 'Tiene 3'],
    ['número es menor', '−1', '−4'],
    ['Cuántos pasos', '8', '7'],
    ['más lejos del cero', 'Recta', 'igual'],
    ['sacar dos deudas', 'No se puede', 'Quitarle', 'Agregar'],
    ['mismo lugar', 'Sacarle', 'Darle'],
    ['rayita del medio', 'deuda', 'Que se saca'],
    ['tiene 2 y paga 5', 'Le quedan 3', 'Queda debiendo'],
    ['subir cinco', '−9', '+1'],
    ['le deben las Terrazas', 'Siete', 'Doce'],
    ['giradas', 'Más', 'Lo mismo'],
    ['dos maneras', 'Hay que contar las dos', 'Alcanza con una'],
    ['otra media vuelta', 'Quedan más', 'Vuelven'],
    ['Catorce atados entre cuatro', 'Cuatro cada una', 'Tres cada una, y sobran'],
    ['Quedan dos atados', 'Dárselos', 'Partirlos', 'Dejarlos'],
    ['bolsas de tres se llenan', 'Tres bolsas', 'Cuatro bolsas'],
    ['bolsas de cuatro', 'Cuatro.', 'Tres.'],
    ['entre cero familias', 'tocan cero', 'No hay a quién'],
    ['bolsas de cero hacen falta', 'Infinitas', 'Ninguna cantidad'],
    ['por 0 da 6', 'El cero', 'Ninguno'],
    ['sumando las dos partes', 'Sí, cambia', 'No: siempre'],
    ['4 × 13', '43', '52'],
    ['Dos atados entre cuatro', 'Darle uno', 'Desatarlos'],
    ['medio montón de seis', 'Lo mismo', 'Medio montón'],
    ['partes iguales cortás', 'En 3.', 'En 2.'],
    ['quién tiene más tiza', 'Cornisa', 'Tienen lo mismo'],
    ['sexto de barra hacen', 'Dos.', 'Tres.'],
    ['Para marcar 3/4', 'en 3.', 'en 4.'],
    ['dónde va 5/4', 'ningún lado', 'Pasando'],
    ['entre 1/2 y 3/4', 'No:', 'Sí'],
    ['2,05 es lo mismo', 'Sí: el 0', 'No: es menos'],
    ['trato le conviene', 'El 80 %', 'Dan lo mismo'],
    ['mida la diagonal justo', 'partiendo bastante fino', 'Quizás'],
    ['pasa sumando', 'se muda', 'Sumar lo mismo'],
    ['Cómo lo comprobás', 'Creerle', 'Poner a Punto'],
    ['truco de Cuña', 'cualquier x es', 'se perdió'],
    ['x · x caiga en el 9', 'Una sola', 'Dos.'],
    ['x = 0 cumple', 'No:', 'Sí:'],
    ['cuadrada hecha con dos cuadros', 'Lado 2', 'Menos de 2'],
    ['llega antes a cien', 'El de Mara', 'El de Punto'],
    ['cuánto vale 2⁰', '2⁰ = 0', '2⁰ = 1.'],
    ['Qué noche dejó más', 'Anoche', 'Esta noche'],
    ['fichas hacen falta', 'Un x por x y seis'],
    ['probás armar la huerta', 'x + 1 por x + 6', 'x + 1 por x + 5', 'x + 2 por x + 3'],
    ['le falta para ser un cuadrado', 'Otra tira'],
    ['Del otro lado del igual', 'Queda 8'],
    ['para pasar mil', 'Unos cien'],
    ['no se puede hacer esa cuenta', 'Con x = 0'],
    ['Siempre falta o sobra', 'Ya se probaron mil', 'Probando no se termina'],
    ['seguir achicando', 'No para siempre', 'Para siempre'],
    ['Pasa con todos los triángulos', 'Pasa con todos', 'hace falta una razón'],
    ['copia parecida', 'Los lados', 'La forma'],
    ['cuánta tierra entra', 'El doble de tierra'],
    ['cuántas cajas como la de Cornisa', 'Cuatro, como la huerta'],
    ['cambia cuánta tierra', 'Con la misma cerca'],
    ['mide el tirante', 'Siete'],
    ['Para qué triángulos', 'Para cualquier triángulo.'],
    ['en línea recta', 'Siete'],
    ['La sombra dice la hora', 'Sí: cada sombra'],
    ['mi sombra mide 2', 'Las 10.'],
    ['Si entra 10', '20: el doble'],
    ['Los puntos se unen', 'Unirlos con una curva linda'],
    ['Esos puntos se unen', 'Unidos'],
    ['qué entradas tienen sentido', 'Cualquier número menos el 2'],
    ['Puede salir −4', 'Sí: con −2'],
    ['Pasado mañana', 'Más: cada día'],
    ['entran alrededor de la rueda', 'Tres, como'],
    ['gira 30°, ¿a qué altura', 'A un tercio'],
    ['Girada 390°', 'Más que 1'],
    ['largo 6, con la misma inclinación', 'Sube 4'],
  ] : route === 'justo' ? [
    ['espía', 'Quedarte'], ['te mira', 'Quedarte'],
    ['vuelven todos', 'Anotarlos'],
    ['marca sola', 'falta uno'],
    ['en fila, ¿alcanzan', 'Alcanzan justo'],
    ['Cómo lo sabés', 'Los conté'],
    ['asiento libre', 'más asientos que en la fila'],
    ['apretados', 'Uno.'],
    ['decís a Punto', 'nombra a catorce'],
  ] : [
    ['espía', 'Quedarte'], ['te mira', 'Quedarte'],
    ['vuelven todos', 'Anotarlos'],
    ['marca sola', 'falta uno'],
    ['en fila, ¿alcanzan', 'Todavía no sé'],
    ['asiento libre', 'más asientos que en la fila'],
    ['apretados', 'Uno.'],
    ['decís a Punto', 'nombra a catorce'],
    ['Dos hileras', 'no se puede saber'],
    ['cuarto vacío', 'Un 0'],
    ['entre el 3 y el 2', 'no se puede saber'],
    ['Qué número es', 'Trescientos dos'],
    ['ningún cuarto a la izquierda', 'dibujar un cuarto'],
    ['lo que debe Curva', 'marca nueva'],
    ['tiene Curva ahora', '−1'],
    ['le queda a Recta', 'Tiene 3'],
    ['número es menor', '−4'],
    ['Cuántos pasos', '7'],
    ['más lejos del cero', 'igual'],
    ['sacar dos deudas', 'Agregar'],
    ['mismo lugar', 'Darle'],
    ['rayita del medio', 'Que se saca'],
    ['tiene 2 y paga 5', 'Queda debiendo'],
    ['subir cinco', '+1'],
    ['le deben las Terrazas', 'Doce'],
    ['giradas', 'Lo mismo'],
    ['dos maneras', 'Alcanza con una'],
    ['otra media vuelta', 'Vuelven'],
    ['Catorce atados entre cuatro', 'Tres cada una, y sobran'],
    ['Quedan dos atados', 'Dejarlos'],
    ['bolsas de tres se llenan', 'Cuatro bolsas'],
    ['bolsas de cuatro', 'Tres.'],
    ['entre cero familias', 'No hay a quién'],
    ['bolsas de cero hacen falta', 'Ninguna cantidad'],
    ['por 0 da 6', 'Ninguno'],
    ['sumando las dos partes', 'No: siempre'],
    ['4 × 13', '52'],
    ['Dos atados entre cuatro', 'Desatarlos'],
    ['medio montón de seis', 'Medio montón'],
    ['partes iguales cortás', 'En 4.'],
    ['quién tiene más tiza', 'Tienen lo mismo'],
    ['sexto de barra hacen', 'Tres.'],
    ['Para marcar 3/4', 'en 4.'],
    ['dónde va 5/4', 'Pasando'],
    ['entre 1/2 y 3/4', 'Sí'],
    ['2,05 es lo mismo', 'No: es menos'],
    ['trato le conviene', 'Dan lo mismo'],
    ['mida la diagonal justo', 'Quizás'],
    ['pasa sumando', 'Sumar lo mismo'],
    ['Cómo lo comprobás', 'Poner a Punto'],
    ['truco de Cuña', 'se perdió'],
    ['x · x caiga en el 9', 'Dos.'],
    ['x = 0 cumple', 'Sí:'],
    ['cuadrada hecha con dos cuadros', 'Menos de 2'],
    ['llega antes a cien', 'El de Punto'],
    ['cuánto vale 2⁰', '2⁰ = 1.'],
    ['Qué noche dejó más', 'Esta noche'],
    ['fichas hacen falta', 'cinco tiras'],
    ['probás armar la huerta', 'x + 2 por x + 3'],
    ['le falta para ser un cuadrado', 'Un cuadradito'],
    ['Del otro lado del igual', '8 + 1'],
    ['para pasar mil', 'Unos diez'],
    ['no se puede hacer esa cuenta', 'Con x = 2'],
    ['Siempre falta o sobra', 'Probando no se termina'],
    ['seguir achicando', 'Para siempre'],
    ['Pasa con todos los triángulos', 'hace falta una razón'],
    ['copia parecida', 'La forma'],
    ['cuánta tierra entra', 'Cuatro veces'],
    ['cuántas cajas como la de Cornisa', 'Ocho.'],
    ['cambia cuánta tierra', 'Depende'],
    ['mide el tirante', 'Cinco.'],
    ['Para qué triángulos', 'ángulo recto'],
    ['en línea recta', 'Cinco.'],
    ['La sombra dice la hora', 'Cada hora da una sola sombra'],
    ['mi sombra mide 2', 'Las 10 o las 14'],
    ['Si entra 10', '21.'],
    ['Los puntos se unen', 'Unirlos: entre'],
    ['Esos puntos se unen', 'Sueltos'],
    ['qué entradas tienen sentido', 'Enteros mayores'],
    ['Puede salir −4', 'No: un número'],
    ['Pasado mañana', '2, como'],
    ['entran alrededor de la rueda', 'Seis y un poco más'],
    ['gira 30°, ¿a qué altura', 'A medio rayo'],
    ['Girada 390°', '0,5'],
    ['largo 6, con la misma inclinación', 'Sube 3'],
  ];
  for (const [key, ...wants] of pref) {
    if (!prompt.includes(key)) continue;
    for (const w of wants) {
      const o = options.find(t => t === w) || options.find(t => t.includes(w));
      const k = `${prompt}|${o}`;
      if (o && !tried.has(k)) { tried.add(k); return o; }
    }
  }
  return options[0];
}

// Estado de las interacciones con objetos
let pairingStage = 0;
let doubleDone = false;
let areaTaps = 0;
let dosPasosStep = 0;
let copyCand = null;
let coordStep = 0;
let c9Shape = null;
let logTaps = 0;
const searchOrder = ['look-crack', 'look-house', 'look-smudge'];
let lastSeg = null;
let stuck = 0;
let lastSig = '';
const reloadAt = new Set([...(opt('reload') ? ['c1.ronda', 'c1.vuelven', 'c1.gradas', 'c1.nombre'] : []), ...val('reload-at', '').split(',').filter(Boolean)]);
const reloaded = new Set();
const fpsSamples = [];
let ended = false;
let partialReloadDone = false;
let choiceSig = '';
// --snap=texto1|texto2: captura cuando el texto en pantalla contiene alguno
const snaps = val('snap', '') ? decodeURIComponent(val('snap', '')).split('|') : [];
const snapped = new Set();

for (let iter = 0; iter < 4000; iter++) {
  const s = await read();
  if (s.seg !== lastSeg) {
    note(`escena → ${s.seg}`);
    lastSeg = s.seg;
    if (s.mode === 'play') await shot(`${s.seg}-inicio`);
    if (reloadAt.has(s.seg) && !reloaded.has(s.seg)) {
      reloaded.add(s.seg);
      await page.waitForTimeout(800);
      note(`recarga en ${s.seg}`);
      await page.reload();
      await page.waitForFunction(() => window.__ready === true, null, {timeout: 20000});
      await page.waitForTimeout(500);
      await page.click('#title [data-act=continue]');
      await page.waitForTimeout(300);
      const after = await read();
      note(`continúa en ${after.seg} (${after.seg === s.seg ? 'ok' : 'DISTINTO'})`);
      if (after.seg !== s.seg) errors.push(`recarga: esperaba ${s.seg} y continuó en ${after.seg}`);
      continue;
    }
  }
  if (s.fatal) { errors.push(`falla del juego en ${s.seg}: ${s.fatal}`); note(`FALLA: ${s.fatal}`); break; }
  // --until=N: termina cuando empieza el capítulo N + 1
  if (val('until', '') && s.seg?.startsWith(`c${Number(val('until', '0')) + 1}.`)) { ended = true; break; }
  if (s.fps) fpsSamples.push(s.fps);
  if (s.mode === 'title') {
    if (s.flags?.chapterDone) { ended = true; break; }
    await page.click('#title [data-act=new]');
    continue;
  }
  const sig = JSON.stringify([s.seg, s.caption, s.choices, s.spots.map(x => x.id + x.label + x.selected)]);
  if (sig === lastSig) stuck++;
  else stuck = 0;
  lastSig = sig;
  if (stuck > 400) { errors.push(`atascado en ${s.seg}: ${sig.slice(0, 300)}`); break; }

  if (!watch && s.skip && s.cinematic) {
    await page.click('#skip-btn').catch(() => {});
    continue;
  }
  if (s.choices.length) {
    // las opciones se activan 450 ms después de aparecer: antes, un clic no cuenta
    const csig = s.prompt + '|' + s.choices.join('|');
    if (csig !== choiceSig) { choiceSig = csig; await page.waitForTimeout(520); continue; }
    choiceSig = '';
    const c = pickChoice(s.prompt, s.choices);
    note(`elige «${c}» (${s.prompt})`);
    await shot(`${s.seg}-eleccion`);
    await page.click(`#choices button:has-text("${c.replace(/"/g, '\\"')}")`);
    continue;
  }
  if (s.waiting || s.typing) {
    if (s.waiting && !s.typing) note(`lee: ${s.caption}`);
    if (s.waiting && !s.typing && snaps.some(t => s.caption.includes(t)) && !snapped.has(s.caption)) {
      snapped.add(s.caption);
      await page.waitForTimeout(400);
      await shot(`snap-${s.seg}`);
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(watch ? 900 : 30);
    continue;
  }
  if (s.spots.length) {
    const spots = s.spots.filter(x => !x.disabled);
    const byLabel = t => spots.filter(x => x.label.includes(t));
    let target = null;
    if (s.seg === 'c1.ronda' && byLabel('contar').length + byLabel('contado').length) {
      const todoC = byLabel('sin contar');
      const doneC = byLabel('ya contado');
      if (route === 'errores' && doneC.length === 3 && !tried.has('recountR')) { tried.add('recountR'); target = doneC[0]; }
      else target = todoC[0];
    } else if (s.seg === 'c1.ronda') {
      // provoca una vez el "ya tiene su marca"
      const done = byLabel('ya tiene su marca');
      const todo = byLabel('sin marca');
      if (route === 'errores' && done.length === 3 && !tried.has('repeat')) { tried.add('repeat'); target = done[0]; }
      else target = todo[0];
      if (route === 'errores' && done.length === 6 && !partialReloadDone && opt('reload')) {
        partialReloadDone = true;
        note('recarga a mitad de anotar');
        await page.waitForTimeout(400);
        await page.reload();
        await page.waitForFunction(() => window.__ready === true, null, {timeout: 20000});
        await page.click('#title [data-act=continue]');
        await page.waitForTimeout(800);
        const after = await read();
        const marks = await page.evaluate(() => Object.keys(window.__game.state.scratch['c1.ronda']?.recorded || {}).length);
        note(`tras recargar: escena ${after.seg}, anotados guardados ${marks}`);
        continue;
      }
    } else if (s.seg === 'c1.vuelven' || (s.seg === 'c1.todos' && spots.some(x => x.id === 'check' || x.id.startsWith('mark')))) {
      const sel = s.spots.find(x => x.selected);
      const freeMarks = spots.filter(x => x.id.startsWith('mark') && x.label.includes('sin unir'));
      const freeDots = spots.filter(x => !x.id.startsWith('mark') && x.label.includes('sin unir'));
      const linkedDots = byLabel('unido a una marca');
      const dbl = spots.filter(x => /unido a [2-9] marcas/.test(x.label));
      if (dbl.length && pairingStage >= 2 && !sel) {
        const st = await page.evaluate(() => window.__game.state.scratch['c1.vuelven'].links);
        const last = st.filter(([, b]) => b === dbl[0].id).pop();
        await clickSpot(last[0]);
        await page.waitForTimeout(80);
        await clickSpot(dbl[0].id);
        note('deshace la unión doble');
        pairingStage = 3;
        await page.waitForTimeout(200);
        continue;
      }
      if (s.seg === 'c1.todos') {
        if (sel) target = sel.id.startsWith('mark') ? freeDots[0] : freeMarks[0];
        else if (freeDots.length && freeMarks.length) target = freeMarks[0];
        else target = spots.find(x => x.id === 'check');
      } else if (route === 'errores' && pairingStage === 0 && linkedDots.length >= 3 && !sel) {
        pairingStage = 1;
        note('comprueba antes de terminar (error deliberado)');
        target = spots.find(x => x.id === 'check');
      } else if (route === 'errores' && pairingStage === 1 && linkedDots.length >= 4 && !sel && freeMarks.length) {
        await clickSpot(freeMarks[0].id);
        await page.waitForTimeout(80);
        await clickSpot(linkedDots[0].id);
        note('une un punto a dos marcas (error deliberado)');
        await page.waitForTimeout(150);
        await clickSpot('check');
        pairingStage = 2;
        await page.waitForTimeout(400);
        continue;
      }
      if (!target) {
        if (sel) target = sel.id.startsWith('mark') ? freeDots[0] : freeMarks[0];
        else if (freeDots.length) target = freeMarks[0];
        else target = spots.find(x => x.id === 'check');
      }
    } else if (s.seg === 'c1.busqueda') {
      const ids = spots.map(x => x.id);
      target = spots.find(x => x.id === searchOrder.find(o => ids.includes(o))) || spots[0];
      if (target?.id?.startsWith('look-')) searchOrder.splice(searchOrder.indexOf(target.id), 1);
    } else if (s.seg === 'c1.todos') {
      const sel = s.spots.find(x => x.selected);
      target = sel ? spots.find(x => x.id !== sel.id) : spots[0];
    } else if (s.seg === 'c1.gradas') {
      const sel = s.spots.find(x => x.selected);
      const free = byLabel('Asiento libre');
      const line = spots.filter(x => !x.id.startsWith('seat'));
      if (route === 'errores' && !tried.has('taken') && byLabel('Asiento ocupado').length && !sel) { tried.add('taken'); target = byLabel('Asiento ocupado')[0]; }
      else if (sel) target = sel.id.startsWith('seat') ? line[0] : free[Math.floor(free.length / 2)];
      else target = line[line.length - 1];
    } else if (s.seg === 'c1.nombre') {
      const todo = byLabel('sin contar');
      const done = byLabel('ya contada');
      if (route === 'errores' && done.length === 5 && !tried.has('recount')) { tried.add('recount'); target = done[0]; }
      else target = todo[(todo.length * 3) % Math.max(1, todo.length)] || todo[0];
    } else if (s.seg === 'c2.lugar' && spots.some(x => x.id === 'b205-ok')) {
      const n = i => Number((spots.find(x => x.id === `b205-${i}`)?.label.match(/hay (\d+)/) || [])[1] || 0);
      const goal = route === 'errores' && !tried.has('b205wrong') ? [2, 5, 0] : [2, 0, 5];
      const cur = [n(0), n(1), n(2)];
      const over = cur.some((c, i) => c > goal[i]);
      if (over) target = spots.find(x => x.id === 'b205-clear');
      else {
        const i = [0, 1, 2].find(k => cur[k] < goal[k]);
        if (i !== undefined) target = spots.find(x => x.id === `b205-${i}`);
        else { if (route === 'errores') tried.add('b205wrong'); target = spots.find(x => x.id === 'b205-ok'); }
      }
    } else if (s.seg === 'c2.atados' && spots.some(x => x.id === 'yring')) {
      target = spots.find(x => x.id === 'yring');
    } else if (s.seg === 'c2.atados') {
      const word = id => spots.find(x => x.id === id);
      const atar = word('atar');
      if (route === 'errores' && atar && atar.label !== 'atar' && !tried.has('shorttie') && byLabel('Palito suelto').length > 20) { tried.add('shorttie'); target = atar; }
      else if (atar && atar.label === 'atar') target = atar;
      else if (word('llenar')) target = word('llenar');
      else if (word('listo') && !atar) target = word('listo');
      else target = byLabel('Palito suelto')[0] || atar;
    } else if (s.seg === 'c2.deposito' || s.seg === 'c2.cuarto') {
      const full = spots.find(x => x.id.startsWith('room') && (x.label.includes('tiene diez') || x.label.includes('(10)')));
      const sel = s.spots.find(x => x.selected);
      const loads = spots.filter(x => x.id.startsWith('load-') && x.id !== 'load-one');
      if (full) target = full;
      else if (s.seg === 'c2.cuarto') target = spots.find(x => x.id === 'room0');
      else if (sel) {
        const want = sel.label.includes('Palito') ? 'room0' : 'room1';
        if (route === 'errores' && !tried.has('wrongroom') && want === 'room0') { tried.add('wrongroom'); target = spots.find(x => x.id === 'room1'); }
        else target = spots.find(x => x.id === want);
      } else target = loads[0];
    } else if (s.seg === 'c2.cuantos') {
      const sel = s.spots.find(x => x.selected);
      const A = k => spots.filter(x => x.label.startsWith('Recta') && x.label.includes(k));
      const B = k => spots.filter(x => x.label.startsWith('Curva') && x.label.includes(k));
      const done = spots.find(x => x.id === 'cmp-done');
      if (done) target = done;
      else if (sel && spots.some(x => x.id === 'cmp-untie') && !(sel.label.startsWith('Recta') ? B('atado') : A('atado')).length) target = spots.find(x => x.id === 'cmp-untie');
      else if (sel) {
        const kind = sel.label.includes('atado') ? 'atado' : 'suelto';
        const other = sel.label.startsWith('Recta') ? B(kind) : A(kind);
        if (route === 'errores' && !tried.has('mixed') && kind === 'atado' && sel.label.startsWith('Recta')) { tried.add('mixed'); target = B('suelto')[0]; }
        else if (other.length) target = other[0];
        else target = sel; // deselecciona
      } else if (A('atado').length && B('atado').length) target = A('atado')[0];
      else if (A('suelto').length && B('suelto').length) target = B('suelto')[0];
      else if (B('suelto').length && A('atado').length) {
        await clickSpot(A('atado')[0].id);
        await page.waitForTimeout(120);
        await clickSpot('cmp-untie');
        note('desata un atado de Recta');
        await page.waitForTimeout(600);
        continue;
      } else if (A('suelto').length >= 10 && B('atado').length) {
        await clickSpot(B('atado')[0].id);
        await page.waitForTimeout(120);
        await clickSpot('cmp-untie');
        note('desata un atado de Curva');
        await page.waitForTimeout(600);
        continue;
      } else target = spots[0];
    } else if (s.seg === 'c3.pares') {
      const sel = s.spots.find(x => x.selected);
      const haves = byLabel('se tiene'), debts = byLabel('se debe');
      if (route === 'errores' && !tried.has('same') && haves.length >= 2 && !sel) { tried.add('same'); await clickSpot(haves[0].id); await page.waitForTimeout(80); target = haves[1]; }
      else if (sel) target = sel.label.includes('se tiene') ? debts[0] : haves[0];
      else target = haves[0] || debts[0];
    } else if (s.seg === 'c3.linea') {
      const sel = s.spots.find(x => x.selected);
      const fams = spots.filter(x => x.label.startsWith('Familia'));
      if (sel && sel.label.startsWith('Familia')) {
        const n = Number(sel.label.split(', ').pop().replace('−', '-').replace('+', ''));
        if (route === 'errores' && !tried.has('misplace') && n < 0) { tried.add('misplace'); target = spots.find(x => x.id === `tick${n === -4 ? -1 : n - 1}`); }
        else target = spots.find(x => x.id === `tick${n}`);
      } else target = route === 'errores' ? fams[fams.length - 1] : fams[0];
    } else if (s.seg === 'c3.pozo') {
      if (route === 'errores' && !tried.has('pitshort')) { tried.add('pitshort'); target = spots.find(x => x.id === 'pit0'); }
      else target = spots.find(x => x.id === 'pit1');
    } else if (s.seg === 'c4.repartir') {
      const fams = spots.filter(x => x.label.startsWith('Familia'));
      const n = x => Number((x.label.match(/tiene (\d+|un)/) || [])[1]?.replace('un', '1') || 0);
      const min = Math.min(...fams.map(n));
      const vuelta = spots.find(x => x.id === 'vuelta');
      if (route === 'errores' && !tried.has('unfair') && fams.some(x => n(x) > min)) { tried.add('unfair'); target = fams.find(x => n(x) > min); }
      else if (vuelta && route !== 'errores') target = vuelta;
      else target = fams.find(x => n(x) === min);
    } else if (s.seg === 'c4.estirar' && spots.some(x => x.id.startsWith('op-'))) {
      target = route === 'errores' ? spots[0] : (spots.find(x => x.id === 'op-times2' || x.id === 'op-timesm1') || spots[0]);
    } else if (s.seg === 'c4.nadie' && spots.some(x => x.id === 'nz-stop')) {
      target = (route === 'errores' && !tried.has('nzmore') && spots.length && (tried.add('nzmore'), true)) ? spots.find(x => x.id === 'nz-fill') : spots.find(x => x.id === 'nz-stop');
    } else if (s.seg?.startsWith('c6.') && spots.some(x => /^x-?\d+$/.test(x.id))) {
      // mover a Punto: buscar la marca que pide la escena
      const want = {'c6.caja': [route === 'errores' ? 5 : 8, 8], 'c6.memoria': [8, 2], 'c6.por-cero': [3, -4, 6], 'c6.cuadrado': [-3], 'c6.dividir': [0], 'c6.al-reves': [-5, 2], 'c6.dos-pasos': [3, 12]}[s.seg] || [0];
      const ids = want.map(n => `x${n}`);
      target = spots.find(x => ids.includes(x.id) && !tried.has(`${s.seg}${x.id}${pairingStage}`)) || spots.find(x => ids.includes(x.id)) || spots[0];
      if (target) tried.add(`${s.seg}${target.id}${pairingStage}`);
    } else if (s.seg === 'c6.dos-pasos' && spots.some(x => x.id.startsWith('op-'))) {
      const seq = route === 'errores' ? ['op-m7', 'op-half', 'op-undo', 'op-m1', 'op-d2', 'op-d4', 'op-p4', 'op-x4'] : ['op-d2', 'op-mh', 'op-x4'];
      target = spots.find(x => x.id === seq[dosPasosStep]) || spots.find(x => x.id === 'op-x4') || spots[0];
      if (target?.id === seq[dosPasosStep]) dosPasosStep++;
    } else if (s.seg?.startsWith('c6.') && spots.some(x => x.id.startsWith('op-'))) {
      const order = route === 'errores' ? ['op-oneL', 'op-bothM', 'op-both', 'op-keep', 'op-flip', 'op-m7', 'op-m1', 'op-d2', 'op-d4', 'op-x4'] : ['op-both', 'op-flip', 'op-m1', 'op-d2', 'op-x4'];
      target = order.map(id => spots.find(x => x.id === id)).find(Boolean) || spots[0];
    } else if (s.seg?.startsWith('c5.') && spots.some(x => x.id.startsWith('part-'))) {
      const want = route === 'errores' ? ['part-6', 'part-7', 'part-5', 'part-12'] : ['part-12', 'part-6'];
      target = want.map(id => spots.find(x => x.id === id)).find(Boolean) || spots[0];
    } else if (s.seg === 'c5.decimos' && spots.some(x => x.id.startsWith('dc-into'))) {
      target = spots.find(x => x.id === (route === 'errores' && !tried.has('dcwrong') && (tried.add('dcwrong'), true) ? 'dc-into0' : 'dc-into1'));
    } else if (s.seg === 'c5.recta') {
      const qs = spots.filter(x => x.id.startsWith('q'));
      if (route === 'errores' && !tried.has('q1')) { tried.add('q1'); target = qs.find(x => x.id === 'q1'); }
      else target = qs.find(x => x.id === 'q3') || spots[0];
    } else if (s.seg === 'c7.grande' && spots.some(x => x.id.startsWith('sc-'))) {
      const zs = spots.filter(x => x.id.startsWith('sc-z') && x.id !== 'sc-z0');
      const ok = spots.find(x => x.id === 'sc-ok');
      if (route === 'errores' && !tried.has('sc3a') && spots.some(x => x.id === 'sc-z0')) { tried.add('sc3a'); target = spots.find(x => x.id === 'sc-z0'); }
      else if (route === 'errores' && !tried.has('sc3b') && ok) { tried.add('sc3b'); target = ok; }
      else target = zs[0] || ok;
    } else if (s.seg === 'c7.areas' && spots.some(x => x.id.startsWith('ar-pick-'))) {
      const seq = route === 'errores' ? ['x2', 'x', 'x', 'x', 'x', 'x', 'x', 'u', 'u', 'u', 'u', 'u', 'u'] : ['x2', 'x', 'x', 'x', 'x', 'x', 'u', 'u', 'u', 'u', 'u', 'u'];
      const k = seq[areaTaps++] || 'u';
      target = spots.find(x => x.id.startsWith(`ar-pick-${k}-`)) || spots[0];
    } else if (s.seg === 'c7.cuantas-veces' && spots.some(x => x.id.startsWith('lg-'))) {
      const goal = route === 'errores' ? 11 : 10;
      if (route === 'errores' && logTaps === 5 && !tried.has('logearly')) { tried.add('logearly'); target = spots.find(x => x.id === 'lg-ok'); }
      else if (logTaps < goal) { logTaps++; target = spots.find(x => x.id === 'lg-dup'); }
      else target = spots.find(x => x.id === 'lg-ok');
    } else if (s.seg === 'c7.no-se-puede' && spots.some(x => x.id.startsWith('ns-x'))) {
      target = route === 'errores' ? spots[0] : (spots.find(x => x.id === 'ns-x2') || spots[0]);
    } else if (s.seg === 'c8.vuelta' && spots.some(x => x.id.startsWith('c8-alt-'))) {
      target = spots.find(x => x.id === (route === 'errores' && !tried.has('altB') && (tried.add('altB'), true) ? 'c8-alt-B' : 'c8-alt-A'));
    } else if (s.seg === 'c8.copias' && spots.some(x => x.id.startsWith('c8-sel-'))) {
      target = spots[0];
      copyCand = target.id.replace('c8-sel-', '');
    } else if (s.seg === 'c8.copias' && spots.some(x => x.id.startsWith('c8-op'))) {
      const right = {rot: 'c8-op0', flip: 'c8-op1', big: 'c8-op2', wide: 'c8-op3'}[copyCand];
      const wrong = {rot: 'c8-op1', flip: 'c8-op0', big: 'c8-op3', wide: 'c8-op2'}[copyCand];
      target = spots.find(x => x.id === (route === 'errores' && !tried.has(`cp${copyCand}`) && (tried.add(`cp${copyCand}`), true) ? wrong : right));
    } else if (s.seg === 'c8.casas' && spots.some(x => x.id.startsWith('c8-pt'))) {
      const seq = route === 'errores' ? ['c8-pt2_3', 'c8-pt3_2', 'c8-pt-1_-1'] : ['c8-pt3_2', 'c8-pt-1_-1'];
      target = spots.find(x => x.id === seq[coordStep]) || spots[0];
      coordStep++;
    } else if (s.seg === 'c9.flechas' && spots.some(x => x.id.startsWith('c9-p'))) {
      const sel = s.spots.find(x => x.selected);
      const MAP = {8: 4, 10: 2, 12: 1, 14: 2, 16: 4};
      if (!sel) target = spots.find(x => x.id.startsWith('c9-ph'));
      else {
        const h = Number(sel.id.replace('c9-ph', ''));
        const wrong = route === 'errores' && !tried.has('c9wrong') && (tried.add('c9wrong'), true);
        target = spots.find(x => x.id === `c9-ps${wrong ? (MAP[h] === 1 ? 2 : 1) : MAP[h]}`);
      }
    } else if (s.seg === 'c9.puntos' && spots.some(x => x.id.startsWith('c9-pt'))) {
      const MAP = {8: 4, 10: 2, 12: 1, 14: 2, 16: 4};
      const free = [8, 10, 12, 14, 16].filter(h => spots.some(x => x.id.startsWith(`c9-pt${h}_`)));
      const h = free[0];
      const wrong = route === 'errores' && !tried.has('c9plot') && (tried.add('c9plot'), true);
      target = spots.find(x => x.id === `c9-pt${h}_${wrong ? (MAP[h] + 1) % 5 : MAP[h]}`);
    } else if (s.seg === 'c9.recta' && spots.some(x => x.id === 'c9-yes')) {
      const truth = {line: true, parabola: true, circle: false, sideways: false}[c9Shape];
      const wrong = route === 'errores' && !tried.has(`c9v${c9Shape}`) && c9Shape === 'circle' && (tried.add(`c9v${c9Shape}`), true);
      target = spots.find(x => x.id === ((truth !== wrong) ? 'c9-yes' : 'c9-no'));
    } else if (s.seg === 'c9.recta' && spots.some(x => x.id.startsWith('c9-c'))) {
      target = spots[0];
      c9Shape = target.id.replace('c9-c', '');
    } else if (s.seg === 'c9.maneras' && spots.some(x => x.id.startsWith('c9-e') || x.id.startsWith('c9-l'))) {
      const sel = s.spots.find(x => x.selected);
      if (!sel) target = spots.find(x => x.id.startsWith('c9-e'));
      else {
        const k = sel.id.replace('c9-e', '');
        const wrong = route === 'errores' && !tried.has('c9match') && (tried.add('c9match'), true);
        target = spots.find(x => x.id === (wrong ? 'c9-lB' : `c9-l${k}`));
      }
    } else if (s.seg === 'c10.rueda' && spots.some(x => x.id === 'c10-more')) {
      // pone pedazos hasta que el séptimo se pase (o, en la ruta con errores, para antes una vez)
      if (route === 'errores' && !tried.has('c10early') && spots.some(x => x.id === 'c10-done') && (tried.add('c10early'), true)) target = spots.find(x => x.id === 'c10-done');
      else target = spots.find(x => x.id === 'c10-more');
    } else if (s.seg === 'c3.perdon') {
      target = byLabel('sacarla')[0] || spots.find(x => x.id === 'pz-stuck') || byLabel('pagarlo')[0] || spots.find(x => x.id === 'pm-pad');
      if (route === 'errores' && spots.some(x => x.id === 'pm-pad') && byLabel('pagarlo').length && !tried.has('padearly')) { tried.add('padearly'); target = spots.find(x => x.id === 'pm-pad'); }
    } else {
      target = spots[0];
    }
    if (target) {
      if (opt('trace')) note(`toca ${target.id} (${target.label})`);
      await clickSpot(target.id).catch(e => note(`no pudo tocar ${target.id}: ${e.message.split('\n')[0]}`));
      await page.waitForTimeout(watch ? 500 : 120);
      continue;
    }
  }
  await page.waitForTimeout(watch ? 200 : 60);
}

const final = await read();
await shot('final');
const evidence = await page.evaluate(() => window.__game.state);
await writeFile(`${out}/state.json`, JSON.stringify(evidence, null, 2));
const fps = fpsSamples.filter(Boolean);
const summary = {
  ended,
  final: {mode: final.mode, seg: final.seg},
  journal: evidence.journal.map(e => e.title),
  evidenceKinds: [...new Set(evidence.evidence.map(e => e.kind))],
  fps: fps.length ? {min: Math.min(...fps).toFixed(1), median: fps.sort((a, b) => a - b)[Math.floor(fps.length / 2)].toFixed(1)} : null,
  errors,
  seconds: (Date.now() - t0) / 1000,
  size: `${W}x${H}`, touch: opt('touch'), route, watch,
};
note(JSON.stringify(summary));
await writeFile(`${out}/log.txt`, log.join('\n'));
await writeFile(`${out}/summary.json`, JSON.stringify(summary, null, 2));
if (film.length) {
  const t0f = film[0].t;
  const frames = film.map(f => [f.name, +(f.t - t0f).toFixed(2)]);
  await writeFile(`${out}/film/index.html`, `<!doctype html><meta charset=utf-8><title>Arithmos · película de prueba</title>
<style>body{margin:0;background:#111;color:#ddd;font:14px system-ui}img{display:block;max-width:100%;margin:auto}#bar{display:flex;gap:8px;align-items:center;padding:8px}input{flex:1}</style>
<img id=f><div id=bar><button id=p>pausa</button><select id=sp><option>0.5</option><option selected>1</option><option>2</option><option>4</option></select><input id=s type=range min=0 value=0><span id=t></span></div>
<script>const F=${JSON.stringify(frames)};const img=document.getElementById('f'),s=document.getElementById('s'),t=document.getElementById('t');s.max=F.length-1;let i=0,play=true,clock=0,last=performance.now();
function show(k){i=k;img.src=F[k][0];s.value=k;t.textContent=F[k][1].toFixed(1)+' s';}
p.onclick=()=>{play=!play;p.textContent=play?'pausa':'seguir'};s.oninput=()=>{show(+s.value);clock=F[i][1]};
function tick(n){const dt=(n-last)/1000;last=n;if(play){clock+=dt*+sp.value;while(i<F.length-1&&F[i+1][1]<=clock)i++;show(i)}requestAnimationFrame(tick)}show(0);requestAnimationFrame(tick);</script>`);
}
await context.close();
await browser.close();
server.close();
process.exit(errors.length || !ended ? 1 : 0);
