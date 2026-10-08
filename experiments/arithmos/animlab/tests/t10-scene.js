// TEST 10 — microescena «¿Cuántos son?» (~25 s): personaje + tiza + matemática + cámara + sonido + transformación.
//
// Guion: el alumno entra caminando; la cámara llega antes; Punto se dibuja a su lado y mira la Ronda (7 puntos).
// Punto salta de punto en punto contando; con cada salto el alumno escribe una marca (la 5.ª cruza las cuatro:
// el atado de cinco). Debajo del atado escribe «5», debajo del par «2», un «+», da un paso y escribe «= 7».
// Comprende; Punto rebota; la cámara se aleja para relacionar los puntos, las marcas y la cuenta.
//
// Cantidad concreta → agrupación → número → expresión: el cambio de representación es la escena (TEST 04).

import {Figure} from '../../src/engine/figure.js';
import {YELLOW} from '../../src/engine/chalk.js';
import {buildActor, ik} from '../core/actor.js';
import {POSES2} from '../core/poses.js';
import {depositStroke, drawDeposit, depositTip, depositSpeed} from '../core/deposit.js';
import {glyphGuides, GLYPHS} from '../core/glyphs.js';
import {circleGuide} from '../core/gesture.js';
import {blobOutline, fillPressure} from '../core/blob.js';
import {cameraTrack} from '../core/camera2.js';
import {countNote} from '../core/score.js';
import {liftTime, minJerk, clamp, lerp} from '../core/motion.js';

const G = 900, K = 2.7;
const X0 = 700, X1 = 1130, X2 = 1215; // entrada, lugar de las marcas, paso para «= 7»
const SH = {dx: 4, dy: -(64 * K * 0.97 + 46 * K - 4 * K)}; // hombro respecto de (x, suelo), de pie
const REACH = (25 + 24 + 8) * K * 0.97; // brazo + tiza
const DOTS = [[1500, 520], [1585, 470], [1640, 560], [1560, 615], [1710, 490], [1690, 615], [1770, 555]];
// la escritura va a la derecha de la cabeza (radio ≈ 42) y a escala de mano: letras ≈ 8 % del alto de la figura
// (t10a: las marcas tapaban la cabeza y el paso al costado tapaba lo escrito)
const TALLY = {x: X1 + 58, top: G - 300, bot: G - 266, gap: 10, pairDx: 56};
const NUM = {y: G - 214, size: 34};
const W = 5.5;

let S; // escena construida

