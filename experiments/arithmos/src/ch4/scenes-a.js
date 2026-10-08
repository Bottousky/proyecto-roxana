// Capítulo 4 — Veces (4.1 a 4.3): grupos iguales, el rectángulo girado y la línea que se estira.

import {Drawing, Label, Link, Shape} from '../engine/world.js';
import {YELLOW, WHITE, stroke} from '../engine/chalk.js';
import {seedOf} from '../engine/rng.js';
const S = (guide, seed, opts = {}) => stroke(guide, {seed, ...opts});
import {lerp, easeInOut} from '../engine/rng.js';
import {zip, hop, pulse, follow, spotOf, rectSpot, wordSpot} from '../acting.js';
import {groups, rectangle, scale} from '../logic/times.js';
import {
  GROUND, BOARD, boardTop, LINE, lineX, ROCK, FAMILIES, SHOTS, base, lineOn, cast, family, familiesHome, chip, gridPos,
  debtSpot, homeOf, signed, art, art4,
} from './common.js';

const WORDS = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'];

/** Lo escrito arriba de la pizarra (persiste entre escenas). */
export function boardNotes(g, upto) {
  const w = g.world;
  const top = boardTop();
  const notes = [
    ['eq1', '4 × 3 = 12', BOARD.x - 250, top - 64],
    ['eq2', '4 × (−3) = −12', BOARD.x + 30, top - 64],
    ['eq3', '4 × 3 = 3 × 4', BOARD.x - 250, top - 18],
  ];
  for (const [id, text, x, y] of notes.slice(0, upto)) w.ensure(id, () => new Label(id, text, x, y, {size: 34, z: 9}));
}

// ——————————————————————————————————————————————
// 4.1 Lo que deben las Terrazas
// ——————————————————————————————————————————————

const groupRect = k => {
  const [x0, y] = debtSpot(k, 0);
  const [x2] = debtSpot(k, 2);
  return {x: x0 - 30, y: y - 40, w: x2 - x0 + 60, h: 80};
};

