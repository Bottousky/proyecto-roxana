// Depth (Hito B, B2): the same simulation, with one more dimension where the level declares it.
// The 2.5D path must not change; behind the Terraza's back wall, through the arch, a passage
// leads to a neighbourhood with familiar conditions, and the explorer comes back the same way.
import test from 'node:test';
import assert from 'node:assert/strict';
import { World, DT, AVATAR } from '../src/sim/world.js';
import { CASCADA, TERRACE_Y, ARCH, BARRIO, MIRADOR_Y, WELL } from '../src/sim/levels/cascada.js';
import { G_FAMILIAR } from '../src/sim/field.js';

const fresh = () => new World(CASCADA);
const run = (w, seconds, input = {}) => { const n = Math.round(seconds / DT); for (let i = 0; i < n; i++) { Object.assign(w.input, input); w.step(); } };
const put = (w, x, feetY) => { const a = w.avatar; a.x = a.px = x; a.y = a.py = feetY + a.hh; a.vx = a.vy = 0; a.z = 0; a.vz = 0; run(w, 0.3); };
const press = w => { w.input.act = true; w.step(); w.input.act = false; };
const standOn = w => w.avatar.support?.solid?.id;
/** A world where the city has been seen from the Mirador and the explorer stands at the arch. */
function atOpenArch(x = (ARCH.x0 + ARCH.x1) / 2) {
  const w = fresh();
  put(w, 14, MIRADOR_Y); run(w, 0.4);
  put(w, w.doors[0].lever.x, TERRACE_Y);
  press(w); run(w, w.doors[0].swing + 0.1);
  put(w, x, TERRACE_Y);
  return w;
}

test('the regions do not reach behind the wall: the neighbourhood has familiar conditions', () => {
  const w = fresh(), g = { x: 0, y: 0 };
  // At the Pozo's (x, y), on the 2.5D path the region acts; far behind the wall it does not.
  w.field.at((WELL.x0 + WELL.x1) / 2, 2.5, g, 0); assert.ok(g.y > 0);
  w.field.at((WELL.x0 + WELL.x1) / 2, 2.5, g, -15); assert.equal(g.y, -G_FAMILIAR);
  w.field.at(2, 0, g, -15); assert.equal(g.y, -G_FAMILIAR);
});

test('the arch opens only after the city was seen from the Mirador', () => {
  const w = fresh(), lx = w.doors[0].lever.x;
  put(w, lx, TERRACE_Y);
  assert.ok(!w.interactables().some(i => i.kind === 'door'), 'closed and not offered before the Mirador');
  put(w, 14, MIRADOR_Y); run(w, 0.4); assert.ok(w.citySeen);
  put(w, lx, TERRACE_Y);
  assert.equal(w.interactables()[0].kind, 'door');
  press(w); assert.ok(!w.doors[0].open, 'the leaf takes its time');
  run(w, 2, { y: 1 }); // ▲ while it swings: not yet walkable, then it is
  assert.ok(w.doors[0].open);
  w.input.y = 0; put(w, 7.6, TERRACE_Y);
  assert.equal(w.interactables()[0].kind, 'enter');
});

test('▲ at the open arch walks through the passage into the neighbourhood, without aiming', () => {
  const w = atOpenArch(ARCH.x0 - 0.3); // off-centre, outside the opening's width
  run(w, 6, { y: 1 });
  const a = w.avatar;
  assert.ok(a.z < -12, `in the neighbourhood (z ${a.z.toFixed(2)})`);
  assert.equal(standOn(w), 'barrio');
  assert.ok(Math.abs(a.y - a.hh - TERRACE_Y) < 0.01, 'on its pavement, at the Terraza\'s level');
});

