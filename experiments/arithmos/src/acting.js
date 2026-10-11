// Actuación compartida: saltos, desplazamientos, pulsos y objetos tocables.

import {lerp, easeInOut} from './engine/rng.js';
import {anim} from './engine/anim.js';
import {hop2, zip2} from './engine/punto.js';

export async function zip(d, dot, x, y, dur = 0.32) {
  if (anim.level === 2) return zip2(d, dot, x, y, dur); // ?anim=2: mínimo jerk (MIGRATION M4)
  const x0 = dot.x, y0 = dot.y;
  dot.setMode?.('still');
  await d.tween(dur, k => { dot.x = lerp(x0, x, k); dot.y = lerp(y0, y, k); }, easeInOut);
}

export async function hop(d, o, x, y, {dur = 0.4, h = 40, g, sound = 'tap'} = {}) {
  if (anim.level === 2) return hop2(d, o, x, y, {dur, h, g, sound}); // ?anim=2: salto de cuatro fases (MIGRATION M4)
  const x0 = o.x, y0 = o.y;
  o.setMode?.('still');
  if (g && sound) sound === 'tap' ? g.audio.tap(0.2, 1.7) : g.audio.punto(sound);
  await d.tween(dur, k => { o.x = lerp(x0, x, k); o.y = lerp(y0, y, k); o.lift = Math.sin(k * Math.PI) * h; });
  o.lift = 0;
  o.x = x;
  o.y = y;
}

export async function pulse(d, o, times = 2, amount = 0.4, each = 0.2) {
  const base = o.baseScale ?? 1;
  for (let i = 0; i < times; i++) await d.tween(each, k => { o.scale = base * (1 + Math.sin(k * Math.PI) * amount); });
  o.scale = base;
}

export function follow(p, s) {
  p.setMode('anchor', {anchor: () => {
    const f = s.facing >= 0 ? 1 : -1;
    return [s.x + 44 * f, s.y - 150 + Math.sin(performance.now() / 380) * 5];
  }});
}

export const spotOf = (o, label, onActivate, extra = {}) => ({id: o.id, kind: 'dot', label, rect: () => o.bounds(), onHover: on => { o.hover = on; }, onActivate, ...extra});
export const rectSpot = (id, label, r, onActivate, extra = {}) => ({id, kind: 'rect', label, rect: typeof r === 'function' ? r : () => r, onActivate, ...extra});
export const wordSpot = (id, text, x, y, onActivate, extra = {}) => ({id, kind: 'word', label: text, text, rect: () => ({x: x - 1, y: y - 1, w: 2, h: 2}), onActivate, ...extra});
