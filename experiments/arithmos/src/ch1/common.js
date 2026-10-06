// Capítulo 1 — lugar, actores y estado canónico de cada escena.

import {Figure, POSES} from '../engine/figure.js';
import {Dot, Custom, Drawing, Label} from '../engine/world.js';
import {YELLOW, WHITE} from '../engine/chalk.js';
import {seedOf} from '../engine/rng.js';
import * as art from '../art.js';

export const GROUND = 700;
export const DOOR = {x: 420, w: 150, h: 270};
export const STONE = {x: 2190, w: 640, h: 110};
export const RING = {x: 2560, y: 400, r: 170};
export const MARKS = 12;
export const FIELD = {crack: [3170, 640], smudge: [3460, 590], house: [3800, 700]};
export const GRADAS = {x: 5010, seats: 14};
export const LINE_X0 = 4050;
export const LINE_GAP = 60;

// planos (rectángulos de mundo)
export const SHOTS = {
  door: {x: 140, y: 300, w: 560, h: 450},
  doorWide: {x: 60, y: 160, w: 1100, h: 640},
  meet: {x: 380, y: 260, w: 1300, h: 520},
  meetClose: {x: 760, y: 420, w: 560, h: 320},
  ronda: {x: 1660, y: 200, w: 1200, h: 560},
  pairing: {x: 1780, y: 280, w: 840, h: 440},
  stone: {x: 1720, y: 440, w: 860, h: 330},
  marea: {x: 1480, y: 150, w: 1500, h: 640},
  field: {x: 2860, y: 360, w: 1100, h: 420},
  gradas: {x: 3870, y: 300, w: 1390, h: 470},
  sky: {x: 4150, y: -60, w: 1400, h: 760},
  nombre: {x: 5150, y: 250, w: 1250, h: 470},
  marksNight: {x: 5200, y: 240, w: 900, h: 420},
};

export const MARK_GAP = 46;
export function markPos(i) {
  const x0 = STONE.x - (MARKS - 1) * MARK_GAP / 2;
  return [x0 + i * MARK_GAP, GROUND - 50];
}

/** Rectángulo tocable de una marca. */
export function markRect(i) {
  const [x, y] = markPos(i);
  return {x: x - 20, y: y - 28, w: 40, h: 56};
}

export const RONDA_IDS = Array.from({length: 12}, (_, i) => `r${i}`);
export const LINO = 'r11';

/** Rasgos mínimos de la Ronda: tamaño y ritmo. */
export function rondaTraits(i) {
  if (RONDA_IDS[i] === LINO) return {r: 5.2, lag: 1};
  return {r: 7.2 + ((i * 7) % 5) * 0.55, lag: 0};
}

export function student(world, x = DOOR.x + 90, opts = {}) {
  const s = world.ensure('student', () => new Figure('student', x, GROUND, {facing: 0.6, pose: 'idle', z: 30}));
  s.x = x;
  s.y = GROUND;
  s.path = null;
  s.walking = 0;
  s.draw = opts.draw ?? 1;
  s.fade = 1;
  s.visible = true;
  s.facing = s.facingTarget = opts.facing ?? 0.6;
  s.setPose(opts.pose || 'idle', 0);
  s.look(0, 0);
  s.gaze = [0, 0];
  return s;
}

export function punto(world, x, y, opts = {}) {
  const p = world.ensure('punto', () => new Dot('punto', x, y, {r: 11, ch: YELLOW, ring: true, z: 40}));
  p.x = x;
  p.y = y;
  p.home = [x, y];
  p.fade = opts.fade ?? 1;
  p.scale = 1;
  p.lift = 0;
  p.setMode(opts.mode || 'bob', {home: [x, y]});
  p.visible = true;
  return p;
}

export function rondaDot(world, i) {
  const id = RONDA_IDS[i];
  const t = rondaTraits(i);
  const d = world.ensure(id, () => new Dot(id, RING.x, RING.y, {r: t.r, ch: WHITE, z: 35}));
  d.fade = 1;
  d.visible = true;
  d.mark = 0;
  d.scale = 1;
  d.lift = 0;
  d.hover = false;
  return d;
}

/** Controla la danda en ronda: ángulo común; el más chico se atrasa y alcanza. */
export function rondaDance(world, {speed = 0.32, cx = RING.x, cy = RING.y, r = RING.r, ids = RONDA_IDS} = {}) {
  const ctl = world.ensure('ronda-ctl', () => new Custom('ronda-ctl', {z: -100}));
  ctl.angle ??= 0;
  ctl.speed = speed;
  ctl.cx = cx;
  ctl.cy = cy;
  ctl.r = r;
  ctl.ids = ids;
  ctl.time ??= 0;
  ctl.update = (dt, w) => {
    ctl.time += dt;
    ctl.angle += ctl.speed * dt;
  };
  ids.forEach((id, i) => {
    const d = world.get(id);
    if (!d) return;
    d.setMode('anchor', {anchor: () => {
      const n = ctl.ids.length;
      const lag = id === LINO ? 0.22 + Math.sin(ctl.time * 0.8) * 0.18 : 0;
      const a = ctl.angle + (i / n) * Math.PI * 2 - lag;
      const bob = Math.sin(ctl.time * 3 + i) * 4;
      return [ctl.cx + Math.cos(a) * ctl.r, ctl.cy + Math.sin(a) * ctl.r * 0.42 + bob];
    }});
  });
  return ctl;
}

