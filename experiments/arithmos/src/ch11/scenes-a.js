// Capítulo 11 — Lo que pasa a veces (11.1 a 11.4): muchos baldes, el del medio, parejo y desparejo, el gráfico de Punto.

import {Drawing, Label, Shape} from '../engine/world.js';
import {zip, pulse, follow, rectSpot, wordSpot} from '../acting.js';
import {pulls, shareFull, mean, median, range} from '../logic/chance.js';
import {SHOTS, area, base, boardCast, clean, poly, dot, S, seedOf, WHITE, YELLOW, BLUE} from '../ch9/common.js';
import {studentWrites} from '../ch7/scenes-a.js';

const dec = v => String(v).replace('.', ',');
const pct = v => `${Math.round(v * 100)} %`;

/** Barras simples: valores, posición, escala; devuelve el x del centro de cada barra. */
function bars(w, id, vals, {x0, y0, bw, gap, k, ch = WHITE, names = []}) {
  vals.forEach((v, i) => {
    const x = x0 + i * (bw + gap);
    w.add(new Shape(`${id}${i}`, poly(`${id}${i}`, [[0, 0], [bw, 0], [bw, -v * k], [0, -v * k]], {ch, hatch: 7, w: 2.2}), x, y0, {z: 12}));
    w.add(new Label(`${id}v${i}`, String(v), x + bw / 2, y0 - v * k - 6, {size: 16, align: 'center', z: 13}));
    if (names[i]) w.add(new Label(`${id}n${i}`, names[i], x + bw / 2, y0 + 18, {size: 13, align: 'center', z: 12, ch: BLUE}));
  });
  w.add(new Drawing(`${id}base`, [S([[x0 - 6, y0], [x0 + vals.length * (bw + gap), y0]], seedOf(`${id}base`), {w: 2, p: 0.9})], {z: 11}));
  return vals.map((_, i) => x0 + i * (bw + gap) + bw / 2);
}

// ——————————————————————————————————————————————
// 11.1 Muchos baldes
// ——————————————————————————————————————————————

