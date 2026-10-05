import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World, DT, ballisticPath, SPHERE, AVATAR } from '../src/sim/world.js';
import { FixedStepper } from '../src/sim/stepper.js';
import { CASCADA, STREAM_SPEED } from '../src/sim/levels/cascada.js';
import { G_FAMILIAR } from '../src/sim/field.js';

const ZONE = CASCADA.zones[0];
const fresh = () => new World(CASCADA);
const stand = (w, id) => w.stands.find(s => s.id === id);
const run = (w, seconds, input = {}) => { const n = Math.round(seconds / DT); for (let i = 0; i < n; i++) { Object.assign(w.input, input); w.step(); } };
function releaseStand(w, id) {
  const st = stand(w, id);
  w.avatar.x = st.x; w.avatar.y = st.baseY + AVATAR.hh; w.avatar.vx = w.avatar.vy = 0;
  w.step(); w.step();
  w.input.act = true; w.step();
  assert.equal(st.state, 'free');
  return st;
}

test('outside: a released test sphere falls as y0 − ½·g·t² until it touches the ground', () => {
  const w = fresh(), st = releaseStand(w, 'A'), b = st.body;
  const y0 = st.clampY, t0 = w.stepCount - 1;
  for (let i = 0; i < 60; i++) {
    w.step();
    const t = (w.stepCount - t0) * DT;
    const expected = y0 - 0.5 * G_FAMILIAR * t * t;
    if (expected - SPHERE.r <= 0.02) break;
    assert.ok(Math.abs(b.y - expected) < 1e-9, `t=${t} y=${b.y} expected=${expected}`);
  }
});

test('outside: the explorer stands on the ground without drifting or jittering', () => {
  const w = fresh();
  run(w, 3);
  const av = w.avatar;
  assert.ok(Math.abs(av.y - AVATAR.hh) < 0.002, `height ${av.y}`);
  assert.ok(Math.abs(av.vx) < 1e-9 && Math.abs(av.vy) < 0.1, `velocity ${av.vx},${av.vy}`);
  assert.ok(av.supportSteps > 100);
});

test('inside: released from rest the sphere rises as y0 + ½·a·t² while fully inside', () => {
  const w = fresh(), st = releaseStand(w, 'B'), b = st.body;
  const y0 = st.clampY, t0 = w.stepCount - 1, a = ZONE.g.y;
  for (let i = 0; i < 400; i++) {
    w.step();
    const t = (w.stepCount - t0) * DT;
    const expected = y0 + 0.5 * a * t * t;
    if (expected + SPHERE.r * 0.7 > ZONE.y1 - ZONE.band / 2) break;
    assert.ok(Math.abs(b.y - expected) < 1e-9, `t=${t} y=${b.y} expected=${expected}`);
  }
});

test('crossing a boundary changes velocity only through a·dt (no jumps, no reversal)', () => {
  const w = fresh(), st = releaseStand(w, 'B'), b = st.body;
  let prev = { vx: b.vx, vy: b.vy }, worst = 0, crossedOut = false, crossedIn = false, lastW = 1;
  const z = w.field.zones[0];
  for (let i = 0; i < 6 / DT; i++) {
    w.step();
    const dv = Math.hypot(b.vx - prev.vx, b.vy - prev.vy);
    worst = Math.max(worst, dv);
    const wt = w.field.weight(z, b.x, b.y);
    if (lastW >= 0.5 && wt < 0.5) crossedOut = true;
    if (crossedOut && lastW < 0.5 && wt >= 0.5) crossedIn = true;
    lastW = wt; prev = { vx: b.vx, vy: b.vy };
  }
  assert.ok(crossedOut && crossedIn, 'the sphere left through the top and came back in');
  const bound = Math.max(G_FAMILIAR, ZONE.g.y) * DT + 1e-9;
  assert.ok(worst <= bound, `largest per-step change ${worst} > ${bound}`);
});