function build() {
  const sc = {strokes: [], hand: [], score: [], punto: [], rings: [], marks: {}, events: {}};
  const ev = (k, t) => { sc.events[k] = +t.toFixed(2); };
  const chalk = (guide, seed, o = {}) => depositStroke(guide, {w: W, p: 0.9, seed, down: 0.14, ...o, motion: {speed: 560, accel: 9000, k0: 1 / 30, ...(o.motion || {})}});
  const write = (st, t, tag) => {
    sc.strokes.push({st, t, tag});
    sc.hand.push({st, t0: t, t1: t + st.T});
    sc.score.push({type: 'tap', t, strength: 0.45}, {type: 'chalk', t0: t, t1: t + st.T, speed: tt => depositSpeed(st, tt - t)});
    return t + st.T;
  };

  // 1. entra caminando
  ev('entra', 0.5);
  // 2. Punto aparece al costado de la cabeza
  const P0 = [X1 + 120, G - 420];
  const T_PUNTO = 4.0;
  sc.punto.push({kind: 'appear', t: T_PUNTO, at: P0, dur: 0.4});
  sc.score.push({type: 'note', t: T_PUNTO + 0.3, freq: 523, dur: 0.3, gain: 0.05});
  ev('aparece Punto', T_PUNTO);
  // 3. contar: Punto salta a cada punto; con cada aterrizaje, una marca. Los saltos se aceleran (contar agarra ritmo).
  let t = 5.1, from = P0;
  for (let i = 0; i < 7; i++) {
    const dur = 0.5 - 0.035 * i;
    const to = [DOTS[i][0], DOTS[i][1] - 15];
    sc.punto.push({kind: 'hop', t, dur, from, to, h: 36 + 8 * (i === 0)});
    const land = t + dur;
    sc.rings.push({t: land, st: depositStroke(circleGuide(DOTS[i][0], DOTS[i][1], 17, {seed: 40 + i}), {w: 4.5, ch: YELLOW, seed: 50 + i, motion: {speed: 500}})});
    sc.score.push({type: 'note', t: land, freq: countNote(i), dur: 0.25, gain: 0.06});
    // la marca: sale un instante después del aterrizaje (el alumno mira y anota)
    let guide;
    if (i < 4) { const x = TALLY.x + i * TALLY.gap; guide = [[x + 2, TALLY.top], [x - 1, TALLY.bot]]; }
    else if (i === 4) guide = [[TALLY.x - 8, TALLY.bot - 8], [TALLY.x + 3 * TALLY.gap + 10, TALLY.top + 6]];
    else { const x = TALLY.x + TALLY.pairDx + (i - 5) * TALLY.gap; guide = [[x + 2, TALLY.top], [x - 1, TALLY.bot]]; }
    (write(chalk(guide, 60 + i, {motion: {speed: i === 4 ? 900 : 620}}), land + 0.06, `marca${i}`));
    from = to;
    t = land + 0.1;
  }
  ev('fin de contar', t);
  // 4. Punto vuelve junto al alumno y mira lo escrito
  const P1 = [X1 + 150, G - 410];
  sc.punto.push({kind: 'hop', t: t + 0.25, dur: 0.6, from, to: P1, h: 60});
  sc.score.push({type: 'note', t: t + 0.85, freq: 392, dur: 0.2, gain: 0.04});
  // 5. debajo del atado «5», debajo del par «2», «+» en el medio
  t += 1.15;
  ev('escribe 5 y 2', t);
  const writeGlyph = (ch, x, y, size, seed, color = 0) => {
    for (const g of glyphGuides(ch, x, y, size, {seed})) {
      const prev = sc.hand.at(-1);
      const end = [prev.st.path.x.at(-1), prev.st.path.y.at(-1)];
      t = Math.max(t, prev.t1 + liftTime(Math.hypot(g[0][0] - end[0], g[0][1] - end[1])));
      t = write(chalk(g, seed++, {ch: color}), t, ch);
    }
    t += 0.04;
  };
  const sz = NUM.size;
  writeGlyph('5', TALLY.x + 1.5 * TALLY.gap - GLYPHS['5'].adv * sz / 2, NUM.y, sz, 101);
  writeGlyph('2', TALLY.x + TALLY.pairDx + TALLY.gap / 2 - GLYPHS['2'].adv * sz / 2, NUM.y, sz, 111);
  writeGlyph('+', TALLY.x + (1.5 * TALLY.gap + TALLY.pairDx + TALLY.gap / 2) / 2 - GLYPHS['+'].adv * sz * 0.4, NUM.y, sz * 0.8, 121);
  // 6. un paso a la derecha y «= 7»
  // 6. se inclina para llegar más a la derecha (sin pasar por delante de lo escrito) y «= 7»
  const T_STEP = t + 0.1;
  ev('se inclina', T_STEP);
  t = T_STEP + 0.45;
  const eqX = TALLY.x + TALLY.pairDx + TALLY.gap + 0.32 * sz;
  writeGlyph('=', eqX, NUM.y, sz, 131);
  t += 0.12;
  writeGlyph('7', eqX + (GLYPHS['='].adv + 0.22) * sz, NUM.y, sz, 141);
  ev('escribe = 7', t);
  // 7. comprende: el alumno se abre, Punto rebota dos veces; la cámara se aleja
  const T_GET = t + 0.45;
  ev('comprende', T_GET);
  sc.punto.push({kind: 'bounce', t: T_GET + 0.15, at: P1, n: 2});
  sc.score.push({type: 'note', t: T_GET + 0.15, freq: 523, dur: 0.6, gain: 0.05}, {type: 'note', t: T_GET + 0.32, freq: 659, dur: 0.6, gain: 0.045}, {type: 'note', t: T_GET + 0.5, freq: 784, dur: 0.9, gain: 0.04});
  sc.T_GET = T_GET;
  sc.duration = T_GET + 5.2;
  // ——— actor ———
  sc.actor = buildActor({ground: G, x: X0, k: K, duration: sc.duration, poses: POSES2, script: [
    {t: 0, pose: 'stand', face: 1},
    {t: 0.5, walk: {to: X1, speed: 150}},
    {t: 3.9, pose: 'stand', gaze: [0.7, -0.6]},
    {t: T_PUNTO + 0.15, pose: 'surprise', gaze: [0.6, -0.9]},       // ¡un punto! (se vuelve hacia nosotros)
    {t: T_PUNTO + 0.8, pose: 'stand', gaze: [0.9, -0.5]},
    {t: 5.0, pose: 'write', gaze: [1, -0.4]},
    {t: sc.events['fin de contar'] + 0.1, pose: 'think', gaze: [0.5, 0.2]},
    {t: sc.events['escribe 5 y 2'] - 0.25, pose: 'write', gaze: [0.6, 0.4]},
    {t: T_STEP, pose: 'write', overrides: {lean: 0.26, armR: [1.3, 0.3]}, gaze: [0.8, 0.5]},
    {t: T_GET - 0.15, pose: 'lookDown', gaze: [0.6, 0.3]},           // anticipación: se encoge un instante
    {t: T_GET, pose: 'eureka', gaze: [0.8, -0.7]},
    {t: T_GET + 0.7, walk: {to: X1 - 150, speed: 110, back: true}},      // un paso atrás para mirar lo hecho
    {t: T_GET + 0.75, pose: 'stand', gaze: [0.8, -0.2]},
    {t: T_GET + 2.0, pose: 'open', gaze: [0.2, -0.3]},
  ]});
  // pasos al sonido: cuando un pie vuelve a apoyar
  let prev = null;
  for (let tt = 0; tt < sc.duration; tt += 1 / 120) {
    const g = sc.actor.gait(tt);
    if (prev) for (const f of ['L', 'R']) if (prev.feet[f].lift > 0.3 && g.feet[f].lift <= 0.3) sc.score.push({type: 'step', t: tt, strength: 0.5});
    prev = g;
  }
  // ——— cámara: general → medio (llega antes de que aparezca Punto) → abre al final ———
  sc.camera = cameraTrack([
    {t: 0, cx: 1250, cy: 560, w: 2300},
    {t: 2.2, cx: 1440, cy: 600, w: 1150, arrive: T_PUNTO - 0.3},
    {t: T_GET + 1.0, cx: 1400, cy: 610, w: 1450},
  ]);
  return sc;
}