export const grupos = {
  id: 'c4.grupos',
  title: 'Lo que deben las Terrazas',
  setup(g) {
    const w = g.world;
    w.clear();
    base(g);
    cast(g);
    familiesHome(g);
    const sc = g.scratch('c4.grupos');
    const moved = sc.moved || [];
    FAMILIES.forEach((f, k) => {
      const row = moved.indexOf(k);
      for (let j = 0; j < 3; j++) {
        const [x, y] = row >= 0 ? gridPos(4, 3, row, j) : debtSpot(k, j);
        chip(w, 'debt', x, y, `dg-${k}-${j}`);
      }
    });
    moved.forEach((_, row) => cumLabel(w, row, 3 * (row + 1), 4));
    if (sc.guess === '7' && !moved.length) punto7(w);
    g.camera.go(SHOTS.terr);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const m = w.get('mara');
    const sc = g.scratch();
    sc.moved ??= [];
    await d.shot(SHOTS.terr, 1.2);
    if (!sc.guess) {
      d.describe('Las Terrazas: una escalera de cuatro escalones, borroneada. Una familia en cada escalón.');
      await d.say('Mara', 'Las Terrazas. Miren la escalera: la Marea se la está llevando.');
      await d.say('Peldaño', 'Desde que nadie entiende lo que dice la piedra de abajo. Lo de las deudas sí lo sabemos: tres atados cada familia.');
      g.setCinematic(true);
      await d.shot({x: ROCK.x - 260, y: GROUND - 300, w: 620, h: 360}, 0.9);
      d.describe('En la piedra, casi borrado: un 4, una cruz acostada y un 3.');
      await d.wait(1.2);
      await d.shot(SHOTS.terr, 0.9);
      g.setCinematic(false);
      await d.think('Un 4, una cruz acostada y un 3. Nadie sabe qué quiere decir.');
      // Punto se apura: junta lo que ve
      g.setCinematic(true);
      p.setMode('still');
      d.describe('Punto vuela a la pizarra de Mara y escribe, en amarillo: 4 + 3 = 7.');
      // inserto: la pizarra de cerca, para que se lea lo que escribe Punto
      await d.all(d.shot({x: BOARD.x - BOARD.w / 2 - 40, y: boardTop() - 40, w: BOARD.w + 80, h: BOARD.h * 0.9}, 0.7), zip(d, p, BOARD.x - 180, boardTop() + 40, 0.5));
      const l = punto7(w);
      l.reveal = 0;
      await d.draw(l, 0.7, {key: 'reveal', sound: false});
      g.audio.punto('happy');
      await pulse(d, p, 2, 0.4);
      await d.wait(0.8);
      follow(p, s);
      // la decisión se toma viendo la pizarra de Punto y las Terrazas juntas, no todo el paisaje
      await d.shot({x: 13980, y: 230, w: 1500, h: 560}, 0.8);
      g.setCinematic(false);
      sc.guess = await d.choose([
        {id: '7', text: 'Siete, como escribió Punto.'},
        {id: '12', text: 'Doce atados.'},
        {id: 'cant', text: 'No se sabe sin contarlos de a uno.'},
      ], {prompt: '¿Cuántos atados le deben las Terrazas a Mara?', evaluate: true});
      d.evidence('predict-total', {answer: sc.guess});
      g.saveNow();
      await d.say('Mara', 'Bajemos las deudas a la pizarra. Cada familia, una fila.');
    }
    // bajar las deudas de a una familia
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá las deudas de una familia: bajan juntas y forman una fila en la pizarra.', 'Al lado de cada fila queda anotado cuántas van.']);
      const todo = () => FAMILIES.map((_, k) => k).filter(k => !sc.moved.includes(k));
      const refresh = () => g.ui.setSpots(todo().map(k => rectSpot(`grp${k}`, `Familia ${FAMILIES[k].name}: tres deudas`, () => groupRect(k), () => bring(k))));
      const bring = async k => {
        if (busy || !ctl.alive()) return;
        busy = true;
        const row = sc.moved.length;
        sc.moved.push(k);
        g.saveNow();
        try {
          const ds = [0, 1, 2].map(j => w.get(`dg-${k}-${j}`));
          d.describe(`Las tres deudas de ${FAMILIES[k].name} bajan juntas y forman la fila ${row + 1} en la pizarra.`);
          await d.all(...ds.map((o, j) => hop(d, o, ...gridPos(4, 3, row, j), {g, h: 120, dur: 0.75, sound: j ? null : 'tap'})));
          const cum = cumLabel(w, row, 3 * (row + 1), 4);
          cum.reveal = 0;
          await d.draw(cum, 0.3, {key: 'reveal', sound: false});
          g.audio.tap(0.15, 1.3 + row * 0.12);
          d.evidence('gather', {family: FAMILIES[k].id, row});
        } catch { return; }
        busy = false;
        if (!todo().length) resolve();
        else refresh();
      };
      if (!todo().length) resolve();
      else refresh();
    }));
    g.setHint(null);
    await d.shot(SHOTS.boardWide, 1);
    // Punto cuenta de a tres, fila por fila
    g.setCinematic(true);
    p.setMode('still');
    d.describe('Punto salta de fila en fila: tres, seis, nueve, doce.');
    for (let row = 0; row < 4; row++) {
      const [x, y] = gridPos(4, 3, row, 2);
      await zip(d, p, x + 70, y - 10, 0.3);
      g.audio.punto('hop');
      await d.wait(0.15);
    }
    follow(p, s);
    g.setCinematic(false);
    const guess = sc.guess;
    const total = groups(4, 3).total;
    await d.think(guess === '12' ? 'Tres, seis, nueve, doce.'
      : guess === '7' ? `${WORDS[total - 1][0].toUpperCase() + WORDS[total - 1].slice(1)}, no siete. Cuatro familias y tres atados no se suman: son cuatro filas de tres.`
        : 'Doce. No hizo falta contarlos de a uno: de a tres alcanzó.');
    if (w.has('p7')) {
      g.setCinematic(true);
      g.audio.erase(0.5, 0.4);
      await d.fadeTo(w.get('p7'), 0, 0.5);
      w.remove('p7');
      g.setCinematic(false);
    }
    await d.say('student', 'Cuatro filas de tres. Cuatro veces tres.');
    // el estudiante lo escribe como estaba en la piedra
    await studentWrites(d, g, 'eq1', 1);
    await d.say('Mara', '¡Eso decía la piedra!');
    // la piedra y la escalera se vuelven legibles
    g.setCinematic(true);
    await d.shot({x: ROCK.x - 300, y: 150, w: 3100, h: 720}, 1);
    d.describe('El signo de la piedra se vuelve nítido: 4 × 3. La escalera de las Terrazas se redibuja, escalón por escalón.');
    g.audio.cue('found');
    await d.all(d.fadeTo(w.get('rock-sign'), 1, 1.4), d.fadeTo(w.get('terr'), 1, 1.6));
    g.flags.c4groups = true;
    g.setCinematic(false);
    await d.say('Mara', 'Y en mis cuentas, como son deudas, ¿cómo lo anoto?');
    await studentWrites(d, g, 'eq2', 2);
    await d.say('Mara', 'Menos doce. Cuatro veces menos tres.');
    d.evidence('times', {groups: 4, each: -3, total: groups(4, -3).total});
  },
};

