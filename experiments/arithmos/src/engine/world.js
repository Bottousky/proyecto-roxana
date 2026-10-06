// Objetos del pizarrón: dibujos, textos, puntos, uniones y manchas de borrado.

import {drawStrokes, strokesTip, stroke, circleGuide, dotStrokes, chalkText, lineGuide, WHITE, YELLOW, pressureStyle} from './chalk.js';
import {mulberry32, seedOf, clamp, lerp} from './rng.js';

export class World {
  constructor() {
    this.objects = [];
    this.byId = new Map();
    this.time = 0;
    this.cacheEnabled = true;
  }

  add(o) {
    if (this.byId.has(o.id)) this.remove(o.id);
    this.objects.push(o);
    this.byId.set(o.id, o);
    this.objects.sort((a, b) => (a.z || 0) - (b.z || 0));
    return o;
  }

  /** Crea el objeto sólo si no existe; devuelve el existente o el nuevo. */
  ensure(id, factory) {
    return this.byId.get(id) || this.add(factory());
  }

  get(id) {
    return this.byId.get(id);
  }

  has(id) {
    return this.byId.has(id);
  }

  remove(id) {
    const o = this.byId.get(id);
    if (!o) return;
    this.byId.delete(id);
    this.objects.splice(this.objects.indexOf(o), 1);
    o.dispose?.();
  }

  removeWhere(pred) {
    for (const o of [...this.objects]) if (pred(o)) this.remove(o.id);
  }

  clear() {
    for (const o of [...this.objects]) this.remove(o.id);
  }

  update(dt) {
    this.time += dt;
    for (const o of this.objects) o.update?.(dt, this);
  }

  render(ctx, view, frame) {
    for (const o of this.objects) if (o.visible !== false) o.render?.(ctx, view, frame, this);
  }

  renderDust(ctx, view) {
    for (const o of this.objects) if (o.visible !== false) o.renderDust?.(ctx, view);
  }

  renderClean(ctx, view, cam) {
    for (const o of this.objects) if (o.visible !== false) o.renderClean?.(ctx, view, cam);
  }
}

/**
 * Dibujo de tiza: una lista de trazos en coordenadas de mundo.
 * `progress` lo dibuja trazo a trazo; `fade` lo atenúa (borrado parcial).
 * Los dibujos terminados se guardan en un lienzo propio a la escala de la cámara.
 */
export class Drawing {
  constructor(id, strokes, {z = 0, progress = 1, fade = 1, cache = true, dust = null} = {}) {
    this.id = id;
    this.strokes = strokes;
    this.z = z;
    this.progress = progress;
    this.fade = fade;
    this.cacheable = cache;
    this.dust = dust; // fantasma en la capa de polvo (lo que dejó un borrado)
    this.bbox = bboxOf(strokes);
    this.cache = null;
    this.visible = true;
  }

  tip() {
    return strokesTip(this.strokes, this.progress);
  }

