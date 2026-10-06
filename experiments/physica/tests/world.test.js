import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World, DT, ballisticPath, SPHERE, AVATAR } from '../src/sim/world.js';
import { FixedStepper } from '../src/sim/stepper.js';
import { CASCADA, STREAM_SPEED, TERRACE_Y } from '../src/sim/levels/cascada.js';
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
  // Released from 1 m the sphere clears the band completely above the top (peak 3.8 m).
  const w = fresh(), sB = stand(w, 'B');
  w.avatar.x = sB.x; w.step(); w.input.adjust = -1; w.step(); w.input.adjust = -1; w.step();
  assert.equal(sB.clampY, 1);
  const st = releaseStand(w, 'B'), b = st.body, z = w.field.zones[0];
  let before = null;
  for (let i = 0; i < 4 / DT; i++) {
    const wt = w.field.weight(z, b.x, b.y);
    if (wt >= 0.5) before = { vy: b.vy };
    w.step();
    if (before && w.field.weight(z, b.x, b.y) < 0.5) break;
  }
  assert.ok(Math.abs(b.vy - before.vy) < 0.1, `exit velocity ${b.vy} vs just before ${before.vy}`);
  // Once clear of the band it decelerates at exactly g.
  let guard = 0; while (w.field.weight(z, b.x, b.y - SPHERE.r) > 0 && guard++ < 600) w.step();
  assert.ok(guard < 600, 'the sphere clears the band');
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

// Redesign (iter 2): the stream no longer leaves the lip (its arch drew the explorer's route).
// The water rises from the bottom of the chasm — the deepest start — and crests over the Terraza.
test('the water rising from the chasm floor crests over the Terraza and lands on it', () => {
  const w = fresh(), sp = CASCADA.spring;
  const path = ballisticPath(w.field, sp.x, sp.y, sp.vx, sp.vy, { steps: 2400 });
  const down = path.find((p, i) => i > 0 && p.vy < 0 && p.y <= TERRACE_Y + 0.02 && p.x > 4.5);
  const peak = path.reduce((m, p) => Math.max(m, p.y), -Infinity);
  assert.ok(peak > TERRACE_Y, `crest at ${peak}`);
  assert.ok(down && down.x > 4.6, `comes down on the Terraza at x=${down?.x}`);
  assert.ok(path.filter(p => p.x < 4.5).every(p => p.x > 0), 'stays in the chasm until it crests');
  // it rises clear of the Terraza's face (no water sliding on the cliff)
  assert.ok(Math.max(...path.filter(p => p.y > 2.5 && p.y < TERRACE_Y && p.vy > 0).map(p => p.x)) < 4.2, 'clear of the face while rising');
});

// Redesign (iter 2): from the lip the explorer must fall short — a safe failure that informs.
test('walking off the lip, the explorer rises but falls short of the Terraza and is not stranded', () => {
  const w = fresh(), av = w.avatar;
  let apex = -Infinity;
  for (let i = 0; i < 8 / DT; i++) { w.input.x = 1; w.step(); for (const e of w.drainEvents()) if (e.type === 'apex') apex = Math.max(apex, e.y); }
  assert.ok(av.x < 4.6 || av.y - AVATAR.hh < TERRACE_Y - 0.1, 'did not land on the Terraza');
  const expected = 3 + (ZONE.g.y / G_FAMILIAR) * (3 - AVATAR.hh) - AVATAR.hh;   // sharp-boundary estimate
  assert.ok(Math.abs(apex - expected) < 0.15, `feet peaked at ${apex}, model ${expected}`);
  assert.ok(TERRACE_Y - apex > 0.5, 'clearly short, beyond the edge-grab reach');
  let back = false;
  for (let i = 0; i < 10 / DT && !back; i++) { w.input.x = -1; w.step(); back = av.supportSteps > 5 && av.x < 0; }
  assert.ok(back, 'steering back reaches the Orilla');
});

function chainRoute(w, letGoY) {
  const av = w.avatar;
  w.shortSeen = true;
  av.x = -0.4; av.y = AVATAR.hh; av.px = av.x; av.py = av.y;
  run(w, 0.3);
  w.input.act = true; w.step();
  assert.equal(av.heldBy?.type, 'chain', 'holding the chain');
  let n = 0; while (av.y > letGoY && n++ < 3000) { w.input.y = -1; w.step(); }
  w.input.y = 0; w.input.act = true; w.step();
  assert.equal(av.heldBy, null, 'let go');
  for (let i = 0; i < 8 / DT; i++) { w.input.x = 1; w.step(); if (av.x > 4.6 && av.supportSteps > 10) break; }
  return av.x > 4.6 && av.supportSteps > 10 && Math.abs(av.y - AVATAR.hh - TERRACE_Y) < 0.02;
}

