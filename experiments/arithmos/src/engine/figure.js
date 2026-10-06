// La figura de palitos del estudiante: esqueleto, poses, caminata y actuación.
//
// Ángulos de extremidades medidos desde "colgando hacia abajo"; positivo = hacia adelante.
// `facing` va de -1 (izquierda) a 1 (derecha); 0 es de frente (brazos y piernas se abren).

import {stroke, circleGuide, smoothGuide, drawStrokes, dotStrokes, WHITE} from './chalk.js';
import {mulberry32, lerp, clamp} from './rng.js';

export const BONES = {thigh: 32, shin: 32, torso: 46, neck: 16, head: 15.5, upper: 25, fore: 24};

export const POSES = {
  idle: {lean: 0.03, tilt: 0.04, armL: [0.34, 0.32], armR: [-0.26, 0.38], legL: [0.16, -0.08], legR: [-0.14, -0.05], drop: 0},
  relaxed: {lean: -0.02, tilt: 0.06, armL: [0.2, 0.3], armR: [-0.18, 0.25], legL: [0.12, -0.05], legR: [-0.1, -0.02], drop: 0},
  lookUp: {lean: -0.1, tilt: -0.35, armL: [0.05, 0.15], armR: [-0.05, 0.2], legL: [0.08, -0.04], legR: [-0.08, -0.04], drop: 0},
  lookDown: {lean: 0.12, tilt: 0.38, armL: [0.1, 0.3], armR: [-0.05, 0.4], legL: [0.06, -0.05], legR: [-0.06, -0.04], drop: 1},
  hands: {lean: 0.18, tilt: 0.85, armL: [1.0, 1.45], armR: [0.8, 1.75], legL: [0.12, -0.06], legR: [-0.1, -0.04], drop: 0},
  surprise: {lean: -0.16, tilt: -0.18, armL: [0.65, 0.9], armR: [-0.35, 0.95], legL: [0.14, -0.08], legR: [-0.22, -0.02], drop: 0},
  crouch: {lean: 0.42, tilt: 0.3, armL: [0.75, 0.25], armR: [0.4, 0.5], legL: [1.25, -1.9], legR: [0.35, -1.6], drop: 26},
  kneel: {lean: 0.15, tilt: 0.25, armL: [0.45, 0.4], armR: [0.2, 0.5], legL: [1.5, -1.5], legR: [-0.1, -1.75], drop: 30},
  reach: {lean: 0.18, tilt: 0.05, armL: [0.25, 0.2], armR: [1.45, 0.08], legL: [0.22, -0.08], legR: [-0.25, -0.05], drop: 0},
  point: {lean: 0.05, tilt: 0.0, armL: [0.1, 0.2], armR: [1.62, 0.02], legL: [0.08, -0.05], legR: [-0.08, -0.04], drop: 0},
  pointUp: {lean: -0.05, tilt: -0.2, armL: [0.1, 0.2], armR: [2.45, 0.05], legL: [0.08, -0.05], legR: [-0.08, -0.04], drop: 0},
  write: {lean: 0.1, tilt: 0.05, armL: [0.15, 0.25], armR: [1.75, 0.55], legL: [0.12, -0.06], legR: [-0.12, -0.05], drop: 0},
  writeLow: {lean: 0.5, tilt: 0.25, armL: [0.6, 0.3], armR: [1.15, 0.2], legL: [0.9, -1.5], legR: [0.2, -1.2], drop: 18},
  shrug: {lean: -0.02, tilt: 0.16, armL: [0.5, -1.5], armR: [-0.5, -1.5], legL: [0.08, -0.04], legR: [-0.08, -0.03], drop: 0},
  worry: {lean: 0.06, tilt: 0.12, armL: [2.4, 1.6], armR: [2.2, 1.7], legL: [0.04, -0.04], legR: [-0.06, -0.03], drop: 0},
  think: {lean: 0.0, tilt: 0.2, armL: [0.4, 1.6], armR: [0.3, 2.35], legL: [0.06, -0.05], legR: [-0.06, -0.04], drop: 0},
  wave: {lean: -0.04, tilt: -0.05, armL: [0.1, 0.2], armR: [2.6, -0.5], legL: [0.08, -0.05], legR: [-0.08, -0.04], drop: 0},
  sit: {lean: 0.08, tilt: 0.0, armL: [0.55, 0.6], armR: [0.4, 0.75], legL: [1.5, -1.45], legR: [1.42, -1.55], drop: 30},
  sitBack: {lean: -0.12, tilt: -0.3, armL: [-0.4, 0.2], armR: [-0.5, 0.25], legL: [1.45, -1.2], legR: [1.35, -1.35], drop: 30},
  open: {lean: -0.04, tilt: -0.05, armL: [0.65, 0.3], armR: [-0.6, 0.3], legL: [0.1, -0.05], legR: [-0.1, -0.04], drop: 0},
  step: {lean: 0.12, tilt: 0.0, armL: [-0.3, 0.3], armR: [0.35, 0.3], legL: [0.45, -0.2], legR: [-0.35, -0.3], drop: 2},
  hide: {lean: 0.3, tilt: 0.5, armL: [2.0, 1.9], armR: [1.8, 2.1], legL: [1.0, -1.7], legR: [0.5, -1.6], drop: 24},
};