  render(ctx, view, frame, world) {
    if (this.fade <= 0.001 || this.progress <= 0) return;
    if (world?.cacheEnabled && this.cacheable && this.progress >= 1) {
      const c = this.#cached(view.scale);
      if (c) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.drawImage(c.canvas, this.bbox.x, this.bbox.y, this.bbox.w, this.bbox.h);
        ctx.restore();
        return;
      }
    }
    drawStrokes(ctx, this.strokes, this.progress, this.fade);
  }

  #cached(scale) {
    const want = Math.min(4, Math.pow(2, Math.ceil(Math.log2(Math.max(0.25, scale)) * 2) / 2));
    const c = this.cache;
    if (c && c.fade === this.fade && c.scale >= want && c.scale <= want * 2.9) return c;
    const b = this.bbox;
    const w = Math.ceil(b.w * want), h = Math.ceil(b.h * want);
    if (w * h > 4096 * 4096 || w < 1 || h < 1) return null;
    const canvas = c?.canvas || document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const cx = canvas.getContext('2d');
    cx.clearRect(0, 0, w, h);
    cx.globalCompositeOperation = 'lighten';
    cx.setTransform(want, 0, 0, want, -b.x * want, -b.y * want);
    drawStrokes(cx, this.strokes, 1, this.fade);
    this.cache = {canvas, scale: want, fade: this.fade};
    return this.cache;
  }

  renderDust(ctx) {
    if (!this.dust) return;
    ctx.save();
    ctx.globalAlpha = this.dust;
    ctx.strokeStyle = '#fff';
    ctx.lineCap = 'round';
    for (const s of this.strokes) {
      ctx.lineWidth = s.w * 2.6;
      ctx.beginPath();
      for (let i = 0; i < s.n; i += 2) {
        const x = s.pts[i * 3], y = s.pts[i * 3 + 1];
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  dispose() {
    if (this.cache) this.cache.canvas.width = 0;
    this.cache = null;
  }
}

export function bboxOf(strokes) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of strokes) {
    const pad = s.w * 1.2 + 3;
    for (let i = 0; i < s.n; i++) {
      const x = s.pts[i * 3], y = s.pts[i * 3 + 1];
      if (x - pad < x0) x0 = x - pad;
      if (y - pad < y0) y0 = y - pad;
      if (x + pad > x1) x1 = x + pad;
      if (y + pad > y1) y1 = y + pad;
    }
  }
  if (!isFinite(x0)) return {x: 0, y: 0, w: 1, h: 1};
  return {x: x0, y: y0, w: x1 - x0, h: y1 - y0};
}

/** Texto de tiza en el mundo; en lectura limpia se dibuja nítido en la capa superior. */
export class Label {
  constructor(id, text, x, y, {size = 36, ch = WHITE, z = 5, align = 'left', reveal = 1, fade = 1, weight = 400, p = 0.86, decor = false} = {}) {
    Object.assign(this, {id, text, x, y, size, ch, z, align, reveal, fade, weight, p, decor});
    this.visible = true;
  }

  render(ctx, view, frame, world) {
    if (world?.clean && !this.decor) return;
    chalkText(ctx, this.text, this.x, this.y, {size: this.size, ch: this.ch, align: this.align, reveal: this.reveal, fade: this.fade, weight: this.weight, p: this.p});
  }

  renderClean(ctx, view, cam) {
    if (this.decor || this.reveal <= 0 || this.fade <= 0.05) return;
    const [sx, sy] = cam.toScreen(view, this.x, this.y);
    const px = (this.size * view.scale) / view.dpr;
    ctx.save();
    ctx.font = `700 ${Math.max(13, px)}px "Atkinson Hyperlegible", system-ui, sans-serif`;
    ctx.textAlign = this.align;
    const w = ctx.measureText(this.text).width;
    const left = this.align === 'center' ? sx - w / 2 : this.align === 'right' ? sx - w : sx;
    if (this.reveal < 1) {
      ctx.beginPath();
      ctx.rect(left - 4, sy - px * 1.5, w * this.reveal + 8, px * 2.4);
      ctx.clip();
    }
    ctx.globalAlpha = Math.min(1, this.fade);
    ctx.fillStyle = 'rgba(8,20,16,0.82)';
    ctx.fillRect(left - 6, sy - px * 1.0, w + 12, px * 1.35);
    ctx.fillStyle = CLEAN_COLORS[this.ch];
    ctx.fillText(this.text, sx, sy);
    ctx.restore();
  }
}

export const CLEAN_COLORS = ['#ffffff', '#ffd76a', '#a8dcff'];

/**
 * Un punto vivo (Punto o alguien de la Ronda). Se mueve solo según su modo
 * y se deforma con la velocidad: la actuación de un punto es su movimiento.
 */
