import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Camera} from '../src/engine/camera.js';
import {zoomPath, travelTime} from '../src/engine/camera-path.js';

const run = (cam, secs, dt = 1 / 240) => { const out = []; for (let t = 0; t < secs; t += dt) { cam.update(dt); out.push({t, ...cam.current}); } return out; };
const far = {x: 2400, y: 300, w: 700, h: 394}, home = {x: 0, y: 0, w: 1600, h: 900};

test('sin la bandera, la cámara viaja exactamente el tiempo pedido (camino de siempre)', () => {
  const cam = new Camera();
  cam.go(home); cam.go(far, 1.6);
  const s = run(cam, 1.0);
  assert.ok(Math.abs(s.at(-1).x - far.x) > 1, 'a 1.0 s todavía viaja');
  run(cam, 0.7);
  for (const k of ['x', 'y', 'w', 'h']) assert.ok(Math.abs(cam.current[k] - far[k]) < 1e-6, k);
});

test('con la bandera, el plano final es exacto y no llega más tarde que el tope', () => {
  const cam = new Camera();
  cam.pathMode = true;
  cam.go(home); cam.go(far, 1.6);
  const S = Math.abs(zoomPath([800, 450, 1600], [2750, 497, 700]).S);
  const T = Math.min(1.6, travelTime(S));
  run(cam, T + 0.01);
  for (const k of ['x', 'y', 'w', 'h']) assert.ok(Math.abs(cam.current[k] - far[k]) < 1e-6, k);
  assert.ok(!cam.moving);
});

test('con la bandera, el viaje es continuo y arranca y frena suave (mínimo jerk)', () => {
  const cam = new Camera();
  cam.pathMode = true;
  cam.go(home); cam.go(far, 3);
  const s = run(cam, cam.dur);
  const c = p => [p.x + p.w / 2, p.y + p.h / 2];
  const v = s.slice(1).map((p, i) => Math.hypot(c(p)[0] - c(s[i])[0], c(p)[1] - c(s[i])[1]));
  const peak = Math.max(...v);
  assert.ok(v[0] < 0.01 * peak, 'arranca desde el reposo');
  assert.ok(v.at(-1) < 0.02 * peak, 'llega en reposo');
  for (let i = 1; i < v.length; i++) assert.ok(Math.abs(v[i] - v[i - 1]) < 0.02 * peak, `sin saltos de velocidad (muestra ${i})`);
});

test('con la bandera, un viaje lejano se aleja en el medio (camino de van Wijk–Nuij)', () => {
  const cam = new Camera();
  cam.pathMode = true;
  cam.go({x: 0, y: 0, w: 400, h: 225}); cam.go({x: 5000, y: 0, w: 400, h: 225}, 3);
  const s = run(cam, cam.dur);
  assert.ok(Math.max(...s.map(p => p.w)) > 1200, 'se abre para cruzar');
});

test('cortes y finish siguen igual con la bandera', () => {
  const cam = new Camera();
  cam.pathMode = true;
  cam.go(far);
  assert.deepEqual(cam.current, far);
  cam.go(home, 2); cam.update(0.1); cam.finish();
  assert.deepEqual(cam.current, home);
  assert.ok(!cam.moving);
});
