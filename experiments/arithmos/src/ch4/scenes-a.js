// Capítulo 4 — Veces (4.1 a 4.3): grupos iguales, el rectángulo girado y la línea que se estira.

import {Drawing, Label, Link, Shape} from '../engine/world.js';
import {YELLOW, WHITE} from '../engine/chalk.js';
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
      await d.say('Mara', 'Las Terrazas. Cuatro familias, y cada una me debe tres atados.');
      await d.say('Peldaño', 'Tres cada una, sí. Abajo, en la piedra, alguien lo dejó escrito hace mucho. Ya casi no se lee.');
      await d.think('Una cruz acostada entre el 4 y el 3. Nadie sabe qué quiere decir.');
      // Punto se apura: junta lo que ve
      g.setCinematic(true);
      p.setMode('still');
      d.describe('Punto vuela a la pizarra de Mara y escribe, en amarillo: 4 + 3 = 7.');
      await zip(d, p, BOARD.x - 180, boardTop() + 40, 0.5);
      const l = punto7(w);
      l.reveal = 0;
      await d.draw(l, 0.7, {key: 'reveal', sound: false});
      g.audio.punto('happy');
      await pulse(d, p, 2, 0.4);
      follow(p, s);
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
    await d.think(guess === '12' ? `Doce, como dije: tres, seis, nueve, doce.`
      : guess === '7' ? `${WORDS[total - 1][0].toUpperCase() + WORDS[total - 1].slice(1)}, no siete. Cuatro familias y tres atados no se suman: son cuatro filas de tres.`
        : 'Doce. No hizo falta contarlos de a uno: de a tres alcanzó.');
    if (w.has('p7')) {
      g.setCinematic(true);
      g.audio.erase(0.5, 0.4);
      await d.fadeTo(w.get('p7'), 0, 0.5);
      w.remove('p7');
      g.setCinematic(false);
    }
    // la escritura: cuatro veces tres
    m.setPose('write', 0.3);
    boardNotes(g, 1);
    const e1 = w.get('eq1');
    e1.reveal = 0;
    await d.draw(e1, 0.8, {key: 'reveal'});
    m.setPose('idle', 0.4);
    await d.say('Mara', 'Cuatro veces tres. ¡Eso decía la piedra!');
    // la piedra se vuelve legible
    g.setCinematic(true);
    await d.shot({x: ROCK.x - 300, y: 200, w: 2300, h: 640}, 1);
    d.describe('El signo de la piedra, que casi no se veía, se vuelve nítido: 4 × 3.');
    g.audio.cue('found');
    await d.fadeTo(w.get('rock-sign'), 1, 1.4);
    g.flags.c4groups = true;
    g.setCinematic(false);
    await d.say('Mara', 'Y como son deudas, en las cuentas va con su rayita: cuatro veces menos tres.');
    m.setPose('write', 0.3);
    boardNotes(g, 2);
    const e2 = w.get('eq2');
    e2.reveal = 0;
    await d.draw(e2, 0.9, {key: 'reveal'});
    m.setPose('idle', 0.4);
    d.evidence('times', {groups: 4, each: -3, total: groups(4, -3).total});
    await d.think('Cuatro grupos iguales de lo mismo: eso es "veces".');
  },
};

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
        const idx = row * 3 + j;
        const [x, y] = turned ? gridPos(3, 4, Math.floor(idx / 4), idx % 4) : gridPos(4, 3, row, j);
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
            const [cx, cy] = [BOARD.x, gridPos(4, 3, 0, 0)[1] + 1.5 * 58];
            const from = list.map(o => [o.x - cx, o.y - cy]);
            g.audio.erase(0.6, 0.3);
            d.describe('El rectángulo de deudas gira un cuarto de vuelta: las cuatro filas de tres quedan como tres filas de cuatro.');
            await d.tween(1.1, k => {
              const a = k * Math.PI / 2;
              list.forEach((o, i) => {
                const [dx, dy] = from[i];
                const idx = i;
                const [tx, ty] = gridPos(3, 4, Math.floor(idx / 4), idx % 4);
                const rx = cx + dx * Math.cos(a) - dy * Math.sin(a), ry = cy + dx * Math.sin(a) + dy * Math.cos(a);
                const q = Math.max(0, (k - 0.6) / 0.4);
                o.x = lerp(rx, tx, q);
                o.y = lerp(ry, ty, q);
                o.rot = a;
              });
            }, easeInOut);
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
      m.setPose('write', 0.3);
      boardNotes(g, 3);
      const e3 = w.get('eq3');
      e3.reveal = 0;
      await d.draw(e3, 0.8, {key: 'reveal'});
      m.setPose('idle', 0.4);
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
    await d.say('Peldaño', 'Mi huerta de atrás: nueve filas de cuatro. Mirada desde el camino, cuatro filas de nueve.');
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
      await d.say('Mara', 'Pará, Punto. Girarlo no le saca ni le pone ninguna.');
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

