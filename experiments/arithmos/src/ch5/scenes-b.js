// Capítulo 5 — Partes de algo (5.5 a 5.9): comparar, sumar, décimos, de cada cien y lo que no entra justo.

import {Drawing, Label, Shape, Custom} from '../engine/world.js';
import {YELLOW, WHITE} from '../engine/chalk.js';
import {lerp, easeInOut} from '../engine/rng.js';
import {zip, hop, pulse, follow, rectSpot, wordSpot} from '../acting.js';
import {frac, compare, add, naiveAdd, decimal, percentOf, measureWith, diagonalFits} from '../logic/fractions.js';
import {GROUND, BOARD, boardTop, SHOTS, BAR, base, cast, family, familiesHome, item, piece, S, seedOf, art} from './common.js';
import {boardText, writeBoard, familiesDown} from './scenes-a.js';

const rowY = i => boardTop() + 100 + i * 90;
const X0 = BOARD.x - BAR.w / 2 - 60;

/** Una barra punteada en la pizarra (la unidad de referencia). */
function guide(w, id, y) {
  return w.ensure(id, () => new Drawing(id, art.rectStrokesFor(id, X0, y - BAR.h / 2, BAR.w, BAR.h).map(q => { q.p = 0.35; return q; }), {z: 8, fade: 0.5}));
}

/** Marcas de partición sobre una barra de la pizarra. */
function ticks(w, id, y, d, ch = YELLOW) {
  const list = [];
  for (let i = 1; i < d; i++) list.push(S([[X0 + i * BAR.w / d, y - BAR.h / 2 - 6], [X0 + i * BAR.w / d, y + BAR.h / 2 + 6]], seedOf(id) + i, {w: 1.8, p: 0.9, ch, lift: false}));
  return w.add(new Drawing(id, list, {z: 17, progress: 0}));
}

function boardCast(g) {
  const w = g.world;
  cast(g, {sx: BOARD.x - BOARD.w / 2 - 200, mx: BOARD.x - BOARD.w / 2 - 90});
  familiesDown(g);
}

// ——————————————————————————————————————————————
// 5.5 Más partes, más chicas
// ——————————————————————————————————————————————

