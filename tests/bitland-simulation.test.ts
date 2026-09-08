import assert from 'node:assert/strict';
import { initial, inherited, tick, Machine, setInput, validate } from '../src/experiments/bitland/simulation.ts';
import type { Op, Mode } from '../src/experiments/bitland/simulation.ts';
const conditional: Op[] = ['pick', 'fork', 'sense', 'gpio', 'drop', 'home'];
const run = (program: Op[], gate = true, count = 1, mode: Mode = 'once', ticks = 50) => {
  let s = initial(program, gate, count, mode);
  for (let i = 0; i < ticks; i++) { s = tick(s); assert.equal(validate(s, 0).conserved, true); }
  return s;
};
for (const gate of [true, false]) {
  const s = run(conditional, gate);
  assert.equal(s.delivered.length, 1); assert.equal(s.halted, true); assert.equal(s.fault, null);
  assert.equal(s.trace.find(t => t.instruction === 'sense')?.reads.gateOpen, gate);
  const alternate = run(['pick', 'wait', 'fork', 'bypass', 'gpio', 'drop', 'home'], gate);
  assert.equal(alternate.delivered.length, 1); assert.equal(alternate.fault, null);
}
assert.match(run(inherited, false).fault!, /cerrado/);
assert.match(run(['drop']).fault!, /puerto/);
assert.match(run(['pick', 'pick']).fault!, /Ya lleva/);
assert.match(run(['pick'], true, 0).fault!, /vacío/);
assert.equal(run(conditional, true, 3, 'three').delivered.length, 3);
for (const count of [0, 1, 3, 5]) {
  const s = run(conditional, false, count, 'pending', 80);
  assert.equal(s.delivered.length, count); assert.equal(s.halted, true); assert.equal(s.fault, null);
}
const badLoop = run(['wait'], true, 0, 'forever', 30);
assert.equal(badLoop.halted, false); assert.equal(badLoop.cycles, 15);
assert.equal(run(['wait'], true, 0, 'pending').halted, true);
const lit = run(conditional, true, 1, 'once', 8);
assert.equal(lit.led, true); assert.equal(lit.trace.at(-1)?.process, 'GPIO → LED');
assert.equal(run(conditional, true, 1, 'once', 14).led, false);
const base = initial(conditional); const frozen = structuredClone(base); tick(base); assert.deepEqual(base, frozen);
const a = new Machine(initial(conditional, false, 5, 'pending'));
const b = new Machine(initial(conditional, false, 5, 'pending'));
for (let i = 0; i < 40; i++) { a.step(); b.step(); assert.deepEqual(a.state, b.state); }
const snapshot = structuredClone(a.state); a.step(); a.rewind(); assert.deepEqual(a.state, snapshot);
a.apply(setInput(a.state, true)); a.rewind(); assert.deepEqual(a.state, snapshot);
let live = setInput(initial(conditional, true, 1, 'pending'), true, true);
for (let i = 0; i < 100; i++) live = tick(live);
assert.equal(live.fault, null); assert.equal(live.halted, false); assert.ok(live.delivered.length >= 6);
assert.equal(validate(live, 6).conserved, true);
console.log('Bitland: semantics, transfer, alternate solutions, loops, FIFO I/O, conservation, determinism, rewind and automation passed.');