/** El estudiante camina a la pizarra y escribe la nota `upto` (las anteriores quedan). */
export async function studentWrites(d, g, id, upto) {
  const w = g.world;
  const s = w.get('student');
  boardNotes(g, upto);
  const l = w.get(id);
  l.reveal = 0;
  g.setCinematic(true);
  s.face(1);
  await d.walk(s, BOARD.x - BOARD.w / 2 - 40, GROUND, 240);
  s.setPose('write', 0.3);
  await d.draw(l, Math.min(1.3, 0.3 + l.text.length * 0.05), {key: 'reveal'});
  s.setPose('idle', 0.4);
  g.setCinematic(false);
}

function punto7(w) {
  return w.ensure('p7', () => new Label('p7', '4 + 3 = 7', BOARD.x - 255, boardTop() + 52, {size: 30, z: 16, ch: YELLOW, weight: 700}));
}

function cumLabel(w, row, n, rows) {
  const [x, y] = gridPos(rows, 3, row, 2);
  return w.ensure(`cum-${row}`, () => new Label(`cum-${row}`, String(n), x + 64, y + 10, {size: 28, z: 9}));
}

// ——————————————————————————————————————————————
// 4.2 Dar vuelta
// ——————————————————————————————————————————————

/** Un rectángulo de puntos de f × c, como figura que se puede girar. */
function dotGrid(id, f, c, cell = 24) {
  const list = art4.grid(id, -c * cell / 2, -f * cell / 2, f, c, cell);
  for (let i = 0; i < f; i++) for (let j = 0; j < c; j++) list.push(...art.dotStrokesFor(-c * cell / 2 + (j + 0.5) * cell, -f * cell / 2 + (i + 0.5) * cell, 3.4));
  return list;
}