export const comparar = {
  id: 'c5.comparar',
  title: 'Más partes, más chicas',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(c5-|bar|pc-|ghost-|gfill|eq-|cm-|l5)/.test(o.id));
    boardCast(g);
    guide(w, 'cm-ga', rowY(0));
    guide(w, 'cm-gb', rowY(1));
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    await d.shot(SHOTS.board, 1);
    // Punto escribe su idea
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, BOARD.x + 120, boardTop() + 230, 0.4);
    d.describe('Punto escribe en la pizarra, en amarillo: 1/4 > 1/3. Porque 4 es más que 3.');
    const pl = w.add(new Label('cm-p', '1/4 > 1/3', BOARD.x + 60, boardTop() + 268, {size: 30, z: 16, ch: YELLOW, reveal: 0, weight: 700}));
    await d.draw(pl, 0.6, {key: 'reveal', sound: false});
    g.audio.punto('happy');
    follow(p, s);
    g.setCinematic(false);
    await d.say('Rampa', 'Punto dice que un cuarto de barra es más que un tercio, porque cuatro es más que tres.');
    const c = await d.choose([
      {id: 'q', text: '1/4 de barra.'},
      {id: 't', text: '1/3 de barra.'},
      {id: 'same', text: 'Lo mismo: los dos son un pedazo.'},
    ], {prompt: '¿Qué es más: un cuarto o un tercio de la misma barra?', evaluate: true});
    d.evidence('compare-unit', {answer: c});
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá las barras para partirlas y comparar los pedazos.']);
      g.ui.setSpots([rectSpot('cm-cut', 'Partir una barra en 4 y otra en 3', {x: X0 - 6, y: rowY(0) - 30, w: BAR.w + 12, h: rowY(1) - rowY(0) + 60}, async () => {
        if (!ctl.alive()) return;
        g.ui.setSpots([]);
        try {
          const ta = ticks(w, 'cm-ta', rowY(0), 4), tb = ticks(w, 'cm-tb', rowY(1), 3);
          await d.all(d.draw(ta, 0.5, {sound: false}), d.draw(tb, 0.5, {sound: false}));
          const a = piece(w, 'cm-a', BAR.w / 4, X0, rowY(0));
          const b = piece(w, 'cm-b', BAR.w / 3, X0, rowY(1));
          a.progress = b.progress = 0;
          await d.tween(0.6, q => { a.progress = b.progress = q; });
          // se juntan, uno arriba del otro
          await d.all(d.tween(0.6, q => { a.y = lerp(rowY(0), rowY(0) + 30, q); b.y = lerp(rowY(1), rowY(0) + 66, q); }, easeInOut));
        } catch { return; }
        g.setHint(null);
        resolve();
      })]);
    }));
    await d.think(c === 't' ? 'El tercio es más largo: más partes, más chicas.' : 'El tercio es más largo. Partir en más partes hace pedazos más chicos.');
    g.setCinematic(true);
    g.audio.erase(0.4, 0.3);
    pl.text = '1/4 < 1/3';
    pl.reveal = 0;
    await d.draw(pl, 0.6, {key: 'reveal', sound: false});
    g.audio.punto('sad');
    g.setCinematic(false);
    // transferencia: 2/3 y 3/4
    w.removeWhere(o => /^cm-(a|b|ta|tb)$/.test(o.id));
    const c2 = await d.choose([
      {id: '34', text: '3/4.'}, {id: '23', text: '2/3.'}, {id: 'same', text: 'Son iguales: a los dos les falta un pedazo.'},
    ], {prompt: '¿Qué es más: 2/3 o 3/4 de barra?', evaluate: true});
    d.evidence('compare-two', {answer: c2});
    g.setCinematic(true);
    d.describe('Las dos barras se parten en doce: dos tercios son ocho doceavos; tres cuartos, nueve doceavos.');
    const t12a = ticks(w, 'cm-12a', rowY(0), 12, WHITE), t12b = ticks(w, 'cm-12b', rowY(1), 12, WHITE);
    await d.all(d.draw(t12a, 0.6, {sound: false}), d.draw(t12b, 0.6, {sound: false}));
    const fa = piece(w, 'cm-fa', BAR.w * 2 / 3, X0, rowY(0), {ch: YELLOW});
    const fb = piece(w, 'cm-fb', BAR.w * 3 / 4, X0, rowY(1), {ch: YELLOW});
    fa.progress = fb.progress = 0;
    await d.tween(0.8, q => { fa.progress = fb.progress = q; });
    w.add(new Label('cm-la', '2/3 = 8/12', X0 + BAR.w + 14, rowY(0) + 9, {size: 22, z: 9}));
    w.add(new Label('cm-lb', '3/4 = 9/12', X0 + BAR.w + 14, rowY(1) + 9, {size: 22, z: 9}));
    g.setCinematic(false);
    const ok = compare(frac(2, 3), frac(3, 4)) < 0;
    await d.think(c2 === '34' ? 'Tres cuartos: nueve doceavos contra ocho.' : c2 === 'same' ? 'A los dos les falta un pedazo, pero no del mismo tamaño: nueve doceavos contra ocho.' : 'Con la misma partición se ve: ocho doceavos contra nueve. Tres cuartos es más.');
    d.evidence('compare-result', {ok});
    g.flags.c5compare = true;
  },
};

// ——————————————————————————————————————————————
// 5.6 Sumar pedazos
// ——————————————————————————————————————————————