test('entering while descending: it slows, stops inside and starts to rise', () => {
  const w = fresh(), st = releaseStand(w, 'B'), b = st.body;
  // First rise, exit through the top, fall back in from above.
  const seen = [];
  for (let i = 0; i < 6 / DT; i++) { w.step(); seen.push({ y: b.y, vy: b.vy, w: w.field.weight(w.field.zones[0], b.x, b.y) }); }
  const reentry = seen.findIndex((s, i) => i > 0 && seen[i - 1].w < 0.5 && s.w >= 0.5);
  assert.ok(reentry > 0, 'came back into the region');
  assert.ok(seen[reentry].vy < -1, `enters descending (vy=${seen[reentry].vy})`);
  const turn = seen.findIndex((s, i) => i > reentry && s.vy >= 0);
  assert.ok(turn > reentry, 'its velocity reaches zero inside');
  assert.ok(seen[turn].w > 0.99, 'the turnaround happens inside the region');
  // Within the band the field is still downward until a crosses zero (w = 9.8/13.8 ≈ 0.71);
  // from there on the body brakes at every step until it turns.
  const brake = seen.findIndex((s, i) => i > reentry && s.w > 9.8 / 13.8 + 0.01);
  for (let i = brake + 1; i < turn; i++) assert.ok(seen[i].vy > seen[i - 1].vy, `monotonically braking at ${i}`);
});

test('ideal 1D field: the sphere returns to its release height (energy, known solution)', () => {
  const w = fresh(), st = releaseStand(w, 'B'), b = st.body;
  let lowest = Infinity, highest = -Infinity, prevVy = 0;
  for (let i = 0; i < 6 / DT; i++) {
    w.step();
    if (prevVy < 0 && b.vy >= 0) lowest = Math.min(lowest, b.y);
    highest = Math.max(highest, b.y);
    prevVy = b.vy;
  }
  assert.ok(Math.abs(lowest - st.clampY) < 0.01, `turnaround at ${lowest}, released at ${st.clampY}`);
  // Peak above the top: energy gained inside (a·Δy) is spent against familiar gravity outside;
  // the band makes the exact value depend on the smooth profile, so allow the band's width.
  const expectedPeak = ZONE.y1 + ZONE.g.y * (ZONE.y1 - st.clampY) / G_FAMILIAR;
  assert.ok(Math.abs(highest - expectedPeak) < 0.15, `peak ${highest} vs sharp-boundary ${expectedPeak}`);
});

test('leaving the region it keeps its instantaneous velocity and then follows exterior gravity', () => {
  const w = fresh(), st = releaseStand(w, 'B'), b = st.body, z = w.field.zones[0];
  let before = null;
  for (let i = 0; i < 4 / DT; i++) {
    const wt = w.field.weight(z, b.x, b.y);
    if (wt >= 0.5) before = { vy: b.vy };
    w.step();
    if (before && w.field.weight(z, b.x, b.y) < 0.5) break;
  }
  assert.ok(Math.abs(b.vy - before.vy) < 0.1, `exit velocity ${b.vy} vs just before ${before.vy}`);
  // Once clear of the band it decelerates at exactly g.
  while (w.field.weight(z, b.x, b.y - SPHERE.r) > 0) w.step();
  const v1 = b.vy; w.step(); const v2 = b.vy;
  assert.ok(Math.abs((v2 - v1) / DT + G_FAMILIAR) < 1e-6, `exterior acceleration ${(v2 - v1) / DT}`);
});

test('frame-rate independence: render rates do not change the simulated history', () => {
  const script = t => ({ x: t < 3 ? 1 : t < 3.5 ? 0 : 1, act: false });
  const play = frames => {
    const w = fresh(), s = new FixedStepper(w);
    let t = 0;
    for (const dt of frames) { s.advance(dt, () => Object.assign(w.input, script(w.t))); t += dt; }
    return w;
  };
  const total = 7;
  const rates = [1 / 30, 1 / 60, 1 / 144];
  const results = rates.map(r => play(Array.from({ length: Math.round(total / r) }, () => r)));
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const jitter = []; let acc = 0; while (acc < total) { const d = 0.004 + rnd() * 0.04; jitter.push(d); acc += d; }
  results.push(play(jitter));
  const ref = results[1];
  for (const r of results) {
    const n = Math.min(r.stepCount, ref.stepCount);
    // Compare at the same step: replay the reference to that step.
    const w = fresh(); for (let i = 0; i < n; i++) { Object.assign(w.input, script(w.t)); w.step(); }
    const a = r.stepCount === n ? r : null;
    if (a) assert.deepEqual([a.avatar.x, a.avatar.y], [w.avatar.x, w.avatar.y]);
    else {
      const w2 = fresh(); for (let i = 0; i < r.stepCount; i++) { Object.assign(w2.input, script(w2.t)); w2.step(); }
      assert.deepEqual([r.avatar.x, r.avatar.y], [w2.avatar.x, w2.avatar.y]);
    }
  }
  assert.ok(results.every(r => Math.abs(r.t - total) < 0.05), 'all rates reach the same simulated time');
});

