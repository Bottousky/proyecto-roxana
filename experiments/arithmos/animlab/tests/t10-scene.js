// TEST 10 — microescena «¿Cuántos son?» (~25 s): personaje + tiza + matemática + cámara + sonido + transformación.
//
// Guion: el alumno entra caminando; la cámara llega antes; Punto se dibuja a su lado y mira la Ronda (7 puntos).
// Punto salta de punto en punto contando; con cada salto el alumno escribe una marca (la 5.ª cruza las cuatro:
// el atado de cinco). Debajo del atado escribe «5», debajo del par «2», un «+», da un paso y escribe «= 7».
// Comprende; Punto rebota; la cámara se aleja para relacionar los puntos, las marcas y la cuenta.
//
// Cantidad concreta → agrupación → número → expresión: el cambio de representación es la escena (TEST 04).

import {Figure} from '../../src/engine/figure.js';
import {BLUE} from '../../src/engine/chalk.js';
import {buildActor, ik, drawFigureDeposit} from '../core/actor.js';
import {POSES2} from '../core/poses.js';
import {depositStroke, drawDeposit, drawDepositCached, depositTip, depositSpeed} from '../core/deposit.js';
import {glyphGuides, GLYPHS} from '../core/glyphs.js';
import {circleGuide} from '../core/gesture.js';
import {blobOutline, fillPressure, groupContour} from '../core/blob.js';
import {cameraTrack} from '../core/camera2.js';
import {countNote} from '../core/score.js';
import {liftTime, minJerk, clamp, lerp} from '../core/motion.js';

const G = 900, K = 2.7;
// entra desde fuera de cuadro (R2: «nadie entra»): el plano abre sobre la Ronda y el alumno aparece por la izquierda
const X0 = 690, X1 = 1130; // R3: a 735 asomaban brazo y pie en el borde a t = 0
const SH = {dx: 4, dy: -(64 * K * 0.97 + 46 * K - 4 * K)}; // hombro respecto de (x, suelo), de pie
const REACH = (25 + 24 + 8) * K * 0.97; // brazo + tiza
const DOTS = [[1500, 520], [1585, 470], [1640, 560], [1560, 615], [1710, 490], [1690, 615], [1770, 555]];
// la escritura va a la derecha de la cabeza (radio ≈ 42) y a escala de mano: letras ≈ 8 % del alto de la figura
// (t10a: las marcas tapaban la cabeza y el paso al costado tapaba lo escrito)
const TALLY = {x: X1 + 58, top: G - 300, bot: G - 266, gap: 13, pairDx: 64}; // R3: ≥ 8 px entre marcas a 1600 y grupos separados
const NUM = {y: G - 226, size: 34}; // pegado bajo las marcas: deja lugar a la llave y al 7 dentro del alcance
const W = 5.5;

let S; // escena construida

/** Toques del jugador por defecto (modo automático): los 7 puntos en orden, con el ritmo del guion original. */
export function autoTaps(order = [0, 1, 2, 3, 4, 5, 6]) {
  let t = 5.1, n = 0;
  const out = [];
  const seen = new Set();
  // reposo ≥ 0.3 s entre saltos (R3: Punto nunca quedaba quieto) y 0.4 s más tras el quinto (el atado de cinco es la idea)
  for (const dot of order) { out.push({t, dot}); const again = seen.has(dot); seen.add(dot); t += again ? 1.4 : 0.5 - 0.035 * n + 0.32 + (n === 4 ? 0.4 : 0); if (!again) n++; }
  return out;
}