export class Dot {
  constructor(id, x, y, {r = 8, ch = WHITE, ring = false, z = 10} = {}) {
    Object.assign(this, {id, x, y, r, ch, ring, z});
    this.vx = 0;
    this.vy = 0;
    this.mode = 'still';
    this.home = [x, y];
    this.wander = {radius: 60, speed: 40, t: Math.random() * 100};
    this.squash = 0;
    this.squashDir = 0;
    this.lift = 0; // salto vertical visual
    this.fade = 1;
    this.scale = 1;
    this.tremble = 0;
    this.glow = 0;
    this.mark = 0; // pequeña marca de "anotado"
    this.visible = true;
    this.hover = false;
    this.anchor = null; // función que devuelve [x, y] destino
    this.variants = [0, 1, 2].map(k => dotStrokes(0, 0, r, seedOf(id, k), {ch}));
    this.ringVariants = ring ? [0, 1, 2].map(k => {
      const rnd = mulberry32(seedOf(id, 'ring', k));
      return [stroke(circleGuide(0, 0, r * 2.15, rnd, {overshoot: 0.25}), {w: 1.6, p: 0.6, ch, seed: seedOf(id, 'r', k), wobble: 0.3})];
    }) : null;
    this.seed = seedOf(id);
    this.trail = [];
  }

  setMode(mode, opts = {}) {
    this.mode = mode;
    if (opts.home) this.home = [...opts.home];
    if (opts.radius != null) this.wander.radius = opts.radius;
    if (opts.speed != null) this.wander.speed = opts.speed;
    if (opts.anchor) this.anchor = opts.anchor;
  }

  update(dt, world) {
    const px = this.x, py = this.y;
    const slow = this.hover ? 0.15 : 1;
    if (this.mode === 'wander') {
      const w = this.wander;
      w.t += dt * slow;
      const s = this.seed % 1000;
      const k = w.speed / Math.max(10, w.radius);
      const tx = this.home[0] + Math.sin(w.t * k * 0.9 + s) * w.radius + Math.sin(w.t * k * 2.3 + s * 2) * w.radius * 0.3;
      const ty = this.home[1] + Math.cos(w.t * k * 0.7 + s * 3) * w.radius * 0.55 + Math.sin(w.t * k * 1.9 + s) * w.radius * 0.2;
      this.x += (tx - this.x) * Math.min(1, dt * 3 * slow);
      this.y += (ty - this.y) * Math.min(1, dt * 3 * slow);
    } else if (this.mode === 'anchor' && this.anchor) {
      const [tx, ty] = this.anchor();
      this.x += (tx - this.x) * Math.min(1, dt * 6);
      this.y += (ty - this.y) * Math.min(1, dt * 6);
    } else if (this.mode === 'bob') {
      this.wander.t += dt;
      this.y = this.home[1] + Math.sin(this.wander.t * 2.2 + (this.seed % 7)) * 3;
      this.x = this.home[0];
    }
    if (dt > 0) {
      this.vx = (this.x - px) / dt;
      this.vy = (this.y - py) / dt;
    }
    const sp = Math.hypot(this.vx, this.vy);
    const target = clamp(sp / 900, 0, 0.45);
    this.squash += (target - this.squash) * Math.min(1, dt * 12);
    if (sp > 5) this.squashDir = Math.atan2(this.vy, this.vx);
    this.tremble = Math.max(0, this.tremble - dt * 0.6);
    if (sp > 260) {
      this.trail.push([this.x, this.y, 0.5]);
    }
    for (const t of this.trail) t[2] -= dt * 1.6;
    this.trail = this.trail.filter(t => t[2] > 0).slice(-14);
  }