test('determinism: the same inputs give bit-identical states', () => {
  const a = fresh(), b = fresh();
  for (const w of [a, b]) {
    run(w, 1, { x: 1 }); w.input.act = true; run(w, 2, { x: 0 }); run(w, 6, { x: 1 });
  }
  assert.deepEqual(a.bodies.map(x => [x.x, x.y, x.vx, x.vy]), b.bodies.map(x => [x.x, x.y, x.vx, x.vy]));
});

test('the water arch: leaving the lip at stream speed it crosses the chasm onto the terrace', () => {
  const w = fresh();
  const path = ballisticPath(w.field, 0, 0.05, STREAM_SPEED, 0, { steps: 1200 });
  const peak = path.reduce((m, p) => Math.max(m, p.y), -Infinity);
  const down = path.find((p, i) => i > 0 && p.vy < 0 && p.y <= 3.05 && p.x > 2);
  assert.ok(peak > ZONE.y1 && peak < ZONE.y1 + 2, `crest at ${peak}`);
  assert.ok(down && down.x > 4.5, `comes down at x=${down?.x}`);
  assert.ok(path.filter(p => p.x < 4.5).every(p => p.y > -0.1), 'never falls into the chasm');
});

test('end-to-end: the explorer walks off the lip, rises with the region and lands on the terrace', () => {
  const w = fresh(), av = w.avatar;
  let maxY = -Infinity, left = false, ticks = 0;
  while (ticks++ < 20 / DT) {
    w.input.x = 1; w.step();
    maxY = Math.max(maxY, av.y);
    if (av.x > 0.3) left = true;
    if (left && av.x > 5 && av.supportSteps > 10) break;
  }
  assert.ok(av.x > 5, `reached x=${av.x}`);
  assert.ok(Math.abs(av.y - AVATAR.hh - 3) < 0.01, `standing on the terrace at feet=${av.y - AVATAR.hh}`);
  assert.ok(maxY - AVATAR.hh > 3, 'it rose above the terrace top');
});

test('end-to-end: stopping inside the region leaves the explorer suspended, never stranded', () => {
  const w = fresh(), av = w.avatar;
  // Edge forward slowly; with no input there is no assist, so it keeps that small drift.
  av.x = -1; run(w, 1.8, { x: 0.35 }); run(w, 1.0, { x: 0 });
  assert.ok(av.x > 0 && av.x < 4.5, `still over the chasm (x=${av.x})`);
  assert.ok(av.y > -0.5, `not fallen into the chasm (y=${av.y})`);
  let back = false;
  for (let i = 0; i < 8 / DT && !back; i++) { w.input.x = -1; w.step(); back = av.supportSteps > 5 && av.x < 0; }
  assert.ok(back, `can steer back to the Orilla (x=${av.x}, y=${av.y})`);
});

test('pushing a loose sphere off the lip sends it after the water', () => {
  const w = fresh(), av = w.avatar;
  // Clear the other loose spheres; push L3 from behind.
  const balls = w.bodies.filter(b => b.home);
  balls[0].x = -12; balls[1].x = -13;
  const b = balls[2]; b.x = -2; b.y = SPHERE.r; b.heldBy = null;
  av.x = -3; av.y = AVATAR.hh;
  let t = 0; while (t++ < 2.5 / DT) { w.input.x = av.x < -0.7 ? 1 : 0; w.step(); }
  run(w, 4, { x: 0 });
  assert.ok(b.x > 4.5 && Math.abs(b.y - (3 + SPHERE.r)) < 0.05, `sphere at ${b.x.toFixed(2)},${b.y.toFixed(2)}`);
});

test('local reset returns test bodies to their supports and keeps the explorer', () => {
  const w = fresh(), st = releaseStand(w, 'A');
  run(w, 1);
  const ax = w.avatar.x;
  w.input.reset = true; w.step();
  assert.equal(st.state, 'armed');
  assert.equal(st.body.x, st.clampX);
  assert.ok(Math.abs(w.avatar.x - ax) < 1e-6);
});

test('reeling brings the sphere home and re-arms the support; a new release repeats the path', () => {
  const w = fresh(), st = releaseStand(w, 'B');
  run(w, 2);
  const first = w.traces.find(t => t.source === 'B').marks.slice(0, 15).map(m => [m.x, m.y]);
  w.input.act = true; w.step();
  assert.equal(st.state, 'reeling');
  run(w, 5);
  assert.equal(st.state, 'armed');
  w.input.act = true; w.step();
  run(w, 2);
  const tr = w.traces.filter(t => t.source === 'B');
  const second = tr[tr.length - 1].marks.slice(0, 15).map(m => [m.x, m.y]);
  assert.deepEqual(second, first);
});