function build(taps = autoTaps()) {
  const sc = {strokes: [], hand: [], score: [], punto: [], rings: [], links: [], marks: {}, events: {}};
  const ev = (k, t) => { sc.events[k] = +t.toFixed(2); };
  const chalk = (guide, seed, o = {}) => depositStroke(guide, {w: W, p: 0.9, seed, down: 0.14, ...o, motion: {speed: 560, accel: 5000, k0: 1 / 30, ...(o.motion || {})}}); // ≤ 5000 px/s² (R7)
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
  // 3. contar: el jugador toca un punto de la Ronda; Punto salta ahí. Si es nuevo: anillo, hilo y marca.
  //    Si ya estaba contado: Punto niega con el cuerpo («ya está») y no hay marca nueva (contar cada uno una sola vez).
  //    Los saltos se aceleran con la cuenta (contar agarra ritmo). Sin los 7, la escena espera.
  let t = T_PUNTO + 1.1, from = P0, n = 0;
  const counted = new Set();
  sc.waitFrom = t;
  for (const tap of taps) {
    if (n >= 7) break;
    t = Math.max(t, tap.t);
    const i = tap.dot;
    const again = counted.has(i);
    const dur = again ? 0.4 : 0.5 - 0.035 * n;
    const to = [DOTS[i][0], DOTS[i][1] - 36]; // se posa arriba del punto, sin pisar el anillo (R2)
    sc.punto.push({kind: 'hop', t, dur, from, to, h: 36 + 8 * (n === 0)});
    const land = t + dur;
    from = to;
    if (again) {
      sc.punto.push({kind: 'no', t: land + 0.3, at: to});
      // el anillo de ese punto se repasa: «este ya está» (la tiza enfatiza repasando, no brillando)
      sc.rings.push({t: land + 0.35, dot: i, again: true, st: depositStroke(circleGuide(DOTS[i][0], DOTS[i][1], 18, {seed: 140 + i, wob: 0.05, sweep: Math.PI * 2 + 0.4}), {w: 4.6, p: 0.85, ch: BLUE, seed: 150 + i, motion: {speed: 700}})});
      sc.score.push({type: 'note', t: land + 0.3, freq: 233, dur: 0.18, gain: 0.05}, {type: 'note', t: land + 0.5, freq: 220, dur: 0.22, gain: 0.05});
      ev(`ya contado ${i}`, land);
      t = land + 1.0;
      continue;
    }
    counted.add(i);
    // anillo celeste (relación, no selección de interfaz): imperfecto, de grosor variable, apenas después del aterrizaje
    sc.rings.push({t: land + 0.05, dot: i, st: depositStroke(circleGuide(DOTS[i][0], DOTS[i][1], 16 + 3 * Math.sin(i * 2.3), {seed: 40 + i, wob: 0.06, from: -Math.PI / 2 + 0.35 + i * 0.9, sweep: Math.PI * 2 + 0.3 + 0.12 * (i % 4)}), {w: 4.2, p: 0.8, ch: BLUE, seed: 50 + i, motion: {speed: 520}})});
    sc.score.push({type: 'note', t: land, freq: countNote(n), dur: 0.25, gain: 0.06});
    // la marca n (por orden de conteo, no por punto)
    let guide;
    if (n < 4) { const x = TALLY.x + n * TALLY.gap; guide = [[x + 2, TALLY.top], [x - 1, TALLY.bot]]; }
    else if (n === 4) guide = [[TALLY.x - 8, TALLY.bot - 8], [TALLY.x + 3 * TALLY.gap + 10, TALLY.top + 6]];
    else { const x = TALLY.x + TALLY.pairDx + (n - 5) * TALLY.gap; guide = [[x + 2, TALLY.top], [x - 1, TALLY.bot]]; }
    // el hilo celeste: del punto contado a su marca. Sale hacia arriba, pasa por encima de la Ronda y baja sobre la marca
    // (no tapa la cara, no cruza el atado ni otros anillos: t10i, cache-cmp, t10k)
    const mid = guide[0];
    const a = [DOTS[i][0] - 6, DOTS[i][1] - 22], b = [mid[0] + 1, mid[1] - 5];
    // cada hilo con su propio arco (abanico): se pueden seguir uno por uno hasta su marca (R5)
    const c = [(a[0] + b[0]) / 2 + 40 + (n - 3) * 30, Math.min(...DOTS.map(d => d[1])) - 115 - Math.abs(n - 3) * 12];
    const link = Array.from({length: 25}, (_, k) => { const u = k / 24; return [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]]; });
    // el hilo nace de la marca recién escrita y sube hasta su punto (R7: «cada hilo nace de su marca»)
    const linkSt = depositStroke(link.reverse(), {w: 2.6, p: 0.46, ch: BLUE, seed: 80 + i, motion: {speed: 1500, accel: 16000}});
    const markEnd = write(chalk(guide, 60 + n, {motion: {speed: n === 4 ? 900 : 620}}), land + 0.1, `marca${n}`);
    sc.links.push({t: markEnd + 0.04, st: linkSt});
    n++;
    t = land + 0.1;
  }
  sc.counted = n;
  sc.pending = DOTS.map((_, k) => k).filter(k => !counted.has(k));
  sc.idleFrom = t + 0.4;
  if (n < 7) { // falta contar: la escena espera al jugador
    sc.duration = Infinity;
    sc.actor = buildActor({ground: G, x: X0, k: K, duration: Math.max(30, t + 30), poses: POSES2, script: baseScript(T_PUNTO, taps.length ? taps[0].t + 0.3 : Infinity)});
    sc.camera = cameraTrack(cameraShots(T_PUNTO, Infinity));
    return sc;
  }
  ev('fin de contar', t);
  // 4. Punto agrupa en la Ronda: corre alrededor de los cinco primeros contados y deja un lazo celeste mientras el alumno
  //    escribe «5»; después alrededor de los dos últimos mientras escribe «+» y «2» (R5: la partición 5 | 2 tiene que
  //    verse en los puntos, no sólo en las marcas). Al terminar, vuelve a la cabeza del alumno.
  const order = [...counted];
  // jerarquía (R5/t10u): el lazo (el grupo) más firme que los hilos (cada correspondencia)
  // si los grupos se entremezclan en el espacio (el jugador contó salteado), un lazo quedaría dentro del otro y se leería
  // como "grupo dentro de grupo": entonces cada grupo se enhebra como un hilo de cuentas, en el orden en que se contó
  const g5 = order.slice(0, 5).map(k => DOTS[k]), g2 = order.slice(5).map(k => DOTS[k]);
  const nested = g2.some(p => insideHull(p, g5, 27)) || g5.some(p => insideHull(p, g2, 27));
  const groupGuide = (pts, seed) => nested ? groupContour(pts, {r: 24, w: 10}) : lassoGuide(pts, 27, seed);
  const lasso = (pts, seed) => depositStroke(groupGuide(pts, seed), {w: 4.2, p: 0.82, ch: BLUE, seed, motion: {speed: 640, accel: 2500, v0: 8, v1: 10, k0: 1 / 40}});
  const L5 = lasso(g5, 170), L2 = lasso(g2, 171);
  sc.groupStyle = nested ? 'contorno' : 'lazo';
  const startOf = st => [st.path.x[0], st.path.y[0]], endOf = st => [st.path.x.at(-1), st.path.y.at(-1)];
  const sz = NUM.size;
  const writeGlyph = (ch, x, y, size, seed, color = 0) => {
    for (const g of glyphGuides(ch, x, y, size, {seed})) {
      const prev = sc.hand.at(-1);
      const end = [prev.st.path.x.at(-1), prev.st.path.y.at(-1)];
      t = Math.max(t, prev.t1 + liftTime(Math.hypot(g[0][0] - end[0], g[0][1] - end[1])));
      t = write(chalk(g, seed++, {ch: color}), t, ch);
    }
    t += 0.04;
  };
  let tp = t + 0.3;
  sc.punto.push({kind: 'hop', t: tp, dur: 0.45, from, to: startOf(L5), h: 40});
  tp += 0.45 + 0.25;
  sc.punto.push({kind: 'trace', t: tp - 0.14, st: L5});
  sc.links.push({t: tp, st: L5});
  sc.score.push({type: 'chalk', t0: tp, t1: tp + L5.T, speed: tt => depositSpeed(L5, tt - tp)});
  ev('escribe 5 y 2', tp);
  t = tp;
  writeGlyph('5', TALLY.x + 1.5 * TALLY.gap - GLYPHS['5'].adv * sz / 2, NUM.y, sz, 101);
  tp = Math.max(tp + L5.T, t) + 0.15;
  sc.punto.push({kind: 'hop', t: tp, dur: 0.4, from: endOf(L5), to: startOf(L2), h: 30});
  tp += 0.4 + 0.2;
  sc.punto.push({kind: 'trace', t: tp - 0.14, st: L2});
  sc.links.push({t: tp, st: L2});
  sc.score.push({type: 'chalk', t0: tp, t1: tp + L2.T, speed: tt => depositSpeed(L2, tt - tp)});
  t = Math.max(t, tp);
  // «+» a 1.3× la cifra: en el plano final de 844×390 queda ≥ 12 px CSS (R5: medía 8.6)
  writeGlyph('+', TALLY.x + (1.5 * TALLY.gap + TALLY.pairDx + TALLY.gap / 2) / 2 - GLYPHS['+'].adv * sz * 0.65, NUM.y, sz * 1.3, 121);
  writeGlyph('2', TALLY.x + TALLY.pairDx + TALLY.gap / 2 - GLYPHS['2'].adv * sz / 2, NUM.y, sz, 111);
  // 6. la unión: mientras el alumno dibuja la llave que junta 5 y 2 (en el papel), Punto rodea los siete con un lazo grande
  //    (en la Ronda): el mismo gesto en las dos representaciones. Después, quietud ≥ 0.4 s y recién el «7» (R6).
  const LALL = depositStroke(lassoGuide(DOTS, 58, 172), {w: 4.6, p: 0.86, ch: BLUE, seed: 172, motion: {speed: 760, accel: 2500, v0: 8, v1: 10, k0: 1 / 60}});
  tp = Math.max(tp + L2.T, t) + 0.2;
  sc.punto.push({kind: 'hop', t: tp, dur: 0.45, from: endOf(L2), to: startOf(LALL), h: 40});
  tp += 0.45 + 0.2;
  const T_STEP = tp;
  ev('une los grupos', T_STEP);
  sc.punto.push({kind: 'trace', t: tp - 0.14, st: LALL});
  sc.links.push({t: tp, st: LALL});
  sc.score.push({type: 'chalk', t0: tp, t1: tp + LALL.T, speed: tt => depositSpeed(LALL, tt - tp)});
  t = Math.max(t, tp);
  {
    const bx0 = TALLY.x - 4, bx1 = TALLY.x + TALLY.pairDx + TALLY.gap + 6, by = NUM.y + 10, bm = (bx0 + bx1) / 2;
    const brace = [[bx0, by], [bx0 + 6, by + 9], [bm - 10, by + 11], [bm, by + 21], [bm + 10, by + 11], [bx1 - 6, by + 9], [bx1, by]];
    const prev = sc.hand.at(-1);
    t = Math.max(t, prev.t1 + liftTime(Math.hypot(brace[0][0] - prev.st.path.x.at(-1), brace[0][1] - prev.st.path.y.at(-1))));
    // la llave dura lo mismo que el lazo grande (se dibujan juntos)
    const braceSt = chalk(brace, 125, {motion: {speed: Math.max(160, 520 * (brace.length * 18) / Math.max(1, LALL.T * 520))}});
    t = write(braceSt, t, 'llave');
    // quietud: la mano y Punto se detienen antes del resultado
    t = Math.max(t, tp + LALL.T) + 0.6;
    ev('quieto antes del 7', t);
    writeGlyph('7', bm - GLYPHS['7'].adv * sz / 2, by + 21 + sz + 6, sz, 141);
  }
  sc.punto.push({kind: 'hop', t: t + 0.15, dur: 0.6, from: endOf(LALL), toFn: perchAt, h: 60});
  sc.punto.push({kind: 'perch', t: t + 0.15 + 0.95});
  sc.score.push({type: 'note', t: t + 0.75, freq: 392, dur: 0.2, gain: 0.04});
  ev('escribe 7', t);
  // 7. comprende: el alumno se abre, Punto rebota dos veces; la cámara se aleja
  // primero se aleja para mirar lo hecho; la comprensión llega al ver el conjunto (y el brazo ya no pasa por la escritura)
  const T_BACK = t + 0.35;
  const T_GET = T_BACK + 0.15 + 1.35 + 0.4;
  ev('comprende', T_GET);
  sc.punto.push({kind: 'bounce', t: T_GET + 0.15, n: 2});
  sc.score.push({type: 'note', t: T_GET + 0.15, freq: 523, dur: 0.6, gain: 0.05}, {type: 'note', t: T_GET + 0.32, freq: 659, dur: 0.6, gain: 0.045}, {type: 'note', t: T_GET + 0.5, freq: 784, dur: 0.9, gain: 0.04});
  sc.T_GET = T_GET;
  sc.duration = T_GET + 2.6; // R3: ≤ 1 s quieto al final
  // ——— actor ———
  sc.actor = buildActor({ground: G, x: X0, k: K, duration: sc.duration, poses: POSES2, script: [
    ...baseScript(T_PUNTO, Math.max(5.0, taps[0].t + 0.3)),
    {t: sc.events['fin de contar'] + 0.1, pose: 'think', gaze: [0.5, 0.2]},
    {t: sc.events['escribe 5 y 2'] - 0.25, pose: 'write', gaze: [0.6, 0.4]},
    {t: T_STEP, pose: 'write', overrides: {drop: 8}, gaze: [0.8, 0.6]},           // dobla apenas las rodillas para escribir más abajo
    // anticipación: se encoge y el brazo baja por debajo de la ecuación antes de subir (R3/VS2: barría por encima de «5+2=7»)
    {t: T_BACK, pose: 'lookDown', overrides: {armR: [0.15, 0.35]}, gaze: [0.6, 0.3]},   // baja el brazo y anticipa el paso atrás
    {t: T_BACK + 0.15, walk: {to: X1 - 170, speed: 190, back: true, swing: 0.25}, face: 0.6, overrides: {armR: [-0.1, 0.3]}},      // dos pasos atrás (de ¾: las piernas no se funden, R5)
    {t: T_BACK + 0.2, pose: 'lookDown', gaze: [0.7, 0.6]},                              // mira lo que escribió (cabeza abajo)
    {t: T_GET - 0.5, pose: 'lookUp', gaze: [1, -0.7]},                                  // levanta la cabeza hacia la Ronda (los ojos primero: canal de mirada más rápido)
    {t: T_GET - 0.12, pose: 'lookDown'},                                                // micro-encogida
    {t: T_GET, pose: 'eureka', face: 0.9, gaze: [1, -0.5]},                             // ¡ya está! (el brazo sube lejos de la escritura)
    {t: T_GET + 1.0, pose: 'open', gaze: [0.2, -0.3]},
  ]});
  // pasos al sonido: cuando un pie vuelve a apoyar
  let prev = null;
  for (let tt = 0; tt < sc.duration; tt += 1 / 120) {
    const g = sc.actor.gait(tt);
    if (prev) for (const f of ['L', 'R']) if (prev.feet[f].lift > 0.3 && g.feet[f].lift <= 0.3) sc.score.push({type: 'step', t: tt, strength: 0.5});
    prev = g;
  }
  // ——— cámara: general → medio (llega antes de que aparezca Punto) → abre al final ———
  sc.camera = cameraTrack(cameraShots(T_PUNTO, T_BACK));
  return sc;
}

