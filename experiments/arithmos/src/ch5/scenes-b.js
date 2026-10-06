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
  cast(g, {sx: BOARD.x - BOARD.w / 2 - 200, mx: BOARD.x - BOARD.w / 2 - 90});
  familiesDown(g);
}

/** Palabras para elegir una partición; devuelve el número elegido. */
function pickPartition(d, g, list, hint) {
  return d.interact(ctl => new Promise(resolve => {
    g.setHint(() => [hint]);
    g.ui.setSpots(list.map((n, i) => wordSpot(`part-${n}`, `partir en ${n}`, BOARD.x - 150 + i * 150, boardTop() - 34, () => { if (ctl.alive()) { g.ui.setSpots([]); g.setHint(null); resolve(n); } }, {label: `Partir las dos barras en ${n} partes iguales`})));
  }));
}

/** Punto borra lo que escribió y lo vuelve a escribir. */
async function puntoRewrites(d, g, label, text) {
  const p = g.world.get('punto');
  g.setCinematic(true);
  p.setMode('still');
  await zip(d, p, label.x + 60, label.y - 40, 0.4);
  d.describe(`Punto borra lo que había escrito y escribe: ${text}.`);
  g.audio.erase(0.4, 0.3);
  label.reveal = 0;
  label.text = text;
  await d.draw(label, 0.6, {key: 'reveal', sound: false});
  g.audio.punto('happy');
  follow(p, g.world.get('student'));
  g.setCinematic(false);
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
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, BOARD.x + 120, boardTop() + 230, 0.4);
    d.describe('Punto escribe en la pizarra, en amarillo: 1/4 > 1/3. Porque 4 es más que 3.');
    const pl = w.add(new Label('cm-p', '1/4 > 1/3', BOARD.x + 60, boardTop() + 268, {size: 30, z: 16, ch: YELLOW, reveal: 0, weight: 700}));
    await d.draw(pl, 0.6, {key: 'reveal', sound: false});
    g.audio.punto('happy');
    follow(p, s);
    g.setCinematic(false);
    await d.say('Rampa', 'Punto dice que un cuarto de barra es más que un tercio, porque cuatro es más que tres. Yo prefiero el cuarto, entonces.');
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá las barras para partirlas y comparar un pedazo de cada una.']);
      g.ui.setSpots([rectSpot('cm-cut', 'Partir una barra en 4 y otra en 3, y comparar un pedazo de cada una', {x: X0 - 6, y: rowY(0) - 30, w: BAR.w + 12, h: rowY(1) - rowY(0) + 60}, async () => {
        if (!ctl.alive()) return;
        g.ui.setSpots([]);
        try {
          const ta = ticks(w, 'cm-ta', rowY(0), 4), tb = ticks(w, 'cm-tb', rowY(1), 3);
          await d.all(d.draw(ta, 0.5, {sound: false}), d.draw(tb, 0.5, {sound: false}));
          const a = piece(w, 'cm-a', BAR.w / 4, X0, rowY(0));
          const b = piece(w, 'cm-b', BAR.w / 3, X0, rowY(1));
          a.progress = b.progress = 0;
          await d.tween(0.6, q => { a.progress = b.progress = q; });
          d.describe('Un cuarto y un tercio, uno arriba del otro: el tercio es más largo.');
          await d.all(d.tween(0.6, q => { a.y = lerp(rowY(0), rowY(0) + 30, q); b.y = lerp(rowY(1), rowY(0) + 66, q); }, easeInOut));
        } catch { return; }
        g.setHint(null);
        resolve();
      })]);
    }));
    d.evidence('compare-unit', {seen: true});
    await d.say('Rampa', 'Ah, no. Me quedo con el tercio.');
    await d.say('student', 'Punto: más partes, más chicas.');
    await puntoRewrites(d, g, pl, '1/4 < 1/3');
    // 2/3 y 3/4: hace falta una partición que sirva para las dos
    w.removeWhere(o => /^cm-(a|b|ta|tb)$/.test(o.id));
    await d.say('Balcón', '¿Y dos tercios o tres cuartos? A los dos les falta un pedazo para la barra entera.');
    const opts = [6, 7, 12];
    let n;
    for (;;) {
      n = await pickPartition(d, g, opts, 'Para comparar, las dos barras tienen que estar partidas igual, y que en la partición caigan justo los tercios y los cuartos.');
      d.evidence('common-partition', {n});
      g.setCinematic(true);
      const ta = ticks(w, `cm-p${n}a`, rowY(0), n, WHITE), tb = ticks(w, `cm-p${n}b`, rowY(1), n, WHITE);
      const t3 = ticks(w, 'cm-t3', rowY(0), 3), t4 = ticks(w, 'cm-t4', rowY(1), 4);
      await d.all(d.draw(ta, 0.5, {sound: false}), d.draw(tb, 0.5, {sound: false}), d.draw(t3, 0.4, {sound: false}), d.draw(t4, 0.4, {sound: false}));
      g.setCinematic(false);
      if (n === 12) break;
      await d.think(n === 6 ? 'En sextos caen los tercios, pero los cuartos quedan entre dos marcas.' : 'En séptimos no cae ni un tercio ni un cuarto.');
      g.setCinematic(true);
      await d.all(d.fadeTo(ta, 0, 0.3), d.fadeTo(tb, 0, 0.3));
      w.remove(ta.id);
      w.remove(tb.id);
      g.setCinematic(false);
      opts.splice(opts.indexOf(n), 1);
    }
    g.setCinematic(true);
    d.describe('En doceavos caen las dos: dos tercios son ocho doceavos; tres cuartos, nueve doceavos.');
    const fa = piece(w, 'cm-fa', BAR.w * 2 / 3, X0, rowY(0), {ch: YELLOW});
    const fb = piece(w, 'cm-fb', BAR.w * 3 / 4, X0, rowY(1), {ch: YELLOW});
    fa.progress = fb.progress = 0;
    await d.tween(0.8, q => { fa.progress = fb.progress = q; });
    w.add(new Label('cm-la', '2/3 = 8/12', X0 + BAR.w + 14, rowY(0) + 9, {size: 24, z: 9}));
    w.add(new Label('cm-lb', '3/4 = 9/12', X0 + BAR.w + 14, rowY(1) + 9, {size: 24, z: 9}));
    g.setCinematic(false);
    await d.think('Ocho doceavos contra nueve: tres cuartos es más. Al que le falta el pedazo más chico, tiene más.');
    d.evidence('compare-result', {ok: compare(frac(2, 3), frac(3, 4)) < 0});
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
    await d.say('Cornisa', 'Le regalé a Peldaño un tercio de barra, de lo mío. Él ya tenía media. ¿Cuánto tiene ahora?');
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, BOARD.x + 120, boardTop() + 230, 0.4);
    d.describe('Punto escribe: 1/2 + 1/3 = 2/5. Uno más uno arriba; dos más tres abajo.');
    const pl = w.add(new Label('sm-p', '1/2 + 1/3 = 2/5', BOARD.x + 10, boardTop() + 268, {size: 28, z: 16, ch: YELLOW, reveal: 0, weight: 700}));
    await d.draw(pl, 0.7, {key: 'reveal', sound: false});
    g.audio.punto('happy');
    follow(p, s);
    g.setCinematic(false);
    // los pedazos, uno a continuación del otro; y lo que dice Punto, debajo
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá la barra de arriba para juntar la media barra y el tercio.']);
      g.ui.setSpots([rectSpot('sm-join', 'Juntar la media barra y el tercio de Peldaño', {x: X0 - 6, y: rowY(0) - 30, w: BAR.w + 12, h: 60}, async () => {
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
          d.describe('Arriba, la media barra y el tercio juntos. Abajo, en amarillo, lo que dice Punto: 2/5, más corto que la media barra sola.');
          w.add(new Label('sm-lp', '2/5', X0 + BAR.w + 14, rowY(1) + 9, {size: 22, z: 9, ch: YELLOW}));
        } catch { return; }
        g.setHint(null);
        resolve();
      })]);
    }));
    await d.think('Lo de Punto es más corto que la media barra sola. Juntando, no puede haber menos.');
    g.audio.punto('sad');
    const opts = [5, 6];
    let n;
    for (;;) {
      n = await pickPartition(d, g, opts, 'Para contar pedazos, tienen que ser del mismo tamaño: elegí una partición donde caigan la mitad y el tercio.');
      d.evidence('add-partition', {n});
      g.setCinematic(true);
      const t = ticks(w, `sm-t${n}`, rowY(0), n, WHITE);
      await d.draw(t, 0.6, {sound: false});
      g.setCinematic(false);
      if (n === 6) break;
      await d.think('En quintos no cae ni la mitad ni el tercio: el cinco de Punto no sirve para contar.');
      g.setCinematic(true);
      await d.fadeTo(t, 0, 0.3);
      w.remove(t.id);
      g.setCinematic(false);
      opts.splice(opts.indexOf(n), 1);
    }
    d.describe('En sextos: la mitad son tres sextos y el tercio, dos sextos. Juntos, cinco sextos.');
    w.add(new Label('sm-l0', '5/6', X0 + BAR.w + 14, rowY(0) + 9, {size: 22, z: 9}));
    const r = add(frac(1, 2), frac(1, 3));
    const wrong = naiveAdd(frac(1, 2), frac(1, 3));
    await d.say('student', 'Punto: tres sextos y dos sextos son cinco sextos. Para sumar pedazos, primero del mismo tamaño.');
    await puntoRewrites(d, g, pl, '1/2 + 1/3 = 3/6 + 2/6 = 5/6');
    d.evidence('add', {result: `${r.n}/${r.d}`, naive: `${wrong.n}/${wrong.d}`, naiveSmaller: compare(wrong, frac(1, 2)) < 0});
    g.flags.c5add = true;
  },
};