test('the chain: letting go deep enough reaches the Terraza, too shallow does not', () => {
  for (const y of [0.55, 0, -0.5]) assert.equal(chainRoute(fresh(), y), false, `let go at ${y} should fall short`);
  for (const y of [-1, -1.5, -2, -2.45]) assert.equal(chainRoute(fresh(), y), true, `let go at ${y} should reach`);
});

test('the bell at the Terraza height rings for B from the same depths that carry the explorer', () => {
  const rings = y0 => {
    const w = fresh(), st = stand(w, 'B');
    w.avatar.x = st.x; w.step();
    while (st.clampY > y0 + 1e-9) { w.input.adjust = -1; w.step(); }
    w.input.act = true; w.step();
    let n = 0; for (let i = 0; i < 4 / DT; i++) { w.step(); n += w.drainEvents().filter(e => e.type === 'bell').length; }
    return n > 0;
  };
  for (const y of [2, 1, 0, -0.5]) assert.equal(rings(y), false, `B from ${y} should not ring`);
  for (const y of [-1, -1.5, -2, -2.5]) assert.equal(rings(y), true, `B from ${y} should ring`);
});

test('B\'s clamp moves in 0.5 m steps along its rail and stops at its ends', () => {
  const w = fresh(), st = stand(w, 'B');
  w.avatar.x = st.x; w.step();
  for (let i = 0; i < 20; i++) { w.input.adjust = -1; w.step(); }
  assert.equal(st.clampY, -2.5);
  assert.equal(st.body.y, -2.5);
  w.input.adjust = 1; w.step();
  assert.equal(st.clampY, -2);
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

test('a loose sphere pushed off the lip rises like the explorer and also falls short', () => {
  const w = fresh(), av = w.avatar;
  const b = w.bodies.filter(x => x.home)[2]; b.heldBy = null; b.x = -2; b.y = SPHERE.r;
  av.x = -3; av.y = AVATAR.hh;
  let t = 0; while (t++ < 2.5 / DT) { w.input.x = av.x < -0.7 ? 1 : 0; w.step(); }
  let top = -Infinity; for (let i = 0; i < 6 / DT; i++) { w.input.x = 0; w.step(); top = Math.max(top, b.y + b.r); }
  assert.ok(top < TERRACE_Y && b.x < 4.5 + b.r, `sphere top reached ${top.toFixed(2)} at x=${b.x.toFixed(2)}`);
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
  run(w, 0.9);   // mid-flight, away from the clamp (near it the reel would re-arm in one step)
  const first = w.traces.find(t => t.source === 'B').marks.slice(0, 8).map(m => [m.x, m.y]);
  w.input.act = true; w.step();
  assert.equal(st.state, 'reeling');
  run(w, 5);
  assert.equal(st.state, 'armed');
  w.input.act = true; w.step();
  run(w, 0.9);
  const tr = w.traces.filter(t => t.source === 'B');
  const second = tr[tr.length - 1].marks.slice(0, 8).map(m => [m.x, m.y]);
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
  assert.ok(chainRoute(w, -1.5), 'down the chain and across to the Terraza');
});

test('equivalence: a sphere and the explorer let go side by side at the same depth rise together', () => {
  const w = fresh(), av = w.avatar;
  w.shortSeen = true;
  av.x = -0.4; av.y = AVATAR.hh; run(w, 0.3);
  w.input.act = true; w.step();
  let n = 0; while (av.y > -1.5 && n++ < 3000) { w.input.y = -1; w.step(); }
  w.input.y = 0;
  const b = w.bodies.filter(x => x.home)[0];
  b.heldBy = null; b.x = av.x + 0.9; b.y = av.y; b.vx = b.vy = 0;   // set beside the hands (test setup)
  w.input.act = true; w.step();
  let worst = 0;
  for (let i = 0; i < 1.2 / DT; i++) { w.step(); worst = Math.max(worst, Math.abs(b.y - av.y)); }
  assert.ok(worst < 0.01, `vertical separation grew to ${worst}`);
});

test('returning from the Terraza: stepping back into the region and holding ▶ gets back onto it', () => {
  // Reviewer's case: walk left off the terrace, float, then hold right at various reaction times.
  for (const react of [0.3, 0.6, 1.0, 1.3, 1.8, 2.5, 3.2]) {
    const w = fresh(), av = w.avatar;
    av.x = 6; av.y = TERRACE_Y + AVATAR.hh; av.px = av.x; av.py = av.y;
    run(w, 0.3);
    let n = 0; while (av.x > 4.3 && n++ < 600) { w.input.x = -1; w.step(); }
    run(w, react, { x: 0 });
    let ok = false;
    for (let i = 0; i < 10 / DT && !ok; i++) { w.input.x = 1; w.step(); ok = av.x > 4.6 && av.supportSteps > 10 && Math.abs(av.y - AVATAR.hh - TERRACE_Y) < 0.02; }
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

test('climbing back up the chain leaves the explorer on firm ground on the Orilla', () => {
  const w = fresh(), av = w.avatar;
  av.x = -0.4; av.y = AVATAR.hh; run(w, 0.3);
  w.shortSeen = true;
  w.input.act = true; w.step();
  assert.equal(av.heldBy?.type, 'chain');
  run(w, 0.6, { y: -1 });
  run(w, 2, { y: 1 });
  run(w, 1, { y: 0 });
  assert.equal(av.heldBy, null, 'off the chain');
  assert.ok(av.supportSteps > 30 && av.x < -0.2 && Math.abs(av.y - AVATAR.hh) < 0.01, `on the Orilla at ${av.x.toFixed(2)},${av.y.toFixed(2)}`);
});

test('the bell rings once per release, not on every bounce', () => {
  const w = fresh(), st = stand(w, 'B');
  w.avatar.x = st.x; w.step();
  while (st.clampY > -1.5 + 1e-9) { w.input.adjust = -1; w.step(); }
  w.input.act = true; w.step();
  let n = 0; for (let i = 0; i < 30 / DT; i++) { w.step(); n += w.drainEvents().filter(e => e.type === 'bell').length; }
  assert.equal(n, 1);
});

test('the chain is offered only after a first attempt fell short (or after the bell rang)', () => {
  const w = fresh(), av = w.avatar;
  av.x = -0.4; av.y = AVATAR.hh; run(w, 0.3);
  assert.ok(!w.interactables().some(i => i.kind === 'chain'), 'not offered at first');
  w.shortSeen = true;
  assert.ok(w.interactables().some(i => i.kind === 'chain'), 'offered after a short attempt');
});

// ---- El Pozo: the same rule in another geometry, with two limits (iter 3) ----
import { WELL, MIRADOR_Y } from '../src/sim/levels/cascada.js';

function wellRoute(w, letGoY, steer = 1) {
  const av = w.avatar;
  av.x = WELL.x0 - 0.4; av.y = TERRACE_Y + AVATAR.hh; av.px = av.x; av.py = av.y;
  run(w, 0.3);
  w.input.act = true; w.step();
  assert.equal(av.heldBy?.type, 'chain', 'holding the well chain');
  assert.equal(av.heldBy.chain.id, 'pozo');
  let n = 0; while (av.y > letGoY && n++ < 4000) { w.input.y = -1; w.step(); }
  w.input.y = 0; w.input.act = true; w.step();
  for (let i = 0; i < 8 / DT; i++) {
    w.input.x = steer; w.step();
    const sd = av.support?.solid?.id;
    if (av.supportSteps > 10 && sd === 'mirador') return 'mirador';
    if (av.supportSteps > 10 && sd === 'pozo-fondo') return 'cae';
  }
  return 'corto';
}

test('El Pozo: let go too low and you drop; in the window you reach the Mirador; too high falls short', () => {
  assert.equal(wellRoute(fresh(), 0.9), 'cae', 'below the region floor nothing lifts');
  assert.equal(wellRoute(fresh(), 1.05), 'cae', 'in the lower band the pull is still downward');
  for (const y of [1.3, 1.5, 1.7, 2.0, 2.25]) assert.equal(wellRoute(fresh(), y), 'mirador', `from ${y}`);
  for (const y of [2.5, 3.0, 3.5]) assert.equal(wellRoute(fresh(), y), 'corto', `from ${y}`);
});

test('El Pozo: from the well floor the explorer can climb the chain back to the Terraza', () => {
  const w = fresh(), av = w.avatar;
  assert.equal(wellRoute(w, 0.9), 'cae');
  run(w, 0.5, { x: -1 });
  w.input.x = 0;
  const ch = w.chains.find(c => c.id === 'pozo');
  // walk to the chain's foot and take it from below
  let n = 0; while (Math.abs(av.x - (ch.x - ch.side)) > 0.05 && n++ < 600) { w.input.x = Math.sign(ch.x - ch.side - av.x) * 0.4; w.step(); }
  w.input.x = 0; run(w, 0.2);
  const grab = w.interactables().find(i => i.kind === 'chain-foot');
  assert.ok(grab, `the chain is offered from the well floor (at x=${av.x.toFixed(2)})`);
  w.input.act = true; w.step();
  for (let i = 0; i < 8 / DT && av.heldBy; i++) { w.input.y = 1; w.step(); }
  w.input.y = 0; run(w, 0.5);
  assert.ok(av.supportSteps > 10 && Math.abs(av.y - AVATAR.hh - TERRACE_Y) < 0.01 && av.x < WELL.x0, `back on the Terraza at ${av.x.toFixed(2)},${(av.y - AVATAR.hh).toFixed(2)}`);
});

test('El Pozo: walking into it from the Terraza never reaches the Mirador, and there is always a way out', () => {
  const w = fresh(), av = w.avatar;
  av.x = WELL.x0 - 1.5; av.y = TERRACE_Y + AVATAR.hh; run(w, 0.2);
  let entered = false, reachedMirador = false;
  for (let i = 0; i < 10 / DT; i++) {
    w.input.x = 1; w.step();
    if (av.x > WELL.x0 + 0.3) entered = true;
    if (av.supportSteps > 10 && av.support?.solid?.id === 'mirador') reachedMirador = true;
  }
  assert.ok(entered, 'it really went into the shaft');
  assert.ok(!reachedMirador, 'walking in does not reach the Mirador');
  // Ways out: steer back to the Terraza, or catch the chain in the air.
  let back = false;
  for (let i = 0; i < 10 / DT && !back; i++) { w.input.x = -1; w.step(); back = av.supportSteps > 10 && av.support?.solid?.id === 'terraza'; }
  assert.ok(back, 'steering back lands on the Terraza');
});

test('El Pozo: an explorer bobbing beside a chain can catch it and climb out', () => {
  const w = fresh(), av = w.avatar;
  assert.equal(wellRoute(w, 4.2, 0), 'corto');      // let go just under the top, no steering: it bobs
  assert.equal(av.supportSteps, 0, 'still bobbing');
  const it = w.interactables().find(i => i.kind === 'chain-air');
  assert.ok(it, 'the chain is offered in the air');
  w.input.act = true; w.step();
  assert.equal(av.heldBy?.type, 'chain');
  for (let i = 0; i < 6 / DT && av.heldBy; i++) { w.input.y = 1; w.step(); }
  w.input.y = 0; run(w, 0.4);
  assert.ok(av.supportSteps > 10 && av.support?.solid?.id === 'terraza', 'climbed out onto the Terraza');
});

test('El Pozo: the water is not firm footing — R from the water returns to the Terraza', () => {
  const w = fresh(), av = w.avatar;
  assert.equal(wellRoute(w, 0.9), 'cae');
  run(w, 1.0, { x: 0 });
  assert.ok(av.lastSupport && av.lastSupport.y > TERRACE_Y, `last footing kept on the Terraza (${av.lastSupport?.x},${av.lastSupport?.y})`);
  w.input.reset = true; w.step(); run(w, 0.3);
  assert.ok(av.support?.solid?.id === 'terraza', 'R put the explorer back on the Terraza');
});

test('El Pozo: support P predicts the explorer — its bell rings from exactly the clamp heights that reach the Mirador', () => {
  const rings = y0 => {
    const w = fresh(), st = stand(w, 'P');
    w.avatar.x = st.x; w.avatar.y = TERRACE_Y + AVATAR.hh; w.step();
    while (st.clampY > y0 + 1e-9) { w.input.adjust = -1; w.step(); }
    while (st.clampY < y0 - 1e-9) { w.input.adjust = 1; w.step(); }
    w.input.act = true; w.step();
    let n = 0; for (let i = 0; i < 5 / DT; i++) { w.step(); n += w.drainEvents().filter(e => e.type === 'bell' && e.bell === 'pozo').length; }
    return { n, fell: st.body.y < WELL.floorY + 0.3 };
  };
  for (const y of [1.5, 2.0]) assert.ok(rings(y).n > 0, `P from ${y} rings`);
  for (const y of [2.5, 3.0, 4.0]) assert.equal(rings(y).n, 0, `P from ${y} is short`);
  for (const y of [-0.5, 0, 0.5, 1.0]) { const r = rings(y); assert.ok(r.n === 0 && r.fell, `P from ${y} falls into the water`); }
  for (const y of [1.5, 2.0]) assert.equal(wellRoute(fresh(), y), 'mirador', `explorer from ${y}`);
  for (const y of [1.0, 2.5]) assert.notEqual(wellRoute(fresh(), y), 'mirador', `explorer from ${y}`);
});

test('The Mirador is left by its steps and the steps lead back up: no dead end', () => {
  const w = fresh(), av = w.avatar;
  av.x = 14; av.y = MIRADOR_Y + AVATAR.hh; run(w, 0.3);
  let n = 0; while (av.x < 18 && n++ < 10 / DT) { w.input.x = 1; w.step(); }
  run(w, 0.6, { x: 0 });
  assert.ok(av.x >= 18 && Math.abs(av.y - AVATAR.hh - TERRACE_Y) < 0.01, `down on the far Terraza at ${av.x.toFixed(2)}`);
  n = 0; while (av.x > 14 && n++ < 10 / DT) { w.input.x = -1; w.step(); }
  assert.ok(av.x <= 14 && Math.abs(av.y - AVATAR.hh - MIRADOR_Y) < 0.01, `back up on the Mirador at ${av.x.toFixed(2)},${(av.y - AVATAR.hh).toFixed(2)}`);
});

test("a support's prompt sits over the sphere it releases; reeling in, over the post", () => {
  const w = fresh(), av = w.avatar;
  for (const id of ['A', 'B']) {
    const st = stand(w, id);
    av.x = av.px = st.x; av.y = av.py = st.baseY + av.hh; av.vx = av.vy = 0; run(w, 0.3);
    const it = w.interactables().find(i => i.kind === 'stand' && i.id === id);
    assert.ok(it, `support ${id} offers its action`);
    assert.equal(it.body, st.body.id);
    const dx = st.prompt?.dx ?? 0; // B's is offset into the chasm's open air
    assert.ok(Math.abs(it.x - (st.body.x + dx)) < 1e-9, `${id}: at its sphere (x ${it.x} vs ${st.body.x} + ${dx})`);
  }
  // B released: the prompt to reel in goes back to B's post.
  const b = stand(w, 'B'); releaseStand(w, 'B'); run(w, 0.5);
  av.x = av.px = b.x; av.y = av.py = b.baseY + av.hh; run(w, 0.2);
  const reel = w.interactables().find(i => i.kind === 'stand' && i.id === 'B');
  assert.equal(b.state, 'free'); assert.ok(Math.abs(reel.x - b.x) < 1e-9);
});

test('with a sphere in hand at the chain lip, the game says why the chain is not offered', () => {
  const w = fresh(), av = w.avatar; w.shortSeen = true;
  const loose = w.bodies.find(x => x.kind === 'sphere' && x.heldBy?.type === 'shelf');
  av.x = av.px = loose.x; av.y = av.py = av.hh; run(w, 0.3);
  w.input.act = true; w.step(); w.input.act = false;
  assert.ok(av.holding, 'picked up a sphere');
  av.x = av.px = -0.35; run(w, 0.3);
  const its = w.interactables();
  assert.equal(its.length, 1); assert.equal(its[0].kind, 'drop');
  assert.match(its[0].reason || '', /Manos ocupadas.*cadena/);
  // Away from the lip there is no such hint.
  av.x = av.px = -6; run(w, 0.3);
  assert.ok(!w.interactables()[0].reason);
});

test("next to the Pozo's support P, E goes to P; at the lip, to the chain (the nearest wins)", () => {
  const at = x => { const w = fresh(), av = w.avatar; av.x = av.px = x; av.y = av.py = TERRACE_Y + av.hh; run(w, 0.25); return w.interactables()[0]; };
  const p = stand(fresh(), 'P');
  for (const x of [p.x, p.x + 0.16, p.x + 0.25]) assert.equal(at(x).kind, 'stand', `at ${x.toFixed(2)} (P's post at ${p.x})`);
  assert.equal(at(10.7).kind, 'chain', 'standing at the lip');
});
