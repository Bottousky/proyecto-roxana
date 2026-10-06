// Capítulo 5 — Partes de algo (5.1 a 5.4): medio atado, barras enteras, dos de cuatro y la línea entre 0 y 1.

import {Drawing, Label, Shape} from '../engine/world.js';
import {YELLOW, WHITE} from '../engine/chalk.js';
import {lerp, easeInOut} from '../engine/rng.js';
import {zip, hop, pulse, follow, spotOf, rectSpot, wordSpot} from '../acting.js';
import {frac, equivalent, compare} from '../logic/fractions.js';
import {
  GROUND, BOARD, boardTop, FAMILIES, SHOTS, BAR, FX, GHOST, ghostX, LINE, lx, base, cast, family, item, piece, ghostBar,
  partitionOn, fracLabel, S, seedOf, art,
} from './common.js';

/** Un renglón escrito en la pizarra. */
export function boardText(w, id, text, row, opts = {}) {
  const l = w.ensure(id, () => new Label(id, text, BOARD.x - BOARD.w / 2 + 30, boardTop() + 52 + row * 48, {size: opts.size ?? 30, z: 9, reveal: opts.reveal ?? 1}));
  l.text = text;
  return l;
}

/** El estudiante camina a la pizarra y escribe un renglón. */
export async function writeBoard(d, g, id, text, row, opts = {}) {
  const s = g.world.get('student');
  const l = boardText(g.world, id, text, row, {...opts, reveal: 0});
  l.reveal = 0;
  g.setCinematic(true);
  s.face(1);
  await d.walk(s, BOARD.x - BOARD.w / 2 - 40, GROUND, 240);
  s.setPose('write', 0.3);
  await d.draw(l, Math.min(1.4, 0.3 + text.length * 0.035), {key: 'reveal'});
  s.setPose('idle', 0.4);
  g.setCinematic(false);
  return l;
}

/** Las cuatro familias, abajo, mirando a la pizarra. */
export function familiesDown(g) {
  FAMILIES.forEach((f, k) => family(g.world, k, FX(k), GROUND, {facing: 0.5}));
}

// ——————————————————————————————————————————————
// 5.1 Medio atado
// ——————————————————————————————————————————————

function halfBundle(w, id, x, y) {
  const list = [];
  for (let i = 0; i < 5; i++) list.push(S([[(i - 2) * 3.8, -21], [(i - 2) * 3.8 + 0.4, 21]], seedOf(id) + i, {w: 2.4, p: 0.9}));
  list.push(S([[-11, 1], [11, 0]], seedOf(id) + 9, {w: 2.6, p: 0.95, ch: 2}));
  const sh = w.add(new Shape(id, list, x, y, {z: 15}));
  return sh;
}