// ——— Punto ———
function puntoAt(t) {
  let pos = null, sl = 1, ang = Math.PI / 2, fill = 0;
  for (const p of S.punto) {
    if (t < p.t) break;
    const tl = t - p.t;
    if (p.kind === 'appear') { pos = p.at; fill = clamp(tl / p.dur); if (tl < p.dur) sl = 1; }
    else if (p.kind === 'hop') {
      if (tl >= p.dur + 0.35) { pos = p.to; continue; }
      const crouch = 0.07;
      if (tl < crouch) { pos = p.from; sl = 1 - 0.22 * minJerk(tl / crouch); }               // se agacha
      else if (tl < p.dur) {
        const u = (tl - crouch) / (p.dur - crouch);
        pos = [lerp(p.from[0], p.to[0], u), lerp(p.from[1], p.to[1], u) - 4 * p.h * u * (1 - u)];
        sl = 1.18 - 0.18 * Math.abs(2 * u - 1);                                               // estirado en el aire
        ang = Math.atan2((p.to[1] - p.from[1]) - 4 * p.h * (1 - 2 * u), p.to[0] - p.from[0]);
      } else {                                                                                // aterriza y se asienta
        const k = (tl - p.dur) / 0.35;
        pos = p.to; ang = Math.PI / 2;
        sl = 1 - 0.24 * Math.exp(-k * 5) * Math.cos(k * 11);
      }
    } else if (p.kind === 'bounce') {
      const per = 0.36, i = Math.floor(tl / per);
      if (i < p.n) { const u = (tl % per) / per; pos = [p.at[0], p.at[1] - 4 * 26 * u * (1 - u)]; sl = u < 0.15 || u > 0.85 ? 0.82 : 1.1; }
      else pos = p.at;
    }
  }
  return pos ? {pos, sl, ang, fill} : null;
}

// ——— brazo que escribe ———
function writingArm(t, sk) {
  // tramo de contacto o de aire entre dos tramos cercanos
  const H = S.hand;
  let target = null, w = 0;
  for (let i = 0; i < H.length; i++) {
    const h = H[i];
    if (t >= h.t0 && t <= h.t1) { target = depositTip(h.st, t - h.t0); w = 1; break; }
    const next = H[i + 1];
    if (next && t > h.t1 && t < next.t0) {
      const a = [h.st.path.x.at(-1), h.st.path.y.at(-1)], b = [next.st.path.x[0], next.st.path.y[0]];
      const gap = next.t0 - h.t1;
      if (gap < 1.4) { const k = minJerk((t - h.t1) / gap); target = [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(Math.PI * k) * 6]; w = 1; }
      else { // vuelve al costado y después sube de nuevo
        const out = clamp((t - h.t1) / 0.35), back = clamp((next.t0 - t) / 0.35);
        w = 1 - minJerk(Math.min(out, back));
        target = t - h.t1 < next.t0 - t ? a : b;
      }
      break;
    }
    if (i === 0 && t < h.t0) { w = minJerk(1 - clamp((h.t0 - t) / 0.35)); target = [h.st.path.x[0], h.st.path.y[0]]; break; }
    if (i === H.length - 1 && t > h.t1) { w = minJerk(1 - clamp((t - h.t1) / 0.4)); target = [h.st.path.x.at(-1), h.st.path.y.at(-1)]; }
  }
  if (!target || w <= 0) return {err: 0};
  const sh = sk.shoulder;
  const up = 25 * K, fore = (24 + 8) * K;
  // el codo va abajo (mano que escribe delante del cuerpo)
  const elbow = ik(sh, target, up, fore, -1);
  const dx = target[0] - elbow[0], dy = target[1] - elbow[1], l = Math.hypot(dx, dy) || 1;
  const reach = Math.hypot(target[0] - sh[0], target[1] - sh[1]);
  const handPt = [elbow[0] + dx / l * 24 * K, elbow[1] + dy / l * 24 * K];
  const mix = (p, q) => [lerp(p[0], q[0], w), lerp(p[1], q[1], w)];
  sk.aR = [sk.aR[0], mix(sk.aR[1], elbow), mix(sk.aR[2], handPt)];
  return {err: w > 0.99 ? Math.max(0, reach - (up + fore)) : 0};
}