  render(ctx, view, frame) {
    if (this.fade <= 0) return;
    const v = frame % 3;
    const tr = this.tremble > 0 ? Math.sin(frame * 2.7 + this.seed) * this.tremble * 2.5 : 0;
    const x = this.x + tr, y = this.y - this.lift;
    for (const [tx, ty, a] of this.trail) {
      ctx.save();
      ctx.translate(tx, ty);
      drawStrokes(ctx, this.variants[(v + 1) % 3], 1, a * 0.5 * this.fade, 0.6);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.squashDir);
    ctx.scale(this.scale * (1 + this.squash), this.scale * (1 - this.squash * 0.55));
    ctx.rotate(-this.squashDir);
    drawStrokes(ctx, this.variants[v], 1, this.fade);
    ctx.restore();
    if (this.ring) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(this.scale, this.scale);
      drawStrokes(ctx, this.ringVariants[v], 1, this.fade * (0.75 + this.glow * 0.25), 1, false);
      ctx.restore();
    }
    if (this.mark > 0) {
      ctx.save();
      ctx.translate(x + this.r * 1.5, y - this.r * 1.6);
      const m = stroke([[-3, 0], [0, 3], [6, -6]], {w: 1.8, p: 0.85 * this.mark, ch: this.ch, seed: this.seed + 3, wobble: 0.2, lift: false});
      drawStrokes(ctx, [m], this.mark, this.fade, 1, false);
      ctx.restore();
    }
  }

  bounds() {
    const r = Math.max(this.r * 2.4, 16);
    return {x: this.x - r, y: this.y - this.lift - r, w: r * 2, h: r * 2};
  }
}

/** Línea de tiza entre dos anclas que pueden moverse. */
export class Link {
  constructor(id, a, b, {ch = WHITE, z = 4, w = 2.2, p = 0.8, progress = 1, dash = false, gap = 0} = {}) {
    Object.assign(this, {id, a, b, ch, z, w, p, progress, dash, gap});
    this.fade = 1;
    this.visible = true;
    this.seed = seedOf(id);
    this.key = '';
    this.s = null;
    this.flash = 0;
  }

  update(dt) {
    this.flash = Math.max(0, this.flash - dt * 1.5);
  }

  render(ctx) {
    const [ax, ay] = this.a();
    const [bx, by] = this.b();
    const key = `${ax.toFixed(1)},${ay.toFixed(1)},${bx.toFixed(1)},${by.toFixed(1)}`;
    if (key !== this.key) {
      this.key = key;
      const rnd = mulberry32(this.seed);
      const L = Math.hypot(bx - ax, by - ay) || 1;
      const ux = (bx - ax) / L, uy = (by - ay) / L;
      const g = Math.min(this.gap, L * 0.3);
      const sx = ax + ux * g, sy = ay + uy * g, ex = bx - ux * g, ey = by - uy * g;
      if (this.dash) {
        // trazo punteado: se lee como "unión", no como otra marca
        const len = Math.hypot(ex - sx, ey - sy);
        const n = Math.max(2, Math.floor(len / 13));
        this.list = [];
        for (let i = 0; i < n; i++) {
          const t0 = i / n, t1 = t0 + 0.55 / n;
          this.list.push(stroke([[sx + (ex - sx) * t0, sy + (ey - sy) * t0], [sx + (ex - sx) * t1, sy + (ey - sy) * t1]], {w: this.w, ch: this.ch, p: this.p, seed: this.seed + i, wobble: 0.2, lift: false, spacing: 1.5}));
        }
      } else {
        this.list = [stroke(lineGuide(sx, sy, ex, ey, rnd, 0.04), {w: this.w, ch: this.ch, p: this.p, seed: this.seed, wobble: 0.6})];
      }
    }
    drawStrokes(ctx, this.list, this.progress, this.fade * (1 + this.flash * 0.3), 1 + this.flash * 0.6, !this.dash);
  }

  midpoint() {
    const [ax, ay] = this.a();
    const [bx, by] = this.b();
    return [(ax + bx) / 2, (ay + by) / 2];
  }
}

/**
 * Mancha de borrado en la capa de polvo: una banda con estrías paralelas
 * en la dirección del gesto, como deja un borrador de fieltro.
 */
export class Smear {
  constructor(id, path, {width = 120, alpha = 0.35, z = -10, seed} = {}) {
    Object.assign(this, {id, path, width, alpha, z});
    this.seed = seed ?? seedOf(id);
    this.visible = true;
    this.progress = 1;
    const rnd = mulberry32(this.seed);
    this.lines = Array.from({length: 11}, (_, i) => ({off: (i / 10 - 0.5) * width * 0.9 + (rnd() - 0.5) * 6, a: 0.25 + rnd() * 0.75, w: width * (0.06 + rnd() * 0.12)}));
  }