// ——————————————————————————————————————————————
// 5.7 La caja de los décimos
// ——————————————————————————————————————————————

export const decimos = {
  id: 'c5.decimos',
  title: 'La caja de los décimos',
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
    await d.say('Mara', 'A mí me quedaron dos barras enteras y media. Lo anoto en el registro del depósito, por cajas, como siempre.');
    // en la pizarra: cajas como las del depósito; las barras guardadas a escala
    const top = boardTop();
    const bx = BOARD.x - 250, bw = 140, gap = 30, by = top + 70, bh = 120;
    const b1x = bx + bw + gap, b2x = bx + 2 * (bw + gap);
    const k = (bw - 24) / BAR.w; // escala de lo guardado: una barra entera mide bw − 24
    w.add(new Drawing('dc-box0', art.rectStrokesFor('dc-box0', bx, by, bw, bh), {z: 9}));
    w.add(new Drawing('dc-box1', art.rectStrokesFor('dc-box1', b1x, by, bw, bh), {z: 9}));
    w.add(new Label('dc-n0', 'barras', bx + bw / 2, by + bh + 30, {size: 20, align: 'center', z: 9}));
    w.add(new Label('dc-n1', 'décimos', b1x + bw / 2, by + bh + 30, {size: 20, align: 'center', z: 9}));
    for (let i = 0; i < 2; i++) piece(w, `dc-b${i}`, BAR.w, bx + 12, by + 34 + i * 44, {scale: k});
    const half = piece(w, 'dc-half', BAR.w / 2, BOARD.x + BOARD.w / 2 + 40, GROUND - 40, {scale: k * 2.2});
    d.describe('Dos barras enteras en la caja de las barras. Afuera, la media barra.');
    let tries = 0;
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá la caja donde va la media barra.', 'En la caja de las barras sólo van barras enteras.']);
      const refresh = () => g.ui.setSpots([
        rectSpot('dc-into0', 'Guardar la media barra en la caja de las barras', {x: bx, y: by, w: bw, h: bh}, () => put(0)),
        rectSpot('dc-into1', 'Guardar la media barra en la caja de los décimos', {x: b1x, y: by, w: bw, h: bh}, () => put(1)),
      ]);
      const put = async box => {
        if (busy || !ctl.alive()) return;
        busy = true;
        tries++;
        d.evidence('store-half', {box});
        try {
          if (box === 0) {
            await d.say('Mara', 'Si la pongo con las enteras, mañana alguien cuenta tres barras.');
            busy = false;
            return refresh();
          }
        } catch { return; }
        g.ui.setSpots([]);
        resolve();
      };
      refresh();
    }));
    g.setCinematic(true);
    d.describe('La media barra se parte en cinco décimos de barra, que entran en la caja de la derecha. Cinco décimos ocupan lo mismo que media barra.');
    const hx = half.x;
    w.remove('dc-half');
    const tl = BAR.w / 10;
    const tenths = [];
    for (let i = 0; i < 5; i++) tenths.push(piece(w, `dc-t${i}`, tl, hx + i * (tl * k * 2.2 + 4), GROUND - 40, {scale: k * 2.2}));
    g.audio.erase(0.4, 0.3);
    await d.all(...tenths.map((t, i) => d.all(
      hop(d, t, b1x + 12 + i * (tl * k), by + 34, {g, h: 120, dur: 0.6 + i * 0.05, sound: i ? null : 'tap'}),
      d.tween(0.6, q => { t.scale = lerp(k * 2.2, k, q); }),
    )));
    // la coma: la pone Punto, como puso la rayita del menos
    p.setMode('still');
    await zip(d, p, bx + bw + 12, by + bh - 50, 0.4);
    d.describe('Punto pone una marca amarilla entre las dos cajas, abajo: una coma.');
    const comma = w.add(new Label('dc-comma', ',', bx + bw + 8, by + bh - 6, {size: 80, z: 10, ch: YELLOW, reveal: 0, weight: 700}));
    await d.draw(comma, 0.5, {key: 'reveal', sound: false});
    g.audio.punto('happy');
    follow(p, s);
    g.setCinematic(false);
    await d.say('student', 'Diez décimos hacen una barra, como diez palitos un atado. Y la coma de Punto separa las barras de sus partes.');
    await d.say('Mara', 'Me sirve.');
    await writeBoard(d, g, 'dc-l0', '2,5 = 2 + 5/10', 0, {size: 30});
    // 2,05
    await d.say('Mara', 'En el registro viejo encontré esto otro. ¿Es lo mismo?');
    const old = w.add(new Label('dc-old', '2,05', BOARD.x + 160, top + 52, {size: 30, z: 9, reveal: 0}));
    await d.draw(old, 0.4, {key: 'reveal'});
    const c2 = await d.choose([
      {id: 'same', text: 'Sí: el 0 no cuenta nada.'},
      {id: 'less', text: 'No: es menos que 2,5.'},
      {id: 'more', text: 'No: es más que 2,5.'},
    ], {prompt: '¿2,05 es lo mismo que 2,5?', evaluate: true});
    d.evidence('read-205', {answer: c2});
    g.setCinematic(true);
    d.describe('Aparece una tercera caja, la de los centésimos. 2,05: dos barras, ningún décimo y cinco centésimos, chiquitos.');
    w.add(new Drawing('dc-box2', art.rectStrokesFor('dc-box2', b2x, by, bw, bh), {z: 9, progress: 0}));
    await d.draw(w.get('dc-box2'), 0.5);
    w.add(new Label('dc-n2', 'centésimos', b2x + bw / 2, by + bh + 30, {size: 20, align: 'center', z: 9}));
    for (const t of tenths) t.fade = 0.25;
    for (let i = 0; i < 5; i++) piece(w, `dc-c${i}`, BAR.w / 100, b2x + 12 + i * (BAR.w / 100 * k + 3), by + 34, {scale: k, ch: YELLOW});
    g.setCinematic(false);
    const v205 = decimal('2,05'), v25 = decimal('2,5');
    await d.say('student', c2 === 'less' ? 'Cinco centésimos son mucho menos que cinco décimos. El 0 guarda el lugar de los décimos, como en el depósito.' : 'No: cinco centésimos son mucho menos que cinco décimos. El 0 guarda el lugar de los décimos, como en el depósito.');
    await d.say('Mara', 'El cero otra vez. Ya no se me escapa.');
    // los tres cuartos de cada familia, en esta escritura
    await d.say('Cornisa', '¿Y mis tres cuartos, cómo se anotan así?');
    await d.think('Un cuarto son veinticinco centésimos: cuatro de esos hacen cien. Tres, setenta y cinco.');
    await writeBoard(d, g, 'dc-l1', '3/4 = 75/100 = 0,75', 1, {size: 30});
    d.evidence('decimal', {a: '2,05', b: '2,5', less: compare(v205, v25) < 0, tries});
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
    family(w, 0, BOARD.x + BOARD.w / 2 + 80, GROUND, {facing: -0.6});
    g.camera.go(SHOTS.share);
  },
  async play(d, g) {
    const w = g.world;
    await d.shot(SHOTS.share, 1);
    await d.say('Mara', 'Para la próxima cosecha les ofrezco dos tratos. El 50 por ciento de 80 palitos, o el 80 por ciento de 50.');
    await d.say('student', 'Por ciento: de cada cien. El 50 % es 50 de cada 100: la mitad.');
    const c = await d.choose([
      {id: 'a', text: 'El 50 % de 80.'},
      {id: 'b', text: 'El 80 % de 50.'},
      {id: 'same', text: 'Dan lo mismo.'},
    ], {prompt: '¿Qué trato le conviene a Peldaño?', evaluate: true});
    d.evidence('percent-predict', {answer: c});
    g.setCinematic(true);
    d.describe('A la izquierda, 8 atados: la mitad son 4, cuarenta palitos. A la derecha, 5 atados desatados: de cada diez palitos se separan ocho, cuarenta en total.');
    const A = [], B = [];
    for (let i = 0; i < 8; i++) A.push(item(w, 1, 12995 + i * 40, GROUND - 26, `pc5-a${i}`));
    for (const o of A) { o.z = 15; o.progress = 0; }
    await d.tween(0.6, q => { for (const o of A) o.progress = q; });
    await d.all(...A.slice(4).map(o => d.tween(0.4, q => { o.y = lerp(GROUND - 26, GROUND - 90, q); })));
    w.add(new Label('pc5-la', '50 % de 80 = 40', 13000, GROUND - 160, {size: 26, z: 9}));
    // 80 % de cada diez: 8 palitos de cada diez, bien separados para poder contarlos
    for (let i = 0; i < 5; i++) {
      const x0 = 13330 + i * 86;
      for (let k2 = 0; k2 < 10; k2++) {
        const st = item(w, 0, x0 + k2 * 7, k2 < 8 ? GROUND - 90 : GROUND - 26, `pc5-s${i}-${k2}`);
        st.z = 15;
        B.push(st);
      }
    }
    g.audio.erase(0.4, 0.3);
    w.add(new Label('pc5-lb', '80 % de 50 = 40', 13340, GROUND - 160, {size: 26, z: 9}));
    g.setCinematic(false);
    const a = percentOf(50, 80), b2 = percentOf(80, 50);
    await d.say('Peldaño', c === 'same' ? 'Cuarenta las dos veces. Mara, sos tramposa.' : 'Cuarenta y cuarenta. Mara, sos tramposa.');
    await d.shot(SHOTS.board, 0.8);
    await writeBoard(d, g, 'pc5-l0', '50 % de 80 = 50/100 × 80 = 40', 0, {size: 28});
    await writeBoard(d, g, 'pc5-l1', '80 % de 50 = 80/100 × 50 = 40', 1, {size: 28});
    await d.think('Es la misma cuenta dada vuelta: 50 × 80 ÷ 100. Y el 50 % es multiplicar por un medio: achica.');
    d.evidence('percent', {a, b: b2});
    g.flags.c5percent = true;
  },
};