export const medio = {
  id: 'c5.medio',
  title: 'Medio atado',
  setup(g) {
    const w = g.world;
    w.clear();
    base(g);
    cast(g, {sx: BOARD.x - BOARD.w / 2 - 200, mx: BOARD.x - BOARD.w / 2 - 90});
    familiesDown(g);
    item(w, 1, BOARD.x - 80, GROUND - 26, 'c5-a0').z = 15;
    item(w, 1, BOARD.x + 0, GROUND - 26, 'c5-a1').z = 15;
    g.camera.go(SHOTS.share);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    await d.shot(SHOTS.share, 1.2);
    await d.say('Balcón', 'Mara, ¿y los dos atados que sobraron ayer? Somos cuatro familias.');
    const opts = [
      {id: 'untie', text: 'Desatarlos: son veinte palitos.'},
      {id: 'halve', text: 'Partir cada atado por la mitad.'},
      {id: 'two', text: 'Darle uno a dos familias.'},
    ];
    let how;
    for (;;) {
      how = await d.choose(opts, {prompt: 'Dos atados entre cuatro familias, igual para todas. ¿Cómo se reparten?', evaluate: true});
      d.evidence('share-two', {choice: how});
      if (how !== 'two') break;
      await d.say('Cornisa', '¿Y Rampa y nosotras, nada? Ayer quedamos en que era igual para todas.');
      opts.splice(opts.findIndex(o => o.id === 'two'), 1);
    }
    g.setCinematic(true);
    const got = [];
    if (how === 'untie') {
      d.describe('Los dos atados se desatan: veinte palitos. Cada familia recibe cinco.');
      const sticks = [];
      for (const [a, id] of [[0, 'c5-a0'], [1, 'c5-a1']]) {
        const o = w.get(id);
        const x0 = o.x;
        w.remove(id);
        g.audio.erase(0.4, 0.3);
        for (let k = 0; k < 10; k++) sticks.push(item(w, 0, x0 - 20 + k * 4, GROUND - 26, `c5-s${a * 10 + k}`));
      }
      await d.wait(0.3);
      await d.all(...sticks.map((st, i) => {
        const f = i % 4, j = Math.floor(i / 4);
        st.z = 15;
        return hop(d, st, FX(f) - 80 + j * 11, GROUND - 24, {g, h: 80, dur: 0.5 + i * 0.03, sound: i % 5 ? null : 'tap'});
      }));
      got.push('cinco palitos');
    } else {
      d.describe('Cada atado se parte por la mitad: cuatro medios atados, uno para cada familia.');
      const halves = [];
      for (const [a, id] of [[0, 'c5-a0'], [1, 'c5-a1']]) {
        const o = w.get(id);
        const x0 = o.x;
        w.remove(id);
        g.audio.erase(0.4, 0.3);
        halves.push(halfBundle(w, `c5-h${a * 2}`, x0 - 12, GROUND - 26), halfBundle(w, `c5-h${a * 2 + 1}`, x0 + 12, GROUND - 26));
      }
      await d.all(...halves.map((h, i) => hop(d, h, FX(i) - 60, GROUND - 26, {g, h: 90, dur: 0.6 + i * 0.05, sound: i ? null : 'tap'})));
    }
    g.setCinematic(false);
    await d.think(how === 'untie' ? 'Cinco palitos cada una.' : 'Medio atado cada una.');
    await d.say('Mara', 'Cinco palitos: medio atado.');
    await d.think(how === 'untie' ? 'Partiendo cada atado por la mitad, daba lo mismo: dos nombres para lo mismo.' : 'Y desatando, daba lo mismo: cinco palitos. Dos nombres para lo mismo.');
    await d.shot(SHOTS.board, 0.8);
    await writeBoard(d, g, 'c5-l0', '2 atados entre 4 → 1/2 atado cada una', 0);
    await writeBoard(d, g, 'c5-l1', '1/2 atado = 5 palitos', 1);
    await d.say('student', 'Uno, una raya, dos: una parte, de dos iguales.');
    await d.say('Mara', 'Así lo anoto.');
    // ¿medio de qué?
    await d.shot(SHOTS.share, 0.8);
    await d.say('Cornisa', '¿Y si en vez de medio atado me dan medio montón? Allá hay seis atados.');
    g.setCinematic(true);
    const heap = [];
    for (let i = 0; i < 6; i++) heap.push(item(w, 1, BOARD.x - 140 + (i % 3) * 42, GROUND - 26 - Math.floor(i / 3) * 48, `c5-heap${i}`));
    for (const o of heap) { o.z = 15; o.progress = 0; }
    await d.tween(0.6, q => { for (const o of heap) o.progress = q; });
    g.setCinematic(false);
    const c = await d.choose([
      {id: 'atado', text: 'Medio atado.'},
      {id: 'monton', text: 'Medio montón.'},
      {id: 'same', text: 'Lo mismo: los dos son "medio".'},
    ], {prompt: '¿Qué es más: medio atado o medio montón de seis atados?', evaluate: true});
    d.evidence('unit-half', {answer: c});
    g.setCinematic(true);
    d.describe('El montón se separa en dos mitades de tres atados cada una.');
    await d.all(...heap.map((o, i) => d.tween(0.5, q => { o.x = lerp(BOARD.x - 140 + (i % 3) * 42, BOARD.x - 160 + (i % 3) * 42 + (i >= 3 ? 170 : 0), q); o.y = lerp(GROUND - 26 - Math.floor(i / 3) * 48, GROUND - 26, q); })));
    await pulse(d, heap[3], 1, 0.3);
    g.setCinematic(false);
    await d.think(c === 'monton' ? 'Medio montón son tres atados: mucho más que medio atado.' : 'Medio montón son tres atados. Medio atado, cinco palitos. "Medio" solo no dice cuánto.');
    await d.say('Mara', 'Medio, ¿de qué? Desde hoy, en mis cuentas eso va siempre.');
    g.flags.c5half = true;
  },
};