test('in the neighbourhood the walls stop the explorer; its pavement has no holes', () => {
  const w = atOpenArch();
  run(w, 6, { y: 1 });
  run(w, 8, { x: -1, y: 0 });
  assert.ok(w.avatar.x >= BARRIO.x0 + AVATAR.hw - 1e-9, `west wall (x ${w.avatar.x.toFixed(2)})`);
  run(w, 10, { x: 1, y: 0 });
  assert.ok(w.avatar.x <= BARRIO.x1 - AVATAR.hw + 1e-9, `east wall (x ${w.avatar.x.toFixed(2)})`);
  // walking over the Pozo's x: the well's hole does not extend behind the wall
  run(w, 0.5, { x: 0 }); const a = w.avatar; a.x = (WELL.x0 + WELL.x1) / 2; run(w, 1);
  assert.equal(standOn(w), 'barrio'); assert.ok(Math.abs(a.y - a.hh - TERRACE_Y) < 0.01);
  run(w, 10, { y: 1 });
  assert.ok(a.z >= BARRIO.z0 + AVATAR.hw - 1e-9, `far wall (z ${a.z.toFixed(2)})`);
});

test('▼ walks back to the 2.5D path, which works as before', () => {
  const w = atOpenArch();
  run(w, 6, { y: 1 }); run(w, 9, { y: -1 });
  const a = w.avatar;
  assert.equal(a.z, 0); assert.equal(standOn(w), 'terraza');
  // ▲ away from the arch does nothing: depth only through a door
  put(w, 5.5, TERRACE_Y); run(w, 2, { y: 1 }); assert.equal(w.avatar.z, 0);
});

test('with a sphere in hand the explorer does not enter, and the game says why', () => {
  const w = atOpenArch();
  const s = w.bodies.find(b => b.kind === 'sphere' && b.heldBy?.type === 'shelf');
  s.heldBy = { type: 'hand' }; w.avatar.holding = s;
  run(w, 2, { y: 1 });
  assert.equal(w.avatar.z, 0);
  assert.match(w.interactables()[0].reason || '', /arco/);
});

test('determinism: the same inputs through the arch give the same state', () => {
  const go = () => { const w = atOpenArch(ARCH.x0 - 0.2); run(w, 3, { y: 1, x: 0.4 }); run(w, 2, { x: -1, y: 0.5 }); run(w, 4, { y: -1 }); const a = w.avatar; return [a.x, a.y, a.z, a.vx, a.vy, a.vz]; };
  assert.deepEqual(go(), go());
});

test('▼ from anywhere in the square leads back through the passage (it is behind the camera)', () => {
  for (const x of [3, 11, 13.5]) {
    const w = atOpenArch();
    run(w, 6, { y: 1 }); run(w, 6, { x: x > 7.6 ? 1 : -1, y: 0 });
    w.avatar.x = w.avatar.px = Math.min(Math.max(x, BARRIO.x0 + 0.3), BARRIO.x1 - 0.3); run(w, 0.2);
    run(w, 14, { x: 0, y: -1 }); // only ▼ (run keeps keys not given: release ◀▶)
    assert.equal(w.avatar.z, 0, `from x ${x}: back on the 2.5D path`);
    assert.equal(standOn(w), 'terraza');
  }
});

test('the footbridge over the Terraza\'s stream is crossed walking in depth, and is not on the 2.5D path', () => {
  const w = atOpenArch();
  let maxFeet = 0;
  for (let i = 0; i < Math.round(1.6 / DT); i++) { w.input.y = 1; w.step(); maxFeet = Math.max(maxFeet, w.avatar.y - w.avatar.hh); }
  assert.ok(maxFeet > TERRACE_Y + 0.1, 'stepped onto the footbridge');
  const v = fresh(); put(v, (ARCH.x0 + ARCH.x1) / 2, TERRACE_Y);
  assert.ok(Math.abs(v.avatar.y - v.avatar.hh - TERRACE_Y) < 0.01, 'at z = 0 there is no footbridge');
});