export function stopDance(world) {
  world.remove('ronda-ctl');
}

/** Fondo del capítulo: fantasmas, manchas, puerta, piedra, gradas. `stage` decide qué cambió ya. */
export function base(g, stage) {
  const w = g.world;
  const after = name => stage >= STAGES.indexOf(name);
  const erased = after('marea-done');
  // fantasmas a la izquierda: la Marea los borra más
  const ghostFade = erased ? 0.1 : 0.24;
  const gh = (id, strokes, f = ghostFade) => {
    const o = w.ensure(id, () => art.ghost(id, strokes, f));
    o.fade = f;
    return o;
  };
  gh('g-house', art.ghostHouse('g-house', 900, GROUND, 0.9));
  gh('g-tree', art.ghostTree('g-tree', 1250, GROUND, 0.8), erased ? 0.08 : 0.2);
  gh('g-spiral', art.ghostSpiral('g-spiral', 1580, 300, 80), erased ? 0.06 : 0.18);
  gh('g-line', art.ghostLine('g-line', 600, 200, 420), erased ? 0.08 : 0.22);
  gh('g-parab', art.ghostParabola('g-parab', 3000, 330, 0.8), 0.16);
  gh('g-house2', art.ghostHouse('g-house2', FIELD.house[0], FIELD.house[1], 0.85), 0.22);
  const gt = (id, text, x, y, size, f) => {
    const o = w.ensure(id, () => art.ghostText(id, text, x, y, size, f));
    o.fade = f;
  };
  gt('g-t1', 'x − 3 = 5', 1300, 190, 48, erased ? 0.08 : 0.22);
  gt('g-t2', '3 + 4 = 4 + 3', 180, 130, 40, erased ? 0.06 : 0.18);
  gt('g-t3', 'a · (b + c)', 3350, 250, 44, 0.16);
  gt('g-t4', '|−2| = 2', 2050, 170, 40, erased ? 0.12 : 0.2);
  // lo que hubo escrito cerca de la puerta: restos de muchas clases
  gt('g-t5', '7 × 8 = 56', 760, 360, 42, erased ? 0.08 : 0.2);
  gt('g-t6', 'a + b = b + a', 120, 300, 40, erased ? 0.07 : 0.18);
  gt('g-t7', 'x² − 1 = (x − 1)(x + 1)', 980, 120, 38, erased ? 0.06 : 0.17);
  gt('g-t8', '1, 2, 3, 5, 8, 13, …', 1500, 430, 36, erased ? 0.07 : 0.2);
  gt('g-t9', '3/4 > 2/3', 260, 470, 40, erased ? 0.06 : 0.16);
  const sm = (id, pts, width, alpha) => {
    const o = w.ensure(id, () => art.smear(id, pts, width, alpha));
    o.alpha = alpha;
  };
  sm('s-1', [[-200, 240], [500, 170], [1200, 240], [1900, 150]], 190, 0.35);
  sm('s-2', [[200, 820], [900, 760], [1700, 830], [2400, 780]], 160, 0.3);
  sm('s-3', [[2700, 160], [3300, 230], [3900, 140], [4800, 220]], 180, 0.3);
  sm('s-4', [[3100, 540], [3400, 600], [3700, 560]], 150, 0.38);
  sm('s-5', [[3360, 560], [3460, 620], [3560, 580]], 110, 0.5);
  if (erased) {
    sm('s-m1', [[600, 360], [1500, 440], [2400, 360], [3000, 420]], 300, 0.42);
    sm('s-m2', [[700, 560], [1600, 520], [2500, 600], [3000, 540]], 220, 0.32);
  } else {
    w.remove('s-m1');
    w.remove('s-m2');
  }
  // puerta: viva hasta cruzarla, después fantasma
  const frame = w.ensure('door', () => new Drawing('door', art.doorFrame('door', DOOR.x, GROUND, DOOR.w, DOOR.h), {z: 2}));
  if (after('door-crossed')) {
    frame.fade = 0.28;
    frame.dust = 0.08;
    w.remove('door-panel');
    w.remove('door-light');
  }
  // piedra
  const st = w.ensure('stone', () => new Drawing('stone', art.stone('stone', STONE.x, GROUND, STONE.w, STONE.h), {z: 3}));
  st.fade = erased ? 0.85 : 1;
  // gradas
  w.ensure('gradas', () => new Drawing('gradas', art.gradas('gradas', GRADAS.x, GROUND, art.seatPositions(GRADAS.x, GROUND, GRADAS.seats)), {z: 3}));
  w.ensure('hill-1', () => art.ghost('hill-1', art.hill('hill-1', 4500, 4900, GROUND - 2, 90, 0.7), 0.45, 0, 1));
  w.ensure('hill-2', () => art.ghost('hill-2', art.hill('hill-2', 5620, 6100, GROUND - 2, 110, 0.7), 0.45, 0, 1));
  // el suelo: una línea de tiza con cortes, como un horizonte dibujado de un trazo
  w.ensure('ground', () => new Drawing('ground', art.groundLine('ground', -300, 6400, GROUND), {z: 0, fade: 0.75}));
  // marcas en la piedra
  const marks = after('recorded') ? MARKS : 0;
  for (let i = 0; i < MARKS; i++) {
    const id = `mark${i}`;
    if (i < marks) {
      const m = w.ensure(id, () => markDrawing(i));
      m.fade = erased ? 0.82 : 1;
      m.progress = 1;
    } else w.remove(id);
  }
  // noche
  const night = after('night');
  g.renderer.dim = night ? 0.9 : 1;
  g.renderer.tint = night ? [0.88, 0.94, 1.1] : [1, 1, 1];
  for (let i = 0; i < STARS.length; i++) {
    const id = `star${i}`;
    if (night) {
      const s = w.ensure(id, () => new Drawing(id, art.star(id, STARS[i][0], STARS[i][1], STARS[i][2]), {z: 1}));
      s.progress = 1;
    } else w.remove(id);
  }
}