// ——————————————————————————————————————————————
// 5.2 Barras enteras
// ——————————————————————————————————————————————

const barY = k => GROUND - 34 - k * 42;

function restoreBars(w) {
  for (let k = 0; k < 3; k++) piece(w, `bar${k}`, BAR.w, BOARD.x - BAR.w / 2, barY(k));
}

/** Dónde va, en la barra fantasma de la familia k, un pedazo que empieza en `from` (de 0 a 1). */
const ghostSlot = (k, from) => [ghostX(k) + from * GHOST.w, GHOST.y];
const GS = GHOST.w / BAR.w;

export const barras = {
  id: 'c5.barras',
  title: 'Barras enteras',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(c5-|bar|pc-|ghost-|gfill)/.test(o.id));
    cast(g, {sx: BOARD.x - BOARD.w / 2 - 200, mx: BOARD.x - BOARD.w / 2 - 90});
    familiesDown(g);
    for (let k = 0; k < 4; k++) ghostBar(w, k);
    restoreBars(w);
    g.camera.go(SHOTS.share);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    await d.shot(SHOTS.share, 1);
    await d.say('Mara', 'Llegaron tres barras de tiza nueva para las cuatro familias. Estas no se desatan: son de una pieza.');
    await d.say('Mara', 'Arriba de cada familia dibujé una barra entera, punteada, para ver cuánto le toca.');
    // Punto corta a ojo
    g.setCinematic(true);
    p.setMode('still');
    const b0 = w.get('bar0');
    await zip(d, p, b0.x + 40, b0.y - 50, 0.4);
    d.describe('Punto corta la primera barra a ojo, en cuatro pedazos de distinto largo, y le da uno a cada familia.');
    const lens = [70, 100, 55, 95];
    const x0 = b0.x;
    w.remove('bar0');
    g.audio.erase(0.5, 0.4);
    let acc = 0;
    const uneven = lens.map((len, i) => { const pc = piece(w, `pc-u${i}`, len, x0 + acc + i * 8, barY(0)); acc += len; return pc; });
    await d.wait(0.3);
    await d.all(...uneven.map((pc, i) => d.all(hop(d, pc, ...ghostSlot(i, 0), {g, h: 120, dur: 0.6, sound: i ? null : 'tap'}), d.tween(0.6, q => { pc.scale = lerp(1, GS, q); }))));
    follow(p, s);
    g.setCinematic(false);
    await d.say('Rampa', 'El mío es más largo que el de Cornisa.');
    await d.say('Cornisa', '¡Y el mío es el más chico!');
    d.evidence('cut-uneven');
    g.audio.punto('sad');
    await d.say('Mara', 'Para que sea igual para todas, los pedazos tienen que ser iguales.');
    g.setCinematic(true);
    for (const pc of uneven) w.remove(pc.id);
    piece(w, 'bar0', BAR.w, BOARD.x - BAR.w / 2, barY(0)).progress = 0;
    await d.tween(0.5, q => { w.get('bar0').progress = q; });
    g.setCinematic(false);
    // elegir en cuántas partes iguales cortar
    const opts = [
      {id: '2', text: 'En 2.'},
      {id: '3', text: 'En 3.'},
      {id: '4', text: 'En 4.'},
    ];
    let n;
    const filled = [0, 0, 0, 0];
    for (;;) {
      n = Number(await d.choose(opts, {prompt: 'Tres barras entre cuatro familias. ¿En cuántas partes iguales cortás cada barra?'}));
      d.evidence('cut', {n});
      const pcs = await cutBars(d, g, n);
      const r = await dealPieces(d, g, pcs, filled, n);
      if (r.left.length === 0) break;
      if (n === 2) {
        await d.say('Mara', 'Sobran dos mitades, y son cuatro familias.');
        await d.think('Cada mitad, en dos: cuatro cuartos.');
        g.setCinematic(true);
        const quarters = [];
        for (const [i, h] of r.left.entries()) {
          const hx = h.x;
          w.remove(h.id);
          g.audio.erase(0.3, 0.3);
          quarters.push(piece(w, `pc-q${i * 2}`, BAR.w / 4, hx, h.y), piece(w, `pc-q${i * 2 + 1}`, BAR.w / 4, hx + BAR.w / 4 + 6, h.y));
        }
        g.setCinematic(false);
        await dealPieces(d, g, quarters, filled, 4);
        break;
      }
      // en tres: sobra un tercio que no se reparte en cuatro sin cortar de nuevo
      await d.say('Mara', 'Sobra un tercio, y son cuatro familias. Así se complica. Empecemos de nuevo.');
      g.setCinematic(true);
      w.removeWhere(o => o.id.startsWith('pc-'));
      filled.fill(0);
      restoreBars(w);
      for (let k = 0; k < 3; k++) w.get(`bar${k}`).progress = 0;
      await d.tween(0.5, q => { for (let k = 0; k < 3; k++) w.get(`bar${k}`).progress = q; });
      g.setCinematic(false);
      opts.splice(opts.findIndex(o => o.id === '3'), 1);
    }
    // cada barra fantasma quedó llena hasta las tres cuartas partes
    if (filled.some(f => Math.abs(f - 0.75) > 1e-9)) console.error(`[barras] las familias tienen ${filled.join(', ')} y la cuenta dice 3/4`);
    g.setCinematic(true);
    d.describe('En cada barra punteada quedan llenas tres de cuatro partes iguales.');
    const marks = [];
    for (let k = 0; k < 4; k++) {
      for (let q = 1; q < 4; q++) marks.push(w.add(new Drawing(`gfill-${k}-${q}`, [S([[ghostX(k) + q * GHOST.w / 4, GHOST.y - 12], [ghostX(k) + q * GHOST.w / 4, GHOST.y + 12]], seedOf(`gf${k}${q}`), {w: 2, p: 0.95, ch: YELLOW, lift: false})], {z: 17, progress: 0})));
    }
    await d.tween(0.6, q => { for (const m of marks) m.progress = q; });
    g.setCinematic(false);
    await d.think(n === 4 ? 'Tres cuartos de barra cada una.' : 'Media barra y un cuarto: la mitad son dos cuartos, así que son tres cuartos.');
    await d.say('student', 'Tres cuartos: tres partes, de las cuatro iguales que entran en una barra.');
    await d.shot(SHOTS.board, 0.8);
    await writeBoard(d, g, 'c5-l2', '3 barras entre 4 → 3/4 de barra cada una', 0);
    d.evidence('share-bars', {each: '3/4', path: n});
    g.flags.c5bars = true;
  },
};