export const girar = {
  id: 'c4.girar',
  title: 'Dar vuelta',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(p7|g9|turn-)/.test(o.id));
    cast(g);
    familiesHome(g);
    family(w, 1, BOARD.x - BOARD.w / 2 - 260, GROUND, {facing: 0.7});
    boardNotes(g, g.scratch('c4.girar').turned ? 3 : 2);
    const turned = g.scratch('c4.girar').turned;
    const order = g.state.scratch['c4.grupos']?.moved || [0, 1, 2, 3];
    order.forEach((k, row) => {
      for (let j = 0; j < 3; j++) {
        const o = chip(w, 'debt', 0, 0, `dg-${k}-${j}`);
        // girar un cuarto de vuelta: la fila `row` pasa a ser la columna 3 − row
        const [x, y] = turned ? gridPos(3, 4, j, 3 - row) : gridPos(4, 3, row, j);
        o.x = x;
        o.y = y;
        o.rot = turned ? Math.PI / 2 : 0;
      }
    });
    if (!turned) for (let row = 0; row < 4; row++) cumLabel(w, row, 3 * (row + 1), 4);
    g.camera.go(SHOTS.boardWide);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const m = w.get('mara');
    const sc = g.scratch();
    const order = g.state.scratch['c4.grupos']?.moved || [0, 1, 2, 3];
    const chips = () => order.flatMap(k => [0, 1, 2].map(j => w.get(`dg-${k}-${j}`)));
    await d.shot(SHOTS.boardWide, 1);
    if (!sc.turned) {
      await d.say('Rampa', 'Si lo miro de costado, son tres filas de cuatro. ¿Entonces debemos más?');
      d.describe('En la pizarra, las doce deudas en cuatro filas de tres.');
      const c = await d.choose([
        {id: 'more', text: 'Más: ahora las filas son más largas.'},
        {id: 'less', text: 'Menos: ahora hay menos filas.'},
        {id: 'same', text: 'Lo mismo: son las mismas deudas.'},
      ], {prompt: 'Cuatro filas de tres, giradas, son tres filas de cuatro. ¿Cambia el total?', evaluate: true});
      d.evidence('turn-predict', {answer: c});
      sc.guess = c;
      await d.interact(ctl => new Promise(resolve => {
        g.setHint(() => ['Tocá el rectángulo de deudas para girarlo.']);
        const top = boardTop();
        let busy = false;
        g.ui.setSpots([rectSpot('turn', 'Girar el rectángulo de deudas', {x: BOARD.x - 130, y: top + 50, w: 260, h: 240}, async () => {
          if (busy || !ctl.alive()) return;
          busy = true;
          g.ui.setSpots([]);
          try {
            for (let row = 0; row < 4; row++) { const l = w.get(`cum-${row}`); if (l) d.fadeTo(l, 0, 0.3).then(() => w.remove(l.id)).catch(() => {}); }
            const list = chips();
            const [cx, cy] = [BOARD.x, gridPos(4, 3, 0, 0)[1] + 1.5 * 64];
            const from = list.map(o => [o.x - cx, o.y - cy]);
            g.audio.erase(0.6, 0.3);
            d.describe('El rectángulo de deudas gira un cuarto de vuelta: las cuatro filas de tres quedan como tres filas de cuatro.');
            await d.tween(1.1, k => {
              const a = k * Math.PI / 2;
              // giro rígido: todo el rectángulo gira junto alrededor de su centro
              list.forEach((o, i) => {
                const [dx, dy] = from[i];
                o.x = cx + dx * Math.cos(a) - dy * Math.sin(a);
                o.y = cy + dx * Math.sin(a) + dy * Math.cos(a);
                o.rot = a;
              });
            }, easeInOut);
            // guarda: el giro tiene que caer justo en la grilla de 3 × 4
            order.forEach((k, row) => [0, 1, 2].forEach(j => {
              const o = w.get(`dg-${k}-${j}`);
              const [tx, ty] = gridPos(3, 4, j, 3 - row);
              if (Math.hypot(o.x - tx, o.y - ty) > 1) console.error(`[girar] ${o.id} quedó fuera de la grilla`);
              o.x = tx;
              o.y = ty;
            }));
          } catch { return; }
          sc.turned = true;
          g.saveNow();
          resolve();
        })]);
      }));
      g.setHint(null);
      // Punto cuenta de a cuatro
      g.setCinematic(true);
      p.setMode('still');
      for (let row = 0; row < 3; row++) {
        const [x, y] = gridPos(3, 4, row, 3);
        await zip(d, p, x + 60, y - 10, 0.3);
        const l = w.add(new Label(`turn-c${row}`, String(4 * (row + 1)), x + 60, y + 10, {size: 28, z: 9, reveal: 0}));
        await d.draw(l, 0.25, {key: 'reveal', sound: false});
        g.audio.punto('hop');
      }
      follow(p, s);
      g.setCinematic(false);
      await d.think(c === 'same' ? 'Doce, como antes: cuatro, ocho, doce. Ninguna deuda se fue ni llegó.' : 'Doce otra vez: cuatro, ocho, doce. Girar no saca ni pone ninguna.');
      await studentWrites(d, g, 'eq3', 3);
      d.evidence('turn', {rect: rectangle(4, 3)});
    }
    // transferencia: un rectángulo que da pereza contar
    g.setCinematic(true);
    await d.all(...chips().map(o => d.fadeTo(o, 0, 0.5)));
    w.removeWhere(o => /^(dg-|turn-c)/.test(o.id));
    const top = boardTop();
    const gr = w.add(new Shape('g9', dotGrid('g9', 9, 4), BOARD.x, top + 150, {z: 12, progress: 0}));
    await d.tween(0.9, k => { gr.progress = k; });
    g.setCinematic(false);
    await d.say('Rampa', 'Mi huerta de atrás: nueve filas de cuatro plantas. Mirada desde el camino, cuatro filas de nueve.');
    const t = await d.choose([
      {id: 'both', text: 'Hay que contar las dos: pueden dar distinto.'},
      {id: 'one', text: 'Alcanza con una: es el mismo rectángulo, girado.'},
    ], {prompt: '¿Hace falta contar las plantas de las dos maneras?', evaluate: true});
    d.evidence('turn-transfer', {answer: t});
    if (t === 'both') {
      g.setCinematic(true);
      p.setMode('still');
      d.describe('Punto empieza a contar las plantas una por una, fila por fila.');
      for (let i = 0; i < 6; i++) {
        await zip(d, p, BOARD.x - 36 + (i % 4) * 24, top + 150 - 96 + Math.floor(i / 4) * 24 - 20, 0.12);
        g.audio.tap(0.1, 1.5 + i * 0.05);
      }
      follow(p, s);
      g.setCinematic(false);
      await d.say('Rampa', 'Pará, Punto. Es la misma huerta, mirada de costado.');
    }
    g.setCinematic(true);
    d.describe('El rectángulo de nueve filas de cuatro gira y queda de cuatro filas de nueve.');
    await d.tween(1, k => { gr.rot = k * Math.PI / 2; }, easeInOut);
    g.setCinematic(false);
    await d.think('Las mismas plantas, de costado. Se cuentan una vez.');
    g.flags.c4turn = true;
  },
};

