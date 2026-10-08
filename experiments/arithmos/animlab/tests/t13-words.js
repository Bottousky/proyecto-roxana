// TEST 13 (E13) — escribir palabras: «puntos» y «esta mañana».
// A: fuente Kalam con barrido rectangular (motor actual, `Label.reveal`).
// B: la misma fuente, revelada letra por letra con ritmo de mano (cada letra un barrido corto; pausas entre letras y palabras).
// C: minúsculas de un trazo (glyphs.js) escritas con el plan de mano, como las cifras.

import {chalkText} from '../../src/engine/chalk.js';
import {glyphGuides, GLYPHS, sideGap} from '../core/glyphs.js';
import {depositStroke, drawDeposit, depositTip, depositSpeed} from '../core/deposit.js';
import {liftTime, clamp} from '../core/motion.js';

const WORDS = ['puntos', 'esta mañana'];
const SIZE = 80; // alto de cifra; la altura x es 0.6 de esto
const ROWS = {A: 190, B: 470, C: 760};
const X0 = 300;
let C = [], Bplan = [], T0 = 0.4, Aend = 0;

function planC() {
  let t = T0, x = X0, last = null, seed = 1;
  const out = [];
  for (const [wi, word] of WORDS.entries()) {
    if (wi) { x += 0.75 * SIZE; t += 0.18; }
    for (const ch of word) {
      if (ch === ' ') { x += 0.42 * SIZE; t += 0.12; continue; }
      for (const g of glyphGuides(ch, x, ROWS.C, SIZE, {seed: seed++, slant: 0.06})) {
        if (last) t += liftTime(Math.hypot(g[0][0] - last[0], g[0][1] - last[1]));
        const st = depositStroke(g, {w: SIZE * 0.13, p: 0.9, seed: seed++, down: 0.14, motion: {speed: SIZE * 6.5, accel: SIZE * 110, k0: 1 / (SIZE * 0.4), v0: 25, v1: 35}});
        out.push({st, t});
        t += st.T;
        last = g.at(-1);
      }
      x += (GLYPHS[ch].adv + 2 * sideGap(ch) - 0.05) * SIZE; // las minúsculas se apoyan unas en otras (kerning de mano)
      t += 0.02;
    }
  }
  return {strokes: out, end: t};
}

export default {
  title: 'palabras · A fuente + barrido · B fuente letra a letra · C minúsculas de un trazo',
  duration: 0,
  setup(lab) {
    const c = planC();
    C = c.strokes;
    // A y B duran lo mismo que C (comparación justa)
    Aend = c.end;
    // B: tiempos por letra proporcionales al ancho de la letra en la fuente
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `400 ${SIZE * 0.95}px Tiza`;
    const total = WORDS.join('   ');
    const widths = [...total].map(ch => ctx.measureText(ch).width);
    const writeT = c.end - T0 - 0.18 - 0.12 - widths.length * 0.05;
    const sumW = widths.reduce((a, b) => a + b, 0);
    let t = T0, x = 0;
    for (const [i, ch] of [...total].entries()) {
      const d = ch === ' ' ? 0.06 : writeT * widths[i] / sumW;
      Bplan.push({ch, x, w: widths[i], t0: t, t1: t + d});
      t += d + (ch === ' ' ? 0.06 : 0.05);
      x += widths[i];
    }
    this.duration = c.end + 0.8;
  },
  render(lab, t, ctx) {
    const text = WORDS.join('   ');
    chalkText(ctx, text, X0, ROWS.A, {size: SIZE * 0.95, reveal: clamp((t - T0) / (Aend - T0))});
    // B: se dibuja el texto entero recortado letra por letra
    ctx.save();
    ctx.beginPath();
    for (const L of Bplan) {
      const k = clamp((t - L.t0) / (L.t1 - L.t0));
      if (k > 0) ctx.rect(X0 + L.x - 2, ROWS.B - SIZE * 1.4, L.w * k + 2, SIZE * 2.2);
    }
    ctx.clip();
    chalkText(ctx, text, X0, ROWS.B, {size: SIZE * 0.95});
    ctx.restore();
    for (const s of C) drawDeposit(ctx, s.st, t - s.t);
    lab.tag('A', 'A · fuente + barrido (motor)', 40, ROWS.A - 30);
    lab.tag('B', 'B · fuente letra a letra', 40, ROWS.B - 30);
    lab.tag('C', 'C · minúsculas de un trazo', 40, ROWS.C - 30);
  },
  probe(lab, t) {
    const h = C.find(s => t >= s.t && t <= s.t + s.st.T);
    return {C: {v: h ? depositSpeed(h.st, t - h.t) : 0}};
  },
};
