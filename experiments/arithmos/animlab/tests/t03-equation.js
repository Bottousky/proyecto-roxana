// TEST 03 — escritura y transformación de una ecuación.
//   x − 3 = 5   →   x − 3 + 3 = 5 + 3   →   x = 8
// Fila A (arriba): motor actual — texto de fuente revelado con barrido, y cambio de paso por fundido cruzado.
// Fila B (abajo): glifos de un trazo escritos por la mano con su plan; identidad por símbolo:
//   lo que se conserva se desliza (y deja polvo), lo nuevo se escribe (amarillo: lo que propone el jugador),
//   lo que se cancela se tacha y después se borra; el «=» es el pivote y no se mueve.

import {glyphGuides, layoutAround, GLYPHS} from '../core/glyphs.js';
import {depositStroke, drawDeposit, depositTip, depositSpeed} from '../core/deposit.js';
import {resample, planStroke, indexAt, liftTime, minJerk, lerp, clamp} from '../core/motion.js';
import {chalkText, YELLOW} from '../../src/engine/chalk.js';

const SIZE = 80;
const PIVOT = 800;
const YA = 290, YB = 640;
const W = SIZE * 0.12;

const S1 = [['x', 'x'], ['−', 'm'], ['3', 'a'], ['=', 'eq'], ['5', 'five']];
const S2 = [['x', 'x'], ['−', 'm'], ['3', 'a'], ['+', 'p1'], ['3', 'b'], ['=', 'eq'], ['5', 'five'], ['+', 'p2'], ['3', 'c']];
const S3 = [['x', 'x'], ['=', 'eq'], ['8', 'eight']];
const tok = s => s.map(([ch, key]) => ({ch, key}));

// ——— Línea de tiempo de B ———
const glyphs = new Map(); // key → {ch, strokes:[{st, start}], moves:[{start, dur, from:[dx,dy], to:[dx,dy], lift}], group}
const extras = []; // tachaduras: {st, start, group}
const erasers = []; // {group, path, plan, w, strength, start}
const events = []; // para la tabla de tiempos
let T = 0, handXY = null;
const hand = []; // [{start, end, st}] tramos con contacto, para la sonda