const KEYS = ['lean', 'tilt', 'drop'];
const LIMBS = ['armL', 'armR', 'legL', 'legR'];

export function blendPose(a, b, t) {
  const o = {};
  for (const k of KEYS) o[k] = lerp(a[k], b[k], t);
  for (const k of LIMBS) o[k] = [lerp(a[k][0], b[k][0], t), lerp(a[k][1], b[k][1], t)];
  return o;
}

export function copyPose(p) {
  return blendPose(p, p, 0);
}

export class Figure {
  constructor(id, x, y, opts = {}) {
    this.id = id;
    this.x = x;
    this.y = y; // suelo bajo los pies
    this.facing = opts.facing ?? 1;
    this.facingTarget = this.facing;
    this.pose = copyPose(POSES[opts.pose || 'idle']);
    this.from = copyPose(this.pose);
    this.target = POSES[opts.pose || 'idle'];
    this.targetName = opts.pose || 'idle';
    this.poseT = 1;
    this.poseDur = 0.4;
    this.gaze = [0, 0];
    this.gazeTarget = [0, 0];
    this.walkPhase = 0;
    this.walking = 0;
    this.path = null;
    this.speed = 120;
    this.draw = 1; // progreso de dibujo (aparecer trazo a trazo)
    this.fade = 1;
    this.holdsChalk = opts.chalk ?? true;
    this.breath = 0;
    this.blinkT = 2 + Math.random() * 3;
    this.blink = 0;
    this.scale = opts.scale ?? 1;
    this.ch = opts.ch ?? WHITE;
    this.gesture = null; // movimiento superpuesto (escribir, saludar)
    this.time = 0;
    this.visible = true;
    this.z = opts.z ?? 20;
  }

  setPose(name, dur = 0.45) {
    if (!POSES[name]) throw new Error(`Pose desconocida: ${name}`);
    if (name === this.targetName && this.poseT >= 1) return;
    this.from = copyPose(this.pose);
    this.target = POSES[name];
    this.targetName = name;
    this.poseT = dur <= 0 ? 1 : 0;
    this.poseDur = Math.max(0.001, dur);
    if (dur <= 0) this.pose = copyPose(this.target);
  }

  /** Gesto breve al hablar: las manos acompañan la frase. */
  talk(sec = 1.1) {
    this.talkT = sec;
    this.talkSeed = Math.random() * 10;
  }

  look(gx, gy) {
    this.gazeTarget = [clamp(gx, -1, 1), clamp(gy, -1, 1)];
  }