export const sumar = {
  id: 'c5.sumar',
  title: 'Sumar pedazos',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(cm-|sm-)/.test(o.id));
    boardCast(g);
    guide(w, 'sm-g0', rowY(0));
    guide(w, 'sm-g1', rowY(1));
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    await d.shot(SHOTS.board, 1);
    await d.say('Balcón', 'Rampa tenía media barra y yo le di un tercio de la mía.');
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, BOARD.x + 120, boardTop() + 230, 0.4);
    d.describe('Punto escribe: 1/2 + 1/3 = 2/5. Uno más uno arriba; dos más tres abajo.');
    const pl = w.add(new Label('sm-p', '1/2 + 1/3 = 2/5', BOARD.x + 10, boardTop() + 268, {size: 28, z: 16, ch: YELLOW, reveal: 0, weight: 700}));
    await d.draw(pl, 0.7, {key: 'reveal', sound: false});
    g.audio.punto('happy');
    follow(p, s);
    g.setCinematic(false);
    const c = await d.choose([
      {id: '25', text: '2/5 de barra, como dice Punto.'},
      {id: '56', text: '5/6 de barra.'},
      {id: '26', text: '2/6 de barra.'},
    ], {prompt: 'Media barra más un tercio de barra: ¿cuánto tiene Rampa?', evaluate: true});
    d.evidence('add-predict', {answer: c});
    // los pedazos, uno a continuación del otro; y lo que dice Punto, debajo
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá la barra de arriba para juntar los dos pedazos de Rampa.']);
      g.ui.setSpots([rectSpot('sm-join', 'Juntar la media barra y el tercio', {x: X0 - 6, y: rowY(0) - 30, w: BAR.w + 12, h: 60}, async () => {
        if (!ctl.alive()) return;
        g.ui.setSpots([]);
        try {
          const h = piece(w, 'sm-h', BAR.w / 2, X0, rowY(0) - 70);
          const t = piece(w, 'sm-t', BAR.w / 3, X0 + BAR.w / 2 + 40, rowY(0) - 70);
          h.progress = t.progress = 0;
          await d.tween(0.5, q => { h.progress = t.progress = q; });
          await d.all(
            d.tween(0.6, q => { h.y = lerp(rowY(0) - 70, rowY(0), q); }, easeInOut),
            d.tween(0.6, q => { t.y = lerp(rowY(0) - 70, rowY(0), q); t.x = lerp(X0 + BAR.w / 2 + 40, X0 + BAR.w / 2, q); }, easeInOut),
          );
          const pk = piece(w, 'sm-pk', BAR.w * 2 / 5, X0, rowY(1), {ch: YELLOW});
          pk.progress = 0;
          await d.tween(0.6, q => { pk.progress = q; });
          w.add(new Label('sm-lp', '2/5', X0 + BAR.w + 14, rowY(1) + 9, {size: 22, z: 9, ch: YELLOW}));
        } catch { return; }
        g.setHint(null);
        resolve();
      })]);
    }));
    await d.think('Lo de Punto, abajo, es más corto que la media barra sola. Juntando, no puede haber menos.');
    g.audio.punto('sad');
    // partición común: sextos
    g.setCinematic(true);
    d.describe('La barra de arriba se parte en sextos: la mitad son tres sextos; el tercio, dos sextos. Juntos, cinco sextos.');
    const t6 = ticks(w, 'sm-t6', rowY(0), 6, WHITE);
    await d.draw(t6, 0.6, {sound: false});
    w.add(new Label('sm-l0', '5/6', X0 + BAR.w + 14, rowY(0) + 9, {size: 22, z: 9}));
    g.setCinematic(false);
    const r = add(frac(1, 2), frac(1, 3));
    const wrong = naiveAdd(frac(1, 2), frac(1, 3));
    await d.think(c === '56' ? 'Cinco sextos: para sumar, primero los mismos pedazos.' : 'Cinco sextos. Para sumar pedazos, primero hay que cortarlos del mismo tamaño.');
    await writeBoard(d, g, 'sm-eq', '1/2 + 1/3 = 3/6 + 2/6 = 5/6', 0, {size: 28});
    pl.text = '1/2 + 1/3 ≠ 2/5';
    d.evidence('add', {result: `${r.n}/${r.d}`, naive: `${wrong.n}/${wrong.d}`, naiveSmaller: compare(wrong, frac(1, 2)) < 0});
    g.flags.c5add = true;
  },
};