  renderDust(ctx) {
    if (this.alpha <= 0 || this.progress <= 0) return;
    const P = this.path;
    const n = Math.max(2, Math.ceil(P.length * this.progress));
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#fff';
    // cuerpo suave
    ctx.globalAlpha = this.alpha * 0.32;
    ctx.lineWidth = this.width;
    trace(ctx, P, n, 0);
    for (const l of this.lines) {
      ctx.globalAlpha = this.alpha * 0.16 * l.a;
      ctx.lineWidth = l.w;
      trace(ctx, P, n, l.off);
    }
    ctx.restore();
  }
}

function trace(ctx, P, n, off) {
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1;
    nx /= l; ny /= l;
    const x = P[i][0] + nx * off, y = P[i][1] + ny * off;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

/** Objeto genérico con funciones propias (para efectos puntuales). */
export class Custom {
  constructor(id, {z = 0, render, renderDust, update, renderClean} = {}) {
    Object.assign(this, {id, z});
    if (render) this.render = render;
    if (renderDust) this.renderDust = renderDust;
    if (update) this.update = update;
    if (renderClean) this.renderClean = renderClean;
    this.visible = true;
  }
}

export {lerp, pressureStyle, YELLOW};

/**
 * Forma móvil: trazos en coordenadas locales que se dibujan trasladados, rotados y escalados.
 * Para cosas que se mueven enteras (palitos, atados) sin regenerar sus trazos.
 */
export class Shape {
  constructor(id, strokes, x = 0, y = 0, {z = 10, rot = 0, scale = 1, progress = 1, fade = 1} = {}) {
    Object.assign(this, {id, strokes, x, y, z, rot, scale, progress, fade});
    this.visible = true;
    this.lift = 0;
    this.flash = 0;
  }

  update(dt) {
    this.flash = Math.max(0, this.flash - dt * 1.4);
  }

  render(ctx, view, frame, world) {
    if (this.fade <= 0 || this.progress <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y - this.lift);
    if (this.rot) ctx.rotate(this.rot);
    if (this.scale !== 1) ctx.scale(this.scale, this.scale);
    const c = this.progress >= 1 && this.flash <= 0 && world?.cacheEnabled !== false ? this.#cached(view.scale * this.scale) : null;
    if (c) ctx.drawImage(c.canvas, c.bx, c.by, c.bw, c.bh);
    else drawStrokes(ctx, this.strokes, this.progress, this.fade * (1 + this.flash * 0.25), 1 + this.flash * 0.4);
    ctx.restore();
  }

  #cached(scale) {
    const want = Math.min(4, Math.pow(2, Math.ceil(Math.log2(Math.max(0.25, scale)) * 2) / 2));
    const c = this.cache;
    if (c && c.fade === this.fade && c.strokes === this.strokes && c.scale >= want && c.scale <= want * 2.9) return c;
    const b = bboxOf(this.strokes);
    const w = Math.ceil(b.w * want), h = Math.ceil(b.h * want);
    if (w * h > 2048 * 2048 || w < 1 || h < 1) return null;
    const canvas = c?.canvas || document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const cx = canvas.getContext('2d');
    cx.clearRect(0, 0, w, h);
    cx.globalCompositeOperation = 'lighten';
    cx.setTransform(want, 0, 0, want, -b.x * want, -b.y * want);
    drawStrokes(cx, this.strokes, 1, this.fade);
    this.cache = {canvas, scale: want, fade: this.fade, strokes: this.strokes, bx: b.x, by: b.y, bw: b.w, bh: b.h};
    return this.cache;
  }

  dispose() {
    if (this.cache) this.cache.canvas.width = 0;
    this.cache = null;
  }

  bounds() {
    const b = this.bbox ??= bboxOf(this.strokes);
    const k = this.scale;
    return {x: this.x + b.x * k, y: this.y - this.lift + b.y * k, w: b.w * k, h: b.h * k};
  }
}
