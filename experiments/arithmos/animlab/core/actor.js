// Actuación de la figura de palitos: el mismo esqueleto y las mismas poses que src/engine/figure.js,
// pero con tiempo superpuesto y pasos reales.
//
//  - Cada canal (mirada, cabeza, torso, brazos, agachada) sigue su objetivo con un sistema de segundo orden propio
//    y un retraso: la mirada lidera, la cabeza sigue, el torso después, los brazos al final (y se pasan un poco).
//  - Caminar: primero se planifican las pisadas; los pies apoyados NO se mueven; el pie en el aire viaja con
//    mínimo jerk y un arco; la cadera sube en el apoyo simple (péndulo invertido); piernas por IK de dos huesos.
//  - Todo se integra una vez a 240 Hz: después cualquier instante t se consulta sin estado (buscable).

import {BONES, POSES} from '../../src/engine/figure.js';
import {SecondOrder, minJerk, clamp, lerp} from './motion.js';

const HZ = 240;

/** Canales de la pose y su "carácter" de movimiento (f Hz, ζ, r, retraso s). */
const CHANNELS = {
  gaze: {f: 6, z: 0.9, r: 0, delay: 0},
  tilt: {f: 3.6, z: 0.62, r: 0, delay: 0.03},
  lean: {f: 2.4, z: 0.7, r: 0, delay: 0.11},   // el torso sigue a la cabeza 80 ms después (R6)
  drop: {f: 2.8, z: 0.6, r: 0, delay: 0.06},
  armL: {f: 2.3, z: 0.5, r: 0, delay: 0.16},
  armR: {f: 2.6, z: 0.5, r: 0, delay: 0.14},   // el brazo, ~110 ms después de la cabeza
  legL: {f: 3, z: 0.8, r: 0, delay: 0.05},
  legR: {f: 3, z: 0.8, r: 0, delay: 0.05},
};

/**
 * @param o.ground y del suelo; o.x posición inicial; o.k escala
 * @param o.script [{t, pose?, gaze?: [gx, gy], walk?: {to, speed}, face?, hold?, overrides?}]
 *        `overrides` permite fijar canales sueltos de la pose (p. ej. {armR: [2.2, 0.1]}) para un gesto.
 */