test('in the square the fountain and the lamps are solid; the planters are stepped onto', () => {
  const w = atOpenArch();
  run(w, 3.3, { y: 1 }); // into the square, on the fountain's axis
  run(w, 4, { x: 0, y: 1 });
  const a = w.avatar, f = w.depthBlockers.find(b => b.id === 'fuente').circle;
  assert.ok(a.z > f.z + f.r, `stopped in front of the basin (z ${a.z.toFixed(2)})`);
  // around it to a planter: stepping onto it raises the feet
  run(w, 1.2, { x: -1, y: 0 }); let top = 0;
  for (let i = 0; i < Math.round(3 / DT); i++) { w.input.x = 0; w.input.y = 1; w.step(); top = Math.max(top, a.y - a.hh); }
  assert.ok(top > TERRACE_Y + 0.3, `onto a planter (feet up to ${top.toFixed(2)})`);
  // standing still in the square, the way back is named
  run(w, 0.6, { x: 0, y: 0 });
  assert.equal(w.interactables()[0]?.kind, 'back');
});

test('▲ right at the crank (beside the arch) still gets in: its post and shaft are solid, the assist slides past them', () => {
  const w = atOpenArch(fresh().doors[0].lever.x + 0.1);
  w.input.x = 0; run(w, 5, { y: 1 });
  assert.ok(w.avatar.z < -9, `in (z ${w.avatar.z.toFixed(2)})`);
  const lever = w.depthBlockers.find(b => b.id === 'palanca');
  assert.ok(lever.z1 + AVATAR.hw < 0, 'the crank never blocks the 2.5D path at z = 0');
});

test("the square's support: reached at its depth, its sphere falls the familiar way (same instrument, other place)", async () => {
  const { fitAcceleration } = await import('../src/journal.js');
  const { SOPORTE_C, TERRACE_Y: TY } = await import('../src/sim/levels/cascada.js');
  const w = atOpenArch(), a = w.avatar;
  // out of the passage, ◀ past the fountain's side, ▲ to the support's depth (over a planter), ◀ to it
  for (let i = 0; i < 400 && a.z > -11; i++) run(w, 0.02, { y: 1 });
  run(w, 0.2, { y: 0 });
  assert.ok(!w.interactables().some(i => i.kind === 'stand'), 'no support offered at the mouth');
  for (let i = 0; i < 400 && a.x > SOPORTE_C.x + 1.4; i++) run(w, 0.02, { x: -1 });
  run(w, 0.2, { x: 0 });
  for (let i = 0; i < 600 && a.z > SOPORTE_C.z; i++) run(w, 0.02, { y: 1 });
  run(w, 0.2, { y: 0 });
  run(w, 3, { x: -1 }); run(w, 0.3, { x: 0 }); // against its post
  const it = w.interactables().find(i => i.kind === 'stand');
  assert.equal(it?.id, 'C', 'support C is offered');
  press(w);
  const st = w.stands.find(s => s.id === 'C');
  assert.equal(st.state, 'free');
  run(w, 1.5);
  const b = st.body;
  assert.ok(Math.abs(b.y - (TY + b.r)) < 0.02, `rests on the square's pavement (y ${b.y.toFixed(3)})`);
  const tr = w.traces.find(t => t.source === 'C');
  assert.ok(tr.marks.length >= 5);
  const tImpact = Math.sqrt(2 * (tr.marks[0].y - (TY + b.r)) / 9.8);
  const acc = fitAcceleration(tr.marks.filter(m => m.t < tImpact - 0.02));
  assert.ok(Math.abs(acc + 9.8) < 0.05, `familiar acceleration (${acc.toFixed(3)} m/s²)`);
});

test('against the fountain\'s side, ▼ and ▲ slide around its basin (they do not stick to it)', () => {
  const f = CASCADA.depthBlockers.find(b => b.id === 'fuente').circle;
  for (const [z0, iy] of [[f.z - 0.3, -1], [f.z + 0.3, 1], [f.z - 0.6, -1]]) {
    const w = atOpenArch(), a = w.avatar;
    a.z = a.pz = z0; a.x = a.px = f.x - 3; run(w, 0.2, { x: 0, y: 0 });
    run(w, 2, { x: 1, y: 0 }); // ▶ into the basin's west side: stopped by it
    assert.ok(a.x < f.x - f.r, `stopped at the basin (x ${a.x.toFixed(2)})`);
    const zs = a.z; run(w, 0.8, { x: 0, y: iy });
    assert.ok(Math.abs(a.z - zs) > 1, `from z ${z0.toFixed(2)}, ${iy < 0 ? '▼' : '▲'} moves along it (z ${zs.toFixed(2)} → ${a.z.toFixed(2)})`);
  }
  // head-on it still stops: the basin is solid
  const w = atOpenArch(), a = w.avatar; a.x = a.px = f.x; a.z = a.pz = f.z + f.r + 1.5; run(w, 3, { x: 0, y: 1 });
  assert.ok(a.z > f.z + f.r, 'head-on, stopped in front of it');
});

