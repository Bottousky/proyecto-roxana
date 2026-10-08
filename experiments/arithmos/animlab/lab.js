// ARITHMOS ANIMATION LAB — banco de pruebas determinista.
//
// Cada prueba es un módulo con {title, duration, setup(lab), render(lab, t, ctx), renderDust?, probe?(t), metrics?()}.
// El tiempo es virtual: `__lab.seek(t)` dibuja exactamente el cuadro t, así una captura es reproducible
// y dos técnicas se comparan cuadro a cuadro. `?play=1` reproduce en tiempo real (para mirar y grabar).
//
// URL: ?test=01&t=1.2 | ?test=01&play=1 | &capture=1 (sin menú)

import {BoardRenderer} from '../src/engine/renderer.js';
import {Camera} from '../src/engine/camera.js';

const TESTS = {
  '01': () => import('./tests/t01-line.js'),
};

const params = new URLSearchParams(location.search);
const id = params.get('test') || '01';
if (params.has('capture')) document.body.classList.add('capture');

const glCanvas = document.getElementById('gl');
const svg = document.getElementById('svg');
const tags = document.getElementById('tags');
const hud = document.getElementById('hud');
const renderer = new BoardRenderer(glCanvas);
const camera = new Camera();
camera.drift = false;

const menu = document.getElementById('menu');
for (const k of Object.keys(TESTS)) {
  const a = document.createElement('a');
  a.href = `?test=${k}&play=1`;
  a.textContent = k;
  if (k === id) a.className = 'on';
  menu.append(a);
}

await document.fonts.load('400 40px Tiza');
await document.fonts.load('400 40px Kalam');
const test = (await TESTS[id]()).default;

const lab = {
  renderer, camera, svg, params,
  shot: {x: 0, y: 0, w: 1600, h: 900},
  view: null,
  /** Rótulo técnico (DOM, no tiza) en coordenadas de mundo. */
  tag(key, text, wx, wy) {
    let el = tags.querySelector(`[data-k="${key}"]`);
    if (!el) { el = document.createElement('div'); el.className = 'tag'; el.dataset.k = key; tags.append(el); }
    el.textContent = text;
    const [sx, sy] = camera.toScreen(lab.view, wx, wy);
    el.style.left = `${sx}px`;
    el.style.top = `${sy}px`;
  },
};

test.setup?.(lab);
const duration = test.duration;

function render(t) {
  const dpr = Math.min(2, devicePixelRatio || 1);
  renderer.resize(innerWidth, innerHeight, dpr);
  const rect = test.camera ? test.camera(t) : lab.shot;
  camera.go(rect, 0);
  const view = camera.view(renderer.w, renderer.h, dpr);
  lab.view = view;
  // el SVG comparte la cámara: su viewBox es el rectángulo de mundo visible
  svg.setAttribute('viewBox', `${view.x} ${view.y} ${renderer.w / view.scale} ${renderer.h / view.scale}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  const ctx = renderer.beginChalk(view);
  const t0 = performance.now();
  test.render(lab, t, ctx);
  const ms = performance.now() - t0;
  const dctx = renderer.beginDust(view);
  test.renderDust?.(lab, t, dctx);
  renderer.present(view);
  hud.textContent = `${id} · ${test.title} · t=${t.toFixed(2)} / ${duration.toFixed(2)} s · tiza ${ms.toFixed(1)} ms`;
  return ms;
}

window.__lab = {
  id, title: test.title, duration,
  seek: t => render(t),
  probe: t => test.probe?.(lab, t) ?? null,
  metrics: () => test.metrics?.(lab) ?? null,
  /** Perfil por columnas de una franja de mundo: pico de presión y ancho (px de mundo sobre el umbral). */
  columns(x, y, w, h, ch = 0, thr = 0.3) {
    const v = lab.view, c = renderer.chalkCtx;
    const px = Math.round((x - v.x) * v.scale), py = Math.round((y - v.y) * v.scale);
    const pw = Math.round(w * v.scale), ph = Math.round(h * v.scale);
    const d = c.getImageData(px, py, pw, ph).data;
    const peak = [], width = [], sum = [];
    for (let i = 0; i < pw; i++) {
      let m = 0, n = 0, a = 0;
      for (let j = 0; j < ph; j++) { const val = d[(j * pw + i) * 4 + ch] / 255; if (val > m) m = val; if (val > thr) n++; a += val; }
      peak.push(m); width.push(n / v.scale); sum.push(a / v.scale);
    }
    return {peak, width, sum};
  },
  /** Lee la presión del lienzo de tiza (antes del compuesto) en una lista de puntos de mundo. */
  sampleChalk(points, ch = 0) {
    const v = lab.view, c = renderer.chalkCtx;
    const out = [];
    for (const [wx, wy] of points) {
      const px = Math.round((wx - v.x) * v.scale), py = Math.round((wy - v.y) * v.scale);
      out.push(c.getImageData(px, py, 1, 1).data[ch] / 255);
    }
    return out;
  },
};

if (params.has('play')) {
  const speed = Number(params.get('speed') || 1);
  const hold = 1.2;
  let start = performance.now();
  const loop = now => {
    let t = (now - start) / 1000 * speed;
    if (t > duration + hold) { start = now; t = 0; }
    render(Math.min(t, duration));
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
} else {
  render(Number(params.get('t') ?? duration));
}
addEventListener('resize', () => { if (!params.has('play')) render(Number(params.get('t') ?? duration)); });
window.__ready = true;