export function buildActor({ground, x, k = 1, script, duration, facing = 1, poses = POSES, stepK = 8}) {
  const n = Math.ceil(duration * HZ) + 2;
  // ——— 1. objetivos por canal en el tiempo (escalones) ———
  for (const e of script) if (typeof e.t !== "number" || Number.isNaN(e.t)) throw new Error(`actor: evento sin tiempo válido ${JSON.stringify(e)}`);
  const events = [...script].sort((a, b) => a.t - b.t);
  const poseAt = t => {
    let pose = poses.stand ?? poses.idle, gaze = [0, 0], over = {};
    for (const e of events) {
      if (e.t > t) break;
      if (e.pose) { pose = poses[e.pose]; over = {}; }
      if (e.overrides) over = {...over, ...e.overrides};
      if (e.gaze) gaze = e.gaze;
    }
    return {...pose, ...over, gaze};
  };
  // ——— 2. caminata: pisadas ———
  const walks = events.filter(e => e.walk);
  let hipX = x;
  const segs = [];
  for (const e of walks) {
    const seg = planWalk(hipX, e.walk.to, e.t, e.walk.speed ?? 115, k);
    seg.swing = e.walk.swing ?? 1; // amplitud del balanceo de brazos (al retroceder, poco: los brazos no barren lo escrito)
    segs.push(seg);
    hipX = e.walk.to;
  }
  // ——— 3. integración ———
  const sims = {};
  for (const [ch, c] of Object.entries(CHANNELS)) {
    const init = poseAt(0);
    const v0 = ch === 'gaze' ? init.gaze : Array.isArray(init[ch]) ? init[ch] : [init[ch], 0];
    sims[ch] = [new SecondOrder(v0[0], c), new SecondOrder(v0[1], c)];
  }
  const out = {};
  for (const ch of Object.keys(CHANNELS)) out[ch] = new Float32Array(n * 2);
  const hipBob = new SecondOrder(0, {f: 5, z: 0.9});
  const bob = new Float32Array(n);
  const swingL = new SecondOrder(0, {f: 2.2, z: 0.45}), swingR = new SecondOrder(0, {f: 2.2, z: 0.45});
  const swing = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const t = i / HZ;
    for (const [ch, c] of Object.entries(CHANNELS)) {
      const p = poseAt(Math.max(0, t - c.delay));
      const v = ch === 'gaze' ? p.gaze : Array.isArray(p[ch]) ? p[ch] : [p[ch], 0];
      out[ch][i * 2] = i ? sims[ch][0].step(1 / HZ, v[0]) : v[0];
      out[ch][i * 2 + 1] = i ? sims[ch][1].step(1 / HZ, v[1]) : v[1];
    }
    const g = gaitAt(segs, t, x);
    bob[i] = i ? hipBob.step(1 / HZ, g.bob) : g.bob;
    // los brazos se balancean opuestos a las piernas, con retraso (follow-through)
    swing[i * 2] = i ? swingL.step(1 / HZ, g.armSwing) : 0;
    swing[i * 2 + 1] = i ? swingR.step(1 / HZ, -g.armSwing) : 0;
  }
  const faceAt = t => { let f = facing; for (const e of events) { if (e.t > t) break; if (e.face != null) f = e.face; else if (e.pose && poses[e.pose]?.face != null) f = poses[e.pose].face * Math.sign(f || 1); if (e.walk && !e.walk.back) f = Math.sign(e.walk.to - (gaitAt(segs, e.t, x).hip)) || f; } return f; };
  // orientación suavizada: dos promedios móviles hacia atrás de 0.09 s (un escalón → curva en S de 0.18 s). Sirve aunque
  // haya varios cambios seguidos; la versión anterior (un solo cambio por ventana) saltaba si dos caían en 0.18 s (R11)
  const faceS = new Float32Array(n);
  {
    const w = Math.round(0.09 * HZ), r = Float32Array.from({length: n}, (_, i) => faceAt(i / HZ)), a = new Float32Array(n);
    for (const [src, dst] of [[r, a], [a, faceS]]) { let acc = w * src[0]; for (let i = 0; i < n; i++) { acc += src[i] - (i >= w ? src[i - w] : src[0]); dst[i] = acc / w; } }
  }
  const faceAtS = t => { const u = clamp(t * HZ, 0, n - 1), i = Math.floor(u), j = Math.min(n - 1, i + 1); return lerp(faceS[i], faceS[j], u - i); };
  const raw = (t, plant = null) => {
    const i = clamp(Math.round(t * HZ), 0, n - 1);
    const ch = name => [out[name][i * 2], out[name][i * 2 + 1]];
    const g = gaitAt(segs, t, x);
    return skeletonFrom({
      x: g.hip, ground, k, f: faceAtS(t),
      lean: ch('lean')[0] + g.walking * 0.08, tilt: ch('tilt')[0], drop: ch('drop')[0],
      armL: addv(ch('armL'), [swing[i * 2] * g.walking, 0.22 * g.walking]), armR: addv(ch('armR'), [swing[i * 2 + 1] * g.walking, 0.22 * g.walking]),
      legL: ch('legL'), legR: ch('legR'), gait: g, bob: bob[i], plant,
    });
  };
  // ——— pies plantados de pie (E16) ———
  // Parado, un pie apoyado NO se mueve aunque la pose o la orientación cambien (al girar hacia la cámara el pie se
  // deslizaba 16 px en 1/240 s: R9). Si la pose lo quiere en otro lado (> 8·k), da un pasito de 0.22 s, de a un pie.
  const PH = 120, np = Math.ceil(duration * PH) + 2;
  const plantX = new Float32Array(np * 2), plantLift = new Float32Array(np * 2);
  const computePlants = () => {
  const pl = {L: null, R: null}, step = {L: null, R: null};
  for (let j = 0; j < np; j++) {
    const t = j / PH, g = gaitAt(segs, t, x), sk = raw(t);
    const want = {L: sk.lL[2][0], R: sk.lR[2][0]};
    for (const [fi, f] of [[0, 'L'], [1, 'R']]) {
      const ww = g.wWalk ?? 0;
      // caminando del todo: el pie plantado es el del plan de pisadas; en las mezclas (empezar/terminar de caminar)
      // queda fijo donde estaba, para que la mezcla parta y llegue a un pie quieto
      if (pl[f] === null) pl[f] = want[f];
      if (ww >= 0.999) { pl[f] = g.feet[f].x; step[f] = null; }
      else if (ww > 0.001) { step[f] = null; }
      else if (step[f]) {
        const u = (t - step[f].t0) / 0.22;
        if (u >= 1) { pl[f] = step[f].to; step[f] = null; }
      } else if (Math.abs(want[f] - pl[f]) > stepK * k && !step[f === 'L' ? 'R' : 'L']) step[f] = {t0: t, from: pl[f], to: want[f]}; // pasito si la pose lo pide más allá de stepK·k
      let xf = pl[f], lift = 0;
      if (step[f]) { const u = clamp((t - step[f].t0) / 0.22); xf = lerp(step[f].from, step[f].to, minJerk(u)); lift = Math.sin(Math.PI * u) * 7 * k; }
      plantX[j * 2 + fi] = xf; plantLift[j * 2 + fi] = lift;
    }
  }
  };
  computePlants();
  // cada caminata arranca con los pies donde están apoyados (el plan suponía pies a ±3·k de la cadera y la mezcla los
  // arrastraba): las dos primeras pisadas del plan pasan a ser los pies plantados, el de atrás primero
  for (const sg of segs) {
    const j = clamp(Math.round(sg.t0 * PH) - 1, 0, np - 1);
    const xl = plantX[j * 2], xr = plantX[j * 2 + 1];
    const lBehind = sg.dir * xl <= sg.dir * xr;
    sg.swap = !lBehind;
    sg.P[0] = lBehind ? xl : xr;
    sg.P[1] = lBehind ? xr : xl;
  }
  computePlants();
  return {
    duration, ground, k, segs, x0: x,
    /** Esqueleto en t (mismo formato que Figure.skeleton()). */
    at(t) {
      const j = clamp(Math.round(t * PH), 0, np - 1);
      return raw(t, {L: [plantX[j * 2], plantLift[j * 2]], R: [plantX[j * 2 + 1], plantLift[j * 2 + 1]]});
    },
    gaze(t) { const i = clamp(Math.round(t * HZ), 0, n - 1); return [out.gaze[i * 2], out.gaze[i * 2 + 1]]; },
    gait: t => gaitAt(segs, t, x),
  };
}