// ——————————————————————————————————————————————
// 4.3 Estirar la línea (momento)
// ——————————————————————————————————————————————

/** Las casas en el plano: a cuántos pasos del pozo (el cero). */
const ON_LINE = [{k: 0, v: 1}, {k: 1, v: 2}, {k: 2, v: -3}];
const STAGE_FACTOR = [1, 2, -2, 2];
const ARC_FLAT = 0.32;

function lineFamilies(g, factor) {
  const w = g.world;
  for (const {k, v} of ON_LINE) {
    const f = family(w, k, lineX(v * factor), GROUND, {facing: 0.2});
    const id = `sign4-${FAMILIES[k].id}`;
    const lab = w.ensure(id, () => new Label(id, '', 0, 0, {size: 28, align: 'center', z: 32}));
    lab.text = signed(v * factor);
    lab.update = () => { const h = f.headPos(); lab.x = h[0]; lab.y = h[1] - 40; };
  }
  w.ensure('well', () => new Label('well', 'pozo', lineX(0), GROUND - 34, {size: 22, align: 'center', z: 9}));
}

/** Un arco de giro alrededor del cero, de θ0 a θ1, para un punto que empieza a `a` pasos. */
function arcStrokes(id, a, th0, th1, ch = YELLOW) {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const th = th0 + (th1 - th0) * (i / 24);
    pts.push([LINE.zero + a * LINE.step * Math.cos(th), GROUND - 30 - a * LINE.step * Math.sin(th) * ARC_FLAT]);
  }
  return [S(pts, seedOf(id), {w: 2.2, p: 0.75, ch})];
}