/** Lo que hace el alumno hasta terminar de contar (compartido por la escena completa y la que espera al jugador). */
function baseScript(T_PUNTO, writeAt = 5.0) {
  return [
    {t: 0, pose: 'stand', face: 1},
    {t: 0.6, walk: {to: X1, speed: 165}},
    {t: 3.9, pose: 'stand', gaze: [0.7, -0.6]},
    {t: T_PUNTO + 0.15, pose: 'surprise', gaze: [0.6, -0.9]},       // ¡un punto! (se vuelve hacia nosotros)
    {t: T_PUNTO + 0.8, pose: 'stand', gaze: [0.9, -0.5]},
    // espera mirando la Ronda; levanta la tiza recién con el primer toque (antes quedaba con el brazo arriba esperando)
    {t: Math.min(5.0, writeAt), pose: 'stand', gaze: [1, -0.3]},
    {t: writeAt, pose: 'write', gaze: [1, -0.4]},
  ];
}

// ——— Punto ———
function puntoAt(t) {
  let pos = null, sl = 1, ang = Math.PI / 2, fill = 0;
  for (const p of S.punto) {
    if (t < p.t) break;
    const tl = t - p.t;
    if (p.kind === 'appear') { pos = p.at; fill = clamp(tl / p.dur); if (tl < p.dur) sl = 1; }
    else if (p.kind === 'hop') {
      if (p.toFn) p.to = p.toFn(p.t + p.dur);
      if (tl >= p.dur + 0.35) { pos = p.to; continue; }
      const crouch = 0.12; // anticipación 80–140 ms (lenguaje visual; R3)
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
    } else if (p.kind === 'no') {
      if (tl < 0.8) { pos = [p.at[0] + 15 * Math.sin(tl * 24) * Math.exp(-tl * 3.2), p.at[1]]; sl = 1 + 0.08 * Math.abs(Math.sin(tl * 26)) * Math.exp(-tl * 4); ang = 0; }
      else pos = p.at;
    } else if (p.kind === 'trace') {
      // se encoge 0.14 s antes de arrancar (anticipación) y se asienta al terminar (R7: arrancaba y frenaba en seco)
      const pre = 0.14, u = tl - pre;
      pos = depositTip(p.st, clamp(u, 0, p.st.T)); ang = Math.PI / 2;
      if (u < 0) sl = 1 - 0.2 * minJerk(tl / pre);
      else if (u < p.st.T) { sl = lerp(0.8, 1.06, clamp(u / 0.15)); ang = 0; }
      else { const k = (u - p.st.T) / 0.35; sl = 1 - 0.18 * Math.exp(-k * 5) * Math.cos(k * 11); }
    } else if (p.kind === 'perch') {
      pos = perchAt(t);
    } else if (p.kind === 'bounce') {
      const per = 0.36, i = Math.floor(tl / per), at = perchAt(t);
      if (i < p.n) { const u = (tl % per) / per; pos = [at[0], at[1] - 4 * 26 * u * (1 - u)]; sl = u < 0.15 || u > 0.85 ? 0.82 : 1.1; }
      else pos = at;
    }
  }
  // esperando al jugador: cada 1.8 s Punto se inclina y da un saltito hacia el próximo punto sin contar (sin texto: «ese»)
  if (pos && S.counted < 7 && t > S.idleFrom) {
    const next = DOTS[S.pending[0]];
    const ph = ((t - S.idleFrom) % 1.8) / 1.8;
    if (next && ph < 0.3) {
      const u = ph / 0.3, dx = next[0] - pos[0], dy = next[1] - pos[1], l = Math.hypot(dx, dy) || 1;
      const hump = Math.sin(Math.PI * u);
      pos = [pos[0] + dx / l * 12 * hump, pos[1] + dy / l * 12 * hump - 14 * hump];
      sl = 1 + 0.15 * hump; ang = Math.atan2(dy, dx);
    }
  }
  return pos ? {pos, sl, ang, fill} : null;
}