  face(dir) {
    this.facingTarget = dir;
  }

  /** Camina hasta x (y opcional). Devuelve los segundos que tardará. */
  walkTo(x, y = this.y, speed = this.speed) {
    const d = Math.hypot(x - this.x, y - this.y);
    if (d < 1) return 0;
    this.path = {x, y, speed};
    this.facingTarget = x >= this.x ? 1 : -1;
    return d / speed;
  }

  arriveNow() {
    if (this.path) {
      this.x = this.path.x;
      this.y = this.path.y;
      this.path = null;
    }
    this.walking = 0;
  }

  finishPose() {
    this.poseT = 1;
    this.pose = copyPose(this.target);
    this.facing = this.facingTarget;
    this.gaze = [...this.gazeTarget];
  }

  update(dt) {
    this.time += dt;
    if (this.poseT < 1) {
      this.poseT = Math.min(1, this.poseT + dt / this.poseDur);
      const e = this.poseT < 0.5 ? 2 * this.poseT * this.poseT : 1 - Math.pow(-2 * this.poseT + 2, 2) / 2;
      this.pose = blendPose(this.from, this.target, e);
    }
    const df = this.facingTarget - this.facing;
    this.facing += Math.sign(df) * Math.min(Math.abs(df), dt * 7);
    this.gaze[0] += (this.gazeTarget[0] - this.gaze[0]) * Math.min(1, dt * 8);
    this.gaze[1] += (this.gazeTarget[1] - this.gaze[1]) * Math.min(1, dt * 8);
    if (this.path) {
      const {x, y, speed} = this.path;
      const dx = x - this.x, dy = y - this.y;
      const d = Math.hypot(dx, dy);
      const step = speed * dt;
      if (d <= step) {
        this.x = x; this.y = y; this.path = null;
      } else {
        this.x += (dx / d) * step;
        this.y += (dy / d) * step;
        this.walkPhase += step / 21;
      }
    }
    const want = this.path ? 1 : 0;
    this.walking += (want - this.walking) * Math.min(1, dt * 9);
    if (!this.path && this.walking < 0.02) this.walking = 0;
    this.breath += dt;
    if (this.talkT > 0) this.talkT = Math.max(0, this.talkT - dt);
    this.blinkT -= dt;
    if (this.blinkT < 0) {
      this.blink = 0.14;
      this.blinkT = 2.5 + Math.random() * 3.5;
    }
    this.blink = Math.max(0, this.blink - dt);
  }