const addv = (a, b) => [a[0] + b[0], a[1] + b[1]];

/** Plan de pisadas de una caminata recta de x0 a x1 que empieza en t0. */
export function planWalk(x0, x1, t0, speed, k) {
  const dir = Math.sign(x1 - x0) || 1;
  const dist = Math.abs(x1 - x0);
  const D = 36 * k; // largo de paso
  const N = Math.max(2, Math.round(dist / D) + 1);
  const Dd = (dist - 3 * k) / Math.max(0.5, N - 1.5);
  // pisadas: -1 izquierdo (atrás), 0 derecho (adelante), luego alternadas; la última junta los pies
  const P = [x0 - 3 * k * dir, x0 + 3 * k * dir];
  for (let j = 1; j <= N - 1; j++) P.push(x0 + dir * (3 * k + (j - 0.5) * Dd));
  P[P.length - 1] = x1 - 3 * k * dir;
  P.push(x1 + 3 * k * dir);
  // perfil de la cadera: arranque y frenada acotados (aceleración ~ v / 0.45 s)
  const acc = speed / 0.45;
  const tAcc = speed / acc, dAcc = speed * tAcc / 2;
  let vmax = speed, ta = tAcc, da = dAcc;
  if (2 * dAcc > dist) { vmax = Math.sqrt(dist * acc); ta = vmax / acc; da = dist / 2; }
  const tc = (dist - 2 * da) / vmax;
  const T = 2 * ta + tc;
  const sAt = tl => {
    if (tl <= 0) return 0;
    if (tl >= T) return dist;
    if (tl < ta) return 0.5 * acc * tl * tl;
    if (tl < ta + tc) return da + vmax * (tl - ta);
    const u = T - tl;
    return dist - 0.5 * acc * u * u;
  };
  return {x0, x1, dir, t0, T, P, Dd, sAt, k};
}

