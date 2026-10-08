// Camino de cámara de van Wijk y Nuij (2003, "Smooth and efficient zooming and panning"; el de d3.interpolateZoom,
// ρ = √2): para ir lejos se aleja, cruza y se vuelve a acercar, con velocidad percibida pareja. La duración sale del
// costo perceptual S del camino. Viene del laboratorio de animación (animlab/core/camera2.js, E08), que ahora lo importa
// de acá: una sola copia.

import {clamp} from './rng.js';

/** Interpolador de van Wijk–Nuij entre p0 = [cx, cy, w] y p1. Devuelve {at(u), S}. */
export function zoomPath(p0, p1, rho = Math.SQRT2) {
  const [ux0, uy0, w0] = p0, [ux1, uy1, w1] = p1;
  const dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy;
  const r2 = rho * rho, r4 = r2 * r2;
  if (d2 < 1e-9) {
    const S = Math.log(w1 / w0) / rho;
    return {S: Math.abs(S), at: u => [ux0 + u * dx, uy0 + u * dy, w0 * Math.exp(rho * u * S)]};
  }
  const d1 = Math.sqrt(d2);
  const b0 = (w1 * w1 - w0 * w0 + r4 * d2) / (2 * w0 * r2 * d1);
  const b1 = (w1 * w1 - w0 * w0 - r4 * d2) / (2 * w1 * r2 * d1);
  const q0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), q1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const S = (q1 - q0) / rho;
  return {S, at: u => {
    const s = u * S, c0 = Math.cosh(q0);
    const k = w0 / (r2 * d1) * (c0 * Math.tanh(rho * s + q0) - Math.sinh(q0));
    return [ux0 + k * dx, uy0 + k * dy, w0 * c0 / Math.cosh(rho * s + q0)];
  }};
}

/** Duración de un viaje según su costo perceptual (≈ 0.75 s por unidad de S, entre 0.6 y 3 s). */
export const travelTime = S => clamp(0.35 + 0.75 * S, 0.6, 3.0);

/** Perfil de mínimo jerk (posición 0..1). */
export const minJerk = u => { const x = clamp(u, 0, 1); return x * x * x * (10 - 15 * x + 6 * x * x); };
