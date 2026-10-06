// Capítulo 4 — las Terrazas: lugar, familias, la pizarra de Mara y la línea de la ladera.

import {Drawing, Label, Shape} from '../engine/world.js';
import {YELLOW, WHITE, BLUE} from '../engine/chalk.js';
import * as art from '../art.js';
import * as art3 from '../ch3/art.js';
import * as art4 from './art.js';
import * as art2 from '../ch2/art.js';
import {GROUND, mara, villager, student, punto, item} from '../ch2/common.js';
import {signed} from '../logic/integers.js';
import {follow} from '../acting.js';

export {GROUND, mara, villager, student, punto, item, signed};

/** Escalones de las Terrazas: uno por familia, subiendo hacia la derecha. */
export const TERR = {x0: 14700, w: 270, rise: 70, count: 4};
/** La pizarra de Mara, al pie de la ladera. */
export const BOARD = {x: 13600, w: 540, h: 300};
export const boardTop = () => GROUND - 110 - BOARD.h;
/** La línea de la ladera, más allá de las terrazas. */
export const LINE = {zero: 16900, step: 80, from: -7, to: 7};
export const lineX = n => LINE.zero + n * LINE.step;
export const ROCK = {x: 12950};

export const FAMILIES = [
  {id: 'peldano', name: 'Peldaño', head: 'square'},
  {id: 'rampa', name: 'Rampa', head: 'tri'},
  {id: 'cornisa', name: 'Cornisa', head: 'oval'},
  {id: 'balcon', name: 'Balcón', head: 'curl'},
];

export const SHOTS = {
  terr: {x: 12880, y: 130, w: 3000, h: 740},
  board: {x: 13220, y: 240, w: 780, h: 450},
  boardWide: {x: 12980, y: 140, w: 1400, h: 620},
  line: {x: 16080, y: 290, w: 1620, h: 560},
  share: {x: 12980, y: 200, w: 1800, h: 600},
};

/** Quita los carteles de saldo de la línea (sólo valen en 4.3). */
export const clearSigns = w => w.removeWhere(o => o.id.startsWith('sign4-'));

const steps = () => art4.terraces('terr', TERR.x0, GROUND, TERR.count, TERR.w, TERR.rise).steps;
/** Dónde está parada la familia k en su escalón. */
export const homeOf = k => { const st = steps()[k]; return [st.x0 + 80, st.y]; };
/** Dónde están las tres deudas de la familia k. */
export const debtSpot = (k, j) => { const st = steps()[k]; return [st.x0 + 150 + j * 44, st.y - 30]; };

/** Fondo del capítulo 4. */
export function base(g, {line = false} = {}) {
  const w = g.world;
  g.renderer.dim = 1;
  g.renderer.tint = [1.02, 1.0, 0.97];
  w.ensure('ground', () => new Drawing('ground', art.groundLine('ground', 12000, 18200, GROUND), {z: 0, fade: 0.75}));
  const t = art4.terraces('terr', TERR.x0, GROUND, TERR.count, TERR.w, TERR.rise);
  w.ensure('terr', () => new Drawing('terr', t.strokes, {z: 2}));
  w.ensure('board', () => new Drawing('board', art2.easel('board', BOARD.x, GROUND, BOARD.w, BOARD.h), {z: 4}));
  w.ensure('rock', () => new Drawing('rock', art4.rock('rock', ROCK.x, GROUND), {z: 3}));
  // el signo de la piedra: casi borrado hasta que se entiende
  w.ensure('rock-sign', () => new Label('rock-sign', '4 × 3', ROCK.x, GROUND - 52, {size: 46, align: 'center', z: 4, fade: g.flags.c4groups ? 1 : 0.22}));
  w.ensure('g4-s1', () => art.smear('g4-s1', [[13000, 170], [14400, 130], [15800, 190], [17400, 140]], 170, 0.3));
  w.ensure('g4-h1', () => art.ghost('g4-h1', art.hill('g4-h1', 15900, 17900, GROUND - 2, 110, 0.6), 0.4, 0, 1));
  if (line) lineOn(w);
}

/** La línea de la ladera, con sus números. */
export function lineOn(w, progress = 1) {
  const nl = art3.numberLine('l4', LINE.zero, GROUND, LINE.step, LINE.from, LINE.to);
  const d = w.ensure('l4', () => new Drawing('l4', nl.strokes, {z: 2, progress}));
  for (const t of nl.ticks) {
    w.ensure(`l4-${t.n}`, () => new Label(`l4-${t.n}`, t.n === 0 ? '0' : signed(t.n), t.x, GROUND + 48, {size: t.n === 0 ? 32 : 26, align: 'center', z: 9, weight: t.n === 0 ? 700 : 400}));
  }
  return d;
}

/** Elenco: el estudiante y Punto a la izquierda de la pizarra; Mara entre la pizarra y la ladera. */
export function cast(g, {sx = BOARD.x - BOARD.w / 2 - 120, mx = BOARD.x + BOARD.w / 2 + 90} = {}) {
  const w = g.world;
  const s = student(w, sx);
  const p = punto(w, s.x + 44, GROUND - 150);
  follow(p, s);
  mara(w, mx, {facing: -0.8});
  return {s, p};
}

/** Una familia de las Terrazas: sombrero y cabeza propia. */
export function family(w, k, x, y, opts = {}) {
  const f = FAMILIES[k];
  const v = villager(w, f.id, x, f.head, {facing: opts.facing ?? -0.6, style: {hat: true}, scale: opts.scale ?? (k === 2 ? 0.94 : 1)});
  v.y = y ?? GROUND;
  return v;
}

export function familiesHome(g) {
  FAMILIES.forEach((f, k) => { const [x, y] = homeOf(k); family(g.world, k, x, y); });
}

/** Un atado que se debe (punteado) o que se tiene. */
export function chip(w, kind, x, y, id, scale = 1) {
  const sh = kind === 'debt' ? w.add(new Shape(id, art3.debt(id), x, y, {z: 15})) : item(w, 1, x, y, id);
  sh.kind = kind;
  sh.z = 15;
  sh.scale = sh.baseScale = scale;
  return sh;
}

/** Posición en la pizarra: f filas de c columnas, centradas. */
export function gridPos(f, c, i, j, {gx = 70, gy = 58} = {}) {
  const top = boardTop();
  const cx = BOARD.x, cy = top + 40 + BOARD.h * 0.42;
  return [cx + (j - (c - 1) / 2) * gx, cy + (i - (f - 1) / 2) * gy];
}

export {art, art2, art3, art4, Drawing, Label, Shape, YELLOW, WHITE, BLUE};