/** Estado de la marcha en t: cadera, pies, rebote y balanceo de brazos. */
function gaitAt(segs, t, xStart) {
  let hip = xStart;
  for (const s of segs) {
    if (t < s.t0) break;
    const sNow = s.sAt(t - s.t0);
    hip = s.x0 + s.dir * sNow;
    if (t - s.t0 <= s.T + 1e-6) {
      const feet = feetAt(s, hip);
      const walking = clamp(Math.min((t - s.t0) / 0.25, (s.T - (t - s.t0)) / 0.25 + 0.4));
      // peso de la pose de marcha frente a la de pie: entra en 0.3 s (sin saltos de piernas)
      const wWalk = minJerk(clamp((t - s.t0) / 0.3));
      return {hip, feet, walking, moving: true, wWalk, ...vault(s, hip, feet)};
    }
  }
  // de pie: pies a ±3 de la cadera, según el último segmento
  const last = segs.filter(s => t >= s.t0).at(-1);
  const d = last ? last.dir : 1, k = last ? last.k : 1;
  // al terminar de caminar, las piernas pasan de los pies plantados a la pose de pie en 0.35 s
  const since = last ? t - last.t0 - last.T : 1e9;
  const wWalk = 1 - minJerk(clamp(since / 0.35));
  // después de caminar, los pies quedan donde los dejó el plan (antes: hip ± 3k según la dirección, que en una caminata
  // hacia atrás invertía izquierdo y derecho: el pie saltaba 6·k = 16 px al terminar, R9)
  let fL = hip - 3 * k * d, fR = hip + 3 * k * d;
  if (last) { const P = last.P, iL = (P.length - 1) % 2 === 0 ? P.length - 1 : P.length - 2; fL = P[iL]; fR = P[iL === P.length - 1 ? P.length - 2 : P.length - 1]; if (last.swap) [fL, fR] = [fR, fL]; }
  // el peso de la marcha termina en 0.4 al final de la caminata: decae acá (antes caía a 0 en una muestra y el torso y los
  // brazos saltaban, 3.5–4.8 px en la cabeza: R11)
  const walking = last ? 0.4 * (1 - minJerk(clamp(since / 0.3))) : 0;
  return {hip, feet: {L: {x: fL, lift: 0}, R: {x: fR, lift: 0}}, walking, moving: false, bob: 0, armSwing: 0, wWalk};
}

/** Pies durante una caminata, en función de la posición de la cadera (así frenan cuando frena la cadera). */
function feetAt(s, hip) {
  const {P, dir} = s;
  const h = dir * (hip - s.x0); // avance de la cadera
  const rel = x => dir * (x - s.x0);
  const feet = {L: null, R: null};
  // pisada j (j ≥ 2) mueve el pie que estaba en P[j-2] hasta P[j]
  for (const [name, start] of [['L', 0], ['R', 1]]) {
    let pos = P[start], lift = 0;
    for (let j = start + 2; j < P.length; j += 2) {
      const prev = P[j - 2], other = P[j - 1];
      const D = Math.abs(P[j] - prev) || 1;
      // despega cuando la cadera pasa el punto medio entre el pie de atrás y el de adelante; aterriza un cuarto de paso después del de apoyo
      const off = (rel(prev) + rel(other)) / 2;
      const on = j === P.length - 1 ? rel(P[j]) - 3 * s.k : rel(other) + 0.25 * Math.abs(rel(P[j]) - rel(other));
      if (h <= off) break;
      if (h >= on) { pos = P[j]; continue; }
      const u = minJerk((h - off) / Math.max(1e-3, on - off));
      pos = lerp(prev, P[j], u);
      lift = Math.sin(Math.PI * u) * Math.min(9 * s.k, D * 0.3);
      break;
    }
    feet[name] = {x: pos, lift};
  }
  return s.swap ? {L: feet.R, R: feet.L} : feet;
}

