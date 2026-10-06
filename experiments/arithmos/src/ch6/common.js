// Capítulo 6 — Lo que no se ve: la explanada del depósito, una recta larga y dos marcadores.
// Punto hace de x: se sienta en una marca de la recta y cada miembro de la ecuación
// pone su marcador donde le da ese valor.

import {Drawing, Label, Custom} from '../engine/world.js';
import {stroke, YELLOW, WHITE, BLUE} from '../engine/chalk.js';
import {seedOf, lerp} from '../engine/rng.js';
import {base as base3, GROUND, mara, villager, student, punto, item, signed, art, art3} from '../ch3/common.js';
import {follow} from '../acting.js';

export {GROUND, mara, villager, student, punto, item, signed, art};

export const LINE = {zero: 13400, step: 64, from: -10, to: 12};
export const lx = v => LINE.zero + v * LINE.step;
export const MK = {L: GROUND - 120, R: GROUND - 215};
export const BOX = {x: 12450};

export const SHOTS = {
  line: {x: 12560, y: 230, w: 1760, h: 600},
  box: {x: 12150, y: 300, w: 900, h: 460},
};

const S = (guide, seed, opts = {}) => stroke(guide, {seed, ...opts});

/** Fondo: el del cap. 3 (depósito, registro, línea de las familias) y la recta larga. */
export function base(g) {
  base3(g, {line: true});
  g.renderer.tint = [0.96, 0.98, 1.04];
  const w = g.world;
  const nl = art3.numberLine('l6', LINE.zero, GROUND, LINE.step, LINE.from, LINE.to);
  w.ensure('l6', () => new Drawing('l6', nl.strokes, {z: 2}));
  w.ensure('g6-ground', () => new Drawing('g6-ground', art.groundLine('g6-ground', 11900, 14900, GROUND), {z: 0, fade: 0.75}));
  for (const t of nl.ticks) {
    w.ensure(`l6-${t.n}`, () => new Label(`l6-${t.n}`, t.n === 0 ? '0' : signed(t.n), t.x, GROUND + 46, {size: t.n === 0 ? 28 : 22, align: 'center', z: 9, weight: t.n === 0 ? 700 : 400}));
  }
}

/** La caja cerrada de Mara (el número que no se ve). */
export function box(w, open = false) {
  const id = open ? 'box-open' : 'box';
  w.remove(open ? 'box' : 'box-open');
  return w.ensure(id, () => {
    const x = BOX.x, y = GROUND;
    const list = [...art.rectStrokesFor(id, x - 70, y - 110, 140, 110)];
    if (!open) list.push(S([[x - 76, y - 110], [x + 76, y - 112]], seedOf(id) + 1, {w: 3.4, p: 0.95}));
    else list.push(S([[x - 70, y - 110], [x - 110, y - 170]], seedOf(id) + 2, {w: 3.4, p: 0.95}));
    list.push(S([[x - 6, y - 70], [x + 6, y - 70]], seedOf(id) + 3, {w: 2.4, p: 0.8, ch: BLUE}));
    return new Drawing(id, list, {z: 6});
  });
}

export function cast(g) {
  const w = g.world;
  const s = student(w, lx(LINE.from) - 90);
  const p = punto(w, s.x + 44, GROUND - 150);
  p.arrow = !!g.flags.puntoArrow;
  follow(p, s);
  mara(w, BOX.x - 150, {facing: 0.8});
  return {s, p};
}

/**
 * La ecuación en la recta. `eq` = {L, R, rel} de logic/equations. x: valor actual (Punto).
 * Los marcadores siguen a sus valores con suavidad; si coinciden, una raya amarilla los une.
 */