function strokeAt(guide, ch, seed, speed = SIZE * 7.5) {
  return depositStroke(guide, {w: W, p: 0.92, ch, seed, motion: {speed, accel: speed * 16, k0: 1 / (SIZE * 0.55), v0: 25, v1: 35}});
}
function travel(to) {
  if (handXY) T += liftTime(Math.hypot(to[0] - handXY[0], to[1] - handXY[1]));
}
function writeGlyph(key, ch, x, y, color, seed, size = SIZE) {
  const g = {ch, strokes: [], moves: [], group: null, size, home: [x, y]};
  for (const guide of glyphGuides(ch, x, y, size, {seed})) {
    travel(guide[0]);
    const st = strokeAt(guide, color, seed++);
    g.strokes.push({st, start: T});
    hand.push({start: T, end: T + st.T, st});
    T += st.T;
    handXY = guide.at(-1);
  }
  glyphs.set(key, g);
  T += 0.03; // entre signos, un respiro
}
function writeTokens(list, layout, y, color = 0, keys = null) {
  const pos = new Map(layout.map(l => [l.key, l]));
  let seed = 100 + glyphs.size * 17;
  for (const [ch, key] of list) {
    if (keys && !keys.includes(key)) continue;
    if (ch === '=') T += 0.12; // antes del «=», la micro-pausa de "ahora viene lo que vale"
    writeGlyph(key, ch, pos.get(key).x, y, color, seed);
    seed += 7;
  }
}
/** Desliza glifos a sus nuevas posiciones: mínimo jerk, arco leve, todos juntos (con un leve escalonado). */
function slide(targets, dur = 0.6, stagger = 0.06) {
  let i = 0;
  for (const [key, [tx, ty]] of targets) {
    const g = glyphs.get(key);
    const cur = offsetAt(g, T + 1e9);
    const to = [tx - g.home[0], ty - g.home[1]];
    const d = Math.hypot(to[0] - cur[0], to[1] - cur[1]);
    g.moves.push({start: T + i * stagger, dur, from: cur, to, lift: Math.min(14, d * 0.06)});
    i++;
  }
  events.push(['desliza', T, [...targets.keys()].join(' ')]);
  T += dur + (i - 1) * stagger;
}
function offsetAt(g, t) {
  let o = [0, 0];
  for (const m of g.moves) {
    if (t < m.start) break;
    const k = minJerk((t - m.start) / m.dur);
    // arco: sube un poco en el medio del viaje (como algo que se levanta para no rozar)
    o = [lerp(m.from[0], m.to[0], k), lerp(m.from[1], m.to[1], k) - Math.sin(Math.PI * k) * m.lift];
  }
  return o;
}
function strike(keys, group, seed) {
  // una raya diagonal rápida que cruza los signos (de abajo a la izquierda hacia arriba a la derecha)
  const gs = keys.map(k => glyphs.get(k));
  const x0 = Math.min(...gs.map(g => g.home[0] + offsetAt(g, T)[0])) - 6;
  const x1 = Math.max(...gs.map(g => g.home[0] + offsetAt(g, T)[0] + GLYPHS[g.ch].adv * SIZE)) + 6;
  const y = gs[0].home[1] + offsetAt(gs[0], T)[1];
  const guide = [[x0, y + SIZE * 0.08], [x1, y - SIZE * 0.95]];
  travel(guide[0]);
  const st = strokeAt(guide, YELLOW, seed, SIZE * 9);
  extras.push({st, start: T, group});
  hand.push({start: T, end: T + st.T, st});
  T += st.T;
  handXY = guide[1];
}
function erase(group, box) {
  // vaivén del borrador sobre la caja: 3 pasadas en zigzag vertical, de izquierda a derecha
  // el borrador pasa más allá de la caja: en los giros del vaivén cubre menos (E03, t03c: quedaban motas arriba)
  const m = SIZE * 0.75 / 3;
  const [x0, y0, x1, y1] = [box[0] - m * 0.5, box[1] - m, box[2] + m * 0.5, box[3] + m];
  const n = Math.max(3, Math.round((x1 - x0) / 28));
  const guide = Array.from({length: n + 1}, (_, i) => [x0 + (x1 - x0) * (i / n), i % 2 ? y0 : y1]);
  travel(guide[0]);
  const path = resample(guide, 1);
  const plan = planStroke(path, {speed: 950, accel: 9000, k0: 1 / 30, beta: 0.5, v0: 80, v1: 80});
  erasers.push({group, path, plan, w: SIZE * 0.75, strength: 0.965, start: T});
  events.push(['borra', T, group]);
  T += plan.T;
  handXY = guide.at(-1);
}

