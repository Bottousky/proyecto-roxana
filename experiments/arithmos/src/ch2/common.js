// Capítulo 2 — lugar, actores y depósito.

import {Figure} from '../engine/figure.js';
import {Drawing, Label, Shape, Custom} from '../engine/world.js';
import {YELLOW, WHITE, BLUE} from '../engine/chalk.js';
import {seedOf} from '../engine/rng.js';
import * as art from '../art.js';
import * as art2 from './art.js';
import {GROUND, GRADAS, rondaDot, punto, student, RONDA_IDS, NAME, nameMarkPos} from '../ch1/common.js';

export {GROUND};

// La mañana empieza en las gradas; el depósito de Mara queda a la derecha.
export const MORNING = {x: GRADAS.x};
export const SLED = {x: 6350};
export const PILE = {x: 6350, y: GROUND - 40};
export const FRAME = {x: 6720, y: GROUND - 210};
export const DEPOT = {right: 8350, widths: [210, 250, 340]};
export const DEPOT4 = [210, 250, 340, 420];
export const LEDGER = {x: 8620};

export const SHOTS = {
  morning: {x: GRADAS.x - 560, y: 160, w: 1500, h: 620},
  board14: {x: GRADAS.x + 300, y: 250, w: 1100, h: 480},
  arrival: {x: 5700, y: 260, w: 1300, h: 520},
  pile: {x: 5980, y: 300, w: 1060, h: 460},
  frame: {x: 6040, y: 290, w: 1130, h: 470},
  depot: {x: 7280, y: 230, w: 1580, h: 560},
  depotRooms: {x: 7480, y: 340, w: 1000, h: 420},
  ledger: {x: 7560, y: 200, w: 1300, h: 560},
};

/** Rectángulos de los cuartos del depósito (0 = sueltos, a la derecha). */
export function rooms(count = 3) {
  const widths = count === 4 ? DEPOT4 : DEPOT.widths;
  return art2.depot('depot', DEPOT.right, GROUND, widths).rooms;
}

/** Dónde va el k-ésimo objeto dentro del cuarto i. */
export function slot(i, k, count = 3) {
  const r = rooms(count)[i];
  const bottom = r.y + r.h - 34;
  if (i === 0) return [r.x + 18 + k * 17, bottom];
  if (i === 1) return [r.x + 30 + (k % 5) * 42, bottom - Math.floor(k / 5) * 62];
  if (i === 2) return [r.x + 56 + (k % 3) * 104, bottom - Math.floor(k / 3) * 44];
  return [r.x + 70 + (k % 3) * 130, bottom - Math.floor(k / 3) * 50];
}

/** Escala de dibujo de cada tipo de objeto dentro del depósito. */
export const ITEM_SCALE = [1, 1, 0.82, 0.62];

let serial = 0;
/** Crea un objeto móvil: palito, atado, atado de atados o "de mil". */
export function item(w, kind, x, y, id) {
  const sid = id || `it${kind}-${serial++}`;
  const strokes = kind === 0 ? art2.stick(sid) : kind === 1 ? art2.bundle(sid) : kind === 2 ? art2.bigBundle(sid) : thousand(sid);
  const sh = w.add(new Shape(sid, strokes, x, y, {z: 14, scale: kind === 2 ? 0.82 : kind === 3 ? 0.62 : 1}));
  sh.kind = kind;
  return sh;
}

function thousand(id) {
  // diez atados de atados apilados de a dos, con una faja doble
  const list = [];
  for (let i = 0; i < 10; i++) {
    const b = art2.bigBundle(`${id}-${i}`).slice(0, 100).map(s => art2.shift(s, (i % 5 - 2) * 30 - 0, Math.floor(i / 5) * 26 - 13));
    list.push(...b.filter((_, k) => k % 3 === 0));
  }
  return list;
}

/** Un habitante de otra familia. La forma de la cabeza dice de qué familia es. */
export function villager(w, id, x, head, opts = {}) {
  const f = w.ensure(id, () => {
    const v = new Figure(id, x, GROUND, {facing: opts.facing ?? -0.6, pose: 'idle', z: 29, chalk: false, scale: opts.scale ?? 1});
    v.style = {head, ...(opts.style || {})};
    return v;
  });
  f.x = x;
  f.y = GROUND;
  f.path = null;
  f.visible = true;
  return f;
}

export function mara(w, x, opts = {}) {
  const m = w.ensure('mara', () => {
    const f = new Figure('mara', x, GROUND, {facing: -0.6, pose: 'idle', z: 31, chalk: false, scale: 1.08});
    f.style = {bun: true, scarf: true, scarfCh: BLUE, bunScale: 1.4};
    return f;
  });
  m.x = x;
  m.y = GROUND;
  m.path = null;
  m.walking = 0;
  m.visible = true;
  m.fade = 1;
  m.facing = m.facingTarget = opts.facing ?? -0.6;
  m.setPose(opts.pose || 'idle', 0);
  return m;
}