  /** Esqueleto en coordenadas de mundo. */
  skeleton() {
    const p = this.pose;
    const f = this.facing;
    const k = this.scale;
    const w = this.walking;
    const ph = this.walkPhase;
    const breathe = Math.sin(this.breath * 1.7) * 0.9 * k * (1 - w);
    const legL = [p.legL[0] + w * Math.sin(ph) * 0.5, p.legL[1] - w * Math.max(0, Math.sin(ph + 1.2)) * 0.9];
    const legR = [p.legR[0] - w * Math.sin(ph) * 0.5, p.legR[1] - w * Math.max(0, Math.sin(ph + 1.2 + Math.PI)) * 0.9];
    let armL = [p.armL[0] - w * Math.sin(ph) * 0.42, p.armL[1] + w * 0.25];
    let armR = [p.armR[0] + w * Math.sin(ph) * 0.42, p.armR[1] + w * 0.25];
    if (this.talkT > 0 && !this.walking) {
      const k = Math.min(1, this.talkT * 2) * Math.sin(this.time * 9 + this.talkSeed);
      armR = [armR[0] + 0.35 * Math.min(1, this.talkT), armR[1] + 0.25 * k];
      armL = [armL[0] + 0.12 * k, armL[1]];
    }
    if (this.gesture) {
      const g = this.gesture(this.time);
      if (g.armR) armR = [armR[0] + g.armR[0], armR[1] + g.armR[1]];
      if (g.armL) armL = [armL[0] + g.armL[0], armL[1] + g.armL[1]];
    }
    const lean = p.lean + w * 0.08;
    // de frente, las piernas y los brazos se abren un poco: si no, se superponen
    const front = 1 - Math.abs(f);
    legL[0] += front * 0.17;
    legR[0] += front * 0.17;
    armL[0] += front * 0.12;
    armR[0] += front * 0.12;
    const hip = [this.x, 0];
    const limb = (base, a1, a2, l1, l2, side) => {
      const fx = f + (1 - Math.abs(f)) * side;
      const j = [base[0] + Math.sin(a1) * fx * l1 * k, base[1] + Math.cos(a1) * l1 * k];
      const a = a1 + a2;
      const e = [j[0] + Math.sin(a) * fx * l2 * k, j[1] + Math.cos(a) * l2 * k];
      return [base, j, e];
    };
    const neck = [hip[0] + Math.sin(lean) * f * BONES.torso * k, hip[1] - Math.cos(lean) * BONES.torso * k + breathe];
    const ha = lean + p.tilt * 0.6;
    const head = [neck[0] + Math.sin(ha) * f * (BONES.neck - 1) * k + p.tilt * f * 3 * k, neck[1] - Math.cos(ha) * BONES.neck * k];
    const shoulder = [neck[0] - Math.sin(lean) * f * 4 * k, neck[1] + Math.cos(lean) * 4 * k];
    // piernas: si una se dobla mucho (sentado), el pie queda donde cae
    const lL = limb(hip, legL[0], legL[1], BONES.thigh, BONES.shin, -1);
    const lR = limb(hip, legR[0], legR[1], BONES.thigh, BONES.shin, 1);
    const aL = limb(shoulder, armL[0], armL[1], BONES.upper, BONES.fore, -1);
    const aR = limb(shoulder, armR[0], armR[1], BONES.upper, BONES.fore, 1);
    // el punto más bajo (pie o rodilla) se apoya en el suelo
    const low = Math.max(lL[1][1], lL[2][1], lR[1][1], lR[2][1]);
    const dy = this.y - low;
    for (const pt of new Set([hip, neck, head, shoulder, ...lL, ...lR, ...aL, ...aR])) pt[1] += dy;
    return {hip, neck, head, shoulder, lL, lR, aL, aR, f, tilt: p.tilt, k};
  }

  strokes(boilSeed = 0) {
    const sk = this.skeleton();
    const k = sk.k;
    const base = (this.id.length * 131 + boilSeed * 977) | 0;
    const rnd = mulberry32(base + 1);
    const opts = {w: 3.6 * k, ch: this.ch, p: 0.95, wobble: 0.45 * k};
    const list = [];
    list.push(stroke(headGuide(this.style?.head, sk.head[0], sk.head[1], BONES.head * k, rnd), {...opts, seed: base + 2}));
    if (this.style?.head === 'curl') {
      const [hx, hy] = sk.head, r = BONES.head * k;
      list.push(stroke(smoothGuide([[hx - 2, hy - r], [hx + 4, hy - r - 9], [hx + 11, hy - r - 6], [hx + 8, hy - r - 1], [hx + 3, hy - r - 4]], 5), {...opts, w: 2.6 * k, seed: base + 9}));
    }
    list.push(stroke(smoothGuide([sk.neck, mid(sk.neck, sk.hip, 0.5, 1.2 * sk.f), sk.hip], 6), {...opts, seed: base + 3}));
    list.push(stroke(smoothGuide(sk.aL, 6), {...opts, seed: base + 4}));
    list.push(stroke(smoothGuide(sk.aR, 6), {...opts, seed: base + 5}));
    list.push(stroke(smoothGuide(sk.lL, 6), {...opts, seed: base + 6}));
    list.push(stroke(smoothGuide(sk.lR, 6), {...opts, seed: base + 7}));
    // cuello: un trazo corto entre cabeza y hombros
    const hb = [sk.head[0] - (sk.head[0] - sk.neck[0]) * 0.0, sk.head[1] + BONES.head * k * 0.98];
    list.push(stroke([[hb[0], hb[1]], [sk.neck[0], sk.neck[1]]], {...opts, w: 3.2 * k, seed: base + 8}));
    return {list, sk};
  }

