import {BoardRenderer} from '../src/engine/renderer.js';
import {Camera} from '../src/engine/camera.js';
import {Figure, POSES} from '../src/engine/figure.js';
import {stroke, drawStrokes, circleGuide, lineGuide, rectStrokes, dotStrokes, WHITE, YELLOW, BLUE, pressureStyle, chalkText} from '../src/engine/chalk.js';
import {mulberry32} from '../src/engine/rng.js';

await document.fonts.load('400 40px Kalam');
const canvas = document.getElementById('gl');
const r = new BoardRenderer(canvas);
const cam = new Camera();
cam.drift = false;
cam.go({x: 0, y: 0, w: 1600, h: 900});
const params = new URLSearchParams(location.search);
const grain = Number(params.get('grain') ?? 1);
r.grain = grain;
const poses = Object.keys(POSES);
const figs = poses.slice(0, 11).map((p, i) => new Figure('f' + i, 120 + i * 130, 560, {pose: p, facing: i % 3 === 0 ? 1 : i % 3 === 1 ? -1 : 0}));
const figs2 = poses.slice(11).map((p, i) => new Figure('g' + i, 120 + i * 130, 840, {pose: p, facing: 1}));
const rnd = mulberry32(4);
const art = [
  ...rectStrokes(60, 40, 300, 180, 10, {w: 4}),
  stroke(circleGuide(560, 130, 80, rnd), {seed: 3, w: 4}),
  stroke(lineGuide(720, 60, 1000, 200, rnd), {seed: 5, w: 3, p: 0.55}),
  stroke(lineGuide(720, 100, 1000, 240, rnd), {seed: 6, w: 3, p: 0.75}),
  stroke(lineGuide(720, 140, 1000, 280, rnd), {seed: 7, w: 3, p: 1}),
  ...dotStrokes(1100, 120, 8, 21, {ch: YELLOW}),
  stroke(circleGuide(1100, 120, 18, rnd, {overshoot: 0.2}), {seed: 9, w: 1.8, p: 0.55, ch: YELLOW}),
  ...[0,1,2,3,4,5].flatMap(i => dotStrokes(1180 + i * 34, 110 + (i % 2) * 18, 6, 40 + i)),
];
function frame() {
  const dpr = Math.min(2, devicePixelRatio || 1);
  r.resize(innerWidth, innerHeight, dpr);
  const view = cam.view(r.w, r.h, dpr);
  const ctx = r.beginChalk(view);
  drawStrokes(ctx, art, 1);
  chalkText(ctx, 'x − 3 = 5   ½   x² √2   ¿Están todos?', 60, 330, {size: 44});
  chalkText(ctx, 'áéíóú ñ ¡Hola! 12 · 14 · −7 · 3/4', 860, 330, {size: 30, ch: BLUE});
  for (const f of [...figs, ...figs2]) { f.update(0); f.render(ctx, view, 0); }
  const d = r.beginDust(view);
  d.strokeStyle = 'rgba(255,255,255,0.05)';
  d.lineCap = 'round';
  for (let k = 0; k < 9; k++) { d.lineWidth = 10 + k * 2; d.beginPath(); d.moveTo(1150, 220 + k * 9); d.bezierCurveTo(1300, 180 + k * 8, 1450, 300 + k * 6, 1580, 230 + k * 9); d.stroke(); }
  r.present(view);
  window.__ready = true;
}
frame();
addEventListener('resize', frame);