/** Péndulo invertido: la cadera sube cuando un solo pie apoya debajo; brazos opuestos a las piernas. */
function vault(s, hip, feet) {
  const L = (BONES.thigh + BONES.shin) * s.k * 0.97;
  const stance = [feet.L, feet.R].filter(f => f.lift < 0.5);
  const dx = stance.length ? Math.min(...stance.map(f => Math.abs(f.x - hip))) : 0;
  const bob = L - Math.sqrt(Math.max(0, L * L - dx * dx)); // cuánto baja la cadera
  const armSwing = clamp((feet.L.x - feet.R.x) / (s.Dd || 30) * s.dir, -1, 1) * 0.6 * (s.swing ?? 1);
  return {bob, armSwing};
}

/** IK de dos huesos: rodilla hacia adelante (según facing). */
export function ik(hip, foot, a, b, f) {
  const dx = foot[0] - hip[0], dy = foot[1] - hip[1];
  const d = clamp(Math.hypot(dx, dy), 1e-3, a + b - 1e-3);
  const base = Math.atan2(dy, dx);
  const cosA = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1);
  const ang = base - Math.sign(f || 1) * Math.acos(cosA);
  return [hip[0] + Math.cos(ang) * a, hip[1] + Math.sin(ang) * a];
}

/** Arma el esqueleto (formato de Figure.skeleton) desde los canales. */
function skeletonFrom({x, ground, k, f, lean, tilt, drop, armL, armR, legL, legR, gait, bob, plant = null}) {
  const front = 1 - Math.abs(f);
  const limb = (base, a1, a2, l1, l2, side) => {
    const fx = f + (1 - Math.abs(f)) * side;
    const j = [base[0] + Math.sin(a1) * fx * l1 * k, base[1] + Math.cos(a1) * l1 * k];
    const a = a1 + a2;
    const e = [j[0] + Math.sin(a) * fx * l2 * k, j[1] + Math.cos(a) * l2 * k];
    return [base, j, e];
  };
  armL = [armL[0] + front * 0.12, armL[1]];
  armR = [armR[0] + front * 0.12, armR[1]];
  // piernas de pie (ángulos de la pose, apoyadas en el suelo)
  const sHip = [x, 0];
  const sl = [legL[0] + front * 0.17, legL[1]], sr = [legR[0] + front * 0.17, legR[1]];
  const sL = limb(sHip, sl[0], sl[1], BONES.thigh, BONES.shin, -1);
  const sR = limb([...sHip], sr[0], sr[1], BONES.thigh, BONES.shin, 1);
  const low = Math.max(sL[1][1], sL[2][1], sR[1][1], sR[2][1]);
  for (const p of new Set([...sL, ...sR])) p[1] += ground - low;
  let hip = sL[0], lL = sL, lR = sR;
  const w = gait.wWalk ?? 0;
  if (plant) {
    // de pie con los pies plantados: la cadera la da la pose; las piernas, por IK hasta donde está apoyado cada pie.
    // Es también el punto de partida de la mezcla con la marcha (si no, al empezar a caminar el pie saltaba: 9.5 px)
    const fL = [plant.L[0], ground - plant.L[1]], fR = [plant.R[0], ground - plant.R[1]];
    lL = [hip, ik(hip, fL, BONES.thigh * k, BONES.shin * k, f), fL];
    lR = [[...hip], ik(hip, fR, BONES.thigh * k, BONES.shin * k, f), fR];
  }
  const sLp = lL, sRp = lR;
  if (w > 0) {
    // piernas de marcha: cadera a la altura que permiten las piernas, pies donde dice el plan (IK)
    const L = (BONES.thigh + BONES.shin) * k * 0.97;
    const wHip = [x, ground - L + bob + drop * k];
    const fL = [gait.feet.L.x, ground - gait.feet.L.lift], fR = [gait.feet.R.x, ground - gait.feet.R.lift];
    const wL = [wHip, ik(wHip, fL, BONES.thigh * k, BONES.shin * k, f), fL];
    const wR = [[...wHip], ik(wHip, fR, BONES.thigh * k, BONES.shin * k, f), fR];
    const mix = (a, b) => a.map((p, i) => [lerp(p[0], b[i][0], w), lerp(p[1], b[i][1], w)]);
    lL = mix(sLp, wL);
    lR = mix(sRp, wR);
    hip = lL[0];
    lR[0] = hip;
  }
  const neck = [hip[0] + Math.sin(lean) * f * BONES.torso * k, hip[1] - Math.cos(lean) * BONES.torso * k];
  const ha = lean + tilt * 0.6;
  const head = [neck[0] + Math.sin(ha) * f * (BONES.neck - 1) * k + tilt * f * 3 * k, neck[1] - Math.cos(ha) * BONES.neck * k];
  const shoulder = [neck[0] - Math.sin(lean) * f * 4 * k, neck[1] + Math.cos(lean) * 4 * k];
  const aL = limb(shoulder, armL[0], armL[1], BONES.upper, BONES.fore, -1);
  const aR = limb([...shoulder], armR[0], armR[1], BONES.upper, BONES.fore, 1);
  return {hip, neck, head, shoulder, lL, lR, aL, aR, f, tilt, k};
}