export const baldes = {
  id: 'c11.baldes',
  title: 'Muchos baldes',
  setup(g) {
    g.world.clear();
    base(g);
    boardCast(g, 3);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Balcón', 'De seis baldes, cuatro subieron llenos. ¿Eso quiere decir que siempre van a ser cuatro de cada seis?');
    const guess = await d.choose([
      {id: 'about', text: 'Con muchos baldes, más o menos dos de cada tres.'},
      {id: 'exact', text: 'Exactamente dos de cada tres, siempre.'},
      {id: 'nothing', text: 'No se puede decir nada: es suerte.'},
    ], {prompt: 'Si subimos mil baldes, ¿qué parte va a subir llena?', evaluate: true});
    d.evidence('freq-predict', {answer: guess});
    // el gráfico: cuántos baldes (escala que se estira) contra la parte que subió llena
    const gx = A.x0 + 40, gy = A.y0 + 210, W = 360, H = 170;
    const px = n => gx + Math.log10(n) / 3 * W, py = v => gy - v * H;
    w.add(new Drawing('c11-ax', [S([[gx, gy], [gx + W + 10, gy]], seedOf('c11-ax'), {w: 2.2, p: 0.9}), S([[gx, gy], [gx, gy - H - 10]], seedOf('c11-ay'), {w: 2.2, p: 0.9})], {z: 11}));
    for (const n of [1, 10, 100, 1000]) w.add(new Label(`c11-xl${n}`, String(n), px(n), gy + 20, {size: 15, align: 'center', z: 12, ch: BLUE}));
    for (const v of [0.5, 1]) w.add(new Label(`c11-yl${v}`, v === 1 ? 'todos' : 'la mitad', gx - 6, py(v) + 5, {size: 13, align: 'right', z: 12, ch: BLUE}));
    w.add(new Drawing('c11-half', [S([[gx, py(0.5)], [gx + W, py(0.5)]], seedOf('c11-half'), {w: 1, p: 0.35, lift: false})], {z: 11}));
    w.add(new Label('c11-xt', 'baldes', gx + W + 14, gy + 4, {size: 14, z: 12, ch: BLUE}));
    w.add(new Label('c11-xs', '(cada marca, diez veces más baldes)', gx + W / 2, gy + 40, {size: 13, align: 'center', z: 12, ch: BLUE}));
    w.add(new Drawing('c11-23', Array.from({length: 18}, (_, i) => S([[gx + i * W / 18, py(2 / 3)], [gx + i * W / 18 + W / 36, py(2 / 3)]], seedOf('c11-23') + i, {w: 1.4, p: 0.6, ch: YELLOW, lift: false})), {z: 12}));
    w.add(new Label('c11-23l', '2/3', gx + W + 6, py(2 / 3) + 5, {size: 14, z: 12, ch: YELLOW}));
    d.describe('Un gráfico: abajo, cuántos baldes se subieron (1, 10, 100, 1000); arriba, qué parte subió llena.');
    await d.shot(SHOTS.tiles, 0.8);
    const xs = pulls(1000);
    let shown = 1;
    const plot = async (upto, from = shown, data = xs, id = 'c11', ch = YELLOW) => {
      const pts = [];
      for (let n = from; n <= upto; n += n < 10 ? 1 : n < 100 ? 3 : 25) pts.push([px(n), py(shareFull(data, n))]);
      pts.push([px(upto), py(shareFull(data, upto))]);
      const line = w.add(new Drawing(`${id}-c${upto}`, [S(pts, seedOf(`${id}-c${upto}`), {w: 2.4, p: 0.9, ch})], {z: 13, progress: 0}));
      await d.draw(line, 0.8, {sound: false});
      w.add(new Shape(`${id}-d${upto}`, dot(`${id}-d${upto}`, 5, ch), px(upto), py(shareFull(data, upto)), {z: 14}));
      w.add(new Label(`${id}-dl${upto}`, pct(shareFull(data, upto)), px(upto), py(shareFull(data, upto)) + (ch === BLUE ? 22 : -14), {size: 16, align: 'center', z: 14, ch}));
      d.describe(`${ch === BLUE ? 'En la otra tanda, con' : 'Con'} ${upto} baldes, subió lleno el ${pct(shareFull(data, upto))}.`);
      d.evidence('freq', {n: upto, share: +shareFull(data, upto).toFixed(3), batch: ch === BLUE ? 2 : 1});
    };
    // el jugador decide hasta cuántos baldes subir, si probar otra tanda y cuándo alcanza
    const TARGETS = [10, 30, 100, 300, 1000];
    let second = false;
    for (;;) {
      const opts = TARGETS.filter(n => n > shown).map(n => ({id: String(n), text: `Subir hasta ${n} baldes.`}));
      if (shown >= 100 && !second) opts.push({id: 'again', text: 'Otra tanda, desde cero.'});
      if (shown >= 300) opts.push({id: 'done', text: 'Ya está: se ve adónde va.'});
      if (!opts.length) break;
      const pick = await d.choose(opts, {prompt: shown === 1 ? '¿Hasta cuántos baldes subimos?' : `Van ${shown} baldes. ¿Y ahora?`});
      if (pick === 'done') { d.evidence('freq-stop', {n: shown, second}); break; }
      if (pick === 'again') {
        second = true;
        await d.say('Balcón', 'Otra tanda de baldes, desde el primero.');
        const ys = pulls(1000, 2 / 3, 13);
        await plot(1000, 1, ys, 'c11-tb', BLUE);
        w.add(new Label('c11-tbl', 'otra tanda', px(1000) + 6, py(shareFull(ys, 1000)) + 40, {size: 14, z: 14, ch: BLUE}));
        await d.think(`La otra tanda empezó muy distinta: con 10 baldes, ${pct(shareFull(ys, 10))}. Con pocos baldes salta para cualquier lado; con mil, ${pct(shareFull(ys, 1000))}: también cerca de dos tercios.`);
        continue;
      }
      const n = Number(pick);
      await plot(n);
      shown = n;
      if (shown >= 1000 && second) { d.evidence('freq-stop', {n: shown, second}); break; }
    }
    await d.think(guess === 'about' ? 'Al principio salta; con muchos, se queda cerca de dos tercios.' : guess === 'exact' ? 'No se queda clavado en dos tercios: a veces da justo y a veces un poco más o un poco menos, siempre cerca.' : 'Caso por caso es suerte, pero con muchos baldes la parte llena se queda cerca de dos tercios.');
    await d.say('student', 'Balcón, con muchos baldes, la parte que sube llena se acomoda cerca de 2 de cada 3. Eso lo vimos, no está garantizado. Y el próximo balde, igual, no se sabe.');
    await studentWrites(d, g, 'c11-f', 'llenos ÷ baldes → cerca de 2/3', A.x0 + 40, A.y0 + 20, {size: 22});
    g.flags.c11freq = true;
  },
};

// ——————————————————————————————————————————————
// 11.2 El del medio
// ——————————————————————————————————————————————