/** Corta las tres barras en n partes iguales, separándolas un poco. */
async function cutBars(d, g, n) {
  const w = g.world;
  const len = BAR.w / n;
  const pcs = [];
  g.setCinematic(true);
  d.describe(`Cada barra se corta en ${n} partes iguales.`);
  for (let k = 0; k < 3; k++) {
    const b = w.get(`bar${k}`);
    const x0 = b.x;
    w.remove(b.id);
    for (let i = 0; i < n; i++) pcs.push(piece(w, `pc-${k}-${i}`, len, x0 + i * len, barY(k)));
    g.audio.erase(0.25, 0.3);
  }
  await d.tween(0.4, q => { for (const pc of pcs) { const i = Number(pc.id.split('-')[2]); pc.x = BOARD.x - BAR.w / 2 + i * (len + 8 * q); } });
  g.setCinematic(false);
  return pcs;
}

/** Reparte por vueltas: un pedazo a cada familia mientras alcance para todas. Devuelve lo que sobra. */
async function dealPieces(d, g, pcs, filled, n) {
  const rounds = Math.floor(pcs.length / 4);
  const give = pcs.slice(0, rounds * 4);
  const left = pcs.slice(rounds * 4);
  g.setCinematic(true);
  d.describe(rounds ? `Por vueltas, cada familia recibe ${rounds === 1 ? 'un pedazo' : `${rounds} pedazos`}.` : 'No alcanza para darle un pedazo a cada familia.');
  for (let r = 0; r < rounds; r++) {
    await d.all(...[0, 1, 2, 3].map(k => {
      const pc = give[r * 4 + k];
      const at = filled[k];
      filled[k] += 1 / n;
      return d.all(hop(d, pc, ...ghostSlot(k, at), {g, h: 110, dur: 0.55, sound: k ? null : 'tap'}), d.tween(0.55, q => { pc.scale = lerp(1, GS, q); }));
    }));
  }
  g.setCinematic(false);
  return {left};
}