  render(ctx, view, frame = 0) {
    if (!this.visible || this.fade <= 0) return;
    const {list, sk} = this.strokes(frame % 3);
    drawStrokes(ctx, list, this.draw, this.fade);
    if (this.draw < 0.98) return;
    const k = sk.k;
    // ojos: la mirada sugerida
    const f = sk.f;
    const front = 1 - Math.abs(f);
    const ex = sk.head[0] + f * 5 * k + this.gaze[0] * 3.2 * k;
    const ey = sk.head[1] - 1.5 * k + this.gaze[1] * 3 * k + sk.tilt * 2 * k;
    const sep = (2.6 + front * 3.4) * k;
    const eyes = this.blink > 0
      ? [stroke([[ex - sep - 1.6 * k, ey], [ex - sep + 1.6 * k, ey]], {w: 2 * k, p: 0.85, seed: 3}), stroke([[ex + sep - 1.6 * k, ey], [ex + sep + 1.6 * k, ey]], {w: 2 * k, p: 0.85, seed: 4})]
      : [...dotStrokes(ex - sep, ey, 1.5 * k, 5, {p: 1}), ...dotStrokes(ex + sep, ey, 1.5 * k, 6, {p: 1})];
    drawStrokes(ctx, eyes, 1, this.fade);
    if (this.style) this.#drawStyle(ctx, sk);
    if (this.holdsChalk) {
      const hand = sk.aR[2];
      const elbow = sk.aR[1];
      const dx = hand[0] - elbow[0], dy = hand[1] - elbow[1];
      const l = Math.hypot(dx, dy) || 1;
      const t = [hand[0] + (dx / l) * 7 * k, hand[1] + (dy / l) * 7 * k];
      drawStrokes(ctx, [stroke([[hand[0] + dx / l * 1, hand[1] + dy / l * 1], t], {w: 4.6 * k, p: 1, wobble: 0, seed: 9, lift: false})], 1, this.fade);
    }
  }