export const medio = {
  id: 'c11.medio',
  title: 'El del medio',
  setup(g) {
    clean(g, /^c11-/);
    boardCast(g, 0);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'Me piden cuántos atados tiene una familia de las Terrazas, así, en general. Peldaño 3, Rampa 4, Cornisa 4, Balcón 5… y la Ronda, que guarda los de todos, 34.');
    const vals = [3, 4, 4, 5, 34];
    const names = ['Peldaño', 'Rampa', 'Cornisa', 'Balcón', 'Ronda'];
    const y0 = A.y0 + 230, k = 5.4;
    const xs = bars(w, 'c11-b', vals, {x0: A.x0 + 30, y0, bw: 44, gap: 16, k, names});
    d.describe('Cinco barras: 3, 4, 4, 5 y una altísima de 34, la de la Ronda.');
    await d.shot(SHOTS.tiles, 0.8);
    const m = mean(vals), md = median(vals);
    const done = new Set();
    const lineAt = (id, v, ch, label) => {
      w.add(new Drawing(id, [S([[A.x0 + 20, y0 - v * k], [xs[4] + 30, y0 - v * k]], seedOf(id), {w: 2.4, p: 0.9, ch})], {z: 14}));
      w.add(new Label(`${id}l`, label, xs[4] + 36, y0 - v * k + 6, {size: 17, z: 14, ch}));
    };
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Calculá los dos: el promedio (repartir todo en partes iguales) y el del medio (ordenados, el que queda en el centro).']);
      const refresh = () => g.ui.setSpots([
        ...(done.has('mean') ? [] : [wordSpot('c11-mean', 'promedio', A.x1 - 60, A.y0 + 40, () => { if (!ctl.alive()) return; done.add('mean'); lineAt('c11-lm', m, YELLOW, `promedio ${m}`); d.describe(`Repartiendo todo en partes iguales tocan ${m} atados por familia: la raya amarilla queda por arriba de cuatro de las cinco barras.`); d.evidence('summary', {kind: 'mean', v: m}); next(); }, {label: 'Calcular el promedio'})]),
        ...(done.has('median') ? [] : [wordSpot('c11-med', 'el del medio', A.x1 - 60, A.y0 + 110, () => { if (!ctl.alive()) return; done.add('median'); lineAt('c11-ld', md, BLUE, `del medio ${md}`); d.describe(`Ordenados, 3, 4, 4, 5, 34: el del medio es ${md}.`); d.evidence('summary', {kind: 'median', v: md}); next(); }, {label: 'Buscar el del medio (la mediana)'})]),
      ]);
      const next = () => { g.audio.tap(0.2, 1.3); if (done.size === 2) { g.ui.setSpots([]); g.setHint(null); resolve(); } else refresh(); };
      refresh();
    }));
    const c = await d.choose([
      {id: 'median', text: 'El del medio: 4, como la mayoría.'},
      {id: 'mean', text: 'El promedio: 10, porque usa todos los datos.'},
      {id: 'both', text: 'Los dos, y decir que la Ronda tiene muchísimos.'},
    ], {prompt: '¿Qué número dice mejor cuántos atados tiene una familia común?', evaluate: true});
    d.evidence('summary-pick', {answer: c});
    await d.think(c === 'mean' ? 'Diez no lo tiene ninguna familia: la Ronda sola empuja el promedio para arriba.' : c === 'median' ? 'Cuatro, como casi todas. El promedio se lo lleva la Ronda.' : 'Lo más honesto: el del medio, 4, y avisar que hay una que tiene muchísimos.');
    await d.say('student', 'Mara, un número solo siempre esconde algo. El promedio reparte todo, y uno muy grande lo arrastra. El del medio, que se llama mediana, no se mueve aunque la Ronda tenga mil.');
    await studentWrites(d, g, 'c11-mm', `promedio ${m}    mediana ${md}`, A.x0 + 30, A.y0 + 30, {size: 22});
    g.flags.c11median = true;
  },
};

// ——————————————————————————————————————————————
// 11.3 Parejo y desparejo
// ——————————————————————————————————————————————