test('traces sample the experiment itself at equal time intervals', () => {
  const w = fresh(); releaseStand(w, 'A');
  run(w, 1.5);
  const tr = w.traces.find(t => t.source === 'A');
  const dts = tr.marks.slice(1).map((m, i) => +(m.t - tr.marks[i].t).toFixed(6));
  assert.ok(dts.every(d => d === 0.1), `intervals ${dts}`);
  const gaps = tr.marks.slice(1, 6).map((m, i) => tr.marks[i].y - m.y);
  for (let i = 1; i < gaps.length; i++) assert.ok(gaps[i] > gaps[i - 1], 'spacing grows while falling');
});

test('the route is never blocked: release A, release B, then cross (no jam on instruments)', () => {
  const w = fresh(), av = w.avatar;
  const walkTo = (x, max = 15) => { let n = 0; while (Math.abs(av.x - x) > 0.12 && n++ < max / DT) { w.input.x = Math.sign(x - av.x); w.step(); } w.input.x = 0; run(w, 0.3); };
  walkTo(stand(w, 'A').x); w.input.act = true; w.step(); run(w, 1.5);
  assert.equal(stand(w, 'A').state, 'free', 'A released');
  walkTo(stand(w, 'B').x + 0.05); assert.ok(Math.abs(av.x - stand(w, 'B').x) < 0.25, `reached support B (x=${av.x})`);
  w.input.act = true; w.step(); run(w, 0.5);
  let n = 0; while (n++ < 12 / DT && !(av.x > 5 && av.supportSteps > 10)) { w.input.x = 1; w.step(); }
  assert.ok(av.x > 5 && Math.abs(av.y - AVATAR.hh - 3) < 0.01, `on the terrace (x=${av.x}, y=${av.y})`);
});

test('taking a sphere from the table, carrying it and letting go at the lip sends it with the water', () => {
  const w = fresh(), av = w.avatar;
  const walkTo = (x, max = 15) => { let n = 0; while (Math.abs(av.x - x) > 0.1 && n++ < max / DT) { w.input.x = Math.sign(x - av.x); w.step(); } };
  walkTo(-5.5); w.input.x = 0; run(w, 0.3);
  w.input.act = true; w.step();
  assert.ok(av.holding, 'holding a sphere');
  const b = av.holding;
  walkTo(-1.2);
  // keep walking and let go just before the lip, at walking speed
  let n = 0; while (av.x < -0.55 && n++ < 400) { w.input.x = 1; w.step(); }
  w.input.act = true; w.input.x = 0; w.step();
  assert.equal(av.holding, null);
  run(w, 5);
  assert.ok(b.x > 4.5 && Math.abs(b.y - (3 + SPHERE.r)) < 0.06, `sphere ended at ${b.x.toFixed(2)},${b.y.toFixed(2)}`);
});

test('returning from the Terraza: stepping back into the region and holding ▶ gets back onto it', () => {
  // Reviewer's case: walk left off the terrace, float, then hold right at various reaction times.
  for (const react of [0.3, 0.6, 1.0, 1.3, 1.8, 2.5, 3.2]) {
    const w = fresh(), av = w.avatar;
    av.x = 6; av.y = 3 + AVATAR.hh; av.px = av.x; av.py = av.y;
    run(w, 0.3);
    let n = 0; while (av.x > 4.3 && n++ < 600) { w.input.x = -1; w.step(); }
    run(w, react, { x: 0 });
    let ok = false;
    for (let i = 0; i < 10 / DT && !ok; i++) { w.input.x = 1; w.step(); ok = av.x > 4.6 && av.supportSteps > 10 && Math.abs(av.y - AVATAR.hh - 3) < 0.02; }
    assert.ok(ok, `reaction ${react}s: stuck at x=${av.x.toFixed(2)} y=${(av.y - AVATAR.hh).toFixed(2)}`);
  }
});

test('R while floating with no support returns the explorer to its last firm footing', () => {
  const w = fresh(), av = w.avatar;
  av.x = -1; run(w, 1.8, { x: 0.35 }); run(w, 0.4, { x: 0 });
  assert.equal(av.supportSteps, 0, 'floating');
  run(w, 2, { x: 0 });
  w.input.reset = true; w.step();
  run(w, 0.3);
  assert.ok(av.supportSteps > 0 && av.x < 0 && Math.abs(av.y - AVATAR.hh) < 0.01, `back on the Orilla at ${av.x.toFixed(2)},${av.y.toFixed(2)}`);
});