/** Lazo que rodea un grupo de puntos: el borde de la envolvente convexa engordada (suma de Minkowski con un disco),
 *  arrancando arriba a la izquierda, antihorario, con un leve sobrepaso al cerrar y algo de temblor. */
function lassoGuide(pts, pad, seed) {
  const g = [], n = 56, a0 = -Math.PI / 2 - 0.7;
  for (let k = 0; k <= n + 4; k++) {
    const a = a0 - (k / n) * Math.PI * 2;
    const ux = Math.cos(a), uy = Math.sin(a);
    let best = pts[0], bv = -Infinity;
    for (const p of pts) { const v = p[0] * ux + p[1] * uy; if (v > bv) { bv = v; best = p; } }
    const r = pad * (1 + 0.06 * Math.sin(k * 0.7 + seed));
    g.push([best[0] + ux * r, best[1] + uy * r]);
  }
  return g;
}

/** ¿p cae dentro de la envolvente de pts engordada `pad`? (para decidir si dos lazos se superpondrían) */
function insideHull(p, pts, pad) {
  if (pts.length === 1) return Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]) < pad * 2;
  for (let k = 0; k < 64; k++) {
    const a = (k / 64) * Math.PI * 2, ux = Math.cos(a), uy = Math.sin(a);
    const support = Math.max(...pts.map(q => q[0] * ux + q[1] * uy)) + pad;
    if (p[0] * ux + p[1] * uy > support) return false; // hay una dirección que lo separa
  }
  return true;
}