// ——————————————————————————————————————————————
// 5.3 Dos de cuatro
// ——————————————————————————————————————————————

const ROW = {a: () => boardTop() + 110, b: () => boardTop() + 200};

export const equivalentes = {
  id: 'c5.equivalentes',
  title: 'Dos de cuatro',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(c5-|bar|pc-|ghost-|gfill|eq-)/.test(o.id));
    cast(g, {sx: BOARD.x - BOARD.w / 2 - 200, mx: BOARD.x - BOARD.w / 2 - 90});
    familiesDown(g);
    family(w, 2, BOARD.x - BOARD.w / 2 - 310, GROUND, {facing: 0.6});
    family(w, 0, BOARD.x - BOARD.w / 2 - 420, GROUND, {facing: 0.6});
    const x0 = BOARD.x - BAR.w / 2;
    w.add(new Label('eq-na', 'Cornisa', x0 - 10, ROW.a() + 8, {size: 24, align: 'right', z: 9}));
    w.add(new Label('eq-nb', 'Peldaño', x0 - 10, ROW.b() + 8, {size: 24, align: 'right', z: 9}));
    w.add(new Drawing('eq-ga', art.rectStrokesFor('eq-ga', x0, ROW.a() - BAR.h / 2, BAR.w, BAR.h).map(q => { q.p = 0.35; return q; }), {z: 8, fade: 0.5}));
    w.add(new Drawing('eq-gb', art.rectStrokesFor('eq-gb', x0, ROW.b() - BAR.h / 2, BAR.w, BAR.h).map(q => { q.p = 0.35; return q; }), {z: 8, fade: 0.5}));
    piece(w, 'eq-q0', BAR.w / 4, x0, ROW.a());
    piece(w, 'eq-q1', BAR.w / 4, x0 + BAR.w / 4 + 8, ROW.a());
    piece(w, 'eq-h0', BAR.w / 2, x0, ROW.b());
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'Ayer, a Cornisa le tocó una barra cortada en cuartos; a Peldaño, una cortada por la mitad.');
    await d.say('Cornisa', 'Yo tengo dos pedazos y Peldaño uno solo. ¡Tengo más!');
    const c = await d.choose([
      {id: 'cornisa', text: 'Cornisa: tiene dos pedazos.'},
      {id: 'peldano', text: 'Peldaño: su pedazo es más grande.'},
      {id: 'same', text: 'Tienen lo mismo.'},
    ], {prompt: 'Dos cuartos de barra o media barra: ¿quién tiene más tiza?', evaluate: true});
    d.evidence('equiv-predict', {answer: c});
    const x0 = BOARD.x - BAR.w / 2;
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá los pedazos de Cornisa para ponerlos sobre la barra de Peldaño.']);
      g.ui.setSpots([rectSpot('eq-move', 'Poner los dos cuartos de Cornisa sobre la mitad de Peldaño', {x: x0 - 6, y: ROW.a() - 30, w: BAR.w / 2 + 20, h: 60}, async () => {
        if (!ctl.alive()) return;
        g.ui.setSpots([]);
        const q0 = w.get('eq-q0'), q1 = w.get('eq-q1');
        try {
          await d.all(
            d.tween(0.7, k => { q0.y = lerp(ROW.a(), ROW.b(), k); }, easeInOut),
            d.tween(0.7, k => { q1.y = lerp(ROW.a(), ROW.b(), k); q1.x = lerp(x0 + BAR.w / 4 + 8, x0 + BAR.w / 4, k); }, easeInOut),
          );
          g.audio.tap(0.2, 1.4);
          const ring = w.add(new Drawing('eq-ring', art.rectStrokesFor('eq-ring', x0 - 4, ROW.b() - BAR.h / 2 - 4, BAR.w / 2 + 8, BAR.h + 8).map(q => { q.ch = YELLOW; return q; }), {z: 16, progress: 0}));
          await d.draw(ring, 0.5, {sound: false});
        } catch { return; }
        g.setHint(null);
        resolve();
      })]);
    }));
    const same = equivalent(frac(2, 4), frac(1, 2));
    await d.think(c === 'same' ? 'Llegan justo hasta el mismo lugar: lo mismo.' : c === 'cornisa' ? 'Dos pedazos, pero cada uno es la mitad de chico: llegan justo hasta el mismo lugar.' : 'Su pedazo es más grande, pero los dos de Cornisa llegan justo hasta el mismo lugar.');
    d.evidence('equiv', {same});
    await writeBoard(d, g, 'c5-l3', '2/4 = 1/2', 5, {size: 32});
    const t = await d.choose([
      {id: '3', text: 'Tres.'}, {id: '2', text: 'Dos.'}, {id: '6', text: 'Seis.'}, {id: '1', text: 'Uno.'},
    ], {prompt: '¿Cuántos sextos de barra hacen media barra?', evaluate: true});
    d.evidence('equiv-transfer', {answer: t});
    g.setCinematic(true);
    p.setMode('still');
    d.describe('Punto marca sextos sobre la barra de Peldaño: tres sextos llegan hasta la mitad.');
    const ticks = [];
    for (let i = 1; i < 6; i++) {
      const x = x0 + i * BAR.w / 6;
      await zip(d, p, x, ROW.b() - 50, 0.15);
      ticks.push(w.add(new Drawing(`eq-t${i}`, [S([[x, ROW.b() - BAR.h / 2 - 8], [x, ROW.b() + BAR.h / 2 + 8]], seedOf(`eqt${i}`), {w: 2, p: 0.95, ch: YELLOW, lift: false})], {z: 17})));
      g.audio.tap(0.12, 1.5);
    }
    follow(p, s);
    g.setCinematic(false);
    await d.think('Tres sextos llegan justo a la mitad.');
    await writeBoard(d, g, 'c5-l3', '1/2 = 2/4 = 3/6', 5, {size: 32});
    await d.say('student', 'El mismo pedazo de barra, con tres nombres.');
    await d.say('Cornisa', 'Bueno. Pero los míos son dos.');
    d.evidence('equiv-names', {names: ['1/2', '2/4', '3/6'], ok: equivalent(frac(3, 6), frac(1, 2))});
    g.flags.c5equiv = true;
  },
};