export const parejo = {
  id: 'c11.parejo',
  title: 'Parejo y desparejo',
  setup(g) {
    clean(g, /^c11-/);
    boardCast(g, 1);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Rampa', 'Dos ayudantes redibujan escalones. Los dos hacen 5 por día en promedio. Mañana necesito por lo menos 4. Te muestro sus últimos cinco días. ¿A cuál llamo?');
    const a = [5, 5, 6, 4, 5], b = [1, 9, 2, 8, 5];
    const y0 = A.y0 + 120, y1 = A.y0 + 240, k = 9;
    bars(w, 'c11-a', a, {x0: A.x0 + 40, y0, bw: 26, gap: 10, k});
    bars(w, 'c11-c', b, {x0: A.x0 + 40, y0: y1, bw: 26, gap: 10, k, ch: YELLOW});
    w.add(new Label('c11-an', 'ayudante A', A.x0 + 230, y0 - 20, {size: 17, z: 12}));
    w.add(new Label('c11-cn', 'ayudante B', A.x0 + 230, y1 - 20, {size: 17, z: 12, ch: YELLOW}));
    for (const [id, yy] of [['c11-ma', y0], ['c11-mc', y1]]) w.add(new Drawing(id, [S([[A.x0 + 34, yy - 5 * k], [A.x0 + 40 + 5 * 36, yy - 5 * k]], seedOf(id), {w: 1.6, p: 0.7, ch: BLUE, lift: false})], {z: 13}));
    d.describe('Dos filas de barras, una por ayudante, con la misma raya azul de promedio en 5. Las barras de A son casi iguales; las de B van de 1 a 9.');
    await d.shot(SHOTS.tiles, 0.8);
    const c = await d.choose([
      {id: 'A', text: 'A: en estos cinco días hizo entre 4 y 6.'},
      {id: 'B', text: 'B: a veces hace 9.'},
      {id: 'same', text: 'Cualquiera: el promedio es el mismo.'},
    ], {prompt: 'Para tener por lo menos 4, ¿a quién llamás?', evaluate: true});
    d.evidence('spread-pick', {answer: c});
    await d.think(c === 'A' ? 'A: sus días van de 4 a 6. B a veces hace 1.' : c === 'B' ? 'B a veces hizo 9, pero también 1. A, en estos cinco días, nunca menos de 4.' : 'El promedio es el mismo, pero B a veces hizo 1. A, en estos cinco días, nunca menos de 4.');
    await d.say('student', `Rampa, el promedio no dice qué tan desparejo es. De lo más bajo a lo más alto: A va de 4 a 6, una diferencia de ${range(a)}; B, de 1 a 9, ${range(b)}. Eso se llama rango.`);
    await studentWrites(d, g, 'c11-r', `rango A ${range(a)}    rango B ${range(b)}`, A.x0 + 260, A.y0 + 60, {size: 20});
    g.flags.c11spread = true;
  },
};

// ——————————————————————————————————————————————
// 11.4 El gráfico de Punto
// ——————————————————————————————————————————————

