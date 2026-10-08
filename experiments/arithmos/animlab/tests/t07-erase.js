// TEST 07 — borrado. El mismo pizarrón con una recta numérica, una cuenta y un círculo.
// Fila A: motor actual (fundido de presión en 0.8 s + fantasma en la capa de polvo).
// Fila B: borrador visible (eraser.js): huella de fieltro, neblina donde había tiza, estrías, polvo que cae.

import {depositStroke, drawDeposit} from '../core/deposit.js';
import {glyphGuides, GLYPHS} from '../core/glyphs.js';
import {circleGuide} from '../core/gesture.js';
import {zigzag, eraserPlan, applyErase, eraserDust, eraserParticles, eraserPose, drawEraser} from '../core/eraser.js';
import {clamp} from '../core/motion.js';

const YA = 250, YB = 650;
const T_ERASE = 0.8;
let rows = {}, er, tmp;

function content(y) {
  const S = (g, seed, o = {}) => depositStroke(g, {w: 7, p: 0.88, seed, ...o});
  const list = [S([[320, y], [1000, y + 2]], 1)];
  for (let i = 0; i <= 7; i++) {
    const x = 360 + i * 88;
    list.push(S([[x, y - 12], [x + 1, y + 12]], 10 + i, {w: 6}));
    for (const g of glyphGuides(String(i), x - 9, y + 52, 32, {seed: 30 + i})) list.push(S(g, 40 + i, {w: 4.5}));
  }
  let x = 420;
  for (const ch of ['3', '+', '4', '=', '7']) { for (const g of glyphGuides(ch, x, y - 60, 56, {seed: 60 + x})) list.push(S(g, x, {w: 7.5, down: 0.14})); x += (GLYPHS[ch].adv + 0.4) * 56; }
  list.push(S(circleGuide(1180, y - 20, 62, {seed: 5}), 90, {w: 7}));
  return list;
}

export default {
  title: 'borrado · A fundido + fantasma · B borrador con huella, neblina y polvo',
  duration: 0,
  setup() {
    rows.A = content(YA);
    rows.B = content(YB);
    er = eraserPlan(zigzag([300, YB - 130, 1290, YB + 80], {pitch: 54}), {t0: T_ERASE, speed: 900});
    this.duration = er.end + 1.2;
    tmp = [document.createElement('canvas'), document.createElement('canvas')];
  },
  render(lab, t, ctx) {
    // A
    const fa = 1 - clamp((t - T_ERASE - 0.4) / 0.8);
    for (const s of rows.A) drawDeposit(ctx, s, Infinity, fa);
    // B: lo que había, luego la borrada encima, luego el borrador
    for (const s of rows.B) drawDeposit(ctx, s);
    applyErase(ctx, er, t, lab.view.scale);
    drawEraser(ctx, eraserPose(er, t), 7);
    lab.tag('A', 'A · fundido (motor actual)', 40, YA - 140);
    lab.tag('B', 'B · borrador', 40, YB - 140);
  },
  renderDust(lab, t, ctx) {
    // A: fantasma constante proporcional a lo que se fue
    const ga = clamp((t - T_ERASE - 0.4) / 0.8);
    if (ga > 0) {
      ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.globalAlpha = 0.08 * ga;
      for (const s of rows.A) { ctx.lineWidth = 7 * 2.6; ctx.beginPath(); for (let i = 0; i < s.path.n; i += 4) (i ? ctx.lineTo(s.path.x[i], s.path.y[i]) : ctx.moveTo(s.path.x[i], s.path.y[i])); ctx.stroke(); }
      ctx.restore();
    }
    // B
    eraserDust(ctx, er, t, x => {
      x.strokeStyle = '#fff'; x.lineCap = 'round'; x.lineJoin = 'round';
      for (const s of rows.B) { x.lineWidth = 12; x.beginPath(); for (let i = 0; i < s.path.n; i += 3) (i ? x.lineTo(s.path.x[i], s.path.y[i]) : x.moveTo(s.path.x[i], s.path.y[i])); x.stroke(); }
    }, tmp);
    eraserParticles(ctx, er, t, (x, y) => (y > YB - 100 && y < YB + 70 ? 0.85 : 0.15));
  },
  probe(lab, t) {
    const p = eraserPose(er, t);
    return {B: p ? {x: p.x, h: YB - p.y, press: p.press, ang: p.ang} : null};
  },
};
