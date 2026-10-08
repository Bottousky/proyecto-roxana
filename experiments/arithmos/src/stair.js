// La escalera nueva de Balcón (la del tirante, 8.6): treinta escalones al costado de la pizarra de las Terrazas.
// Se empieza en el cap. 8, la Marea se lleva de abajo lo que no está repasado (noche 0 al final del cap. 10, noche 1
// al final del 11) y en 12.8 el jugador la repasa antes de la Marea grande.

import {Drawing} from './engine/world.js';
import {lerp, seedOf} from './engine/rng.js';
import {stroke} from './engine/chalk.js';
import {GROUND} from './ch2/common.js';
import {mareaBand} from './ch1/scenes.js';

const S = (guide, seed, opts = {}) => stroke(guide, {seed, ...opts});

export const LAD = {x: 13650, w: 80, h: 300, groups: 6};
const RUNGS = 30;

/** Los trazos del tramo k (5 escalones); `lost` escalones de abajo, borrados por la Marea, no se dibujan. */
function groupStrokes(k, lost = 0) {
  const step = LAD.h / RUNGS, per = RUNGS / LAD.groups;
  const y0 = GROUND - k * per * step, y1 = y0 - per * step;
  const list = [
    S([[LAD.x, y0], [LAD.x, y1]], seedOf(`stair-g${k}`), {w: 2.6, p: 0.9}),
    S([[LAD.x + LAD.w, y0], [LAD.x + LAD.w, y1]], seedOf(`stair-g${k}`) + 1, {w: 2.6, p: 0.9}),
  ];
  for (let r = 0; r < per; r++) {
    if (k * per + r < lost) continue;
    const y = y0 - (r + 0.5) * step;
    list.push(S([[LAD.x, y], [LAD.x + LAD.w, y]], seedOf(`stair-g${k}`) + 2 + r, {w: 2, p: 0.8, lift: false}));
  }
  return list;
}

/** Asegura la escalera en el mundo, borroneada (o repasada, si ya se repasó), con los escalones que se llevó la Marea. */
export function stair(g) {
  const w = g.world, lost = g.flags.stairLost || 0;
  return Array.from({length: LAD.groups}, (_, k) => {
    const id = `stair-g${k}`;
    // cuántos escalones borrados le tocan a este tramo (sólo cambian los de abajo)
    const mine = Math.max(0, Math.min(RUNGS / LAD.groups, lost - k * RUNGS / LAD.groups));
    let d = w.ensure(id, () => new Drawing(id, groupStrokes(k, lost), {z: 3, fade: 0.22}));
    d.lost ??= mine;
    // con otros escalones hay que rehacer el dibujo (su caja y su caché dependen de los trazos)
    if (d.lost !== mine) {
      const fade = d.fade;
      w.remove(id);
      d = w.add(new Drawing(id, groupStrokes(k, lost), {z: 3, fade}));
      d.lost = mine;
    }
    return d;
  });
}

/** Repone los escalones borrados del tramo de abajo (al repasarlo). */
export function restoreStair(g) {
  g.flags.stairLost = 0;
  stair(g);
}

/** Una pasada de la Marea por la escalera y las Terrazas. Con `reach`, se lleva los escalones de abajo que no están repasados. */
export async function mareaNight(d, g, {reach = 0, shot = {x: 13500, y: GROUND - 560, w: 1700, h: 640}, describe} = {}) {
  const w = g.world;
  g.setCinematic(true);
  await d.shot(shot, 1);
  const band = w.add(mareaBand(w, shot.x - 200));
  band.strength = 0.85;
  band.width = 300;
  g.audio.marea?.(4);
  g.camera.shake = 0.25;
  if (describe) d.describe(describe);
  const groups = stair(g);
  const weak = groups.filter(st => st.fade < 1);
  await d.tween(2.4, q => {
    band.x = lerp(shot.x - 200, shot.x + shot.w + 200, q);
    // lo que no está repasado se apaga mientras pasa el borrador
    if (band.x > LAD.x + LAD.w / 2) for (const st of weak) st.fade = Math.max(0.1, st.fade - 0.01);
  });
  w.remove('marea-band');
  if (reach > (g.flags.stairLost || 0) && weak.some(st => st.id === 'stair-g0')) g.flags.stairLost = reach;
  for (const st of weak) st.fade = 0.22;
  stair(g);
  g.setCinematic(false);
}
