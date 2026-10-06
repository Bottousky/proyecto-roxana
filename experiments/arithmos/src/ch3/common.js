// Capítulo 3 — lugar, actores y la línea.

import {Drawing, Label, Shape, Custom} from '../engine/world.js';
import {YELLOW, WHITE, BLUE} from '../engine/chalk.js';
import * as art from '../art.js';
import * as art3 from './art.js';
import * as art2 from '../ch2/art.js';
import {GROUND, DEPOT, LEDGER, mara, villager, depotBuilding, ledgerBoard, student, punto, item} from '../ch2/common.js';
import {signed} from '../logic/integers.js';

export {GROUND, DEPOT, LEDGER, mara, villager, student, punto, item, signed};

export const LINE = {zero: 10500, step: 110, from: -6, to: 6};
export const lineX = n => LINE.zero + n * LINE.step;
/** Dónde esperan las familias antes de ubicarse (a la derecha de la línea, dentro del plano). */
export const waitX = i => LINE.zero + LINE.to * LINE.step + 150 + i * 100;
export const TABLE = {x: 9330, top: GROUND - 320, w: 440, h: 210};
export const PIT = {x: 11800, step: 70};

export const SHOTS = {
  ledger: {x: 8100, y: 200, w: 1300, h: 560},
  table: {x: 8980, y: 280, w: 760, h: 440},
  line: {x: 9600, y: 260, w: 2200, h: 600},
  lineClose: {x: 10000, y: 380, w: 1000, h: 420},
  pit: {x: 11450, y: 260, w: 700, h: 820},
};

/** Fondo del capítulo 3: el depósito con su registro, la mesa de cuentas y la línea del suelo. */
export function base(g, {line = false, neg = true} = {}) {
  const w = g.world;
  g.renderer.dim = 1;
  g.renderer.tint = [1, 1, 1];
  w.ensure('ground', () => new Drawing('ground', art.groundLine('ground', 6000, LINE.zero + LINE.from * LINE.step - 120, GROUND), {z: 0, fade: 0.75}));
  w.ensure('ground-r', () => new Drawing('ground-r', art.groundLine('ground-r', LINE.zero + LINE.to * LINE.step + 120, 13000, GROUND), {z: 0, fade: 0.75}));
  depotBuilding(w, 4);
  ledgerBoard(w);
  w.ensure('table', () => new Drawing('table', art2.easel('table', TABLE.x, GROUND, TABLE.w, TABLE.h), {z: 4}));
  w.ensure('g3-t1', () => art.ghost('g3-t1', art.ghostLine('g3-t1', 9000, 150, 420, 7), 0.2, 0.05, -5));
  w.ensure('g3-t2', () => art.ghost('g3-t2', art.ghostSpiral('g3-t2', 11400, 170, 60), 0.2, 0.05, -5));
  w.ensure('g3-s1', () => art.smear('g3-s1', [[8200, 180], [9600, 140], [11000, 210], [12400, 150]], 170, 0.3));
  if (line) numberLineOn(w, 1, {neg});
}

/** La línea del suelo, con números legibles debajo (los negativos, sólo si `neg`). */
export function numberLineOn(w, progress = 1, {neg = true} = {}) {
  const nl = art3.numberLine('nline', LINE.zero, GROUND, LINE.step, LINE.from, LINE.to);
  const d = w.ensure('nline', () => new Drawing('nline', nl.strokes, {z: 2, progress}));
  for (const t of nl.ticks) {
    if (t.n < 0 && !neg) continue;
    w.ensure(`nl-${t.n}`, () => new Label(`nl-${t.n}`, t.n === 0 ? '0' : signed(t.n), t.x, GROUND + 50, {size: t.n === 0 ? 36 : 30, align: 'center', z: 9, weight: t.n === 0 ? 700 : 400}));
  }
  return d;
}

/** El pozo: una línea vertical con el 0 al ras del suelo. */
export function pitOn(w) {
  const rnd = art.S;
  const list = [];
  const top = GROUND - 5 * PIT.step, bottom = GROUND + 5 * PIT.step;
  list.push(art.S([[PIT.x, top - 30], [PIT.x, bottom + 30]], 8801, {w: 3.4, p: 0.95}));
  for (let n = -5; n <= 5; n++) {
    const y = GROUND - n * PIT.step;
    const h = n === 0 ? 22 : 12;
    list.push(art.S([[PIT.x - h, y], [PIT.x + h, y]], 8810 + n + 10, {w: n === 0 ? 3.6 : 2.6, p: 0.95}));
    w.ensure(`pit-${n}`, () => new Label(`pit-${n}`, n === 0 ? '0' : signed(n), PIT.x + 40, y + 12, {size: 28, z: 9}));
  }
  // paredes del pozo
  list.push(art.S([[PIT.x - 60, GROUND], [PIT.x - 60, bottom + 20]], 8840, {w: 2.6, p: 0.6}));
  list.push(art.S([[PIT.x + 120, GROUND], [PIT.x + 120, bottom + 20]], 8841, {w: 2.6, p: 0.6}));
  void rnd;
  return w.ensure('pit', () => new Drawing('pit', list, {z: 2}));
}

/** Un atado que se tiene o que se debe, como objeto móvil. */
export function chip(w, kind, x, y, id) {
  const sh = kind === 'debt' ? w.add(new Shape(id, art3.debt(id), x, y, {z: 15})) : item(w, 1, x, y, id);
  sh.kind = kind;
  sh.z = 15;
  sh.scale = sh.baseScale = 1.35;
  return sh;
}

/** Posiciones en la mesa: lo que se tiene arriba, lo que se debe abajo. */
export function tableSlot(kind, k) {
  const x = TABLE.x - TABLE.w / 2 + 60 + k * 72;
  const y = TABLE.top + (kind === 'have' ? 58 : 150);
  return [x, y];
}

export {art, art2, art3, Drawing, Label, Shape, Custom, YELLOW, WHITE, BLUE};