// ——————————————————————————————————————————————
// 5.7 El cuarto de los décimos
// ——————————————————————————————————————————————

export const decimos = {
  id: 'c5.decimos',
  title: 'El cuarto de los décimos',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(cm-|sm-|dc-)/.test(o.id));
    boardCast(g);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'Para el depósito tengo que anotar cuántas barras quedan: dos enteras… y media.');
    // en la pizarra: dos cajas y una coma; las barras a la izquierda
    const top = boardTop();
    const bx = BOARD.x - 250, bw = 140, gap = 30, by = top + 70, bh = 120;
    const b1x = bx + bw + gap, b2x = bx + 2 * (bw + gap);
    w.add(new Drawing('dc-box0', art.rectStrokesFor('dc-box0', bx, by, bw, bh), {z: 9}));
    w.add(new Drawing('dc-box1', art.rectStrokesFor('dc-box1', b1x, by, bw, bh), {z: 9}));
    w.add(new Label('dc-n0', 'barras', bx + bw / 2, by + bh + 30, {size: 20, align: 'center', z: 9}));
    w.add(new Label('dc-n1', 'décimos', b1x + bw / 2, by + bh + 30, {size: 20, align: 'center', z: 9}));
    for (let k = 0; k < 2; k++) piece(w, `dc-b${k}`, bw - 24, bx + 12, by + 34 + k * 44, {scale: 1});
    const half = piece(w, 'dc-half', BAR.w / 2, BOARD.x + BOARD.w / 2 + 40, GROUND - 40);
    await d.say('Mara', 'Las enteras van en su cuarto. ¿Y la media?');
    const opts = [
      {id: 'tenths', text: 'Partirla en décimos y guardarlos en el cuarto de al lado.'},
      {id: 'with', text: 'Guardarla con las enteras.'},
      {id: 'apart', text: 'Dejarla afuera: no es una barra.'},
    ];
    for (;;) {
      const c = await d.choose(opts, {prompt: 'Media barra no es una barra entera. ¿Dónde se guarda?', evaluate: true});
      d.evidence('store-half', {choice: c});
      if (c === 'tenths') break;
      await d.say('Mara', c === 'with' ? 'Si la pongo con las enteras, después alguien cuenta tres barras.' : 'Afuera se pierde. Y es tiza.');
      opts.splice(opts.findIndex(o => o.id === c), 1);
    }
    g.setCinematic(true);
    d.describe('La media barra se parte en cinco décimos de barra, que entran en el cuarto de la derecha.');
    w.remove('dc-half');
    const tenths = [];
    for (let i = 0; i < 5; i++) tenths.push(piece(w, `dc-t${i}`, BAR.w / 10, half.x + i * (BAR.w / 10 + 4), GROUND - 40));
    g.audio.erase(0.4, 0.3);
    await d.all(...tenths.map((t, i) => hop(d, t, b1x + 6 + (i % 4) * 33, by + 30 + Math.floor(i / 4) * 44, {g, h: 120, dur: 0.6 + i * 0.05, sound: i ? null : 'tap'})));
    // la coma: la pone Punto, como puso la rayita del menos
    p.setMode('still');
    await zip(d, p, bx + bw + 12, by + bh - 50, 0.4);
    d.describe('Punto pone una marca amarilla entre las dos cajas, abajo: una coma.');
    const comma = w.add(new Label('dc-comma', ',', bx + bw + 8, by + bh - 6, {size: 80, z: 10, ch: YELLOW, reveal: 0, weight: 700}));
    await d.draw(comma, 0.5, {key: 'reveal', sound: false});
    g.audio.punto('happy');
    follow(p, s);
    g.setCinematic(false);
    await d.say('Mara', 'Una coma de Punto, entre las barras y sus partes. Así nadie confunde los cuartos.');
    await writeBoard(d, g, 'dc-l0', '2,5 = 2 + 5/10 = 2 + 1/2', 0, {size: 30});
    // 2,05
    await d.say('Mara', 'En el registro viejo encontré esto: 2,05. ¿Es lo mismo?');
    const c2 = await d.choose([
      {id: 'same', text: 'Sí: el 0 no cuenta nada.'},
      {id: 'less', text: 'No: es menos que 2,5.'},
      {id: 'more', text: 'No: es más que 2,5.'},
    ], {prompt: '¿2,05 es lo mismo que 2,5?', evaluate: true});
    d.evidence('read-205', {answer: c2});
    g.setCinematic(true);
    d.describe('Aparece un tercer cuarto, el de los centésimos. 2,05: dos barras, ningún décimo, cinco centésimos, chiquitos.');
    w.add(new Drawing('dc-box2', art.rectStrokesFor('dc-box2', b2x, by, bw, bh), {z: 9, progress: 0}));
    await d.draw(w.get('dc-box2'), 0.5);
    w.add(new Label('dc-n2', 'centésimos', b2x + bw / 2, by + bh + 30, {size: 20, align: 'center', z: 9}));
    // en 2,05 los décimos quedan vacíos: se apartan los de recién
    for (const t of tenths) t.fade = 0.25;
    for (let i = 0; i < 5; i++) piece(w, `dc-c${i}`, BAR.w / 100 + 2, b2x + 20 + i * 18, by + bh / 2, {h: 14, ch: YELLOW});
    g.setCinematic(false);
    const v205 = decimal('2,05'), v25 = decimal('2,5');
    await d.think(c2 === 'less' ? 'Menos: cinco centésimos es mucho menos que cinco décimos.' : 'No: cinco centésimos es mucho menos que cinco décimos. 2,05 es menos que 2,5.');
    await d.say('student', 'El cero guarda el lugar de los décimos. Como en el depósito.');
    await d.say('Mara', 'El cero otra vez. Ya no se me escapa.');
    d.evidence('decimal', {a: '2,05', b: '2,5', less: compare(v205, v25) < 0});
    g.flags.c5dec = true;
  },
};