function build() {
  T = 0.5;
  // 1. se escribe la ecuación
  const L1 = layoutAround(tok(S1), PIVOT, SIZE);
  events.push(['escribe x − 3 = 5', T]);
  writeTokens(S1, L1, YB);
  events.push(['fin escritura', T]);
  T += 0.6; // leer
  // 2. el miembro izquierdo se corre para dejar lugar; se suma 3 a ambos lados con el mismo gesto
  const L2 = layoutAround(tok(S2), PIVOT, SIZE);
  const p2 = new Map(L2.map(l => [l.key, l]));
  slide(new Map(['x', 'm', 'a'].map(k => [k, [p2.get(k).x, YB]])));
  T += 0.12;
  events.push(['suma 3 a la izquierda', T]);
  writeTokens(S2, L2, YB, YELLOW, ['p1', 'b']);
  T += 0.18;
  events.push(['suma 3 a la derecha', T]);
  writeTokens(S2, L2, YB, YELLOW, ['p2', 'c']);
  T += 0.7; // leer: ahora vale lo mismo de los dos lados
  // 3. −3 + 3 se cancela: se tacha cada par con el mismo trazo
  events.push(['tacha', T]);
  strike(['m', 'a'], 'L', 901);
  T += 0.1;
  strike(['p1', 'b'], 'L', 903);
  T += 0.35;
  // 4. 5 + 3 = 8: se escribe el 8 debajo, se borra lo cancelado y la suma, y todo se acomoda alrededor del «=»
  const five = p2.get('five'), c = p2.get('c');
  const mid = (five.x + c.x + c.w) / 2;
  events.push(['escribe 8 debajo de 5 + 3', T]);
  writeGlyph('eight', '8', mid - GLYPHS['8'].adv * SIZE * 0.4, YB + SIZE * 1.25, 0, 77, SIZE * 0.8);
  T += 0.45;
  erase('L', [p2.get('m').x - 10, YB - SIZE * 1.05, p2.get('b').x + p2.get('b').w + 12, YB + SIZE * 0.15]);
  T += 0.08;
  erase('R', [five.x - 10, YB - SIZE * 1.05, c.x + c.w + 12, YB + SIZE * 0.15]);
  T += 0.25;
  const L3 = layoutAround(tok(S3), PIVOT, SIZE);
  const p3 = new Map(L3.map(l => [l.key, l]));
  // el 8 crece a tamaño completo mientras sube a su lugar (su glifo se escribió al 80 %)
  slide(new Map([['x', [p3.get('x').x, YB]], ['eight', [p3.get('eight').x, YB]]]), 0.7, 0.1);
  events.push(['fin', T]);
  T += 1.4;
}

// ——— Fila A: motor actual ———
let A = null;
function buildA() {
  const e = events;
  const at = name => e.find(x => x[0] === name)[1];
  A = {s1: [0.5, at('fin escritura')], s2: at('suma 3 a la izquierda'), s3: at('fin') - 0.6};
}

export default {
  title: 'ecuación · A fuente + barrido + fundido · B glifos + identidad por símbolo',
  duration: 0,
  setup(lab) {
    build();
    buildA();
    this.duration = T;
    this.events = events;
    this.tmp = document.createElement('canvas');
  },
  render(lab, t, ctx) {
    // A
    const f12 = clamp((t - A.s2) / 0.6), f23 = clamp((t - A.s3) / 0.6);
    const reveal = clamp((t - A.s1[0]) / (A.s1[1] - A.s1[0]));
    chalkText(ctx, 'x − 3 = 5', PIVOT, YA, {size: SIZE * 1.1, align: 'center', reveal, fade: 1 - f12});
    if (f12 > 0) chalkText(ctx, 'x − 3 + 3 = 5 + 3', PIVOT, YA, {size: SIZE * 1.1, align: 'center', fade: f12 * (1 - f23)});
    if (f23 > 0) chalkText(ctx, 'x = 8', PIVOT, YA, {size: SIZE * 1.1, align: 'center', fade: f23});
    lab.tag('A', 'A · motor actual', 40, YA - 30);
    lab.tag('B', 'B · glifos + identidad', 40, YB - 30);
    // B: los grupos que se borran se dibujan en un lienzo aparte, se borran ahí y se suman
    const groups = {null: ctx};
    for (const gname of ['L', 'R']) {
      const c = this.tmp;
      if (c.width !== ctx.canvas.width || c.height !== ctx.canvas.height) { c.width = ctx.canvas.width; c.height = ctx.canvas.height; }
      const x = c.getContext('2d');
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.globalCompositeOperation = 'source-over';
      x.fillStyle = '#000';
      x.fillRect(0, 0, c.width, c.height);
      x.setTransform(ctx.getTransform());
      drawGroup(x, t, gname);
      for (const e of erasers) if (e.group === gname && t >= e.start) drawEraser(x, e, t - e.start);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(c, 0, 0);
      ctx.restore();
    }
    drawGroup(ctx, t, null);
  },
  renderDust(lab, t, ctx) {
    // rastro de polvo de lo que se deslizó, que se asienta en ~1.5 s; y la neblina de los borrados
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#fff';
    for (const g of glyphs.values()) {
      for (const m of g.moves) {
        if (t < m.start) continue;
        const k = minJerk((t - m.start) / m.dur);
        const age = Math.max(0, t - m.start - m.dur);
        const a = 0.09 * Math.exp(-age / 1.5);
        if (a < 0.004) continue;
        const cx = g.home[0] + GLYPHS[g.ch].adv * g.size / 2, cy = g.home[1] - g.size * 0.45;
        ctx.globalAlpha = a;
        ctx.lineWidth = g.size * 0.55;
        ctx.beginPath();
        ctx.moveTo(cx + m.from[0], cy + m.from[1]);
        ctx.lineTo(cx + lerp(m.from[0], m.to[0], k), cy + lerp(m.from[1], m.to[1], k));
        ctx.stroke();
      }
    }
    for (const e of erasers) {
      if (t < e.start) continue;
      const i1 = Math.floor(indexAt(e.plan, t - e.start));
      ctx.globalAlpha = 0.06;
      ctx.lineWidth = e.w * 0.9;
      ctx.beginPath();
      for (let i = 0; i <= i1; i += 4) (i ? ctx.lineTo(e.path.x[i], e.path.y[i]) : ctx.moveTo(e.path.x[i], e.path.y[i]));
      ctx.stroke();
    }
    ctx.restore();
  },
  probe(lab, t) {
    const o = {};
    for (const [k, g] of glyphs) { const off = offsetAt(g, t); o[k] = {x: g.home[0] + off[0], y: g.home[1] + off[1]}; }
    const h = hand.find(h => t >= h.start && t <= h.end);
    o.hand = h ? {v: depositSpeed(h.st, t - h.start), xy: depositTip(h.st, t - h.start)} : {v: 0};
    return o;
  },
  metrics() {
    return {events: events.map(([n, t, x]) => [n, +t.toFixed(2), x].filter(v => v !== undefined)), glyphs: glyphs.size, strokes: [...glyphs.values()].reduce((a, g) => a + g.strokes.length, 0) + extras.length};
  },
};