  /** Rasgos de otros habitantes: bufanda, rodete, sombrero. */
  #drawStyle(ctx, sk) {
    const k = sk.k, f = sk.f, st = this.style;
    const [hx, hy] = sk.head;
    const r = BONES.head * k;
    const list = [];
    if (st.scarf) {
      const [nx, ny] = sk.neck;
      list.push(stroke([[nx - 11 * k, ny - 7 * k], [nx, ny - 1 * k], [nx + 11 * k, ny - 7 * k]], {w: 4.2 * k, p: 0.95, ch: st.scarfCh ?? this.ch, seed: 31, wobble: 0.2}));
      const sway = Math.sin(this.time * 2.2) * 3 * k;
      list.push(stroke([[nx - f * 4 * k, ny - 3 * k], [nx - f * 15 * k + sway, ny + 16 * k], [nx - f * 9 * k + sway, ny + 28 * k]], {w: 3.4 * k, p: 0.9, ch: st.scarfCh ?? this.ch, seed: 32, wobble: 0.2}));
      list.push(stroke([[nx - f * 1 * k, ny - 3 * k], [nx - f * 8 * k + sway * 0.6, ny + 14 * k], [nx - f * 2 * k + sway * 0.6, ny + 24 * k]], {w: 3 * k, p: 0.85, ch: st.scarfCh ?? this.ch, seed: 33, wobble: 0.2}));
    }
    if (st.bun) {
      const br = r * 0.42 * (st.bunScale || 1);
      list.push(stroke(circleGuide(hx - f * r * 0.62, hy - r * 0.8 - (br - r * 0.42), br, mulberry32(41), {overshoot: 0.2}), {w: 2.6 * k, p: 0.9, ch: this.ch, seed: 41}));
    }
    if (st.hat) {
      list.push(stroke([[hx - r * 1.5, hy - r * 0.75], [hx + r * 1.5, hy - r * 0.8]], {w: 3 * k, p: 0.95, ch: this.ch, seed: 51}));
      list.push(stroke([[hx - r * 0.85, hy - r * 0.8], [hx - r * 0.7, hy - r * 1.8], [hx + r * 0.7, hy - r * 1.8], [hx + r * 0.85, hy - r * 0.82]], {w: 3 * k, p: 0.9, ch: this.ch, seed: 52}));
    }
    drawStrokes(ctx, list, 1, this.fade);
  }

  /** Punta de la tiza (para trazar desde la mano). */
  chalkTip() {
    const sk = this.skeleton();
    const hand = sk.aR[2], elbow = sk.aR[1];
    const dx = hand[0] - elbow[0], dy = hand[1] - elbow[1];
    const l = Math.hypot(dx, dy) || 1;
    return [hand[0] + (dx / l) * 8 * sk.k, hand[1] + (dy / l) * 8 * sk.k];
  }

  headPos() {
    return this.skeleton().head;
  }

  bounds() {
    const k = this.scale;
    return {x: this.x - 30 * k, y: this.y - 150 * k, w: 60 * k, h: 152 * k};
  }
}

/** Contorno de la cabeza: redonda, ovalada (familia Oval) o cuadrada (familia Recta). */
function headGuide(kind, cx, cy, r, rnd) {
  if (kind === 'oval') {
    const g = circleGuide(0, 0, r, rnd, {overshoot: 0.28, start: -1.9 + rnd() * 0.3});
    return g.map(([x, y]) => [cx + x * 0.78, cy + y * 1.3 - r * 0.25]);
  }
  if (kind === 'tri') {
    const q = r * 1.1;
    return [[cx, cy - q * 1.05], [cx + q, cy + q * 0.75], [cx - q, cy + q * 0.78], [cx + 2, cy - q * 1.02]];
  }
  if (kind === 'diamond') {
    const q = r * 1.15;
    return [[cx, cy - q], [cx + q * 0.85, cy], [cx, cy + q], [cx - q * 0.85, cy], [cx + 1, cy - q + 1]];
  }
  if (kind === 'half') {
    // semicírculo: cúpula con base recta
    const pts = [];
    for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI; pts.push([cx + Math.cos(a) * r * 1.1, cy + r * 0.55 + Math.sin(a) * r * 1.3]); }
    pts.push([cx - r * 1.1, cy + r * 0.55 + 1]);
    return pts;
  }
  if (kind === 'step') {
    // escalón: dos peldaños
    const q = r * 1.05;
    return [[cx - q, cy + q], [cx - q, cy - q * 0.1], [cx, cy - q * 0.1], [cx, cy - q], [cx + q, cy - q], [cx + q, cy + q], [cx - q + 1, cy + q + 1]];
  }
  if (kind === 'hex') {
    const pts = [];
    for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * Math.PI * 2; pts.push([cx + Math.cos(a) * r * 1.08, cy + Math.sin(a) * r * 1.08]); }
    return pts;
  }
  if (kind === 'square') {
    const q = r * 0.95;
    return [[cx - q, cy - q + 2], [cx - q + 2, cy - q], [cx + q, cy - q + 1], [cx + q + 1, cy + q], [cx - q, cy + q + 1], [cx - q - 1, cy - q + 6]];
  }
  return circleGuide(cx, cy, r, rnd, {overshoot: 0.28, start: -1.9 + rnd() * 0.3});
}

function mid(a, b, t, off) {
  const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
  return [x + off, y];
}