// ——————————————————————————————————————————————
// 5.9 Lo que no entra justo (momento)
// ——————————————————————————————————————————————

const PARTS = [
  {n: 2, name: 'mitades'}, {n: 3, name: 'tercios'}, {n: 5, name: 'quintos'},
  {n: 7, name: 'séptimos'}, {n: 10, name: 'décimos'}, {n: 12, name: 'doceavos'},
];

export const diagonal = {
  id: 'c5.diagonal',
  title: 'Lo que no entra justo',
  moment: 'Lo que no entra justo',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(pc5-|dg5-)/.test(o.id));
    boardCast(g);
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
    const sx = BOARD.x - 240, sy = top + 50;
    const sq = w.add(new Drawing('dg5-sq', art.rectStrokesFor('dg5-sq', sx, sy, side, side), {z: 9, progress: 0}));
    const diag = w.add(new Drawing('dg5-dg', [S([[sx, sy + side], [sx + side, sy]], seedOf('dg5'), {w: 3, p: 0.95, ch: YELLOW})], {z: 10, progress: 0}));
    await d.draw(sq, 0.6);
    await d.draw(diag, 0.6);
    w.add(new Label('dg5-l1', '1 barra', sx + side / 2, sy + side + 30, {size: 22, align: 'center', z: 9}));
    // el jugador elige con qué partición del lado medir la diagonal
    const L = Math.SQRT2;
    const tried = [];
    const ux = Math.SQRT1_2, uy = -Math.SQRT1_2; // dirección de la diagonal
    let rowN = 0;
    const measure = async part => {
      const m = measureWith(L, part.n);
      w.removeWhere(o => o.id.startsWith('dg5-tk'));
      const list = [];
      for (let i = 1; i <= m.parts + 1; i++) {
        const t = i * side / part.n;
        const cx = sx + ux * t, cy = sy + side + uy * t;
        list.push(S([[cx - uy * 7, cy + ux * 7], [cx + uy * 7, cy - ux * 7]], seedOf(`tk${part.n}${i}`), {w: 1.8, p: 0.9, ch: i === m.parts + 1 ? YELLOW : 0, lift: false}));
      }
      const tk = w.add(new Drawing('dg5-tk', list, {z: 11, progress: 0}));
      d.describe(`La diagonal medida en ${part.name} del lado: ${m.parts} se quedan cortos y ${m.parts + 1} se pasan.`);
      await d.draw(tk, 0.7, {sound: false});
      const l = w.add(new Label(`dg5-m${rowN}`, `${m.parts}/${part.n} < diagonal < ${m.parts + 1}/${part.n}`, BOARD.x - 10, top + 70 + rowN * 38, {size: 22, z: 9, reveal: 0}));
      rowN++;
      await d.draw(l, 0.5, {key: 'reveal', sound: false});
      d.evidence('diag-try', {d: part.n, lo: m.parts, exact: m.exact});
      return m;
    };
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Elegí en cuántas partes partir el lado para medir la diagonal. Probá varias.']);
      const refresh = () => {
        const left = PARTS.filter(pt => !tried.includes(pt.n));
        g.ui.setSpots(left.map((pt, i) => wordSpot(`dgp-${pt.n}`, `en ${pt.name}`, BOARD.x - 230 + (i % 3) * 140, top - 70 + Math.floor(i / 3) * 40, () => go(pt), {label: `Medir la diagonal en ${pt.name} del lado`})));
      };
      const go = async pt => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        tried.push(pt.n);
        try { await measure(pt); } catch { return; }
        busy = false;
        if (tried.length >= 3) resolve();
        else refresh();
      };
      refresh();
    }));
    g.setHint(null);
    const c = await d.choose([
      {id: 'finer', text: 'Sí: con alguna partición más fina, va a entrar justo.'},
      {id: 'none', text: 'Hasta ahora ninguna. Quizás no haya ninguna.'},
      {id: 'never', text: 'No se puede saber nunca.'},
    ], {prompt: '¿Habrá alguna partición del lado que mida la diagonal justo?', evaluate: true});
    d.evidence('diag-predict', {answer: c, tried});
    // el contraejemplo: lo que no cierra en decimales puede entrar justo en otra partición
    await d.say('student', 'Ojo, Punto: un tercio de barra, en décimos, tampoco cierra: 0,3; 0,33; 0,333… Y en tercios entra justo.');
    await d.think('Así que no cerrar en décimos no prueba nada. Lo raro de la diagonal es que tampoco entró en ninguna de las otras.');
    const fits = diagonalFits(2000);
    await d.think(c === 'finer' ? 'Partiendo más fino se acerca; probé varias y ninguna entró justo. Que ninguna, nunca, entre justo, se puede probar: lo voy a necesitar cuando dibujemos cuadrados.' : 'Que ninguna, nunca, entre justo, se puede probar. Lo voy a necesitar cuando dibujemos cuadrados.');
    const ap = w.add(new Label('dg5-eq', 'diagonal ≈ 1,414', BOARD.x - 10, top + 260, {size: 26, z: 9, reveal: 0}));
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
    await d.say('Peldaño', 'Más o menos me alcanza para el camino. Pero, ¿cómo se anota un número que no sé cuánto vale?');
    g.audio.punto('question');
    await pulse(d, p, 1, 0.4);
  },
};

