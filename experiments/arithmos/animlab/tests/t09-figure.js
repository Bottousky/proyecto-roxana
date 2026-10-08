// TEST 09 — personaje de palitos: caminar, detenerse, mirar, señalar, sorprenderse, equivocarse, comprender.
// Fila A: Figure del motor (setPose con mezcla de 0.45 s; caminata senoidal a velocidad constante).
// Fila B: el mismo dibujo con actor.js (canales superpuestos de segundo orden, pisadas planificadas, IK).
// Ambas se dibujan con Figure.render (mismos trazos, mismo hervor): la diferencia es sólo de movimiento.

import {Figure} from '../../src/engine/figure.js';
import {stroke, drawStrokes, YELLOW} from '../../src/engine/chalk.js';
import {buildActor} from '../core/actor.js';
import {clamp} from '../core/motion.js';

const GA = 390, GB = 820, K = 1.35;
const X0 = 230, X1 = 760;
const D = 14.5;
// guion compartido (s): mismas poses y tiempos para A y B
const SCRIPT = [
  {t: 0, pose: 'idle'},
  {t: 0.5, walk: {to: X1, speed: 125}},
  {t: 5.0, pose: 'lookUp', gaze: [0.6, -0.8], face: 0.62},  // se queda de ¾: se leen los dos brazos
  {t: 6.1, pose: 'point', overrides: {armR: [2.35, 0.05]}, gaze: [0.8, -0.6]},
  {t: 7.4, pose: 'surprise', gaze: [1, -0.3]},           // aparece la marca «!»
  {t: 8.6, pose: 'think', gaze: [0.4, -0.6]},
  {t: 9.6, pose: 'point', overrides: {armR: [2.0, 0.1]}, gaze: [0.8, -0.5]},  // "¡ya sé!" (equivocado)
  {t: 10.5, pose: 'worry', gaze: [0.2, 0.4]},            // se da cuenta del error
  {t: 11.9, pose: 'lookUp', gaze: [0.7, -0.9]},          // mira otra vez
  {t: 12.6, pose: 'open', gaze: [0.6, -0.6]},            // comprende
];
// anticipación en B: antes de señalar, el brazo se recoge; antes de sorprenderse, un microencogimiento
const ANTICIP = [
  {t: 5.96, overrides: {armR: [-0.45, 0.35]}},  // la mano baja y va atrás antes de subir a señalar
  {t: 7.3, pose: 'hands'},
  {t: 9.48, overrides: {armR: [-0.35, 0.3]}},
  {t: 12.48, pose: 'lookDown'},
];

let actor, figA, figB, mark;
let cacheA = null;

/** A: se reproduce cuadro a cuadro desde 0 (su estado depende de la historia); las sondas avanzan en orden y reutilizan. */
function figAt(t) {
  if (!cacheA || cacheA.t > t) cacheA = {t: 0, si: 0, fig: new Figure('alumno', X0, GA, {scale: K})};
  const c = cacheA;
  while (c.t <= t + 1e-6) {
    while (c.si < SCRIPT.length && SCRIPT[c.si].t <= c.t) {
      const e = SCRIPT[c.si++];
      if (e.pose) c.fig.setPose(e.pose);
      if (e.gaze) c.fig.look(...e.gaze);
      if (e.walk) c.fig.walkTo(e.walk.to, GA, 120);
    }
    c.fig.update(1 / 60);
    c.t += 1 / 60;
  }
  return c.fig;
}

export default {
  title: 'figura · A poses mezcladas · B superposición + pisadas',
  duration: D,
  setup() {
    actor = buildActor({ground: GB, x: X0, k: K, duration: D, script: [...SCRIPT, ...ANTICIP]});
    figB = new Figure('alumno', X0, GB, {scale: K});
    figB.skeleton = () => figB._sk;
    mark = [stroke([[1010, 120], [1004, 230]], {w: 5, ch: YELLOW, seed: 2}), stroke([[1001, 262], [1000, 268]], {w: 7, ch: YELLOW, seed: 3})];
  },
  render(lab, t, ctx) {
    const frame = Math.floor(t * 8);
    figA = figAt(t);
    figA.render(ctx, null, frame);
    // B
    figB._sk = actor.at(t);
    figB.gaze = actor.gaze(t);
    figB.facing = figB._sk.f;
    figB.time = t;
    figB.blink = (t % 3.7) < 0.12 ? 0.1 : 0;
    figB.render(ctx, null, frame);
    // la marca que sorprende (en las dos filas)
    const mk = clamp((t - 7.2) / 0.25);
    if (mk > 0) {
      drawStrokes(ctx, mark, mk);
      ctx.save(); ctx.translate(0, GB - GA); drawStrokes(ctx, mark, mk); ctx.restore();
    }
    lab.tag('A', 'A · Figure actual', 40, GA - 230);
    lab.tag('B', 'B · actor (superposición + pisadas)', 40, GB - 230);
  },
  probe(lab, t) {
    const sk = actor.at(t), g = actor.gait(t);
    const a = figAt(t).skeleton();
    return {A: {hip: a.hip[0], head: a.head[0], hand: a.aR[2][0], handH: GA - a.aR[2][1], headH: GA - a.head[1], headX: a.head[0] - a.hip[0]}, B: {headH: GB - sk.head[1], handH: GB - sk.aR[2][1], headX: sk.head[0] - sk.hip[0], hip: sk.hip[0], hipY: -sk.hip[1], head: sk.head[0], hand: sk.aR[2][0], handY: -sk.aR[2][1], footL: g.feet.L.x, footR: g.feet.R.x, liftL: g.feet.L.lift, liftR: g.feet.R.lift}};
  },
  metrics() {
    // deslizamiento de pies: mientras un pie no está en el aire, su x no debe cambiar
    let slide = 0;
    for (let t = 0; t < D; t += 1 / 120) {
      const a = actor.gait(t), b = actor.gait(t + 1 / 120);
      for (const f of ['L', 'R']) if (a.feet[f].lift < 0.01 && b.feet[f].lift < 0.01 && a.moving && b.moving) slide = Math.max(slide, Math.abs(b.feet[f].x - a.feet[f].x));
    }
    return {maxFootSlidePerTick: +slide.toFixed(3), walkT: +actor.segs[0].T.toFixed(2), steps: actor.segs[0].P.length - 2};
  },
};