// ——— Dibujo de la figura con depósito (E15) ———
// Mismo esqueleto y mismas guías que Figure.strokes del motor, pero cada trazo se deposita como la escritura
// (en VS6 la figura con el trazo del motor se veía más manchada que lo escrito: dos texturas en una escena).
import {depositStroke as _dep, drawDeposit as _draw} from './deposit.js';
import {smoothGuide as _smooth, circleGuide as _circle} from '../../src/engine/chalk.js';
import {mulberry32 as _rng} from '../../src/engine/rng.js';

const figCache = new Map();
/** Dibuja el esqueleto `sk` con trazos de depósito. `boil` (0..2) re-sortea el temblor como el motor (vida a 8 cuadros/s). */
export function drawFigureDeposit(ctx, sk, {boil = 0, gaze = [0, 0], blink = 0, w = 5.6, ch = 0} = {}) {
  const k = sk.k;
  const rnd = _rng(1000 + boil * 977);
  const W = w * k;
  const guides = [
    _circle(sk.head[0], sk.head[1], BONES.head * k, rnd, {overshoot: 0.28, start: -1.9 + rnd() * 0.3}),
    _smooth([sk.neck, [(sk.neck[0] + sk.hip[0]) / 2 + 1.2 * sk.f, (sk.neck[1] + sk.hip[1]) / 2], sk.hip], 6),
    _smooth(sk.aL, 6), _smooth(sk.aR, 6), _smooth(sk.lL, 6), _smooth(sk.lR, 6),
    [[sk.head[0], sk.head[1] + BONES.head * k * 0.98], [sk.neck[0], sk.neck[1]]],
  ];
  guides.forEach((g, i) => {
    // sin plan de velocidad (la figura no se está dibujando): estampas parejas, temblor según el hervor
    const st = _dep(g, {w: W, p: 0.95, ch, seed: 2000 + boil * 31 + i, tremor: 0.5 * k, land: false, lift: false, motion: {speed: 4000, accel: 1e6}});
    _draw(ctx, st);
  });
  // ojos
  const f = sk.f, front = 1 - Math.abs(f);
  const ex = sk.head[0] + f * 5 * k + gaze[0] * 3.2 * k, ey = sk.head[1] - 1.5 * k + gaze[1] * 3 * k + sk.tilt * 2 * k;
  const sep = (2.6 + front * 3.4) * k;
  for (const sx of [-1, 1]) {
    const x = ex + sx * sep;
    const g = blink > 0 ? [[x - 1.6 * k, ey], [x + 1.6 * k, ey]] : _circle(x, ey, 0.9 * k, rnd, {overshoot: 0.6});
    _draw(ctx, _dep(g, {w: 2.4 * k, p: 1, ch, seed: 3000 + sx, tremor: 0, land: false, lift: false, motion: {speed: 4000, accel: 1e6}}));
  }
  // la tiza en la mano
  const hand = sk.aR[2], elbow = sk.aR[1];
  const dx = hand[0] - elbow[0], dy = hand[1] - elbow[1], l = Math.hypot(dx, dy) || 1;
  _draw(ctx, _dep([[hand[0] + dx / l, hand[1] + dy / l], [hand[0] + dx / l * 7 * k, hand[1] + dy / l * 7 * k]], {w: 4.6 * k, p: 1, ch, seed: 3100, tremor: 0, land: false, lift: false, motion: {speed: 4000, accel: 1e6}}));
}