export class EqView {
  constructor(g, e, x = 0) {
    this.g = g;
    this.w = g.world;
    this.e = e;
    this.x = x;
    this.shown = {L: e.L.f(x), R: e.R.f(x)};
    this.texts = {L: e.L.text, R: e.R.text};
    this.hidden = {L: false, R: false};
    this.w.removeWhere(o => o.id.startsWith('eqv-'));
    for (const side of ['L', 'R']) this.#marker(side);
    this.w.add(new Custom('eqv-link', {z: 7, render: (ctx, view) => this.#renderLink(ctx, view)}));
  }

  get value() { return {L: this.e.L.f(this.x), R: this.e.R.f(this.x)}; }
  get match() { const v = this.value; return Number.isFinite(v.L) && Number.isFinite(v.R) && Math.abs(v.L - v.R) < 1e-9; }
  /** ¿Se cumple la relación (=, <, >) con Punto donde está? */
  get holds() {
    const v = this.value;
    if (!Number.isFinite(v.L) || !Number.isFinite(v.R)) return false;
    const rel = this.e.rel;
    return rel === '=' ? this.match : rel === '<' ? v.L < v.R - 1e-9 : rel === '>' ? v.L > v.R + 1e-9 : rel === '≤' ? v.L <= v.R + 1e-9 : v.L >= v.R - 1e-9;
  }

  #marker(side) {
    const y = MK[side];
    // el rótulo, al costado del marcador (la raya amarilla no lo cruza)
    const lab = this.w.add(new Label(`eqv-t${side}`, '', 0, y - 2, {size: 30, align: 'left', z: 12}));
    const id = `eqv-m${side}`;
    const tri = this.w.add(new Custom(id, {z: 11, render: (ctx, view) => {
      if (this.hidden[side]) return;
      const v = this.shown[side];
      if (!Number.isFinite(v)) return;
      const cv = Math.max(LINE.from - 0.6, Math.min(LINE.to + 0.6, v));
      const x = lx(cv);
      ctx.save();
      ctx.strokeStyle = side === 'L' ? 'rgba(255,0,0,0.95)' : 'rgba(255,0,0,0.95)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 12, y - 14); ctx.lineTo(x, y + 4); ctx.lineTo(x + 12, y - 14); ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([6, 8]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(160,0,0,0.6)';
      ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x, GROUND - 14); ctx.stroke();
      ctx.restore();
    }, update: () => {
      const target = this.e[side].f(this.x);
      if (!Number.isFinite(target)) { this.shown[side] = target; return; }
      if (!Number.isFinite(this.shown[side])) this.shown[side] = target;
      this.shown[side] = lerp(this.shown[side], target, 0.18);
      if (Math.abs(this.shown[side] - target) < 0.002) this.shown[side] = target;
      const cv = Math.max(LINE.from - 0.6, Math.min(LINE.to + 0.6, this.shown[side]));
      lab.x = lx(cv) + 20;
      lab.text = this.hidden[side] ? '' : this.texts[side];
    }}));
    void tri;
  }

  #renderLink(ctx) {
    if (this.e.rel !== '=') {
      // desigualdad: una tilde amarilla sobre Punto cuando se cumple
      if (!this.holds) return;
      const x = lx(this.x);
      ctx.save();
      ctx.strokeStyle = 'rgba(0,255,0,0.95)';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x - 14, GROUND - 72); ctx.lineTo(x - 4, GROUND - 60); ctx.lineTo(x + 16, GROUND - 88); ctx.stroke();
      ctx.restore();
      return;
    }
    if (!this.match) return;
    const v = this.value.L;
    if (Math.abs(this.shown.L - v) > 0.01 || Math.abs(this.shown.R - v) > 0.01) return;
    const x = lx(Math.max(LINE.from, Math.min(LINE.to, v)));
    ctx.save();
    ctx.strokeStyle = 'rgba(0,255,0,0.9)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, MK.R + 6); ctx.lineTo(x, MK.L - 16); ctx.stroke();
    ctx.restore();
  }

  set(e, texts) {
    this.e = e;
    this.texts = texts || {L: e.L.text, R: e.R.text};
  }

  dispose() { this.w.removeWhere(o => o.id.startsWith('eqv-')); }
}

export {Drawing, Label, Custom, YELLOW, WHITE, BLUE, S, seedOf};
