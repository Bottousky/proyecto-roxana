// Cámara cinematográfica para un pizarrón enorme.
//
//  - Viajes con el camino óptimo de zoom y paneo de van Wijk y Nuij (2003, "Smooth and efficient zooming and panning";
//    el mismo que d3.interpolateZoom, ρ = √2): para ir lejos, se aleja, cruza y se vuelve a acercar; la velocidad
//    percibida se mantiene pareja. La duración sale del costo perceptual S del camino (no es fija).
//  - Perfil temporal de mínimo jerk sobre ese camino.
//  - Temblor por trauma (Eiserloh, GDC 2016): desplazamiento = máx · trauma² · ruido coherente; el trauma decae lineal.
//    Sin rotación: el ojo frente a un pizarrón no gira.

import {minJerk, clamp, lerp} from './motion.js';
import {noise1} from '../../src/engine/rng.js';

export {zoomPath, travelTime} from '../../src/engine/camera-path.js';
import {zoomPath, travelTime} from '../../src/engine/camera-path.js';

/**
 * Guion de cámara: [{t, cx, cy, w, arrive?}] — `arrive` = instante en que la cámara debe estar quieta
 * (la acción empieza después: la cámara llega antes, no persigue). Si no hay `arrive`, sale en t.
 */
export function cameraTrack(shots, {aspect = 16 / 9} = {}) {
  const legs = [];
  for (let i = 1; i < shots.length; i++) {
    const a = shots[i - 1], b = shots[i];
    const path = zoomPath([a.cx, a.cy, a.w], [b.cx, b.cy, b.w]);
    const T = travelTime(path.S);
    const end = b.arrive ?? b.t + T;
    legs.push({start: end - T, end, path, T});
  }
  return {
    legs, shots, aspect,
    at(t) {
      let p = [shots[0].cx, shots[0].cy, shots[0].w];
      for (const L of legs) {
        if (t < L.start) break;
        p = L.path.at(minJerk((t - L.start) / L.T));
      }
      return p;
    },
  };
}

/** Temblor por trauma: impactos [{t, amount}] (trauma 0..1, decae 1.2/s); devuelve desplazamiento en px de mundo. */
export function traumaShake(impacts, t, w, {maxFrac = 0.012, freq = 18} = {}) {
  let trauma = 0;
  for (const im of impacts) if (t >= im.t) trauma = Math.max(trauma, im.amount - (t - im.t) * 1.2);
  trauma = clamp(trauma);
  if (!trauma) return [0, 0];
  const nx = noise1(77), ny = noise1(91);
  const m = maxFrac * w * trauma * trauma;
  return [m * nx(t * freq), m * ny(t * freq + 40)];
}