export const grafico = {
  id: 'c11.grafico',
  title: 'El gráfico de Punto',
  setup(g) {
    clean(g, /^c11-/);
    boardCast(g, 2);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const p = w.get('punto');
    const s = w.get('student');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Cornisa', 'Punto juntó tiza para la escalera: 104 trozos. Mara juntó 100. Punto hizo un gráfico.');
    // el gráfico de Punto: las barras empiezan en 96. El dibujo pone la barra más alta siempre del mismo alto (H),
    // como hace cualquier gráfico que se acomoda a la hoja; lo que cambia es dónde empieza el eje.
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, A.x0 + 120, A.y0 + 20, 0.4);
    const gy = A.y0 + 220, H = 144, bx = A.x0 + 70;
    const tall = (v, from) => H * (v - from) / (104 - from);
    const ratio = from => Math.round((104 - from) / (100 - from) * 100) / 100;
    const draw = (from, progress = 1, showRatio = true) => {
      w.removeWhere(o => /^c11-p(m|p|ax|0|rt)$/.test(o.id));
      const bar = (id, x, v, ch) => w.add(new Shape(id, poly(id, [[0, 0], [50, 0], [50, -tall(v, from)], [0, -tall(v, from)]], {ch, hatch: 7, w: 2.2}), x, gy, {z: 12, progress}));
      const out = [bar('c11-pm', bx, 100, WHITE), bar('c11-pp', bx + 100, 104, YELLOW)];
      w.add(new Drawing('c11-pax', [
        S([[bx - 14, gy], [bx - 14, gy - H - 10]], seedOf('c11-pax'), {w: 1.8, p: 0.8, ch: BLUE}),
        S([[bx - 14, gy], [bx + 166, gy]], seedOf('c11-pax') + 1, {w: 1.8, p: 0.8, ch: BLUE}),
      ], {z: 11}));
      w.add(new Label('c11-p0', String(from), bx - 20, gy + 6, {size: 20, align: 'right', z: 12, ch: BLUE}));
      if (showRatio) w.add(new Label('c11-prt', `a la vista: ×${dec(ratio(from))}`, bx + 75, gy - H - 20, {size: 20, align: 'center', z: 13, ch: YELLOW}));
      return out;
    };
    const first = draw(96, 0, false);
    await d.all(...first.map(o => d.draw(o, 0.6, {sound: false})));
    w.add(new Label('c11-pml', 'Mara: 100', bx + 25, gy + 22, {size: 20, align: 'center', z: 12}));
    w.add(new Label('c11-ppl', 'Punto: 104', bx + 130, gy + 22, {size: 20, align: 'center', z: 12, ch: YELLOW}));
    g.audio.punto('happy');
    d.describe('Punto dibuja dos barras: la suya, el doble de alta que la de Mara. Abajo, en chiquito, el eje empieza en 96.');
    follow(p, s);
    g.setCinematic(false);
    // la decisión se toma con el gráfico de cerca: el 96 tiene que poder leerse
    await d.shot(SHOTS.tiles, 0.8);
    const c = await d.choose([
      {id: 'double', text: 'Sí: su barra es el doble de alta.'},
      {id: 'check', text: 'Hay que mirar dónde empiezan las barras.'},
      {id: 'lie', text: 'No: Punto mintió con los números.'},
    ], {prompt: '¿Punto juntó el doble de tiza que Mara?', evaluate: true});
    d.evidence('graph-predict', {answer: c});
    await d.think(c === 'check' ? 'A ver qué pasa si el eje empieza en otro lado.' : c === 'double' ? 'El alto dice el doble. ¿Y si el eje empezara en otro número?' : 'Los números son 100 y 104, eso está bien. ¿Y el dibujo?');
    // el jugador mueve dónde empieza el eje y decide cuándo el dibujo compara bien
    const FROMS = [96, 90, 80, 50, 0];
    let from = 96;
    const tried = [];
    w.add(new Label('c11-axq', 'el eje empieza en', A.x1 - 158, A.y0 + 26, {size: 16, align: 'center', z: 12, ch: BLUE}));
    draw(96, 1, true);
    for (;;) {
      const pick = await d.interact(ctl => new Promise(resolve => {
        g.setHint(() => ['Tocá un número para que el eje empiece ahí, y mirá cuánto más alta se ve la barra de Punto. Cuando el dibujo sirva para comparar, tocá «así sirve».']);
        g.ui.setSpots([
          ...FROMS.map((f, i) => wordSpot(`c11-ax${f}`, String(f), A.x1 - 210 + (i % 2) * 110, A.y0 + 66 + Math.floor(i / 2) * 64, () => { if (ctl.alive()) resolve(f); }, {label: `Que el eje empiece en ${f}`, selected: f === from})),
          wordSpot('c11-axok', 'así sirve', A.x1 - 100, A.y0 + 194, () => { if (ctl.alive()) resolve('ok'); }, {label: 'Así el dibujo sirve para comparar las cantidades'}),
        ]);
      }));
      g.ui.setSpots([]);
      g.setHint(null);
      if (pick === 'ok') {
        d.evidence('graph-axis', {from, tried: [...tried]});
        if (from === 0) break;
        await d.say('Cornisa', `Todavía no. A la vista, la barra de Punto es ${dec(ratio(from))} veces la de Mara; la tiza de Punto es 104 ÷ 100 = 1,04 veces la de Mara. Mirá dónde empieza el eje.`);
        continue;
      }
      if (pick === from) continue;
      from = pick;
      tried.push(from);
      const fresh = draw(from, 0);
      g.audio.erase(0.4, 0.3);
      await d.all(...fresh.map(o => d.draw(o, 0.5, {sound: false})));
      d.describe(`El eje empieza en ${from}. La barra de Mara mide ${100 - from} desde el eje y la de Punto ${104 - from}: a la vista, la de Punto es ${dec(ratio(from))} veces la de Mara.`);
    }
    await d.think('Desde cero, ×1,04: lo mismo que la tiza, 104 ÷ 100.');
    w.remove('c11-axq');
    await d.think(c === 'check' ? '104 es 4 más que 100, no el doble: el eje en 96 lo hacía parecer.' : c === 'double' ? 'El doble era de lo que se veía, no de la tiza.' : 'Los números eran ciertos: 104 y 100. Lo que engañaba era el dibujo, que empezaba en 96.');
    g.setCinematic(true);
    g.audio.punto('sad');
    await pulse(d, p, 1, 0.3);
    await d.wait(0.3);
    g.audio.punto('happy');
    g.setCinematic(false);
    await d.say('student', 'Punto, los números eran ciertos, pero el dibujo decía otra cosa. Si las barras no empiezan en cero, el alto no compara cantidades.');
    await studentWrites(d, g, 'c11-g', 'mirar dónde empieza el eje', A.x1 - 250, A.y1 - 8, {size: 20});
    g.flags.c11graph = true;
  },
};

export {mean, Label, rectSpot};