let fig;
export default {
  title: 'microescena «¿Cuántos son?»',
  duration: 0,
  setup() {
    S = build();
    this.duration = S.duration;
    fig = new Figure('alumno', X0, G, {scale: K});
    fig.skeleton = () => fig._sk;
  },
  camera(t) {
    const [cx, cy, w] = S.camera.at(t);
    return {x: cx - w / 2, y: cy - w * 9 / 32, w, h: w * 9 / 16};
  },
  render(lab, t, ctx) {
    const frame = Math.floor(t * 8);
    // la Ronda: siete puntos vivos (respiran desfasados; se aplastan al recibir a Punto)
    DOTS.forEach(([x, y], i) => {
      const land = S.rings[i].t;
      const hit = t > land ? Math.exp(-(t - land) * 7) * Math.cos((t - land) * 16) * 0.2 : 0;
      const sl = 1 - hit;
      fillPressure(ctx, blobOutline(x, y + 2 * hit * 8, 8.5 * (1 + 0.03 * Math.sin(t * 2.6 + i)), {ang: Math.PI / 2, sl, sw: 1 / sl, boil: frame % 3, seed: 20 + i}), 0, 0.74, [x, y], 9);
    });
    for (const r of S.rings) drawDeposit(ctx, r.st, t - r.t);
    for (const s of S.strokes) drawDeposit(ctx, s.st, t - s.t);
    // alumno
    const sk = S.actor.at(t);
    const arm = writingArm(t, sk);
    this._err = arm.err;
    fig._sk = sk;
    fig.gaze = S.actor.gaze(t);
    fig.facing = sk.f;
    fig.time = t;
    fig.blink = (t % 3.3) < 0.11 ? 0.1 : 0;
    fig.render(ctx, null, frame);
    // Punto
    const p = puntoAt(t);
    if (p) {
      const breathe = 1 + 0.03 * Math.sin(t * Math.PI);
      const r = 15 * breathe * (0.35 + 0.65 * p.fill);
      fillPressure(ctx, blobOutline(p.pos[0], p.pos[1], r, {ang: p.ang, sl: p.sl, sw: 1 / p.sl, boil: frame % 3, seed: 3}), 0, 0.72 * Math.min(1, p.fill * 1.4), p.pos, r * 1.15);
    }
  },
  score() { return S.score; },
  probe(lab, t) {
    const h = S.hand.find(h => t >= h.t0 && t <= h.t1);
    const p = puntoAt(t);
    return {contact: h ? depositSpeed(h.st, t - h.t0) : 0, punto: p ? {x: p.pos[0], h: G - p.pos[1]} : null, cam: S.camera.at(t)[2]};
  },
  metrics(lab) {
    // alcance: ¿la mano llega a cada punto de cada trazo? (error > 0 = la tiza estaría fuera del brazo)
    let maxErr = 0, worst = null;
    for (const h of S.hand) for (let tt = h.t0; tt <= h.t1; tt += 1 / 60) {
      const sk = S.actor.at(tt), tip = depositTip(h.st, tt - h.t0);
      const reach = Math.hypot(tip[0] - sk.shoulder[0], tip[1] - sk.shoulder[1]) - (25 + 32) * K;
      if (reach > maxErr) { maxErr = reach; worst = +tt.toFixed(2); }
    }
    return {events: S.events, duration: +S.duration.toFixed(2), strokes: S.strokes.length, reachOver: +maxErr.toFixed(1), worstAt: worst};
  },
};
