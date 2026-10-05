import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Field, G_FAMILIAR } from '../src/sim/field.js';

const box = { id: 'z', x0: 0, x1: 4, y0: 0, y1: 6, g: { x: 0, y: 4 }, band: 0.6, priority: 1 };

test('outside every region the familiar condition holds', () => {
  const f = new Field({ zones: [box] });
  assert.deepEqual(f.at(-5, 3), { x: 0, y: -G_FAMILIAR });
  assert.deepEqual(f.at(2, 10), { x: 0, y: -G_FAMILIAR });
});

test('well inside a region its own acceleration holds', () => {
  const f = new Field({ zones: [box] });
  assert.deepEqual(f.at(2, 3), { x: 0, y: 4 });
});

test('the transition band is centred on the boundary and has the declared width', () => {
  const f = new Field({ zones: [box] });
  const z = f.zones[0];
  assert.equal(f.weight(z, 0, 3), 0.5);
  assert.equal(f.weight(z, -0.3, 3), 0);
  assert.equal(f.weight(z, 0.3, 3), 1);
  const mid = f.at(0, 3).y;
  assert.ok(Math.abs(mid - (-G_FAMILIAR + 4) / 2) < 1e-12, `boundary value ${mid}`);
});

test('the acceleration is continuous across the band (no pixel-wide activation)', () => {
  const f = new Field({ zones: [box] });
  let prev = f.at(-1, 3).y, worst = 0;
  const h = 0.001;
  for (let x = -1 + h; x <= 1; x += h) { const v = f.at(x, 3).y; worst = Math.max(worst, Math.abs(v - prev)); prev = v; }
  // smoothstep slope ≤ 1.5/band, so per-millimetre change ≤ 13.8·1.5/0.6·0.001 ≈ 0.0345
  assert.ok(worst < 0.036, `largest step ${worst}`);
});

test('overlapping regions: higher priority wins where both are full, result stays continuous', () => {
  const low = { id: 'low', x0: 0, x1: 10, y0: 0, y1: 10, g: { x: 0, y: 4 }, band: 0.6, priority: 1 };
  const high = { id: 'high', x0: 5, x1: 15, y0: 0, y1: 10, g: { x: 2, y: -2 }, band: 0.6, priority: 2 };
  const f = new Field({ zones: [high, low] });
  assert.deepEqual(f.at(3, 5), { x: 0, y: 4 });
  assert.deepEqual(f.at(7, 5), { x: 2, y: -2 });
  assert.deepEqual(f.at(12, 5), { x: 2, y: -2 });
  let prev = f.at(3, 5), worst = 0;
  for (let x = 3.001; x < 13; x += 0.001) {
    const v = f.at(x, 5); worst = Math.max(worst, Math.hypot(v.x - prev.x, v.y - prev.y)); prev = v;
  }
  assert.ok(worst < 0.03, `largest step ${worst}`);
});

test('a body partially inside feels a fraction of the region', () => {
  const f = new Field({ zones: [box] });
  const half = f.onBody(0, 3, 0.4, 0.4).y;
  assert.ok(half > -G_FAMILIAR && half < 4, `straddling body ${half}`);
  assert.equal(f.onBody(2, 3, 0.4, 0.4).y, 4);
  assert.equal(f.onBody(-2, 3, 0.4, 0.4).y, -G_FAMILIAR);
});

test('a region without power exerts nothing; partial power scales it', () => {
  const f = new Field({ zones: [box] });
  f.zones[0].active = false;
  assert.equal(f.at(2, 3).y, -G_FAMILIAR);
  f.zones[0].active = true; f.zones[0].power = 0.5;
  assert.ok(Math.abs(f.at(2, 3).y - (-G_FAMILIAR + (4 + G_FAMILIAR) * 0.5)) < 1e-12);
});