const ON_LINE = [{k: 0, v: 1}, {k: 1, v: 2}, {k: 2, v: -3}];
const STAGE_FACTOR = [1, 2, -2, 2];

function lineFamilies(g, factor) {
  const w = g.world;
  for (const {k, v} of ON_LINE) {
    const f = family(w, k, lineX(v * factor), GROUND, {facing: 0.2});
    const id = `sign4-${FAMILIES[k].id}`;
    const lab = w.ensure(id, () => new Label(id, '', 0, 0, {size: 28, align: 'center', z: 32, ch: YELLOW}));
    lab.text = signed(v * factor);
    lab.update = () => { const h = f.headPos(); lab.x = h[0]; lab.y = h[1] - 40; };
  }
}

export const estirar = {
  id: 'c4.estirar',
  title: 'Estirar la línea',
  moment: 'Estirar y dar vuelta',
  setup(g, {replay} = {}) {
    const w = g.world;
    base(g, {line: true});
    w.removeWhere(o => /^(g9|stretch-|pmore|flip-)/.test(o.id));
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
    const m = w.get('mara');
    // en un recuerdo no se toca el progreso guardado
    const sc = replay ? {} : g.scratch();
    sc.stage ??= 0;
    await d.shot(SHOTS.line, 1);
    const fam = k => w.get(FAMILIES[k].id);
    /** Aplicar un factor a las tres familias de la línea. */
    const apply = async (factor, from) => {
      const moves = ON_LINE.map(({k, v}) => ({f: fam(k), a: v * from, b: v * from * factor, lab: w.get(`sign4-${FAMILIES[k].id}`)}));
      if (factor === -1) {
        // media vuelta alrededor del cero
        d.describe('Cada familia da media vuelta alrededor del cero, por arriba, y cae del otro lado a la misma distancia.');
        g.audio.erase(0.9, 0.3);
        await d.tween(1.4, q => {
          const ang = q * Math.PI;
          for (const mv of moves) {
            const r = mv.a * LINE.step;
            mv.f.x = LINE.zero + r * Math.cos(ang);
            mv.f.y = GROUND - Math.abs(r) * Math.sin(ang) * 0.55;
          }
        }, easeInOut);
        for (const mv of moves) { mv.f.y = GROUND; mv.f.x = lineX(mv.b); }
      } else {
        // estirar desde el cero: el cero queda quieto
        d.describe(factor === 1 ? 'Nadie se mueve.' : 'La línea se estira desde el cero: cada familia se aleja del cero al doble de distancia. El cero queda quieto.');
        const links = moves.map((mv, i) => w.add(new Link(`stretch-${i}`, () => [LINE.zero, GROUND - 24], () => [mv.f.x, GROUND - 24], {ch: YELLOW, p: 0.8, w: 2.2, z: 8, dash: true, gap: 6})));
        await d.tween(factor === 1 ? 0.6 : 1.3, q => { for (const mv of moves) mv.f.x = lerp(lineX(mv.a), lineX(mv.b), q); }, easeInOut);
        await d.all(...links.map(l => d.fadeTo(l, 0, 0.5)));
        for (const l of links) w.remove(l.id);
      }
      for (const mv of moves) mv.lab.text = signed(mv.b);
      g.audio.tap(0.2, 1.2);
    };
    if (sc.stage === 0) {
      await d.say('Mara', 'Este año la cosecha de las Terrazas se duplicó. Y las cuentas también: lo que cada familia tenía, y lo que debía, ahora es el doble.');
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
      const c = await d.choose([
        {id: '-6', text: '−6'}, {id: '-1', text: '−1'}, {id: '-5', text: '−5'}, {id: '+6', text: '+6'},
      ], {prompt: 'Cornisa debía tres: está en −3. Con el doble, ¿dónde queda?', evaluate: true});
      d.evidence('predict-double', {answer: c});
      await waitWord(d, g, 'por2', '× 2', 'Multiplicar todo por 2');
      await apply(2, 1);
      await d.think(c === '-6' ? 'Menos seis: el doble de lejos del cero, del mismo lado.' : `Menos seis, no ${c.replace('-', '−')}: el doble de lejos del cero, del mismo lado.`);
      await d.think('Más lejos del cero… pero −6 es menos que −3. "Más" no es la palabra: se aleja del cero.');
      const pm = w.get('pmore');
      pm.text = '× 2 → más lejos del 0';
      d.evidence('scale', {factor: 2, cornisa: scale(-3, 2)});
      // por uno: nada
      g.setCinematic(true);
      p.setMode('still');
      d.describe('Punto prueba con × 1: nadie se mueve. Punto mira a todos, desconcertado.');
      await zip(d, p, lineX(0), GROUND - 200, 0.4);
      const one = w.add(new Label('flip-one', '× 1', lineX(0), GROUND - 236, {size: 40, align: 'center', z: 20, ch: YELLOW, reveal: 0}));
      await d.draw(one, 0.4, {key: 'reveal', sound: false});
      await apply(1, 2);
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
      await d.say('Mara', '¿Y si hubiera que dar vuelta las cuentas? Lo que se tenía, deberlo; lo que se debía, tenerlo.');
      const c = await d.choose([
        {id: '-4', text: '−4'}, {id: '+4', text: '+4'}, {id: '0', text: '0'}, {id: '-8', text: '−8'},
      ], {prompt: 'Rampa está en +4. Si se dan vuelta las cuentas, ¿dónde queda?', evaluate: true});
      d.evidence('predict-flip', {answer: c});
      await waitWord(d, g, 'flip1', '× (−1)', 'Multiplicar todo por menos uno');
      await apply(-1, 2);
      await d.think(c === '-4' ? 'Menos cuatro: media vuelta alrededor del cero.' : 'Menos cuatro: media vuelta alrededor del cero. Cada uno quedó a la misma distancia, del otro lado.');
      sc.stage = 2;
      g.saveNow();
    }
    if (sc.stage === 2) {
      const c = await d.choose([
        {id: 'back', text: 'Vuelven adonde estaban.'},
        {id: 'further', text: 'Quedan más a la izquierda todavía.'},
        {id: 'cant', text: 'Dos veces no se puede.'},
      ], {prompt: '¿Y si se dan vuelta otra vez?', evaluate: true});
      d.evidence('predict-flip2', {answer: c});
      await waitWord(d, g, 'flip2', '× (−1)', 'Multiplicar todo por menos uno, otra vez');
      await apply(-1, -2);
      await d.think(c === 'back' ? 'Volvieron. Dos medias vueltas: una vuelta entera.' : 'Volvieron adonde estaban. Dos medias vueltas: una vuelta entera, como si nadie se hubiera movido.');
      m.setPose('write', 0.3);
      const eq = w.add(new Label('flip-eq', '(−1) × (−1) = 1', lineX(-6), GROUND - 330, {size: 40, z: 9, reveal: 0}));
      await d.draw(eq, 0.9, {key: 'reveal'});
      m.setPose('idle', 0.4);
      sc.stage = 3;
      g.saveNow();
    }
    await d.say('Mara', 'Por dos, todo se aleja del cero. Por uno, nada se mueve. Por menos uno, media vuelta.');
    if (!replay) g.flags.c4scale = true;
  },
};

function pMore(w, fixed) {
  const l = w.ensure('pmore', () => new Label('pmore', '× 2 → más', lineX(-6), GROUND - 250, {size: 34, z: 20, ch: YELLOW}));
  if (fixed) l.text = '× 2 → más lejos del 0';
  return l;
}

/** Espera a que el jugador toque una palabra (una operación a aplicar). */
function waitWord(d, g, id, text, label) {
  return d.interact(ctl => new Promise(resolve => {
    g.setHint(() => [`Tocá "${text}" para aplicarlo a todos.`]);
    g.ui.setSpots([wordSpot(id, text, lineX(0), GROUND - 300, () => { if (ctl.alive()) { g.ui.setSpots([]); g.setHint(null); resolve(); } }, {label})]);
  }));
}

export {homeOf, spotOf, Drawing, WHITE};