test('beside the mouth the explorer\'s body never goes into the wall\'s thickness (the camera would have it inside the rock)', () => {
  const w = atOpenArch(), a = w.avatar;
  a.x = a.px = 3.5; a.z = a.pz = -11; run(w, 0.2, { x: 0, y: 0 });
  let inWall = 0, steps = 0;
  for (let i = 0; i < Math.round(9 / DT); i++) { w.input.x = 0; w.input.y = -1; w.step(); steps++; if (a.z > -9 - AVATAR.hw + 1e-9 && (a.x - AVATAR.hw < ARCH.x0 - 1e-9 || a.x + AVATAR.hw > ARCH.x1 + 1e-9)) inWall++; }
  assert.equal(inWall, 0, `steps with the body in the wall beside the mouth: ${inWall} of ${steps}`);
  assert.equal(a.z, 0, 'and ▼ still leads back to the Terraza');
  // east of the mouth: ▼ towards the wall, ▶ and ◀ pressing against it; the body stays on the square's side
  const v = atOpenArch(), b = v.avatar; b.x = b.px = 11; b.z = b.pz = -10; run(v, 0.2, { x: 0, y: 0 });
  let pressed = 0;
  for (const [x, y, s] of [[0, -1, 0.4], [1, -1, 1.0], [-1, -1, 0.3]]) for (let i = 0; i < Math.round(s / DT); i++) {
    v.input.x = x; v.input.y = y; v.step();
    if (b.z > -9 - AVATAR.hw + 1e-9) assert.ok(b.x - AVATAR.hw >= ARCH.x0 - 1e-9 && b.x + AVATAR.hw <= ARCH.x1 + 1e-9, `in the wall at (${b.x.toFixed(2)}, ${b.z.toFixed(2)})`);
    if (b.z > -9.3) pressed++;
  }
  assert.ok(pressed > 0, 'it did reach the wall');
});

test('from the arch\'s threshold the path\'s supports are not offered (their clamps do not move while walking in)', () => {
  const w = atOpenArch(), a = w.avatar, p = w.stands.find(s => s.id === 'P'), y0 = p.clampY;
  for (const x of [8.65, 8.7, 8.74]) {
    a.x = a.px = x; a.z = a.pz = -0.8; run(w, 0.1, { x: 0, y: 0 });
    assert.ok(!w.interactables().some(i => i.kind === 'stand'), `no support offered at (${x}, −0.8)`);
  }
  assert.equal(p.clampY, y0);
});

test('the square\'s neighbours are solid, like the lamps: the explorer walks around them, not through', async () => {
  const { VECINOS } = await import('../src/sim/levels/cascada.js');
  const w = atOpenArch(), a = w.avatar, p = VECINOS.parado;
  a.x = a.px = p.x; a.z = a.pz = p.z + 1.5; run(w, 0.2, { x: 0, y: 0 });
  run(w, 2, { x: 0, y: 1 }); // ▲ straight at him
  assert.ok(a.z > p.z + 0.24, `stopped in front of the standing neighbour (z ${a.z.toFixed(2)})`);
  const s = w.depthBlockers.find(b => b.id === 'vecina').circle, f = w.depthBlockers.find(b => b.id === 'fuente').circle;
  assert.ok(Math.hypot(s.x - f.x, s.z - f.z) > f.r - 0.1, 'the sitting one is on the rim, by the basin\'s edge');
});