export const estirar = {
  id: 'c4.estirar',
  title: 'Estirar la línea',
  moment: 'Estirar y dar vuelta',
  setup(g, {replay} = {}) {
    const w = g.world;
    base(g, {line: true});
    w.removeWhere(o => /^(g9|stretch-|pmore|flip-|arc4-)/.test(o.id));
    const st = replay ? 0 : g.scratch('c4.estirar').stage || 0;
    cast(g, {sx: lineX(LINE.from) - 120, mx: lineX(LINE.to) + 110});
    lineFamilies(g, STAGE_FACTOR[st]);
    if (st >= 1) pMore(w, true);
    g.camera.go(SHOTS.line);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    // en un recuerdo no se toca el progreso guardado
    const sc = replay ? {} : g.scratch();
    sc.stage ??= 0;
    await d.shot(SHOTS.line, 1);
    const fam = k => w.get(FAMILIES[k].id);
    const lab = k => w.get(`sign4-${FAMILIES[k].id}`);
    /** Llevar a cada familia de a·from a f(v·from), caminando. */
    const moveAll = async (from, to, desc) => {
      d.describe(desc);
      const links = ON_LINE.map(({k, v}, i) => w.add(new Link(`stretch-${i}`, () => [LINE.zero, GROUND - 24], () => [fam(k).x, GROUND - 24], {ch: YELLOW, p: 0.8, w: 2.2, z: 8, dash: true, gap: 6})));
      await d.tween(1.2, q => { for (const {k, v} of ON_LINE) fam(k).x = lerp(lineX(v * from), lineX(to(v * from)), q); }, easeInOut);
      for (const {k, v} of ON_LINE) lab(k).text = signed(to(v * from));
      await d.all(...links.map(l => d.fadeTo(l, 0, 0.4)));
      for (const l of links) w.remove(l.id);
      g.audio.tap(0.2, 1.2);
    };
    /** Media vuelta alrededor del cero: los arcos se dibujan; Punto, desde +1, da la vuelta chica. */
    const halfTurn = async th0 => {
      // cada punto gira alrededor del cero desde donde estaba antes de cualquier vuelta (2v)
      const at = (v, th) => Math.round(v * 2 * Math.cos(th));
      d.describe('Media vuelta alrededor del pozo: lo que estaba a la derecha pasa por arriba hacia la izquierda; lo que estaba a la izquierda pasa por abajo hacia la derecha. Punto, desde el 1, da la misma media vuelta, chiquita.');
      const arcs = ON_LINE.map(({v}, i) => w.add(new Drawing(`arc4-${i}-${th0}`, arcStrokes(`arc4-${i}-${th0}`, v * 2, th0, th0 + Math.PI), {z: 7, progress: 0})));
      const pArc = w.add(new Drawing(`arc4-p-${th0}`, arcStrokes(`arc4-p-${th0}`, 1, th0, th0 + Math.PI), {z: 7, progress: 0}));
      p.setMode('still');
      g.audio.erase(0.9, 0.3);
      await d.tween(1.6, q => {
        const th = th0 + q * Math.PI;
        for (const a of arcs) a.progress = q;
        pArc.progress = q;
        p.x = LINE.zero + LINE.step * Math.cos(th);
        p.y = GROUND - 30 - LINE.step * Math.sin(th) * ARC_FLAT - 30;
        for (const {k, v} of ON_LINE) fam(k).x = lerp(lineX(at(v, th0)), lineX(at(v, th0 + Math.PI)), q);
      }, easeInOut);
      for (const {k, v} of ON_LINE) lab(k).text = signed(at(v, th0 + Math.PI));
      g.audio.tap(0.2, 1.2);
    };
    /** Elegir qué aplicar: palabras sobre la línea; las equivocadas muestran su efecto y se deshacen. */
    const pickOp = (ops, hint) => d.interact(ctl => new Promise(resolve => {
      g.setHint(() => [hint]);
      g.ui.setSpots(ops.map((o, i) => wordSpot(`op-${o.id}`, o.text, lineX(-3 + i * 3), GROUND - 330, () => { if (ctl.alive()) { g.ui.setSpots([]); g.setHint(null); resolve(o.id); } }, {label: o.label})));
    }));
    if (sc.stage === 0) {
      await d.say('Mara', 'Para el plano nuevo de las Terrazas: el pozo de agua en el cero, y cada casa a tantos pasos del pozo.');
      await d.say('Mara', 'Y lo quiero al doble de grande: cada casa, al doble de lejos del pozo.');
      g.setCinematic(true);
      p.setMode('still');
      const l = pMore(w, false);
      await zip(d, p, l.x - 20, l.y - 40, 0.5);
      d.describe('Punto escribe "× 2 → más" en el aire, sobre la línea, y salta contento.');
      l.reveal = 0;
      await d.draw(l, 0.7, {key: 'reveal', sound: false});
      g.audio.punto('happy');
      await pulse(d, p, 2, 0.4);
      follow(p, s);
      g.setCinematic(false);
      const ops = [
        {id: 'plus2', text: '+ 2', label: 'Sumarle 2 a cada casa'},
        {id: 'times2', text: '× 2', label: 'Multiplicar por 2 cada casa'},
        {id: 'timesm2', text: '× (−2)', label: 'Multiplicar por menos 2 cada casa'},
      ];
      for (;;) {
        const op = await pickOp(ops, 'Cada casa tiene que quedar al doble de distancia del pozo, del mismo lado.');
        d.evidence('scale-choice', {op});
        if (op === 'times2') { await moveAll(1, x => x * 2, 'Cada familia se aleja del pozo al doble de distancia; el pozo queda quieto.'); break; }
        if (op === 'plus2') {
          await moveAll(1, x => x + 2, 'Todas las familias se corren dos pasos a la derecha.');
          await d.think('Todas se corrieron dos pasos. Cornisa quedó más cerca del pozo, no al doble de lejos.');
          await moveAll(1, x => x, 'Vuelven a sus casas.');
          ON_LINE.forEach(({k, v}) => { fam(k).x = lineX(v); lab(k).text = signed(v); });
        } else {
          await moveAll(1, x => x * -2, 'Cada familia queda al doble de distancia, pero del otro lado del pozo.');
          await d.think('Al doble de lejos, sí… pero del otro lado del pozo.');
          ON_LINE.forEach(({k, v}) => { fam(k).x = lineX(v); lab(k).text = signed(v); });
        }
        ops.splice(ops.findIndex(o => o.id === op), 1);
      }
      await d.think('Al doble de lejos, cada una de su lado. El pozo no se movió.');
      await d.think('Cornisa quedó en −6: más lejos del pozo, pero más a la izquierda que −3. "Más" no es la palabra.');
      // Punto corrige lo que escribió
      g.setCinematic(true);
      const pm = w.get('pmore');
      p.setMode('still');
      await zip(d, p, pm.x + 60, pm.y - 40, 0.4);
      d.describe('Punto borra "más" y escribe "más lejos del 0".');
      g.audio.erase(0.3, 0.3);
      pm.text = '× 2 → más lejos del 0';
      pm.reveal = 0;
      await d.draw(pm, 0.6, {key: 'reveal', sound: false});
      d.evidence('scale', {factor: 2, cornisa: scale(-3, 2)});
      // por uno: nada
      d.describe('Punto prueba con × 1: nadie se mueve. Punto mira a todos, desconcertado.');
      await zip(d, p, lineX(0), GROUND - 200, 0.4);
      const one = w.add(new Label('flip-one', '× 1', lineX(0), GROUND - 236, {size: 40, align: 'center', z: 20, ch: YELLOW, reveal: 0}));
      await d.draw(one, 0.4, {key: 'reveal', sound: false});
      await d.wait(0.6);
      g.audio.punto('question');
      await d.fadeTo(one, 0, 0.4);
      w.remove('flip-one');
      follow(p, s);
      g.setCinematic(false);
      await d.think('Por uno, nadie se mueve. Multiplicar no siempre agranda.');
      sc.stage = 1;
      g.saveNow();
    }
    if (sc.stage === 1) {
      await d.say('Mara', 'Y otro plano para los que llegan del otro lado del pozo: lo de la derecha, a la izquierda, a la misma distancia.');
      const ops = [
        {id: 'minus4', text: '− 4', label: 'Restarle 4 a cada casa'},
        {id: 'times0', text: '× 0', label: 'Multiplicar por cero cada casa'},
        {id: 'timesm1', text: '× (−1)', label: 'Multiplicar por menos 1 cada casa'},
      ];
      for (;;) {
        const op = await pickOp(ops, 'Cada casa tiene que pasar al otro lado del pozo, a la misma distancia.');
        d.evidence('flip-choice', {op});
        if (op === 'timesm1') break;
        if (op === 'minus4') {
          await moveAll(2, x => x - 4, 'Todas las familias se corren cuatro pasos a la izquierda.');
          await d.think('Se corrieron cuatro: Cornisa quedó todavía más lejos, del mismo lado. No es dar vuelta.');
        } else {
          await moveAll(2, () => 0, 'Todas las familias caen en el pozo, en el cero, una encima de la otra.');
          await d.think('Todas en el cero. Si Mara no lo tuviera anotado, ya no se sabría dónde estaba cada casa.');
        }
        await moveAll(2, x => x, 'Vuelven a donde estaban.');
        ON_LINE.forEach(({k, v}) => { fam(k).x = lineX(v * 2); lab(k).text = signed(v * 2); });
        ops.splice(ops.findIndex(o => o.id === op), 1);
      }
      await halfTurn(0);
      await d.think('Media vuelta alrededor del pozo: cada una quedó a la misma distancia, del otro lado.');
      sc.stage = 2;
      g.saveNow();
    }
    if (sc.stage === 2) {
      const c = await d.choose([
        {id: 'back', text: 'Vuelven adonde estaban.'},
        {id: 'further', text: 'Quedan más a la izquierda todavía.'},
        {id: 'cant', text: 'Dos veces no se puede.'},
      ], {prompt: '¿Y si se da otra media vuelta, para el mismo lado?', evaluate: true});
      d.evidence('predict-flip2', {answer: c});
      await halfTurn(Math.PI);
      follow(p, s);
      await d.think(c === 'back' ? 'Las dos medias vueltas cerraron la vuelta entera: cada una en su casa.' : 'Volvieron adonde estaban: dos medias vueltas, una vuelta entera. Punto, otra vez en el 1.');
      // el estudiante escribe lo que hizo Punto: de 1, por −1, a −1; por −1 otra vez, a 1
      g.setCinematic(true);
      await d.walk(s, lineX(-5), GROUND, 260);
      s.setPose('writeLow', 0.3);
      const eq = w.add(new Label('flip-eq', '(−1) × (−1) = 1', lineX(-6), GROUND - 330, {size: 40, z: 9, reveal: 0}));
      await d.draw(eq, 0.9, {key: 'reveal'});
      s.setPose('idle', 0.4);
      g.setCinematic(false);
      await d.say('student', 'Punto, mirá: empezaste en el 1, dos medias vueltas, y estás en el 1.');
      g.audio.punto('happy');
      sc.stage = 3;
      g.saveNow();
    }
    if (!replay) g.flags.c4scale = true;
  },
};

function pMore(w, fixed) {
  const l = w.ensure('pmore', () => new Label('pmore', '× 2 → más', lineX(-6), GROUND - 250, {size: 34, z: 20, ch: YELLOW}));
  if (fixed) l.text = '× 2 → más lejos del 0';
  return l;
}

export {homeOf, spotOf, Drawing, WHITE};
