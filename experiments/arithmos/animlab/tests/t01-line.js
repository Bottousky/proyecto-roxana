// TEST 01 — línea. Tres técnicas, mismo dibujo, mismo pizarrón:
//  A. motor actual: polilínea con presión por segmentos ('lighten'), progreso lineal en el tiempo (d.draw);
//  B. depósito por estampas + plan de velocidad de la mano (ley 2/3, aceleración acotada, levantadas de Fitts);
//  C. SVG: stroke-dashoffset con ease-in-out y filtro feTurbulence/feDisplacementMap (lo típico en la web).
// Cada fila: una línea larga deliberada y tres marcas cortas seguidas (para ver arranques, frenadas y levantadas).

import {stroke, drawStroke, lineGuide, strokeTip} from '../../src/engine/chalk.js';
import {mulberry32} from '../../src/engine/rng.js';
import {depositStroke, drawDeposit, depositTip, depositSpeed} from '../core/deposit.js';
import {liftTime, clamp} from '../core/motion.js';

const ROWS = {A: 230, B: 470, C: 710};
const X0 = 300, X1 = 1180;
const T0 = 0.4;

function guides(y, seed) {
  const rnd = mulberry32(seed);
  const long = lineGuide(X0, y, X1, y + 6, rnd, 0.01);
  const ticks = [0, 1, 2].map(i => lineGuide(1250 + i * 34, y - 34, 1236 + i * 34, y + 30, rnd, 0.03));
  return [long, ...ticks];
}

/** Línea de tiempo de una lista de trazos: arranque, duración y levantada entre trazos. */
function schedule(durs, guides) {
  const out = [];
  let t = T0;
  for (let i = 0; i < durs.length; i++) {
    if (i > 0) {
      const a = guides[i - 1].at(-1), b = guides[i][0];
      t += liftTime(Math.hypot(b[0] - a[0], b[1] - a[1]));
    }
    out.push({start: t, dur: durs[i]});
    t += durs[i];
  }
  return out;
}

const easeInOutCss = t => { // cubic-bezier(.42,0,.58,1) aproximada (la de CSS ease-in-out)
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

let A, B, C, gA, gB, gC, schedB, schedA, schedC;

export default {
  title: 'línea · A motor actual · B depósito + mano · C SVG dash',
  duration: 0,
  setup(lab) {
    gA = guides(ROWS.A, 7); gB = guides(ROWS.B, 7).map(g => g.map(([x, y]) => [x, y])); gC = guides(ROWS.C, 7);
    // B: la duración surge del plan de la mano
    B = gB.map((g, i) => depositStroke(g, {w: 8.5, p: 0.9, seed: 20 + i, motion: i === 0 ? {speed: 620} : {speed: 900, accel: 9000}}));
    schedB = schedule(B.map(s => s.T), gB);
    // A y C usan las mismas duraciones totales por trazo (comparación justa); A con el mismo hueco entre trazos
    A = gA.map((g, i) => stroke(g, {w: 3.4, seed: 30 + i}));
    schedA = schedule(B.map(s => s.T), gA);
    schedC = schedule(B.map(s => s.T), gC);
    const end = schedB.at(-1);
    this.duration = end.start + end.dur + 0.6;
    // C: SVG
    const NS = 'http://www.w3.org/2000/svg';
    lab.svg.innerHTML = `<defs><filter id="chalkC" x="-5%" y="-50%" width="110%" height="200%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="9" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.2 1.75" result="mask"/>
      <feComposite in="d" in2="mask" operator="in"/></filter></defs>`;
    gC.forEach((g, i) => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', 'M' + g.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L'));
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', '#eeeee6');
      p.setAttribute('stroke-width', '4');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('filter', 'url(#chalkC)');
      p.id = `c${i}`;
      lab.svg.append(p);
    });
    C = gC.map((_, i) => { const el = lab.svg.querySelector(`#c${i}`); return {el, L: el.getTotalLength()}; });
  },
  render(lab, t, ctx) {
    A.forEach((s, i) => {
      const {start, dur} = schedA[i];
      drawStroke(ctx, s, clamp((t - start) / dur)); // lineal, como d.draw
    });
    B.forEach((s, i) => drawDeposit(ctx, s, t - schedB[i].start));
    C.forEach(({el, L}, i) => {
      const {start, dur} = schedC[i];
      const k = easeInOutCss((t - start) / dur);
      el.style.strokeDasharray = `${L}`;
      el.style.strokeDashoffset = `${L * (1 - k)}`;
      el.style.visibility = k > 0 ? 'visible' : 'hidden';
    });
    lab.tag('A', 'A · motor actual (lineal)', 40, ROWS.A);
    lab.tag('B', 'B · depósito + plan de mano', 40, ROWS.B);
    lab.tag('C', 'C · SVG dash + filtro', 40, ROWS.C);
  },
  probe(lab, t) {
    const tipA = (() => { const i = schedA.findLastIndex(s => t >= s.start); if (i < 0) return null; const k = clamp((t - schedA[i].start) / schedA[i].dur); return {i, k, xy: strokeTip(A[i], k), v: k < 1 ? A[i].len / schedA[i].dur : 0}; })();
    const tipB = (() => { const i = schedB.findLastIndex(s => t >= s.start); if (i < 0) return null; const tl = t - schedB[i].start; return {i, xy: depositTip(B[i], tl), v: tl < B[i].T ? depositSpeed(B[i], tl) : 0}; })();
    const tipC = (() => { const i = schedC.findLastIndex(s => t >= s.start); if (i < 0) return null; const k = clamp((t - schedC[i].start) / schedC[i].dur); const e = 0.0005; return {i, v: k < 1 ? C[i].L * (easeInOutCss(k + e) - easeInOutCss(k - e)) / (2 * e) / schedC[i].dur : 0}; })();
    return {A: tipA, B: tipB, C: tipC};
  },
  metrics(lab) {
    // franja de 700 px de la línea larga ya dibujada: pico de presión, ancho y carga (integral) por columna
    const stat = arr => {
      const m = arr.reduce((a, b) => a + b, 0) / arr.length;
      const sd = Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length);
      // autocorrelación: a 2-3 px delata cuentas periódicas por segmento; a 12 px, ondulación lenta
      const ac = lag => { let n = 0, d = 0; for (let i = 0; i + lag < arr.length; i++) { n += (arr[i] - m) * (arr[i + lag] - m); d += (arr[i] - m) ** 2; } return d ? n / d : 0; };
      return {mean: +m.toFixed(3), cv: +(sd / (m || 1)).toFixed(3), ac2: +ac(2).toFixed(2), ac12: +ac(12).toFixed(2)};
    };
    const band = y => {
      const c = window.__lab.columns(X0 + 90, y - 16, 700, 40);
      return {peak: stat(c.peak), width: stat(c.width), load: stat(c.sum), holes: c.peak.filter(p => p < 0.3).length};
    };
    return {
      A: band(ROWS.A),
      B: band(ROWS.B),
      timing: {B: B.map(s => ({L: +s.L.toFixed(0), T: +s.T.toFixed(3), vmax: Math.round(Math.max(...s.plan.v))})), gapsB: schedB.map(s => +s.start.toFixed(3))},
    };
  },
};
