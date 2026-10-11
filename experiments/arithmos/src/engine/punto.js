// Actuación de Punto con ?anim=2 (MIGRATION M4): el salto de cuatro fases y el deslizamiento de mínimo jerk de la
// vertical slice del laboratorio (animlab/tests/t10-scene.js, aprobada en R16), con la misma firma que zip/hop del juego.
//
// Salto: agachada (anticipación, aplastado ≤ 22 %) → impulso (acelera mientras libera el aplastamiento) → vuelo
// balístico con frenada en el aire hasta 55 % → aterrizaje. El aterrizaje (seguir de largo con la misma velocidad,
// aplastarse con la base apoyada y volver) ocurre DESPUÉS de la duración pedida, en Dot.update y sólo en el dibujo
// (desplazamiento visual): la posición lógica queda exacta y la escena sigue con sus tiempos de siempre.

import {clamp, lerp} from './rng.js';
import {minJerk} from './motion.js';

const CROUCH = 0.12, PUSH = 0.07;

/** Forma del salto en el instante t (s) de un salto de `dur` s: u = avance 0..1, lift = altura, sl = aplastamiento a lo largo de `ang`. */
export function hopShape(t, dur, h, {brake = false} = {}) {
  const crouch = Math.min(CROUCH, dur * 0.3), M = Math.max(1e-3, dur - crouch);
  const a = Math.min(PUSH / M, 0.35), b = a, lam = brake ? 0 : 0.55, A = 1 - a / 2 - b * (1 - lam) / 2;
  const warp = s => (s < a ? s * s / (2 * a) : s < 1 - b ? a / 2 + (s - a) : a / 2 + (1 - a - b) + (s - 1 + b) - (1 - lam) * (s - 1 + b) ** 2 / (2 * b)) / A;
  const flightSl = u => 1.18 - 0.18 * Math.abs(2 * u - 1);
  if (t < crouch) return {u: 0, lift: 0, sl: 1 - 0.22 * minJerk(t / crouch), ang: Math.PI / 2, phase: 'crouch'};
  const sN = clamp((t - crouch) / M), u = warp(sN);
  const sl = sN < a ? lerp(0.78, flightSl(u), minJerk(sN / a)) : flightSl(u);
  return {u, lift: 4 * h * u * (1 - u), sl, phase: 'flight', vxFrac: lam / (M * A), vyFrac: lam * 4 * h / (M * A)};
}

/** Salto con la firma de los del juego: hop(d, dot, x, y, {dur, h, g, sound}). */
export async function hop2(d, o, x, y, {dur = 0.4, h = 40, g, sound = 'tap', brake = false} = {}) {
  const x0 = o.x, y0 = o.y;
  o.setMode?.('still');
  o.settle = null;
  if (g && sound) sound === 'tap' ? g.audio.tap(0.2, 1.7, Math.min(CROUCH, dur * 0.3)) : g.audio.punto(sound);
  await d.tween(dur, k => {
    const s = hopShape(k * dur, dur, h, {brake});
    o.x = lerp(x0, x, s.u); o.y = lerp(y0, y, s.u); o.lift = s.lift;
    // el aplastamiento de la agachada es vertical; en el vuelo se estira a lo largo de la trayectoria
    o.deform = {sl: s.sl, ang: s.phase === 'crouch' ? Math.PI / 2 : Math.atan2((y - y0) - 4 * h * (1 - 2 * s.u), x - x0)};
  }, k => k);
  o.lift = 0; o.x = x; o.y = y;
  const s = hopShape(dur, dur, h, {brake});
  // el aterrizaje sigue en el dibujo: velocidad horizontal al tocar y de caída (para el aplastamiento con base apoyada)
  if (!d.skipping) o.settle = {t: 0, vx: (x - x0) * (s.vxFrac ?? 0), vy: (s.vyFrac ?? 0) + Math.max(0, y - y0) * (s.vxFrac ?? 0), dist: Math.abs(x - x0)};
  o.deform = null;
}

/** Deslizamiento con perfil de mínimo jerk (arranca y frena suave); se estira según la velocidad (Dot.update). */
export async function zip2(d, o, x, y, dur = 0.32) {
  const x0 = o.x, y0 = o.y;
  o.setMode?.('still');
  o.settle = null;
  await d.tween(dur, k => { const u = minJerk(k); o.x = lerp(x0, x, u); o.y = lerp(y0, y, u); }, k => k);
}

/** Desplazamiento visual del aterrizaje en el instante τ (s) después de tocar: [ox, oy, sl] (sl vertical, base apoyada). */
export function settleShape(st, tau, r) {
  const T = 0.3;
  if (tau >= T) return null;
  const tau0 = Math.min(0.08, 0.06 * Math.max(1, st.dist) * Math.E / (Math.abs(st.vx) || 1));
  const ov = x => st.vx * x * Math.exp(-x / tau0), sm = clamp(tau / T);
  const ox = ov(tau) - ov(T) * sm * sm * (3 - 2 * sm);
  const ta = clamp(0.24 * Math.E * r / Math.max(1, st.vy), 0.025, 0.06), amp = 0.24 * clamp(st.vy / 250, 0.12, 1);
  const sl = 1 - amp * (tau / ta) * Math.exp(1 - tau / ta) + amp / 0.24 * 0.05 * Math.sin(Math.PI * clamp((tau - 3 * ta) / 0.16)) * (tau > 3 * ta);
  return [ox, r * (1 - sl), sl];
}