export function markDrawing(i) {
  const [x, y] = markPos(i);
  return new Drawing(`mark${i}`, art.tally(`mark${i}`, x, y, 44), {z: 6, progress: 0});
}

export const STARS = [
  [4270, 40, 7], [4440, 110, 5], [4600, 20, 8], [4780, 90, 6], [4970, 10, 7], [5150, 100, 5], [5330, 40, 8], [5490, 130, 5],
  [4350, 210, 4], [4710, 190, 5], [5070, 200, 4], [5410, 240, 5],
];

/** Orden de etapas: setup de cada escena declara la suya. */
/** Pizarra del final del capítulo: marcas de Punto, palabras, presentes y el "14". */
export const NAME = {
  x0: GRADAS.x + 300,
  step: 56,
  marksY: GROUND - 340,
  wordsY: GROUND - 280,
  numX: GRADAS.x + 300 + 13 * 56 + 96,
  numY: GROUND - 150,
};
export const nameMarkPos = i => [NAME.x0 + i * NAME.step, NAME.marksY];

/** Altura donde se ubica un punto emparejado con su marca (por encima del canto). */
export const PAIRED_Y = GROUND - 158;

export const STAGES = ['start', 'door-crossed', 'met', 'recorded', 'marea-done', 'paired', 'found', 'all', 'night', 'seated'];

/** Limpia actores transitorios de escenas anteriores. */
export function clearTransient(w) {
  w.removeWhere(o => o.transient);
}

export function poseNames() {
  return Object.keys(POSES);
}

export function addPoses() {
  POSES.sitGround = {lean: -0.05, tilt: 0.05, armL: [0.9, 0.5], armR: [0.7, 0.6], legL: [1.45, 0.1], legR: [1.32, 0.2], drop: 0};
  POSES.sitGroundLook = {lean: -0.12, tilt: -0.12, armL: [-0.35, 0.15], armR: [-0.45, 0.2], legL: [1.45, 0.1], legR: [1.32, 0.2], drop: 0};
  POSES.offer = {lean: 0.12, tilt: 0.25, armL: [0.2, 0.2], armR: [1.2, -0.2], legL: [1.45, 0.1], legR: [1.32, 0.2], drop: 0};
  POSES.lean = {lean: 0.3, tilt: 0.3, armL: [0.4, 0.3], armR: [0.6, 0.4], legL: [0.25, -0.15], legR: [-0.2, -0.1], drop: 0};
  POSES.writeStone = {lean: 0.28, tilt: 0.25, armL: [0.35, 0.3], armR: [1.35, 0.35], legL: [0.3, -0.25], legR: [-0.2, -0.15], drop: 0};
  POSES.cheer = {lean: -0.08, tilt: -0.25, armL: [2.5, 0.2], armR: [2.6, 0.15], legL: [0.12, -0.05], legR: [-0.12, -0.04], drop: 0};
}
addPoses();

export {art, seedOf, Label, Drawing, Dot, Custom};
