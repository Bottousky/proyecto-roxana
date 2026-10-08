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
import {planWalk, buildActor, ik, drawFigureDeposit} from '../core/actor.js';
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

/** Duración del salto n del conteo: se acorta 12 % por salto (el 3.º dura 77 % del 1.º; contar agarra ritmo). */
const hopDur = n => Math.max(0.26, 0.5 * Math.pow(0.88, n));

/** Toques del jugador por defecto (modo automático): los 7 puntos en orden, con el ritmo del guion original. */
export function autoTaps(order = [0, 1, 2, 3, 4, 5, 6]) {
  let t = 5.1, n = 0;
  const out = [];
  const seen = new Set();
  // reposo ≥ 0.3 s entre saltos (R3: Punto nunca quedaba quieto) y 0.4 s más tras el quinto (el atado de cinco es la idea)
  for (const dot of order) { out.push({t, dot}); const again = seen.has(dot); seen.add(dot); t += again ? 1.4 : hopDur(n) + 0.32 + (n === 4 ? 0.4 : 0); if (!again) n++; }
  return out;
}

function build(taps = autoTaps()) {
  const sc = {strokes: [], hand: [], score: [], punto: [], rings: [], links: [], marks: {}, events: {}, gaze: []};
  const ev = (k, t) => { sc.events[k] = +t.toFixed(2); };
  // aceleración ≤ 5000 px/s² y además proporcional a la velocidad: la rampa dura ≥ 0.12 s y se ve a 60 Hz (R8: un trazo lento
  // llegaba a crucero en menos de un cuadro y la curva parecía una pared)
  const chalk = (guide, seed, o = {}) => { const sp = o.motion?.speed ?? 560; return depositStroke(guide, {w: W, p: 0.9, seed, down: 0.14, ...o, motion: {speed: sp, accel: Math.min(5000, sp / 0.12), v0: 15, v1: 30, k0: 1 / 30, ...(o.motion || {}), accel: Math.min(5000, sp / 0.12)}}); };
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
    const dur = again ? 0.4 : hopDur(n);
    const to = [DOTS[i][0], DOTS[i][1] - 36]; // se posa arriba del punto, sin pisar el anillo (R2)
    // más bajos cuanto más rápidos (altura ∝ vuelo^1.5; con gravedad sería ∝ T²): R13, pico/media 2.1–2.6 en los saltos 5–7
    sc.punto.push({kind: 'hop', t, dur, from, to, h: again ? 30 : Math.max(14, 44 * ((dur - 0.12) / 0.38) ** 1.5)});
    // los ojos van al punto antes de que Punto llegue (la mirada lidera) y después bajan a la marca
    // R11: la cabeza quedaba fija 5.8–10.4 s (sólo se movían los ojos, ±3 px): ahora la mirada Y la cabeza van al punto
    // ~0.1 s antes del despegue (agachada 0.12 s) y bajan a la marca al escribir
    { const hx = X1 + 6, hy = G - 335, dx = DOTS[i][0] - hx, dy = DOTS[i][1] - hy, l = Math.hypot(dx, dy);
      const look = {gaze: [dx / l, dy / l * 1.4], overrides: {tilt: -0.1 + 0.8 * Math.atan2(dy, dx), lean: 0.05}};
      sc.gaze.push({t: t + 0.02, ...look});
      if (n === 0 && !again) sc.gaze.push({t: t + 0.301, ...look}); // la pose de escribir (t + 0.3) borra los ajustes: se repite
    }
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
    sc.gaze.push({t: land + 0.02, gaze: [0.55, 0.55], overrides: {tilt: 0.28, lean: 0.1}});
    const markEnd = write(chalk(guide, 60 + n, {motion: {speed: n === 4 ? 900 : 620}}), land + 0.1, `marca${n}`);
    sc.links.push({t: markEnd + 0.04, st: linkSt, i, n, b, seed: 80 + i});
    if (n === 4) ev('cierra el atado de cinco (pausa de 0.4 s)', markEnd);
    n++;
    t = land + 0.1;
  }
  sc.counted = n;
  sc.pending = DOTS.map((_, k) => k).filter(k => !counted.has(k));
  sc.idleFrom = t + 0.4;
  if (n < 7) { // falta contar: la escena espera al jugador
    sc.duration = Infinity;
    sc.actor = buildActor({ground: G, x: X0, k: K, duration: Math.max(30, t + 30), poses: POSES2, script: [...baseScript(T_PUNTO, taps.length ? taps[0].t + 0.3 : Infinity), ...sc.gaze]});
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
  let g5 = order.slice(0, 5).map(k => DOTS[k]), g2 = order.slice(5).map(k => DOTS[k]);
  const nested = g2.some(p => insideHull(p, g5, 27)) || g5.some(p => insideHull(p, g2, 27));
  // si los grupos se entremezclan (conteo salteado), los puntos SE JUNTAN antes de los lazos: agrupar es acercar
  // (R8: los contornos de grupos entremezclados se cruzaban). Los hilos y los anillos acompañan a su punto.
  sc.regroup = null;
  if (nested) {
    const slots5 = [[1530, 500], [1600, 470], [1625, 545], [1560, 590], [1500, 560]], slots2 = [[1740, 520], [1770, 590]];
    const assign = (idx, slots) => { const free = [...slots], m = new Map(); for (const k of idx) { let bi = 0, bd = Infinity; free.forEach((q, j) => { const d = Math.hypot(DOTS[k][0] - q[0], DOTS[k][1] - q[1]); if (d < bd) { bd = d; bi = j; } }); m.set(k, free.splice(bi, 1)[0]); } return m; };
    const targets = new Map([...assign(order.slice(0, 5), slots5), ...assign(order.slice(5), slots2)]);
    sc.regroup = {t0: t + 0.35, dur: 0.75, stagger: 0.07, targets, order};
    g5 = order.slice(0, 5).map(k => targets.get(k)); g2 = order.slice(5).map(k => targets.get(k));
    ev('se juntan', sc.regroup.t0);
    t += 0.35 + 0.75 + 0.07 * 6 + 0.25;
  }
  const groupGuide = (pts, seed) => lassoGuide(pts, 27, seed);
  const lasso = (pts, seed) => depositStroke(groupGuide(pts, seed), {w: 4.2, p: 0.82, ch: BLUE, seed, motion: {speed: 640, accel: 2500, v0: 8, v1: 10, k0: 1 / 40, smooth: 90}});
  const L5 = lasso(g5, 170), L2 = lasso(g2, 171);
  sc.groupStyle = nested ? 'se juntan + lazo' : 'lazo';
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
  sc.punto.push({kind: 'hop', t: tp, dur: 0.45, from, to: startOf(L5), h: 40, brake: true});
  ev('Punto va al primer grupo', tp);
  tp += 0.45 + 0.4; // Punto quieto 0.4 s antes del lazo y del 5 (R12: 0.25)
  sc.punto.push({kind: 'trace', t: tp - 0.14, st: L5});
  const tL5 = tp;
  sc.links.push({t: tp, st: L5});
  sc.score.push({type: 'chalk', t0: tp, t1: tp + L5.T, speed: tt => depositSpeed(L5, tt - tp)});
  t = tp;
  writeGlyph('5', TALLY.x + 1.5 * TALLY.gap - GLYPHS['5'].adv * sz / 2, NUM.y, sz, 101);
  ev('escribe el 5', sc.strokes.find(x => x.tag === '5').t);
  ev('lazo de 5', tp);
  tp = Math.max(tp + L5.T, t) + 0.15;
  sc.punto.push({kind: 'hop', t: tp, dur: 0.4, from: endOf(L5), to: startOf(L2), h: 30, brake: true});
  tp += 0.4 + 0.4; // quieto 0.4 s antes del lazo de 2, el + y el 2 (R12: 0.20)
  sc.punto.push({kind: 'trace', t: tp - 0.14, st: L2});
  const tL2 = tp;
  sc.links.push({t: tp, st: L2});
  sc.score.push({type: 'chalk', t0: tp, t1: tp + L2.T, speed: tt => depositSpeed(L2, tt - tp)});
  t = Math.max(t, tp);
  // «+» a 1.3× la cifra: en el plano final de 844×390 queda ≥ 12 px CSS (R5: medía 8.6)
  writeGlyph('+', TALLY.x + (1.5 * TALLY.gap + TALLY.pairDx + TALLY.gap / 2) / 2 - GLYPHS['+'].adv * sz * 0.65, NUM.y, sz * 1.3, 121);
  writeGlyph('2', TALLY.x + TALLY.pairDx + TALLY.gap / 2 - GLYPHS['2'].adv * sz / 2, NUM.y, sz, 111);
  ev('lazo de 2', tp);
  // al cerrarse cada lazo, los hilos de sus puntos se juntan en UN hilo: del atado de marcas al lazo (contar de a uno →
  // el grupo). Es movimiento de lo que ya está, no un fundido: cada hilo desliza sus dos extremos hasta coincidir.
  // el hilo de 5 llega al lado cercano de su lazo con un arco bajo; el de 2, por arriba a la derecha bajando de lo alto
  // (así no cruza el lazo de 5 ni el otro hilo)
  const top5 = Math.min(...L5.path.y);
  const gatherOf = (idx, st, t0, score, ctrl) => {
    const ls = sc.links.filter(l => l.i != null && idx.includes(l.i));
    const b = [ls.reduce((a, l) => a + l.b[0], 0) / ls.length, Math.min(...ls.map(l => l.b[1]))];
    let a = null, best = -Infinity;
    for (let k = 0; k < st.path.n; k++) { const q = [st.path.x[k], st.path.y[k]], v = score(q); if (v > best) { best = v; a = q; } }
    return {idx, t0, a, b, c: ctrl(a, b)};
  };
  sc.gather = [
    gatherOf(order.slice(0, 5), L5, tL5 + L5.T + 0.1, q => -q[1] - 0.8 * q[0], (a, b) => [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 45]), // el lado cercano, arco bajo: el de 2 pasa por encima sin cruzarlo
    gatherOf(order.slice(5), L2, tL2 + L2.T + 0.1, q => 0.6 * q[0] - q[1], a => [a[0] - 20, Math.min(top5, a[1]) - 210]),
  ];
  ev('se juntan los hilos de 5', sc.gather[0].t0);
  ev('se juntan los hilos de 2', sc.gather[1].t0);
  ev('escribe el +', sc.strokes.find(x => x.tag === '+').t);
  ev('escribe el 2', sc.strokes.find(x => x.tag === '2').t);
  // 6. la unión: mientras el alumno dibuja la llave que junta 5 y 2 (en el papel), Punto rodea los siete con un lazo grande
  //    (en la Ronda): el mismo gesto en las dos representaciones. Después, quietud ≥ 0.4 s y recién el «7» (R6).
  // arranca y cierra del lado que mira a la llave: de ahí sale el hilo hacia el 7 (R10: salía de arriba y cruzaba el «2»)
  const cxR = DOTS.reduce((a, d) => a + d[0], 0) / DOTS.length, cyR = DOTS.reduce((a, d) => a + d[1], 0) / DOTS.length;
  const braceEnd = [TALLY.x + TALLY.pairDx + TALLY.gap + 6, NUM.y + 10];
  const LALL = depositStroke(lassoGuide(DOTS, 58, 172, Math.atan2(braceEnd[1] - cyR, braceEnd[0] - cxR)), {w: 4.6, p: 0.86, ch: BLUE, seed: 172, motion: {speed: 760, accel: 2500, v0: 8, v1: 10, k0: 1 / 60, smooth: 90}});
  tp = Math.max(tp + L2.T, t) + 0.42; // quietud ≥ 0.35 s con «5+2» escrito antes de unir (R11: 0.31 s)
  sc.punto.push({kind: 'hop', t: tp, dur: 0.45, from: endOf(L2), to: startOf(LALL), h: 40, brake: true});
  tp += 0.45 + 0.4; // quieto 0.4 s antes de unir (R12: 0.20)
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
    ev('dibuja la llave', t);
    t = write(braceSt, t, 'llave');
    // de los lazos al 7 (R9): al cerrar el lazo grande, Punto sigue de largo y dibuja un hilo celeste hasta la punta de la
    // llave; se queda ahí, quieto, mientras se escribe el 7 (los siete puntos → la llave → el 7)
    const tip = [bx1 + 3, by + 1], e0 = endOf(LALL);
    const ctrl = [tip[0] + (e0[0] - tip[0]) * 0.35, Math.max(e0[1], tip[1]) + 40];
    const carryG = Array.from({length: 30}, (_, k) => { const u = k / 29; return [(1 - u) ** 2 * e0[0] + 2 * (1 - u) * u * ctrl[0] + u * u * tip[0], (1 - u) ** 2 * e0[1] + 2 * (1 - u) * u * ctrl[1] + u * u * tip[1]]; });
    const CARRY = depositStroke(carryG, {w: 3.6, p: 0.78, ch: BLUE, seed: 173, motion: {speed: 700, accel: 2500, v0: 10, v1: 10, smooth: 90}});
    const tc = tp + LALL.T;
    sc.punto.push({kind: 'trace', t: tc, st: CARRY, pre: 0}); // sigue de largo: misma velocidad de salida y entrada (10 px/s)
    sc.links.push({t: tc, st: CARRY});
    sc.score.push({type: 'chalk', t0: tc, t1: tc + CARRY.T, speed: tt => depositSpeed(CARRY, tt - tc)});
    ev('hilo a la llave', tc);
    // quietud: la mano y Punto se detienen antes del resultado
    const still0 = Math.max(t, tc + CARRY.T);
    ev('quietos (mano y Punto)', still0);
    t = still0 + 0.6;
    sc.T_UNION = tc + CARRY.T;
    sc.carryEnd = endOf(CARRY);
    ev('empieza el 7', t + 0.0);
    sc.seven = {x: bm - GLYPHS['7'].adv * sz / 2, top: by + 21 + 6, w: GLYPHS['7'].adv * sz}; // para medir la textura
    sc.braceBox = {x: bx0 + 10, y: by - 4, w: bx1 - bx0 - 20, h: 30};
    sc.braceFull = {x: bx0 - 4, y: by - 6, w: bx1 - bx0 + 8, h: 34};
    writeGlyph('7', bm - GLYPHS['7'].adv * sz / 2, by + 21 + sz + 6, sz, 141);
  }
  sc.punto.push({kind: 'hop', t: t + 0.15, dur: 0.6, from: sc.carryEnd, toFn: perchAt, h: 60});
  sc.punto.push({kind: 'perch', t: t + 0.15 + 0.95});
  sc.score.push({type: 'note', t: t + 0.75, freq: 392, dur: 0.2, gain: 0.04});
  ev('termina el 7', t);
  // 7. comprende: el alumno se abre, Punto rebota dos veces; la cámara se aleja
  // primero se aleja para mirar lo hecho; la comprensión llega al ver el conjunto (y el brazo ya no pasa por la escritura)
  const T_BACK = t + 0.35;
  // la comprensión empieza recién cuando el paso atrás terminó y el alumno quedó quieto ≥ 0.4 s (R13: la reacción caía
  // sobre los pasos). Fin de la caminata del plan de pisadas + 0.35 s de mezcla de piernas + 0.25 s de pasito + 0.4 s quieto + 0.62 s de
  // contramovimiento antes del «¡ya está!»
  const T_WALK_END = T_BACK + 0.15 + planWalk(X1, X1 - 170, 0, 190, K).T;
  const T_GET = T_WALK_END + 0.35 + 0.25 + 0.4 + 0.62; // + 0.25: el pasito de acomodarse (si lo hay) termina antes de la quietud
  ev('termina el paso atrás', T_WALK_END);
  ev('contramovimiento (baja la cabeza)', T_GET - 0.62);
  ev('levanta la vista a la Ronda', T_GET - 0.5);
  ev('comprende', T_GET); // «¡ya está!»: el brazo sube ~0.14 s después (retraso del canal del brazo), tras su contramovimiento
  sc.punto.push({kind: 'bounce', t: T_GET + 0.15, n: 2});
  sc.score.push({type: 'note', t: T_GET + 0.15, freq: 523, dur: 0.6, gain: 0.05}, {type: 'note', t: T_GET + 0.32, freq: 659, dur: 0.6, gain: 0.045}, {type: 'note', t: T_GET + 0.5, freq: 784, dur: 0.9, gain: 0.04});
  sc.T_GET = T_GET;
  sc.duration = T_GET + 2.6; // R3: ≤ 1 s quieto al final
  // ——— actor ———
  // stepK 14: parado, el pie sólo da un pasito si la pose lo quiere a más de 14·k (con 8·k la comprensión caía sobre pasitos, R13)
  sc.actor = buildActor({ground: G, x: X0, k: K, duration: sc.duration, poses: POSES2, stepK: 14, script: [
    ...baseScript(T_PUNTO, Math.max(5.0, taps[0].t + 0.3)),
    ...sc.gaze,
    {t: sc.events['fin de contar'] + 0.1, pose: 'think', gaze: [0.5, 0.2]},
    {t: sc.events['escribe el 5'] - 0.75, pose: 'write', gaze: [0.6, 0.4]},          // se prepara antes de la pausa de lectura (R12)
    {t: T_STEP, pose: 'write', overrides: {drop: 8}, gaze: [0.8, 0.6]},           // dobla apenas las rodillas para escribir más abajo
    // anticipación: se encoge y el brazo baja por debajo de la ecuación antes de subir (R3/VS2: barría por encima de «5+2=7»)
    {t: T_BACK, pose: 'lookDown', overrides: {armR: [0.15, 0.35]}, gaze: [0.6, 0.3]},   // baja el brazo y anticipa el paso atrás
    {t: T_BACK + 0.15, walk: {to: X1 - 170, speed: 190, back: true, swing: 0.25}, face: 0.6, overrides: {armR: [-0.1, 0.3]}},      // dos pasos atrás (de ¾: las piernas no se funden, R5)
    {t: T_BACK + 0.2, pose: 'lookDown', gaze: [0.7, 0.6]},                              // mira lo que escribió (cabeza abajo)
    {t: T_WALK_END - 0.1, face: 0.9},                                                    // se acomoda de frente a lo escrito al terminar el paso (si hace falta un pasito, es parte del paso, no de la comprensión: R13)
    {t: T_GET - 0.62, pose: 'lookDown', face: 0.9, overrides: {tilt: 0.55}},                        // contramovimiento: baja un poco más antes de levantar la cabeza
    {t: T_GET - 0.5, pose: 'lookUp', face: 0.9, gaze: [1, -0.7]},                                  // levanta la cabeza hacia la Ronda (los ojos primero)
    {t: T_GET - 0.12, pose: 'lookUp', face: 0.9, overrides: {tilt: -0.2, drop: 3, armR: [0.05, 0.85]}}, // micro-encogida: el brazo baja antes de subir (contramovimiento, R15)                 // micro-encogida pequeña (antes bajaba la cabeza 0.6 rad: vaivén)
    // ¡ya está! (el brazo sube lejos de la escritura); las piernas quedan como estaban: la comprensión es del torso para arriba
    // (R13: la pose de eureka abría las piernas y el alumno daba dos pasitos justo al comprender)
    {t: T_GET, pose: 'eureka', face: 0.9, gaze: [1, -0.5], overrides: {legL: POSES2.lookUp.legL, legR: POSES2.lookUp.legR, armR: [2.15, -0.2]}}, // brazo arriba y adelante, hacia la Ronda (vertical pasaba por la cabeza)
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
const R_PUNTO = 15;
function puntoAt(t) {
  let pos = null, sl = 1, ang = Math.PI / 2, fill = 0;
  for (const p of S.punto) {
    if (t < p.t) break;
    const tl = t - p.t;
    if (p.kind === 'appear') {
      // nace de un toque: una mota que se hincha con sobrepaso y se asienta (R11: crecía lineal, como un fundido de escala)
      pos = p.at;
      const k = Math.max(0, tl - 0.05) / p.dur;
      fill = tl < 0.05 ? 0.12 : 1 - 0.88 * Math.exp(-k * 7.5) * Math.cos(k * 7.5); // sobrepaso ≈ 7 % (VL: ≤ 8 %)
      sl = tl < 0.05 ? 1 : 1 + 0.12 * Math.exp(-k * 5) * Math.sin(k * 11);
    }
    else if (p.kind === 'hop') {
      if (p.toFn) p.to = p.toFn(p.t + p.dur);
      if (tl >= p.dur + 0.35) { pos = p.toFn ? p.toFn(t) : p.to; if (p.toFn) sl = perchSquash(t); continue; } // si el destino se mueve (la cabeza), lo sigue
      // salto en cuatro fases (R11: el vuelo arrancaba a velocidad plena y frenaba en seco, y el estiramiento saltaba en un
      // cuadro): agachada → impulso (acelera mientras se estira) → vuelo balístico → aterrizaje que absorbe (sigue de largo
      // con la misma velocidad y vuelve, x·e^(−τ/τ0): velocidad continua, sobrepaso ≤ 8 % del salto)
      const crouch = 0.12, push = 0.07, M = p.dur - crouch;
      const a = Math.min(push / M, 0.35);                     // fracción del vuelo que dura el impulso (≤ 35 %: queda crucero)
      // perfil de velocidad (fracción del crucero): rampa 0 → 1 en el impulso, crucero, y frenada en el aire hasta `lam` antes
      // de tocar el suelo (lam = 0 con `brake`: aterriza para empezar a trazar enseguida; si no, 0.55 y el resto lo absorbe
      // el aterrizaje con sobrepaso). Integrado: u(s) = ∫v / área
      const b = a, lam = p.brake ? 0 : 0.55, A = 1 - a / 2 - b * (1 - lam) / 2;
      const warp = s => (s < a ? s * s / (2 * a) : s < 1 - b ? a / 2 + (s - a) : a / 2 + (1 - a - b) + (s - 1 + b) - (1 - lam) * (s - 1 + b) ** 2 / (2 * b)) / A;
      const flightSl = u => 1.18 - 0.18 * Math.abs(2 * u - 1);
      if (tl < crouch) { sl = Math.min(sl, 1 - 0.22 * minJerk(tl / crouch)); pos = [p.from[0], p.from[1] + R_PUNTO * (1 - sl)]; } // se agacha: la base apoyada, el centro baja
      else if (tl < p.dur) {
        const sN = (tl - crouch) / M, u = warp(sN);
        pos = [lerp(p.from[0], p.to[0], u), lerp(p.from[1], p.to[1], u) - 4 * p.h * u * (1 - u)];
        sl = sN < a ? lerp(0.78, flightSl(u), minJerk(sN / a)) : flightSl(u);                 // el estiramiento se libera en el impulso
        if (sN < a) pos[1] += R_PUNTO * 0.22 * (1 - minJerk(sN / a));                         // el centro sube desde la agachada
        ang = Math.atan2((p.to[1] - p.from[1]) - 4 * p.h * (1 - 2 * u), p.to[0] - p.from[0]);
      } else {                                                                                // aterriza, sigue de largo, vuelve y se asienta
        const tau = tl - p.dur, base = p.toFn ? p.toFn(t) : p.to;
        const vx = lam * (p.to[0] - p.from[0]) / (M * A);                                     // velocidad al tocar el suelo
        const dist = Math.abs(p.to[0] - p.from[0]) || 1;
        const tau0 = Math.min(0.08, 0.06 * dist * Math.E / (Math.abs(vx) || 1));            // sobrepaso = vx·τ0/e ≤ 6 % del salto (VL: ≤ 8 %)
        // termina exactamente en el destino a los 0.3 s (el siguiente salto o gesto puede empezar ahí): se resta el resto
        // con una curva suave de pendiente nula en los extremos (si no, saltaba 2.8 px al terminar)
        const Tset = 0.3, ov = x => vx * x * Math.exp(-x / tau0), sm = clamp(tau / Tset);
        pos = [base[0] + (tau < Tset ? ov(tau) - ov(Tset) * sm * sm * (3 - 2 * sm) : 0), base[1]]; ang = Math.PI / 2;
        // el aplastamiento crece al ritmo de la caída: el centro (que baja r·(1 − sl) con la base apoyada) sigue con la
        // velocidad vertical que traía, se hunde y vuelve, con un pequeño rebote (R12: frenaba de −306 px/s a 0 en un cuadro)
        const vy = Math.max(0, (p.to[1] - p.from[1]) + 4 * p.h) * lam / (M * A);              // velocidad de caída al tocar (dy/du · du/dt)
        const ta = clamp(0.24 * Math.E * R_PUNTO / Math.max(1, vy), 0.025, 0.06);
        const amp = 0.24 * clamp(vy / 250, 0.12, 1);                                         // aterrizaje suave (brake) → casi sin aplastarse: queda quieto para leer
        sl = 1 - amp * (tau / ta) * Math.exp(1 - tau / ta) + amp / 0.24 * 0.05 * Math.sin(Math.PI * clamp((tau - 3 * ta) / 0.16)) * (tau > 3 * ta);
        pos[1] += R_PUNTO * (1 - sl);
      }
    } else if (p.kind === 'no') {
      if (tl < 0.8) { pos = [p.at[0] + 15 * Math.sin(tl * 24) * Math.exp(-tl * 3.2), p.at[1]]; sl = 1 + 0.08 * Math.abs(Math.sin(tl * 26)) * Math.exp(-tl * 4); ang = 0; }
      else pos = p.at;
    } else if (p.kind === 'trace') {
      // se encoge 0.14 s antes de arrancar (anticipación) y se asienta al terminar (R7: arrancaba y frenaba en seco)
      const pre = p.pre ?? 0.14, u = tl - pre;
      pos = depositTip(p.st, clamp(u, 0, p.st.T)); ang = Math.PI / 2;
      if (u < 0) sl = Math.min(sl, 1 - 0.2 * minJerk(tl / pre)); // si todavía se aplasta del aterrizaje, parte de ahí
      else if (u < p.st.T) { const st_ = 1 + 0.07 * clamp(depositSpeed(p.st, u) / 640); sl = pre ? lerp(0.8, st_, clamp(u / 0.15)) : st_; ang = 0; } // se estira según la velocidad (R12)
      else { const tau = u - p.st.T, ta = 0.05, e = 1 + 0.07 * clamp(depositSpeed(p.st, p.st.T) / 640); sl = lerp(e, 1, clamp(tau / 0.06)) - 0.2 * (tau / ta) * Math.exp(1 - tau / ta); pos = [pos[0], pos[1] + R_PUNTO * (1 - sl)]; } // continuo desde el estiramiento final; la base apoyada
    } else if (p.kind === 'perch') {
      pos = perchAt(t); sl = perchSquash(t);
    } else if (p.kind === 'bounce') {
      const per = 0.36, i = Math.floor(tl / per), at = perchAt(t);
      // aplastado en el contacto, estirado en el aire, con transición suave (R11: cambiaba en escalón 0.82 ↔ 1.1)
      if (i < p.n) { const u = (tl % per) / per; pos = [at[0], at[1] - 4 * 26 * u * (1 - u)]; const env = clamp(tl / 0.05) * clamp((p.n * per - tl) / 0.05); sl = 1 + (0.82 + 0.28 * Math.sin(Math.PI * u) ** 0.6 - 1) * env; }
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
function lassoGuide(pts, pad, seed, a0 = -Math.PI / 2 - 0.7) {
  const g = [], n = 56;
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

/** El hilo de una marca a su punto, rehecho si el punto se movió (los hilos son relaciones vivas: siguen a su punto). */
const linkCache = new Map();
function linkFor(l, t) {
  if (l.i == null) return l.st; // los lazos no son hilos
  const moving = S.regroup && t > S.regroup.t0;
  const G_ = S.gather?.find(g => g.idx.includes(l.i));
  const u = G_ ? minJerk(clamp((t - G_.t0 - G_.idx.indexOf(l.i) * GATHER_STAGGER) / GATHER_DUR)) : 0;
  if (!moving && u <= 0) return l.st;
  const p = dotAt(l.i, t), a0 = [p[0] - 6, p[1] - 22], b0 = l.b;
  const c0 = [(a0[0] + b0[0]) / 2 + 40 + (l.n - 3) * 30, Math.min(...DOTS.map(d => d[1])) - 115 - Math.abs(l.n - 3) * 12];
  const L = (q, r) => [lerp(q[0], r[0], u), lerp(q[1], r[1], u)];
  const a = u ? L(a0, G_.a) : a0, b = u ? L(b0, G_.b) : b0, c = u ? L(c0, G_.c) : c0;
  const key = `${l.n}:${a.map(Math.round)},${b.map(Math.round)},${c.map(Math.round)}`;
  if (linkCache.has(key)) return linkCache.get(key);
  const g = Array.from({length: 25}, (_, k) => { const w = k / 24; return [(1 - w) ** 2 * a[0] + 2 * (1 - w) * w * c[0] + w * w * b[0], (1 - w) ** 2 * a[1] + 2 * (1 - w) * w * c[1] + w * w * b[1]]; }).reverse();
  const st = depositStroke(g, {w: 2.6, p: 0.46, ch: BLUE, seed: l.seed, motion: {speed: 1500, accel: 16000}});
  if (linkCache.size > 160) linkCache.clear();
  linkCache.set(key, st);
  return st;
}
const GATHER_DUR = 0.7, GATHER_STAGGER = 0.06;
/** ¿Este hilo ya se fundió con el primero de su grupo? (entonces no se dibuja: coincide con él) */
function gatheredAway(l, t) {
  const G_ = S.gather?.find(g => g.idx.includes(l.i));
  if (!G_ || G_.idx.indexOf(l.i) === 0) return false;
  return t >= G_.t0 + G_.idx.indexOf(l.i) * GATHER_STAGGER + GATHER_DUR;
}

/** Posición de un punto de la Ronda en t (se desplaza si los grupos se juntan). */
function dotAt(i, t) {
  const R = S.regroup, home = DOTS[i];
  if (!R || t <= R.t0) return home;
  const k = R.order.indexOf(i), to = R.targets.get(i);
  const u = minJerk((t - R.t0 - k * R.stagger) / R.dur);
  return [lerp(home[0], to[0], u), lerp(home[1], to[1], u) - Math.sin(Math.PI * u) * 18];
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
/** Posado sobre la cabeza: la aceleración vertical del apoyo lo aplasta (sube) o lo estira (frena o baja). R15: Punto subía
 *  55 px con la cabeza sin ninguna reacción. Aceleración por diferencias centradas a 30 ms (el actor está muestreado a 240 Hz). */
function perchSquash(t) {
  // aceleración promediada con pesos de campana en ±60 ms, hacia atrás en el tiempo (el cuerpo blando responde con retraso):
  // con diferencias puras, los escalones de aceleración de la cabeza lo hacían saltar 98 → 80 → 112 % en 0.05 s
  const h = 0.03, acc = tt => (perchAt(tt + h)[1] - 2 * perchAt(tt)[1] + perchAt(tt - h)[1]) / (h * h);
  let sum = 0, wsum = 0;
  for (let k = 0; k <= 6; k++) { const w = Math.exp(-((k - 3) ** 2) / 4.5); sum += w * acc(t - k * 0.02); wsum += w; }
  return 1 + clamp(sum / wsum * 0.00014, -0.2, 0.12); // + = acelera hacia abajo (y crece hacia abajo) → se estira
}
function perchAt(t) {
  const sk = S.actor.at(t);
  return [sk.head[0] - 4 * Math.sign(sk.f || 1), sk.head[1] - 15.5 * K - 24]; // separado del contorno de la cabeza
}

/** Planos: medio fijo; al aparecer Punto se acerca (la causa es Punto) y llega antes de contar; se abre al alejarse el alumno. */
function cameraShots(T_PUNTO, T_BACK) {
  const shots = [{t: 0, cx: 1440, cy: 600, w: 1250}, {t: T_PUNTO + 0.45, cx: 1470, cy: 598, w: 1100, arrive: T_PUNTO + 0.85}]; // el pie apoya dentro del cuadro (R7)
  if (Number.isFinite(T_BACK)) shots.push({t: T_BACK + 0.5, cx: 1385, cy: 600, w: 1220}); // después del primer paso atrás y de que Punto se posa (R14: tres movimientos juntos)
  return shots;
}

// ——— brazo que escribe ———
const HAND_HOLD = 0.4;
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
      // en las pausas (≥ 0.8 s) la mano llega antes y espera quieta 0.4 s sobre el próximo trazo (VL §5.4; R12: se movía
      // durante toda la pausa)
      if (gap < 1.4) { const T = gap >= 0.8 ? gap - HAND_HOLD : gap, k = minJerk(clamp((t - h.t1) / T)); target = [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(Math.PI * k) * 6]; w = 1; }
      else { // pausa larga: la mano baja y descansa justo debajo de lo escrito, con la tiza lista, y vuelve
        // (R11: volvía a la pose de escribir, con el brazo en alto, y cruzaba las marcas del 5)
        const rest = [Math.min(a[0], b[0]) - 6, NUM.y + 34];
        const out = minJerk(clamp((t - h.t1) / 0.45)), back = minJerk(clamp((next.t0 - HAND_HOLD - t) / 0.45));
        target = t - h.t1 < next.t0 - t ? [lerp(a[0], rest[0], out), lerp(a[1], rest[1], out)] : [lerp(b[0], rest[0], back), lerp(b[1], rest[1], back)];
        w = 1;
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
    DOTS.forEach((_, i) => {
      const [x, y] = dotAt(i, t);
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
    for (const r of S.rings) {
      const [x, y] = dotAt(r.dot, t), [hx, hy] = DOTS[r.dot];
      ctx.save(); ctx.translate(x - hx, y - hy); draw(ctx, r.st, t - r.t); ctx.restore();
    }
    // hilos: ya no se atenúan tras la unión (R12: era un fundido); los de cada grupo se juntan en uno (linkFor).
    // Entre hilos se compone con 'lighten': mientras convergen, dos hilos superpuestos no suman tiza
    for (const l of S.links) {
      if (l.i != null && gatheredAway(l, t)) continue;
      const st = linkFor(l, t);
      if (l.i != null && t - l.t >= st.T) drawDepositCached(ctx, st, Infinity, 1, 'lighten'); else draw(ctx, st, t - l.t);
    }
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
      const r = 15 * breathe * p.fill;
      fillPressure(ctx, blobOutline(p.pos[0], p.pos[1], r, {ang: p.ang, sl: p.sl, sw: 1 / p.sl, boil: frame % 3, seed: 3}), 0, 0.72, p.pos, r * 1.15);
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
    // los puntos que se juntan arrastran un poco de polvo
    if (S.regroup && t > S.regroup.t0) {
      ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineWidth = 16;
      for (const [i] of S.regroup.targets) {
        const a = 0.06 * Math.exp(-Math.max(0, t - S.regroup.t0 - S.regroup.dur - 0.5) / 1.5);
        ctx.globalAlpha = a; ctx.beginPath();
        for (let tt = S.regroup.t0; tt <= Math.min(t, S.regroup.t0 + S.regroup.dur + 0.5); tt += 0.04) { const [x, y] = dotAt(i, tt); tt === S.regroup.t0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.restore();
    }
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
    writingArm(t, sk); // la mano tal como se dibuja (R12: la sonda medía la de la pose, quieta mientras escribía)
    // pies tal como se dibujan (esqueleto), no el plan de pisadas
    return {pieL: +sk.lL[2][0].toFixed(2), pieR: +sk.lR[2][0].toFixed(2), alzaL: +(G - sk.lL[2][1]).toFixed(2), alzaR: +(G - sk.lR[2][1]).toFixed(2), headUp: +(-(sk.head[0] - sk.neck[0]) * 0 + (sk.neck[1] - sk.head[1])).toFixed(2), tilt: +Math.atan2(sk.head[0] - sk.neck[0], sk.neck[1] - sk.head[1]).toFixed(3), handH: G - sk.aR[2][1], torso: +Math.atan2(sk.neck[0] - sk.hip[0], sk.hip[1] - sk.neck[1]).toFixed(3), contact: h ? depositSpeed(h.st, t - h.t0) : 0, punto: p ? {x: p.pos[0], h: G - p.pos[1], squash: +(p.sl * 100).toFixed(1), size: +(p.fill * 100).toFixed(1)} : null, cam: S.camera.at(t)[2], mirada: S.actor.gaze(t).map(v => +v.toFixed(3))};
  },
  metrics(lab) {
    // alcance: ¿la mano llega a cada punto de cada trazo? (error > 0 = la tiza estaría fuera del brazo)
    let maxErr = 0, worst = null;
    for (const h of S.hand) for (let tt = h.t0; tt <= h.t1; tt += 1 / 60) {
      const sk = S.actor.at(tt), tip = depositTip(h.st, tt - h.t0);
      const reach = Math.hypot(tip[0] - sk.shoulder[0], tip[1] - sk.shoulder[1]) - (25 + 32) * K;
      if (reach > maxErr) { maxErr = reach; worst = +tt.toFixed(2); }
    }
    // aceleración real de cada trazo, medida sobre su plan (a = v·dv/ds), sin el ruido del muestreo a 60 Hz
    let aMax = 0, aTag = null;
    for (const h of S.strokes) {
      const {path, plan} = h.st;
      for (let i = 1; i < path.n; i++) {
        const ds = path.s[i] - path.s[i - 1];
        if (ds <= 0) continue;
        const a = Math.abs((plan.v[i] + plan.v[i - 1]) / 2 * (plan.v[i] - plan.v[i - 1]) / ds);
        if (a > aMax) { aMax = a; aTag = h.tag; }
      }
    }
    // textura sobre la presión (antes del compuesto), en el trazo de arriba del 7, en el cuadro final: pico por columna
    // (media, CV), ancho sobre el umbral (CV) y autocorrelación del pico a 2 px de pantalla (≈ 1 = "a cuentas", sin grano)
    let texture = null;
    const api = globalThis.__lab; // las mediciones de presión viven en la API del laboratorio
    const tex = (where, c) => {
      const pk = c.peak.filter(v => v > 0.05), wd = c.width.filter(v => v > 0);
      const mean = a => a.reduce((x, y) => x + y, 0) / a.length, sd = a => Math.sqrt(mean(a.map(v => (v - mean(a)) ** 2)));
      // autocorrelación del grano: antes se resta la tendencia (media móvil de 9 columnas), si no la curvatura de un trazo
      // curvo (la llave) da autocorrelación alta sin que haya "cuentas"
      const m = mean(pk), r = pk.map((v, i) => v - mean(pk.slice(Math.max(0, i - 4), i + 5)));
      const ac = lag => { let n = 0, d = 0; for (let i = lag; i < r.length; i++) n += r[i] * r[i - lag]; for (const v of r) d += v * v; return d ? n / d : 0; };
      return {where, cols: pk.length, peakMean: +m.toFixed(3), peakCV: +(sd(pk) / m).toFixed(3), widthCV: +(sd(wd) / mean(wd)).toFixed(3), autocorr2px: +ac(2).toFixed(3)};
    };
    if (S.seven && api?.columns) texture = [
      tex('llave (cuadro final)', api.columns(S.braceBox.x, S.braceBox.y, S.braceBox.w, S.braceBox.h)),
      tex('trazo de arriba del 7 (cuadro final)', api.columns(S.seven.x + 2, S.seven.top - 6, S.seven.w * 0.7, 14)),
    ];
    // toque y levantada (VL §2): (a) en el depósito de cada trazo escrito (cantidad por estampa: primeros 5 px y últimos
    // 3 px frente al tramo medio), (b) en la presión dibujada a lo largo de la llave (suma por columna en el cuadro final)
    const med = a => { const b = [...a].sort((x, y) => x - y); return b.length ? b[b.length >> 1] : NaN; };
    const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN;
    const per = S.strokes.filter(x => x.st.L > 30).map(({st}) => {
      const mid = st.dabs.filter(d => d.s > st.L * 0.3 && d.s < st.L * 0.7);
      const m = avg(mid.map(d => d.amt));
      const vs = mid.map(d => d.v), am = mid.map(d => d.amt), mv = avg(vs), ma = avg(am);
      let cov = 0, sv = 0, sa = 0; for (let i = 0; i < vs.length; i++) { cov += (vs[i] - mv) * (am[i] - ma); sv += (vs[i] - mv) ** 2; sa += (am[i] - ma) ** 2; }
      return {touch: avg(st.dabs.filter(d => d.s < 5).map(d => d.amt)) / m, lift: avg(st.dabs.filter(d => st.L - d.s < 3).map(d => d.amt)) / m, corrSpeed: sv && sa ? cov / Math.sqrt(sv * sa) : NaN};
    });
    let brace = null;
    if (S.braceFull && api?.columns) {
      const c = api.columns(S.braceFull.x, S.braceFull.y, S.braceFull.w, S.braceFull.h), sc_ = c.sum.length / S.braceFull.w;
      const n5 = Math.max(1, Math.round(5 * sc_)), n14 = Math.max(1, Math.round(14 * sc_)), sum = c.sum.filter(v => v > 0.05);
      const mid = avg(sum.slice(Math.round(sum.length * 0.12), Math.round(sum.length * 0.36))); // brazo izquierdo, sin el pico central
      brace = {touch5px: +(avg(sum.slice(0, n5)) / mid).toFixed(2), lastQuarterOf14px: +(avg(sum.slice(-Math.max(1, n14 >> 2))) / mid).toFixed(2), columns: sum.length};
    }
    const pressure = {strokes: per.length, touchMedian: +med(per.map(x => x.touch)).toFixed(2), liftMedian: +med(per.map(x => x.lift)).toFixed(2), brace};
    const hops = S.punto.filter(p => p.kind === 'hop').map(p => ({t: +p.t.toFixed(3), dur: +p.dur.toFixed(3), brake: !!p.brake}));
    return {events: S.events, duration: +S.duration.toFixed(2), strokes: S.strokes.length, reachOver: +maxErr.toFixed(1), worstAt: worst, chalkAccelMax: Math.round(aMax), chalkAccelAt: aTag, texture, pressure, hops};
  },
};