// ——————————————————————————————————————————————
// 5.4 Entre el 0 y el 1
// ——————————————————————————————————————————————

export const recta = {
  id: 'c5.recta',
  title: 'Entre el 0 y el 1',
  setup(g) {
    const w = g.world;
    base(g, {line: true});
    w.removeWhere(o => /^(l5p-|l5m-|l5f-)/.test(o.id));
    cast(g, {sx: lx(0) - 160, mx: lx(2) + 140});
    g.camera.go(SHOTS.line);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    await d.shot(SHOTS.line, 1);
    await d.say('Mara', 'Para el registro: una línea como la de Curva, pero con el 1 bien lejos del 0. ¿Dónde anoto los tres cuartos de barra?');
    // elegir la partición; sólo la de cuartos tiene una marca para 3/4
    const opts = [{id: '2', text: 'Partir cada tramo en 2.'}, {id: '3', text: 'Partir cada tramo en 3.'}, {id: '4', text: 'Partir cada tramo en 4.'}];
    let dpart;
    for (;;) {
      dpart = Number(await d.choose(opts, {prompt: 'Para marcar 3/4, ¿en cuántas partes iguales partís el tramo de 0 a 1?'}));
      d.evidence('line-partition', {d: dpart});
      g.setCinematic(true);
      const pt = partitionOn(w, dpart, {progress: 0});
      await d.draw(pt, 0.8);
      g.setCinematic(false);
      if (dpart === 4) break;
      await d.think(dpart === 2 ? 'Con mitades hay una marca para 1/2, pero ninguna para tres cuartos.' : 'Con tercios no hay ninguna marca que sea tres cuartos.');
      g.setCinematic(true);
      await d.fadeTo(pt, 0, 0.4);
      w.remove(pt.id);
      g.setCinematic(false);
      opts.splice(opts.findIndex(o => o.id === String(dpart)), 1);
    }
    // ubicar 3/4
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Cada marca es un cuarto más. Tocá la marca de 3/4.']);
      const refresh = () => {
        const spots = [];
        for (let i = 1; i < 4; i++) spots.push(rectSpot(`q${i}`, `Marca ${i} de 4 entre el 0 y el 1`, {x: lx(i / 4) - 20, y: GROUND - 34, w: 40, h: 80}, () => pick(i)));
        g.ui.setSpots(spots);
      };
      const pick = async i => {
        if (busy || !ctl.alive()) return;
        busy = true;
        p.setMode('still');
        try {
          await zip(d, p, lx(0), GROUND - 40, 0.3);
          for (let k = 1; k <= i; k++) { await zip(d, p, lx(k / 4), GROUND - 40, 0.22); g.audio.tap(0.12, 1.4 + k * 0.08); }
        } catch { return; }
        d.evidence('place-frac', {at: `${i}/4`});
        if (i !== 3) {
          try { await d.think(`Esa es ${['', 'un cuarto', 'dos cuartos: la mitad'][i]}. Tres cuartos es un salto más.`); } catch { return; }
          follow(p, s);
          busy = false;
          return refresh();
        }
        resolve();
      };
      refresh();
    }));
    g.setHint(null);
    fracLabel(w, 'l5f-34', 3, 4, lx(0.75), GROUND - 110, {ch: YELLOW});
    follow(p, s);
    // 5/4
    const c = await d.choose([
      {id: 'past', text: 'Pasando el 1.'},
      {id: 'in', text: 'Entre el 0 y el 1.'},
      {id: 'none', text: 'En ningún lado: no se pueden tomar 5 de 4 partes.'},
    ], {prompt: '¿Y dónde va 5/4?', evaluate: true});
    d.evidence('predict-54', {answer: c});
    g.setCinematic(true);
    p.setMode('still');
    d.describe('Punto salta de cuarto en cuarto desde el 0: cinco saltos lo dejan pasando el 1.');
    await zip(d, p, lx(0), GROUND - 40, 0.3);
    for (let k = 1; k <= 5; k++) { await zip(d, p, lx(k / 4), GROUND - 40, 0.22); g.audio.tap(0.12, 1.4 + k * 0.08); }
    fracLabel(w, 'l5f-54', 5, 4, lx(1.25), GROUND - 110, {ch: YELLOW});
    g.setCinematic(false);
    await d.think(c === 'past' ? 'Cinco cuartos: una barra entera y un cuarto más.' : 'Cinco cuartos pasan el 1: una barra entera y un cuarto más. Cuartos hay los que haga falta.');
    // entre 1/2 y 3/4
    const dn = await d.choose([
      {id: 'no', text: 'No: son marcas vecinas.'},
      {id: 'yes', text: 'Sí, partiendo más fino.'},
    ], {prompt: '¿Hay algún número entre 1/2 y 3/4?', evaluate: true});
    d.evidence('density', {answer: dn});
    g.setCinematic(true);
    d.describe('Punto parte cada cuarto en dos: aparece una marca nueva entre 1/2 y 3/4, la de 5/8. Después parte otra vez, y aparece otra entre 1/2 y 5/8.');
    const p8 = partitionOn(w, 8, {progress: 0});
    await d.draw(p8, 0.8, {sound: false});
    fracLabel(w, 'l5f-58', 5, 8, lx(5 / 8), GROUND - 190, {ch: YELLOW, size: 24});
    await d.wait(0.4);
    const p16 = partitionOn(w, 16, {progress: 0});
    await d.draw(p16, 0.8, {sound: false});
    fracLabel(w, 'l5f-916', 9, 16, lx(9 / 16), GROUND - 260, {ch: YELLOW, size: 22});
    g.setCinematic(false);
    await d.think(dn === 'yes' ? 'Siempre cabe otro: partiendo más fino, siempre aparece una marca en el medio.' : 'No eran vecinas: entre dos marcas siempre cabe otra, partiendo más fino.');
    d.evidence('between', {a: '1/2', b: '3/4', found: ['5/8', '9/16'], ok: compare(frac(1, 2), frac(9, 16)) < 0 && compare(frac(9, 16), frac(5, 8)) < 0});
    g.flags.c5line = true;
  },
};

export {Drawing, WHITE};