// ——————————————————————————————————————————————
// 5.8 De cada cien
// ——————————————————————————————————————————————

export const cien = {
  id: 'c5.cien',
  title: 'De cada cien',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(dc-|pc5-)/.test(o.id));
    cast(g, {sx: BOARD.x - BOARD.w / 2 - 200, mx: BOARD.x - BOARD.w / 2 - 90});
    familiesHome(g);
    family(w, 0, BOARD.x - BOARD.w / 2 - 330, GROUND, {facing: 0.6});
    g.camera.go(SHOTS.share);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    await d.shot(SHOTS.share, 1);
    await d.say('Peldaño', 'Mara nos ofrece dos tratos para la próxima cosecha. El 50 % de 80 palitos, o el 80 % de 50.');
    await d.say('Mara', 'Por ciento quiere decir "de cada cien". El 50 % es la mitad: 50 de cada 100.');
    const c = await d.choose([
      {id: 'a', text: 'El 50 % de 80.'},
      {id: 'b', text: 'El 80 % de 50.'},
      {id: 'same', text: 'Dan lo mismo.'},
    ], {prompt: '¿Qué trato les conviene más?', evaluate: true});
    d.evidence('percent-predict', {answer: c});
    // 80 palitos: 8 atados; la mitad, 4
    g.setCinematic(true);
    d.describe('A la izquierda, 8 atados: la mitad son 4. A la derecha, 5 atados: de cada uno se separan 8 palitos de 10.');
    const A = [], B = [];
    for (let i = 0; i < 8; i++) A.push(item(w, 1, 13020 + i * 46, GROUND - 26, `pc5-a${i}`));
    for (let i = 0; i < 5; i++) B.push(item(w, 1, 13450 + i * 46, GROUND - 26, `pc5-b${i}`));
    for (const o of [...A, ...B]) { o.z = 15; o.progress = 0; }
    await d.tween(0.6, q => { for (const o of [...A, ...B]) o.progress = q; });
    await d.all(...A.slice(4).map(o => d.tween(0.4, q => { o.y = lerp(GROUND - 26, GROUND - 90, q); })));
    w.add(new Label('pc5-la', '50 % de 80 = 40', 13100, GROUND - 160, {size: 26, z: 9}));
    // 80 % de cada atado: 8 de 10
    for (const [i, b] of B.entries()) {
      const x0 = b.x;
      w.remove(b.id);
      for (let k = 0; k < 10; k++) {
        const st = item(w, 0, x0 - 18 + k * 4, GROUND - 26, `pc5-s${i}-${k}`);
        st.z = 15;
        if (k < 8) st.y = GROUND - 90;
      }
    }
    g.audio.erase(0.4, 0.3);
    w.add(new Label('pc5-lb', '80 % de 50 = 40', 13440, GROUND - 160, {size: 26, z: 9}));
    g.setCinematic(false);
    const a = percentOf(50, 80), b2 = percentOf(80, 50);
    await d.think(c === 'same' ? 'Lo mismo: cuarenta y cuarenta.' : 'Cuarenta y cuarenta: dan lo mismo.');
    await d.say('Peldaño', 'La mitad de 80, o 8 de cada 10 de 50: cuarenta las dos veces. Mara, sos tramposa.');
    await d.think('Un porcentaje solo no dice cuánto: hay que saber de qué.');
    d.evidence('percent', {a, b: b2});
    g.flags.c5percent = true;
  },
};

