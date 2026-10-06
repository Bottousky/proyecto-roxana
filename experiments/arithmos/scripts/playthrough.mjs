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
    ['Apretados', 'entran más', 'los mismos'],
    ['decís a Punto', 'catorce cosas', 'nombra a dos', 'nombra a los catorce'],
    ['', '¿Quién sos?'],
    ['Dos hileras', 'Hoy llegó más'],
    ['cuarto vacío', 'Nada:', 'espacio', 'Un 0'],
    ['entre el 3 y el 2', 'Es una mancha'],
    ['Qué número es', 'Treinta y dos', 'Trescientos dos'],
    ['ningún cuarto a la izquierda', 'Dejar los diez', 'Tirar un palito', 'dibujar un cuarto'],
    ['lo que debe Curva', 'Un 0', 'Un 3.', 'palabras'],
    ['tiene Curva ahora', '+1', '5', '−1'],
    ['le queda a Recta', '+5', '+3'],
    ['Quién tiene menos', 'Curva', 'Espiral'],
    ['más lejos del cero', 'Recta', 'igual'],
    ['perdonar dos deudas', 'No se puede', 'Quitarle', 'Agregar'],
    ['Si sube cinco', '−8', '+2'],
  ] : route === 'justo' ? [
    ['espía', 'Quedarte'], ['te mira', 'Quedarte'],
    ['vuelven todos', 'Anotarlos'],
    ['marca sola', 'falta uno'],
    ['en fila, ¿alcanzan', 'Alcanzan justo'],
    ['Cómo lo sabés', 'Los conté'],
    ['asiento libre', 'más asientos que en la fila'],
    ['Apretados', 'los mismos'],
    ['decís a Punto', 'nombra a los catorce'],
  ] : [
    ['espía', 'Quedarte'], ['te mira', 'Quedarte'],
    ['vuelven todos', 'Anotarlos'],
    ['marca sola', 'falta uno'],
    ['en fila, ¿alcanzan', 'Todavía no sé'],
    ['asiento libre', 'más asientos que en la fila'],
    ['Apretados', 'los mismos'],
    ['decís a Punto', 'nombra a los catorce'],
    ['Dos hileras', 'no se puede saber'],
    ['cuarto vacío', 'Un 0'],
    ['entre el 3 y el 2', 'no se puede saber'],
    ['Qué número es', 'Trescientos dos'],
    ['ningún cuarto a la izquierda', 'dibujar un cuarto'],
    ['lo que debe Curva', 'marca nueva'],
    ['tiene Curva ahora', '−1'],
    ['le queda a Recta', '+3'],
    ['Quién tiene menos', 'Espiral'],
    ['más lejos del cero', 'igual'],
    ['perdonar dos deudas', 'Agregar'],
    ['Si sube cinco', '+2'],
  ];
  for (const [key, ...wants] of pref) {
    if (!prompt.includes(key)) continue;
    for (const w of wants) {
      const o = options.find(t => t.includes(w));
      const k = `${prompt}|${o}`;
      if (o && !tried.has(k)) { tried.add(k); return o; }
    }
  }
  return options[0];
}

// Estado de las interacciones con objetos
let pairingStage = 0;
let doubleDone = false;
const searchOrder = ['look-crack', 'look-house', 'look-smudge'];
let lastSeg = null;
let stuck = 0;
let lastSig = '';
const reloadAt = new Set(opt('reload') ? ['c1.ronda', 'c1.vuelven', 'c1.gradas', 'c1.nombre'] : []);
const reloaded = new Set();
const fpsSamples = [];
let ended = false;
let partialReloadDone = false;

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
    const c = pickChoice(s.prompt, s.choices);
    note(`elige «${c}» (${s.prompt})`);
    await shot(`${s.seg}-eleccion`);
    await page.click(`#choices button:has-text("${c.replace(/"/g, '\\"')}")`);
    continue;
  }
  if (s.waiting || s.typing) {
    if (s.waiting && !s.typing) note(`lee: ${s.caption}`);
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
      const dbl = byLabel('unido a 2 marcas');
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
        await page.waitForTimeout(80);
        await clickSpot(A('atado')[0].id);
        note('desata un atado de Recta');
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
        const v = sel.label.split(', ').pop();
        const want = v === '0' ? 'cero' : v;
        if (route === 'errores' && !tried.has('misplace')) { tried.add('misplace'); target = spots.find(x => x.label.startsWith('Marca ') && !x.label.includes(` ${want} `)); }
        else target = spots.find(x => x.label === `Marca ${want} de la línea`);
      } else target = fams[0];
    } else if (s.seg === 'c3.perdon') {
      target = byLabel('perdonarla')[0] || spots.find(x => x.id === 'pz-stuck');
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
