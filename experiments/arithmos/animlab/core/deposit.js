// Técnica B: depósito de tiza por estampas.
//
// La tiza no "pinta una línea": cada instante deja un poco de polvo donde toca. Modelo:
//  - la punta es una elipse áspera a ángulo fijo en el mundo (la tiza se sostiene inclinada),
//    así un trazo horizontal y uno vertical no tienen el mismo ancho;
//  - cada estampa suma presión al lienzo (composición aditiva): dos pasadas acumulan más polvo,
//    y el cruce de dos trazos queda más cargado, como en un pizarrón real;
//  - lo depositado por unidad de longitud baja con la velocidad: un trazo rápido queda seco y cortado,
//    uno lento queda lleno (por eso la textura y el tiempo no se pueden diseñar por separado);
//  - el temblor de la mano es función del TIEMPO, no del largo: un trazo lento tiembla más por centímetro;
//  - al tocar, la tiza "aterriza" (unos px más cargados); al levantar, la presión cae con la frenada.
// El compuesto WebGL existente (diente del pizarrón) convierte presión en cobertura.

import {resample, planStroke, indexAt, lerp, clamp} from './motion.js';
import {noise1, mulberry32} from '../../src/engine/rng.js';

const STAMP = 48;
export let RIDGE = 0.35; // cuánto marcan las crestas de la punta
export let DENSITY = 0.4; // presión aportada por estampa (calibrada para que el centro de un trazo a velocidad de crucero ronde 0.85)
export const setDensity = d => { DENSITY = d; }; // resolución de la estampa (px de sprite)
const stamps = new Map();

/** Estampa de un canal (0 R, 1 G, 2 B): elipse de borde áspero, perfil suave en el centro. */
function stampFor(ch, variant) {
  const key = ch * 8 + variant;
  if (stamps.has(key)) return stamps.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = STAMP;
  const x = c.getContext('2d');
  const img = x.createImageData(STAMP, STAMP);
  const rnd = mulberry32(911 + variant * 31);
  const edge = Array.from({length: 24}, () => 0.82 + rnd() * 0.3);
  const ridges = [9 + rnd() * 6, rnd() * 6, 17 + rnd() * 9];
  for (let j = 0; j < STAMP; j++) {
    for (let i = 0; i < STAMP; i++) {
      const u = (i + 0.5) / STAMP * 2 - 1, v = (j + 0.5) / STAMP * 2 - 1;
      const a = Math.atan2(v, u), r = Math.hypot(u, v);
      const ai = ((a / (Math.PI * 2)) + 1) % 1 * 24;
      const e0 = edge[Math.floor(ai) % 24], e1 = edge[(Math.floor(ai) + 1) % 24];
      const R = lerp(e0, e1, ai - Math.floor(ai));
      // meseta y caída: casi todo el depósito en el 70 % central
      let val = clamp((R - r) / 0.32);
      val = val * val * (3 - 2 * val);
      // cara de contacto: crestas finas (las que dejan estrías en la dirección del trazo) y poros
      const ridge = 0.5 + 0.5 * Math.sin(v * ridges[0] + ridges[1]) * Math.sin(v * ridges[2] + u * 1.3);
      val *= (1 - RIDGE) + RIDGE * ridge;
      val *= 0.7 + 0.3 * rnd();
      const k = (j * STAMP + i) * 4;
      img.data[k + ch] = 255;
      img.data[k + 3] = Math.round(val * 255);
    }
  }
  x.putImageData(img, 0, 0);
  stamps.set(key, c);
  return c;
}

/**
 * Prepara un trazo de depósito.
 * @param guide polilínea [x, y]
 * @param o.w diámetro de la punta (px de mundo); o.p presión de cuerpo; o.ch canal de color
 * @param o.motion opciones del plan de velocidad (motion.planStroke)
 */