// ——————————————————————————————————————————————
// 5.9 Lo que no entra justo (momento)
// ——————————————————————————————————————————————

export const diagonal = {
  id: 'c5.diagonal',
  title: 'Lo que no entra justo',
  moment: 'Lo que no entra justo',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(pc5-|dg5-)/.test(o.id));
    boardCast(g);
    family(w, 0, BOARD.x - BOARD.w / 2 - 330, GROUND, {facing: 0.6});
    g.camera.go(SHOTS.board);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    await d.shot(SHOTS.board, 1);
    await d.say('Peldaño', 'Mi huerta nueva es cuadrada: de lado, una barra justa. Quiero un camino en diagonal. ¿Cuántas barras mide?');
    const top = boardTop();
    const side = 200;
    const sx = BOARD.x - 230, sy = top + 50;
    const sq = w.add(new Drawing('dg5-sq', art.rectStrokesFor('dg5-sq', sx, sy, side, side), {z: 9, progress: 0}));
    const diag = w.add(new Drawing('dg5-dg', [S([[sx, sy + side], [sx + side, sy]], seedOf('dg5'), {w: 3, p: 0.95, ch: YELLOW})], {z: 10, progress: 0}));
    await d.draw(sq, 0.6);
    await d.draw(diag, 0.6);
    w.add(new Label('dg5-l1', '1 barra', sx + side / 2, sy + side + 30, {size: 22, align: 'center', z: 9}));
    const tries = [10, 100, 1000];
    const L = Math.SQRT2;
    for (const [i, dd] of tries.entries()) {
      const m = measureWith(L, dd);
      const name = {10: 'décimos', 100: 'centésimos', 1000: 'milésimos'}[dd];
      const lo = (m.parts / dd).toFixed(String(dd).length - 1).replace('.', ',');
      const hi = ((m.parts + 1) / dd).toFixed(String(dd).length - 1).replace('.', ',');
      g.setCinematic(true);
      d.describe(`Punto mide la diagonal en ${name} de barra: ${m.parts} se quedan cortos y ${m.parts + 1} se pasan.`);
      p.setMode('still');
      await zip(d, p, sx + side * 0.2, sy + side * 0.8 - 30, 0.3);
      await zip(d, p, sx + side * 0.95, sy + side * 0.05 - 30, 0.6);
      g.audio.punto('question');
      const l = w.add(new Label(`dg5-m${i}`, `${lo} < diagonal < ${hi}`, BOARD.x - 10, top + 80 + i * 46, {size: 22, z: 9, reveal: 0}));
      await d.draw(l, 0.6, {key: 'reveal', sound: false});
      follow(p, s);
      g.setCinematic(false);
      if (i === 0) await d.think('Catorce décimos no llegan; quince se pasan.');
      d.evidence('diag-try', {d: dd, lo: m.parts, exact: m.exact});
    }
    const c = await d.choose([
      {id: 'finer', text: 'Sí: partiendo bastante fino, en algún momento entra justo.'},
      {id: 'none', text: 'Hasta ahora ninguna. Quizás no haya ninguna.'},
      {id: 'never', text: 'No se puede saber nunca.'},
    ], {prompt: '¿Habrá alguna partición de la barra que mida la diagonal justo?', evaluate: true});
    d.evidence('diag-predict', {answer: c});
    const fits = diagonalFits(2000);
    await d.say('Mara', 'Probé toda la noche con partes más chicas. Ninguna entra justo.');
    await d.think('Probar que ninguna, nunca, va a entrar justo es otra cosa: hay una manera de probarlo, y la vamos a necesitar cuando dibujemos cuadrados.');
    await d.think(c === 'none' ? 'Las aproximaciones se acercan cada vez más, pero ninguna llega justo.' : c === 'finer' ? 'Partir más fino acerca, pero no alcanza: ninguna partición entra justo.' : 'Sí se puede saber, con una prueba. Por ahora: cada vez más cerca, nunca justo.');
    const ap = w.add(new Label('dg5-eq', 'diagonal ≈ 1,414', BOARD.x - 10, top + 240, {size: 26, z: 9, reveal: 0}));
    g.setCinematic(true);
    s.face(1);
    await d.walk(s, BOARD.x - BOARD.w / 2 - 40, GROUND, 240);
    s.setPose('write', 0.3);
    await d.draw(ap, 0.7, {key: 'reveal'});
    s.setPose('idle', 0.4);
    g.setCinematic(false);
    await d.say('student', 'Con la raya ondulada: "más o menos". Lo exacto no lo sé escribir todavía.');
    d.evidence('diag', {fits: !!fits});
    if (!replay) writeJournal5(g);
    await d.say('Peldaño', 'Más o menos me alcanza para el camino. Pero la diagonal… ¿cómo se la escribe exacta?');
    g.audio.punto('question');
    await pulse(d, p, 1, 0.4);
    await d.think('Algo que existe, que se puede medir cada vez mejor, y que todavía no sabemos escribir. Lo que no se ve.');
  },
};