/** Hilo de cuentas: una curva suave que pasa por los puntos del grupo en el orden en que se contaron (y se pasa un poco). */
function beadString(pts) {
  const ext = (a, b, k) => [a[0] + (a[0] - b[0]) * k, a[1] + (a[1] - b[1]) * k];
  const P = pts.length > 1 ? [ext(pts[0], pts[1], 0.25), ...pts, ext(pts.at(-1), pts.at(-2), 0.25)] : [[pts[0][0] - 25, pts[0][1]], pts[0], [pts[0][0] + 25, pts[0][1]]];
  const g = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < 10; k++) {
      const t = k / 10, t2 = t * t, t3 = t2 * t;
      g.push([0, 1].map(j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  g.push(P.at(-1));
  return g;
}

/** Arriba de la cabeza del alumno, donde Punto se posa (en el hombro quedaba tapado por la cabeza: t10r). */
function perchAt(t) {
  const sk = S.actor.at(t);
  return [sk.head[0] - 4 * Math.sign(sk.f || 1), sk.head[1] - 15.5 * K - 24]; // separado del contorno de la cabeza
}

/** Planos: medio fijo; al aparecer Punto se acerca (la causa es Punto) y llega antes de contar; se abre al alejarse el alumno. */
function cameraShots(T_PUNTO, T_BACK) {
  const shots = [{t: 0, cx: 1440, cy: 600, w: 1250}, {t: T_PUNTO + 0.45, cx: 1470, cy: 598, w: 1100, arrive: T_PUNTO + 1.1}]; // el pie apoya dentro del cuadro (R7)
  if (Number.isFinite(T_BACK)) shots.push({t: T_BACK + 0.15, cx: 1385, cy: 600, w: 1220}); // empieza con el paso atrás
  return shots;
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
  setup(lab) {
    // ?taps=0,1,2,2,3,4,5,6 → orden de toques en modo automático (p. ej. para ver el «ya está» de un punto repetido)
    const order = lab.params.get('taps')?.split(',').map(Number);
    this.taps = lab.params.has('interactive') ? [] : autoTaps(order);
    S = build(this.taps);
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
      const ring = S.rings.find(r => r.dot === i);
      const land = ring ? ring.t - 0.05 : Infinity;
      // mientras la escena espera al jugador, los puntos sin contar respiran más (invitan a tocarlos)
      const invite = S.counted < 7 && !ring && t > S.waitFrom ? 0.08 : 0.03;
      const hit = t > land ? Math.exp(-(t - land) * 7) * Math.cos((t - land) * 16) * 0.2 : 0;
      const sl = 1 - hit;
      fillPressure(ctx, blobOutline(x, y + 2 * hit * 8, 8.5 * (1 + invite * Math.sin(t * 2.6 + i)), {ang: Math.PI / 2, sl, sw: 1 / sl, boil: frame % 3, seed: 20 + i}), 0, 0.74, [x, y], 9);
    });
    // lo terminado se dibuja desde su bitmap (se estampa una sola vez); `?nocache` para comparar
    const draw = lab.params.has('nocache') ? drawDeposit : drawDepositCached;
    for (const r of S.rings) draw(ctx, r.st, t - r.t);
    for (const l of S.links) draw(ctx, l.st, t - l.t);
    for (const s of S.strokes) draw(ctx, s.st, t - s.t);
    // alumno
    const sk = S.actor.at(t);
    const arm = writingArm(t, sk);
    this._err = arm.err;
    fig._sk = sk;
    fig.gaze = S.actor.gaze(t);
    fig.facing = sk.f;
    fig.time = t;
    fig.blink = (t % 3.3) < 0.11 ? 0.1 : 0;
    // ?figura=motor dibuja con el trazo del motor (comparación A/B); por defecto, con depósito (misma textura que lo escrito)
    if (lab.params.get('figura') === 'motor') fig.render(ctx, null, frame);
    else drawFigureDeposit(ctx, sk, {boil: frame % 3, gaze: fig.gaze, blink: fig.blink});
    // Punto
    const p = puntoAt(t);
    if (p) {
      const breathe = 1 + 0.03 * Math.sin(t * Math.PI);
      const r = 15 * breathe * (0.35 + 0.65 * p.fill);
      fillPressure(ctx, blobOutline(p.pos[0], p.pos[1], r, {ang: p.ang, sl: p.sl, sw: 1 / p.sl, boil: frame % 3, seed: 3}), 0, 0.72 * Math.min(1, p.fill * 1.4), p.pos, r * 1.15);
    }
  },
  renderDust(lab, t, ctx) {
    // Punto arrastra un poco de polvo al saltar: rastro tenue que se asienta en ~1.5 s (R2: «pizarrón sin historia»)
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineWidth = 30; ctx.filter = 'blur(4px)';
    for (const p of S.punto) {
      if (p.kind !== 'hop' || t < p.t) continue;
      const u1 = clamp((t - p.t - 0.07) / (p.dur - 0.07)), age = Math.max(0, t - p.t - p.dur);
      const a = 0.05 * Math.exp(-age / 1.5);
      if (a < 0.004 || u1 <= 0) continue;
      ctx.globalAlpha = a;
      ctx.beginPath();
      for (let u = 0; u <= u1 + 1e-6; u += 0.05) { const x = lerp(p.from[0], p.to[0], u), y = lerp(p.from[1], p.to[1], u) - 4 * p.h * u * (1 - u); u ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    ctx.restore();
    // la quinta marca, al cruzar las cuatro, levanta un poco de polvo en cada cruce (R5)
    const m5 = S.strokes.find(x => x.tag === 'marca4');
    if (m5 && t > m5.t) {
      const [x0, y0] = [TALLY.x - 8, TALLY.bot - 8], [x1, y1] = [TALLY.x + 3 * TALLY.gap + 10, TALLY.top + 6];
      ctx.save();
      for (let k = 0; k < 4; k++) {
        const xk = TALLY.x + k * TALLY.gap, u = (xk - x0) / (x1 - x0);
        const tc = m5.t + u * m5.st.T;
        if (t < tc) continue;
        const a = 0.06 + 0.06 * Math.exp(-(t - tc) / 1.5);
        const y = y0 + (y1 - y0) * u;
        const gr = ctx.createRadialGradient(xk, y, 0, xk, y, 9);
        gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(xk, y, 9, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  },
  score() { return S.score; },
  /** Interacción: tocar un punto de la Ronda mientras se cuenta. Devuelve true si la escena cambió. */
  onPointer(lab, t, [wx, wy]) {
    if (!lab.params.has('interactive') || S.counted >= 7 || t < S.waitFrom - 0.3) return false;
    // radio de toque: 46 px de mundo o lo que haga falta para ≥ 52 px CSS de diámetro (R4: en 844×390 eran ~5 px)
    let best = -1, bd = Math.max(46, 26 / (lab.view.scale / lab.view.dpr));
    DOTS.forEach(([x, y], i) => { const d = Math.hypot(wx - x, wy - y); if (d < bd) { bd = d; best = i; } });
    if (best < 0) return false;
    this.taps.push({t, dot: best});
    S = build(this.taps);
    this.duration = S.duration;
    return true;
  },
  probe(lab, t) {
    const h = S.hand.find(h => t >= h.t0 && t <= h.t1);
    const p = puntoAt(t);
    const sk = S.actor.at(t);
    return {headUp: +(-(sk.head[0] - sk.neck[0]) * 0 + (sk.neck[1] - sk.head[1])).toFixed(2), tilt: +Math.atan2(sk.head[0] - sk.neck[0], sk.neck[1] - sk.head[1]).toFixed(3), handH: G - sk.aR[2][1], torso: +Math.atan2(sk.neck[0] - sk.hip[0], sk.hip[1] - sk.neck[1]).toFixed(3), contact: h ? depositSpeed(h.st, t - h.t0) : 0, punto: p ? {x: p.pos[0], h: G - p.pos[1], squash: +(p.sl * 100).toFixed(1)} : null, cam: S.camera.at(t)[2]};
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