/** Fondo del capítulo 2. */
export function base(g, {dawn = true} = {}) {
  const w = g.world;
  g.renderer.dim = 1;
  g.renderer.tint = dawn ? [1.04, 1.0, 0.94] : [1, 1, 1];
  w.ensure('ground', () => new Drawing('ground', art.groundLine('ground', GRADAS.x - 900, 10800, GROUND), {z: 0, fade: 0.75}));
  w.ensure('gradas', () => new Drawing('gradas', art.gradas('gradas', GRADAS.x, GROUND, art.seatPositions(GRADAS.x, GROUND, GRADAS.seats)), {z: 3}));
  w.ensure('sun', () => new Drawing('sun', art2.sun('sun', GRADAS.x - 240, 270), {z: 1, fade: 0.8}));
  // la pizarra de anoche: marcas de Punto, palabras, la llave, el 14 y el círculo del 1
  const words = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce'];
  for (let i = 0; i < 14; i++) {
    const [mx, my] = nameMarkPos(i);
    w.ensure(`pmark${i}`, () => {
      const d = new Drawing(`pmark${i}`, art.tally(`pmark${i}`, mx, my, 40), {z: 9});
      for (const s2 of d.strokes) s2.ch = YELLOW;
      return d;
    });
    w.ensure(`nword${i}`, () => new Label(`nword${i}`, words[i], mx, NAME.wordsY + (i % 2) * 22, {size: 26, align: 'center', z: 10}));
  }
  const bx = NAME.numX - 46;
  w.ensure('brace', () => new Drawing('brace', [art.S([[bx - 10, NAME.marksY - 40], [bx + 6, NAME.marksY - 30], [bx + 4, (NAME.marksY + GROUND) / 2 - 12], [bx + 18, (NAME.marksY + GROUND) / 2], [bx + 4, (NAME.marksY + GROUND) / 2 + 12], [bx + 6, GROUND - 4], [bx - 10, GROUND + 6]], 611, {w: 3, p: 0.9})], {z: 9}));
  w.ensure('num-14', () => new Label('num-14', '14', NAME.numX, NAME.numY, {size: 96, weight: 700, z: 9}));
  const m = document.createElement('canvas').getContext('2d');
  m.font = '700 96px Kalam';
  const g1x = NAME.numX + m.measureText('1').width / 2, g1y = NAME.numY - 34;
  w.ensure('one-ring', () => new Drawing('one-ring', [art.S(art.circleGuideFor(g1x, g1y, 44), 717, {w: 2.2, p: 0.8, ch: YELLOW})], {z: 9}));
  // camino al depósito
  w.ensure('hill-a', () => art.ghost('hill-a', art.hill('hill-a', 6000, 6700, GROUND - 2, 70, 0.7), 0.45, 0, 1));
  w.ensure('hill-b', () => art.ghost('hill-b', art.hill('hill-b', 8900, 9500, GROUND - 2, 120, 0.7), 0.45, 0, 1));
  w.ensure('g2-t1', () => art.ghost('g2-t1', art.ghostTree('g2-t1', 7000, 260, 0.8), 0.22, 0.05, -5));
  w.ensure('g2-t2', () => art.ghostText('g2-t2', '9 + 1', 7800, 120, 40, 0.14));
  w.ensure('g2-s1', () => art.smear('g2-s1', [[5400, 200], [6400, 150], [7600, 230], [9200, 160]], 180, 0.32));
  w.ensure('g2-s2', () => art.smear('g2-s2', [[6000, 780], [7400, 740], [9000, 800]], 150, 0.28));
}

/** El depósito (edificio). `count` cuartos. */
export function depotBuilding(w, count = 3) {
  const id = count === 4 ? 'depot4' : 'depot';
  w.remove(count === 4 ? 'depot' : 'depot4');
  const d = art2.depot('depot', DEPOT.right, GROUND, count === 4 ? DEPOT4 : DEPOT.widths);
  return w.ensure(id, () => new Drawing(id, d.strokes, {z: 4}));
}

export function ledgerBoard(w) {
  return w.ensure('ledger', () => new Drawing('ledger', art2.easel('ledger', LEDGER.x, GROUND), {z: 4}));
}

/** Coloca a la Ronda dormida/sentada en las gradas (decorado vivo de la mañana). */
export function rondaOnGradas(g) {
  const w = g.world;
  const seats = art.seatPositions(GRADAS.x, GROUND, GRADAS.seats);
  RONDA_IDS.forEach((id, k) => {
    const d = rondaDot(w, k);
    d.visible = true;
    d.fade = 1;
    d.x = seats[k][0];
    d.y = seats[k][1] - 14;
    d.setMode('bob', {home: [d.x, d.y]});
  });
}

export {art, art2, student, punto, Drawing, Label, Shape, Custom, seedOf, YELLOW, WHITE, BLUE, GRADAS};