export function depositStroke(guide, {w = 4.2, p = 0.9, ch = 0, seed = 1, motion = {}, nib = -0.6, aspect = 1.45, tremor = 0.7, land = true, lift = true, down = 0} = {}) {
  const path = resample(guide, 0.5);
  const plan = planStroke(path, motion);
  const n = path.n;
  const nTrem = noise1(seed * 3 + 1), nTrem2 = noise1(seed * 5 + 7);
  const nPress = noise1(seed * 11 + 3), nDry = noise1(seed * 13 + 5);
  const rnd = mulberry32(seed * 17 + 9);
  // durante un trazo la punta no gira ni cambia de cara: su forma fija deja estrías paralelas al movimiento
  const face = Math.floor(rnd() * 4), rot0 = nib + (rnd() - 0.5) * 0.3;
  // estampas cada ~0.22 diámetros
  const step = Math.max(0.35, w * 0.22);
  const every = Math.max(1, Math.round(step / 0.5));
  const dabs = [];
  const vRef = motion.speed ?? 520;
  for (let i = 0; i < n; i += every) {
    const s = path.s[i], t = plan.t[i], v = plan.v[i];
    const a = Math.max(0, i - 2), b = Math.min(n - 1, i + 2);
    let nx = -(path.y[b] - path.y[a]), ny = path.x[b] - path.x[a];
    const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    // temblor en el tiempo (~9 Hz fisiológico, amplitud sub-píxel) y deriva lenta en el espacio
    const off = tremor * (0.35 * nTrem(t * 9) + 0.65 * nTrem2(s / 40));
    // `down`: al escribir, las bajadas cargan más que las subidas (la mano empuja hacia abajo)
    const dy = (path.y[b] - path.y[a]) / Math.max(1e-6, path.s[b] - path.s[a]);
    let pr = p * (1 + 0.12 * nPress(s / 23)) * (1 + down * dy);
    if (land && s < 5) pr *= 1.18 - 0.03 * s;
    const fromEnd = path.L - s;
    if (lift && fromEnd < 14) pr *= 0.35 + 0.65 * (fromEnd / 14);
    // más rápido, menos depósito por unidad de largo; además huecos secos a alta velocidad
    const speedK = clamp(Math.pow(vRef / Math.max(40, v), 0.3), 0.72, 1.3);
    const dry = 0.5 + 0.5 * nDry(s / 6) + Math.max(0, v / vRef - 1.1) * 1.5;
    const gap = dry > 0.97 ? 0.5 : 1;
    dabs.push({x: path.x[i] + nx * off, y: path.y[i] + ny * off, t, s, v,
      amt: clamp(pr * speedK * gap) * DENSITY * (step / (w * 0.22)),
      rot: rot0 + (rnd() - 0.5) * 0.04, variant: face});
  }
  return {kind: 'deposit', path, plan, dabs, w, aspect, ch, T: plan.T, L: path.L};
}

/** Dibuja el trazo como estaba en el tiempo local tl (0..T). Requiere composición aditiva ('lighter'). */
export function drawDeposit(ctx, st, tl = Infinity, fade = 1) {
  if (tl <= 0 || fade <= 0) return;
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighter';
  const W = st.w, H = st.w / st.aspect;
  for (const d of st.dabs) {
    if (d.t > tl) break;
    const img = stampFor(st.ch, d.variant);
    ctx.globalAlpha = d.amt * fade;
    const c = Math.cos(d.rot), s = Math.sin(d.rot);
    // transformación local respecto de la actual (la de la cámara)
    ctx.save();
    ctx.transform(c, s, -s, c, d.x, d.y);
    ctx.drawImage(img, -W / 2, -H / 2, W, H);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = prev;
}

/** Punta de la tiza en el tiempo local tl. */
export function depositTip(st, tl) {
  const i = indexAt(st.plan, tl);
  const i0 = Math.floor(i), i1 = Math.min(st.path.n - 1, i0 + 1), f = i - i0;
  return [lerp(st.path.x[i0], st.path.x[i1], f), lerp(st.path.y[i0], st.path.y[i1], f)];
}

/** Velocidad de la punta en tl (px/s). */
export function depositSpeed(st, tl) {
  // interpolada entre muestras: redondear al índice más cercano hacía saltar la sonda (15 → 72 px/s "en un instante",
  // cuando en realidad tarda 0.011 s a 5000 px/s²)
  const i = indexAt(st.plan, tl), i0 = Math.floor(i), i1 = Math.min(st.path.n - 1, i0 + 1);
  return lerp(st.plan.v[i0], st.plan.v[i1], i - i0);
}

/**
 * Igual que drawDeposit, pero un trazo ya terminado se dibuja desde un bitmap (se estampa una sola vez).
 * El bitmap guarda la presión en espacio de mundo a la escala de la vista (se rehace si la escala cambia > 30 %).
 * Se compone con 'lighter', como las estampas: el resultado es el mismo que estamparlo.
 */
export function drawDepositCached(ctx, st, tl = Infinity, fade = 1) {
  if (tl < st.T || fade !== 1) return drawDeposit(ctx, st, tl, fade);
  const m = ctx.getTransform();
  const scale = Math.hypot(m.a, m.b);
  let c = st.cache;
  if (!c || c.scale < scale * 0.77 || c.scale > scale * 1.3) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const d of st.dabs) { x0 = Math.min(x0, d.x); y0 = Math.min(y0, d.y); x1 = Math.max(x1, d.x); y1 = Math.max(y1, d.y); }
    const pad = st.w;
    x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
    const W = Math.max(1, Math.ceil((x1 - x0) * scale)), H = Math.max(1, Math.ceil((y1 - y0) * scale));
    const canvas = c?.canvas || document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const x = canvas.getContext('2d');
    x.fillStyle = '#000';
    x.fillRect(0, 0, W, H);
    x.setTransform(scale, 0, 0, scale, -x0 * scale, -y0 * scale);
    drawDeposit(x, st, Infinity, 1);
    c = st.cache = {canvas, scale, x0, y0, w: x1 - x0, h: y1 - y0};
  }
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(c.canvas, c.x0, c.y0, c.w, c.h);
  ctx.globalCompositeOperation = prev;
}
