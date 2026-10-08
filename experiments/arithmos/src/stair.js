// La escalera nueva de Balcón (la del tirante, 8.6): treinta escalones al costado de la pizarra de las Terrazas.
// Se empieza en el cap. 8, apenas marcada. Cada noche la Marea sube y deja una raya en el escalón al que llegó
// (noche 0 al final del cap. 10, noche 1 al final del 11; las noches 2, 3 y 4, en 12.8). Mientras no la pase por
// arriba no borra nada; la noche que la pase, se lleva lo que no esté repasado. Por eso el plazo es esa noche.

import {Drawing, Label} from './engine/world.js';
import {lerp, seedOf} from './engine/rng.js';
import {stroke, BLUE} from './engine/chalk.js';
import {GROUND} from './ch2/common.js';
import {mareaBand} from './ch1/scenes.js';

const S = (guide, seed, opts = {}) => stroke(guide, {seed, ...opts});

export const LAD = {x: 13650, w: 80, h: 300, groups: 6};
export const RUNGS = 30;
const STEP = LAD.h / RUNGS;

/** Los trazos del tramo k (5 escalones). */
function groupStrokes(k) {
  const per = RUNGS / LAD.groups;
  const y0 = GROUND - k * per * STEP, y1 = y0 - per * STEP;
  const list = [
    S([[LAD.x, y0], [LAD.x, y1]], seedOf(`stair-g${k}`), {w: 2.6, p: 0.9}),
    S([[LAD.x + LAD.w, y0], [LAD.x + LAD.w, y1]], seedOf(`stair-g${k}`) + 1, {w: 2.6, p: 0.9}),
  ];
  for (let r = 0; r < per; r++) {
    const y = y0 - (r + 0.5) * STEP;
    list.push(S([[LAD.x, y], [LAD.x + LAD.w, y]], seedOf(`stair-g${k}`) + 2 + r, {w: 2, p: 0.8, lift: false}));
  }
  return list;
}

/** La raya que deja la Marea en el escalón al que llegó, con su noche. */
function tideMark(w, night, steps) {
  const id = `stair-tide${night}`;
  const y = GROUND - Math.min(steps, RUNGS) * STEP;
  w.ensure(id, () => new Drawing(id, [S([[LAD.x - 14, y], [LAD.x + LAD.w + 14, y]], seedOf(id), {w: 2.4, p: 0.9, ch: BLUE, lift: false})], {z: 4}));
  // las noches pares rotuladas a la izquierda y las impares a la derecha, para que no se pisen las de abajo
  const left = night % 2 === 0;
  w.ensure(`${id}l`, () => new Label(`${id}l`, `noche ${night}`, left ? LAD.x - 20 : LAD.x + LAD.w + 20, y + 5, {size: 13, align: left ? 'right' : 'left', z: 4, ch: BLUE}));
}

/** Asegura la escalera (apenas marcada, o repasada si ya se repasó) y las rayas de las noches que ya pasaron. */
export function stair(g) {
  const w = g.world;
  const groups = Array.from({length: LAD.groups}, (_, k) => {
    const id = `stair-g${k}`;
    return w.ensure(id, () => new Drawing(id, groupStrokes(k), {z: 3, fade: g.flags.stairDone ? 1 : 0.22}));
  });
  (g.flags.tides || []).forEach(([night, steps]) => tideMark(w, night, steps));
  return groups;
}

/** Anota que la noche `night` la Marea llegó a `steps` escalones, y deja la raya. */
export function markTide(g, night, steps) {
  const tides = (g.flags.tides || []).filter(([n]) => n !== night);
  g.flags.tides = [...tides, [night, steps]].sort((a, b) => a[0] - b[0]);
  tideMark(g.world, night, steps);
}

/** Una noche de Marea: la franja cruza la escalera y las Terrazas y deja su raya. No borra nada: todavía no pasa la escalera por arriba. */
export async function mareaNight(d, g, {night, steps, shot = {x: 13450, y: GROUND - 560, w: 1700, h: 640}, describe} = {}) {
  const w = g.world;
  g.setCinematic(true);
  await d.shot(shot, 1);
  stair(g);
  const band = w.add(mareaBand(w, shot.x - 200));
  band.strength = 0.85;
  band.width = 300;
  g.audio.marea?.(4);
  g.camera.shake = 0.25;
  if (describe) d.describe(describe);
  let marked = false;
  await d.tween(2.4, q => {
    band.x = lerp(shot.x - 200, shot.x + shot.w + 200, q);
    if (!marked && band.x > LAD.x + LAD.w / 2) { marked = true; markTide(g, night, steps); }
  });
  w.remove('marea-band');
  if (!marked) markTide(g, night, steps);
  g.setCinematic(false);
}
