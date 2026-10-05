// Cámara: encuadra un rectángulo del mundo dentro del área libre de la pantalla.
// Los planos se definen como rectángulos; la forma de la pantalla decide el zoom.

import {lerp, easeInOut, clamp} from './rng.js';

export class Camera {
  constructor() {
    this.shot = {x: 0, y: 0, w: 1600, h: 900};
    this.from = null;
    this.t = 1;
    this.dur = 0;
    this.ease = easeInOut;
    this.current = {...this.shot};
    this.shake = 0;
    this.drift = true;
    this.time = 0;
    this.safe = {left: 0, top: 0, right: 0, bottom: 0};
  }

  /** Corta o viaja a un plano. Devuelve la duración efectiva. */
  go(rect, dur = 0, ease = easeInOut) {
    const r = {x: rect.x, y: rect.y, w: rect.w, h: rect.h};
    if (dur <= 0) {
      this.shot = r;
      this.current = {...r};
      this.from = null;
      this.t = 1;
      return 0;
    }
    this.from = {...this.current};
    this.shot = r;
    this.t = 0;
    this.dur = dur;
    this.ease = ease;
    return dur;
  }

  get moving() {
    return this.t < 1;
  }

  finish() {
    this.t = 1;
    this.current = {...this.shot};
  }

  update(dt) {
    this.time += dt;
    if (this.t < 1) {
      this.t = Math.min(1, this.t + dt / this.dur);
      const e = this.ease(this.t);
      const f = this.from;
      // interpolación en escala logarítmica del tamaño para que el zoom se sienta parejo
      const w = Math.exp(lerp(Math.log(f.w), Math.log(this.shot.w), e));
      const h = Math.exp(lerp(Math.log(f.h), Math.log(this.shot.h), e));
      const cx = lerp(f.x + f.w / 2, this.shot.x + this.shot.w / 2, e);
      const cy = lerp(f.y + f.h / 2, this.shot.y + this.shot.h / 2, e);
      this.current = {x: cx - w / 2, y: cy - h / 2, w, h};
    }
    this.shake = Math.max(0, this.shake - dt * 2.5);
  }

  /** Vista en píxeles de dispositivo: origen en mundo y escala. */
  view(pxW, pxH, dpr) {
    const s = this.safe;
    const availW = Math.max(50, pxW - (s.left + s.right) * dpr);
    const availH = Math.max(50, pxH - (s.top + s.bottom) * dpr);
    const r = this.current;
    const scale = Math.min(availW / r.w, availH / r.h);
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    // centro del área libre en píxeles
    const ax = s.left * dpr + availW / 2;
    const ay = s.top * dpr + availH / 2;
    let dx = 0, dy = 0;
    if (this.drift) {
      dx = Math.sin(this.time * 0.21) * 3 + Math.sin(this.time * 0.13 + 1) * 2;
      dy = Math.sin(this.time * 0.17 + 2) * 2;
    }
    if (this.shake > 0) {
      dx += Math.sin(this.time * 61) * this.shake * 6;
      dy += Math.cos(this.time * 53) * this.shake * 4;
    }
    return {x: cx + dx - ax / scale, y: cy + dy - ay / scale, scale, dpr};
  }

  /** De mundo a píxeles CSS. */
  toScreen(view, wx, wy) {
    return [(wx - view.x) * view.scale / view.dpr, (wy - view.y) * view.scale / view.dpr];
  }

  toWorld(view, sx, sy) {
    return [sx * view.dpr / view.scale + view.x, sy * view.dpr / view.scale + view.y];
  }
}

export function rectAround(cx, cy, w, h) {
  return {x: cx - w / 2, y: cy - h / 2, w, h};
}

export function padRect(r, p) {
  return {x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p};
}

export {clamp};