function writeJournal5(g) {
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1));
  const first = k => ev.find(e => e.kind === k);
  const all = k => ev.filter(e => e.kind === k);
  const seen = [];
  const st = first('share-two');
  if (st) seen.push(st.choice === 'untie' ? 'Repartiste los dos atados desatándolos: cinco palitos, medio atado cada una.' : st.choice === 'halve' ? 'Partiste cada atado por la mitad: medio atado, cinco palitos, cada una.' : 'Darle un atado a dos familias no era igual para todas.');
  const uh = first('unit-half');
  if (uh) seen.push(uh.answer === 'monton' ? 'Viste que medio montón de seis es más que medio atado: "medio" depende de qué.' : uh.answer === 'atado' ? 'Elegiste medio atado; medio montón eran tres atados: "medio" depende de qué.' : 'Pensaste que los dos "medios" eran lo mismo; medio montón eran tres atados.');
  const cut = first('cut');
  if (cut) seen.push(`Cortaste las barras en ${cut.n}${cut.n === 4 ? '' : ' y volviste a partir lo que sobraba'}: tres cuartos de barra para cada familia.`);
  const eq = first('equiv-predict');
  if (eq) seen.push(eq.answer === 'same' ? 'Anticipaste que dos cuartos y una mitad son lo mismo.' : 'Superpuestos, dos cuartos y una mitad llegaban al mismo lugar.');
  const cp = all('common-partition').map(e => e.n);
  if (cp.length) seen.push(`Para comparar 2/3 y 3/4 partiste en ${cp.length > 1 ? `${cp.slice(0, -1).join(' y ')} antes de llegar a ` : ''}doceavos: 8/12 < 9/12.`);
  const ap = all('add-partition').map(e => e.n);
  if (ap.length) seen.push(ap[0] === 6 ? 'Para sumar 1/2 y 1/3 elegiste sextos: 5/6.' : 'Probaste quintos, como el 2/5 de Punto, y no caían; en sextos, 5/6.');
  const rd = first('read-205');
  if (rd) seen.push(rd.answer === 'less' ? 'Viste que 2,05 es menos que 2,5.' : 'Creíste que 2,05 era lo mismo o más que 2,5; el 0 guardaba el lugar de los décimos.');
  const dt = all('diag-try').map(e => e.d);
  if (dt.length) seen.push(`Mediste la diagonal partiendo el lado en ${dt.join(', ')}: ninguna partición entró justo.`);
  const entry = {
    id: 'c5',
    title: 'Partes de algo',
    abbr: 'Una fracción mide con pedazos iguales de una unidad; un mismo número tiene muchos nombres.',
    body: [
      'n/d de una unidad son n pedazos del tamaño que entra d veces justo en ella: 3/4 son tres pedazos de un cuarto; 5/4, cinco, más que una entera. Repartir 3 entre 4 da 3/4: 3 ÷ 4 = 3/4.',
      'Un mismo número tiene muchos nombres: 1/2 = 2/4 = 3/6 = 0,5. Para comparar o sumar, primero una partición común: 1/2 + 1/3 = 3/6 + 2/6 = 5/6.',
      'En la recta, entre dos números siempre cabe otro. Los decimales siguen las cajas del depósito hacia la derecha de la coma; por ciento quiere decir de cada cien.',
      'Hay medidas que ninguna partición alcanza justo, como la diagonal de un cuadrado de lado 1 (≈ 1,414). No cerrar en decimales no lo prueba (1/3 tampoco cierra); la prueba llega más adelante.',
    ],
    seen,
    moments: [{id: 'c5.diagonal', label: 'Desplegar: lo que no entra justo'}],
  };
  g.state.journal = g.state.journal.filter(e => e.id !== entry.id).concat([entry]);
  g.ui.toast('Anotado en la Bitácora (≡)');
  g.saveNow();
}

export {Shape, Custom, wordSpot, WHITE, writeBoard, boardText};