function writeJournal5(g) {
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1));
  const first = k => ev.find(e => e.kind === k);
  const seen = [];
  const st = first('share-two');
  if (st) seen.push(st.choice === 'untie' ? 'Repartiste los dos atados desatándolos: cinco palitos, medio atado cada una.' : st.choice === 'halve' ? 'Partiste cada atado por la mitad: medio atado, cinco palitos, cada una.' : 'Darle un atado a dos familias no era igual para todas.');
  const uh = first('unit-half');
  if (uh) seen.push(uh.answer === 'monton' ? 'Viste que medio montón de seis es más que medio atado: "medio" depende de qué.' : 'Pensaste que dos "medios" eran lo mismo; medio montón eran tres atados.');
  if (first('cut-uneven')) seen.push('Cuando Punto cortó a ojo, las familias protestaron: para repartir igual, partes iguales.');
  const cuts = ev.filter(e => e.kind === 'cut').map(e => e.n);
  if (cuts.length) seen.push(`Cortaste las barras en ${cuts.join(', después en ')}: cada familia terminó con tres cuartos de barra.`);
  const eq = first('equiv-predict');
  if (eq) seen.push(eq.answer === 'same' ? 'Anticipaste que dos cuartos y una mitad son lo mismo.' : 'Pensaste que dos cuartos y una mitad no eran lo mismo; superpuestos coincidían.');
  const pl = first('line-partition');
  if (pl) seen.push('Para ubicar 3/4 en la línea partiste el tramo de 0 a 1 en cuartos; 5/4 quedó pasando el 1.');
  const cu = first('compare-unit');
  if (cu) seen.push(cu.answer === 't' ? 'Anticipaste que un tercio es más que un cuarto.' : 'Pensaste, como Punto, que un cuarto era más o igual que un tercio; los pedazos mostraron lo contrario.');
  const ap = first('add-predict');
  if (ap) seen.push(ap.answer === '56' ? 'Sumaste media barra y un tercio: cinco sextos.' : 'Viste que 2/5 era menos que la media barra sola: para sumar hacen falta pedazos iguales (5/6).');
  const rd = first('read-205');
  if (rd) seen.push(rd.answer === 'less' ? 'Viste que 2,05 es menos que 2,5.' : 'Creíste que 2,05 era lo mismo o más que 2,5; el cero guardaba el lugar de los décimos.');
  const pp = first('percent-predict');
  if (pp) seen.push(pp.answer === 'same' ? 'Anticipaste que el 50 % de 80 y el 80 % de 50 dan lo mismo.' : 'El 50 % de 80 y el 80 % de 50 dieron lo mismo: 40.');
  const dp = first('diag-predict');
  if (dp) seen.push('Mediste la diagonal de un cuadrado de lado 1 con décimos, centésimos y milésimos: siempre cerca, nunca justo.');
  const entry = {
    id: 'c5',
    title: 'Partes de algo',
    abbr: 'Una fracción mide con partes iguales de una unidad; un mismo número tiene muchos nombres.',
    body: [
      '"Medio" depende de qué: medio atado son 5 palitos; medio montón de seis atados, tres atados.',
      'n/d de una unidad: n partes de las d iguales que entran en ella. 3 barras entre 4: 3/4 de barra cada una.',
      'El mismo número tiene muchos nombres: 1/2 = 2/4 = 3/6 = 0,5.',
      'En la recta, entre dos números siempre cabe otro, partiendo más fino. 5/4 queda pasando el 1.',
      'Más partes, más chicas: 1/4 < 1/3. Para comparar o sumar, primero la misma partición: 1/2 + 1/3 = 3/6 + 2/6 = 5/6 (no 2/5).',
      'Los decimales siguen los cuartos del depósito hacia la derecha, después de una coma: 2,5 = 2 + 5/10; 2,05 = 2 + 5/100.',
      'Por ciento es "de cada cien": el 50 % de 80 y el 80 % de 50 son 40.',
      'Hay medidas que ninguna partición de la unidad alcanza justo: la diagonal de un cuadrado de lado 1 está entre 1,414 y 1,415, y la prueba de que nunca entra justo llega más adelante. ≈ quiere decir "aproximadamente".',
    ],
    seen,
    moments: [{id: 'c5.diagonal', label: 'Desplegar: lo que no entra justo'}],
  };
  g.state.journal = g.state.journal.filter(e => e.id !== entry.id).concat([entry]);
  g.ui.toast('Anotado en la Bitácora (≡)');
  g.saveNow();
}

export {Shape, Custom, wordSpot, WHITE, writeBoard, boardText};