function drawGroup(ctx, t, gname) {
  for (const g of glyphs.values()) {
    if ((g.group ?? null) !== gname) continue;
    const off = offsetAt(g, t);
    ctx.save();
    ctx.translate(off[0], off[1]);
    // el 8 escrito chico crece a tamaño completo mientras sube (escala alrededor de su base izquierda)
    if (g.size !== SIZE && g.moves.length) {
      const k = minJerk((t - g.moves[0].start) / g.moves[0].dur);
      const s = lerp(1, SIZE / g.size, k);
      ctx.translate(g.home[0], g.home[1]);
      ctx.scale(s, s);
      ctx.translate(-g.home[0], -g.home[1]);
    }
    for (const {st, start} of g.strokes) drawDeposit(ctx, st, t - start);
    ctx.restore();
  }
  for (const e of extras) if ((e.group ?? null) === gname) drawDeposit(ctx, e.st, t - e.start);
}

function drawEraser(ctx, e, tl) {
  const i1 = Math.floor(indexAt(e.plan, Math.min(tl, e.plan.T)));
  const step = 3, N = Math.max(1, (e.w * 0.5) / step), a = 1 - Math.pow(1 - e.strength, 1 / N);
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i <= i1; i += step) {
    const x = e.path.x[i], y = e.path.y[i];
    const grd = ctx.createRadialGradient(x, y, 0, x, y, e.w / 2);
    grd.addColorStop(0, `rgba(0,0,0,${a})`);
    grd.addColorStop(0.6, `rgba(0,0,0,${a * 0.8})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(x, y, e.w / 2, e.w / 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// los glifos que se borran pertenecen a su grupo
const GROUP = {m: 'L', a: 'L', p1: 'L', b: 'L', five: 'R', p2: 'R', c: 'R'};
const _set = glyphs.set.bind(glyphs);
glyphs.set = (k, g) => { g.group = GROUP[k] ?? null; return _set(k, g); };
