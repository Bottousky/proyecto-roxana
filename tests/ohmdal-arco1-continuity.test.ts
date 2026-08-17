/**
 * Tests for the continuity model (Puzzle 1).
 *
 * Run with: `node --experimental-strip-types tests/ohmdal-arco1-continuity.test.ts`
 */

import {
  createContinuityState,
  computeReachability,
  initialBrokenSet,
  repairEdge,
  breakEdge,
  isEnergized,
  isPuzzleSolved,
  isValidRepairSet,
  type ContinuityNode,
  type ContinuityEdge,
} from '../src/ohmdal-arco1/puzzles/continuityModel.ts';

const nodes: ContinuityNode[] = [
  { id: 'src', type: 'source' },
  { id: 'A', type: 'load' },
  { id: 'B', type: 'load' },
  { id: 'C', type: 'load' },
];

const edges: ContinuityEdge[] = [
  { id: 'e1', from: 'src', to: 'A', state: 'intact' },
  { id: 'e2', from: 'A', to: 'B', state: 'intact' },
  { id: 'e3', from: 'B', to: 'C', state: 'intact' },
];

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}: ${e}`);
    failed++;
  }
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

console.log('continuityModel:');

test('initial state: all intact, all reachable', () => {
  const state = createContinuityState(nodes, edges, 'src');
  const r = computeReachability(state, new Set());
  assert(r.reachable.src, 'src reachable');
  assert(r.reachable.A, 'A reachable');
  assert(r.reachable.B, 'B reachable');
  assert(r.reachable.C, 'C reachable');
});

test('one edge broken in topology: downstream not reachable', () => {
  const brokenEdge: ContinuityEdge = { id: 'e2', from: 'A', to: 'B', state: 'broken' };
  const localEdges = [edges[0], brokenEdge, edges[2]];
  const state = createContinuityState(nodes, localEdges, 'src');
  const initial = initialBrokenSet(localEdges);
  const r = computeReachability(state, initial);
  assert(r.reachable.src, 'src reachable');
  assert(r.reachable.A, 'A reachable');
  assert(!r.reachable.B, 'B NOT reachable (e2 broken)');
  assert(!r.reachable.C, 'C NOT reachable (B down)');
});

test('repairing broken edge restores reachability', () => {
  const brokenEdge: ContinuityEdge = { id: 'e2', from: 'A', to: 'B', state: 'broken' };
  const localEdges = [edges[0], brokenEdge, edges[2]];
  const state = createContinuityState(nodes, localEdges, 'src');
  const broken = initialBrokenSet(localEdges);
  const r1 = computeReachability(state, broken);
  assert(!r1.reachable.B, 'before repair B is not reachable');
  const after = repairEdge(state, broken, 'e2');
  const r2 = computeReachability(state, after);
  assert(r2.reachable.B, 'after repair B is reachable');
  assert(r2.reachable.C, 'after repair C is reachable');
});

test('breaking an intact edge stops flow', () => {
  const state = createContinuityState(nodes, edges, 'src');
  const broken = new Set<string>();
  const r1 = computeReachability(state, broken);
  assert(r1.reachable.C, 'C initially reachable');
  const after = breakEdge(state, broken, 'e2');
  const r2 = computeReachability(state, after);
  assert(!r2.reachable.C, 'C not reachable after breaking e2');
});

test('puzzle solved: required loads all reachable', () => {
  const state = createContinuityState(nodes, edges, 'src');
  const broken = new Set<string>();
  assert(isPuzzleSolved(state, broken, ['A', 'B', 'C']), 'all loads reachable');
});

test('puzzle not solved if any required load unreachable', () => {
  const brokenEdge: ContinuityEdge = { id: 'e3', from: 'B', to: 'C', state: 'broken' };
  const localEdges = [edges[0], edges[1], brokenEdge];
  const state = createContinuityState(nodes, localEdges, 'src');
  const initial = initialBrokenSet(localEdges);
  assert(!isPuzzleSolved(state, initial, ['A', 'B', 'C']), 'C is not reachable');
});

test('isValidRepairSet: any known edge is valid', () => {
  const brokenEdge: ContinuityEdge = { id: 'e2', from: 'A', to: 'B', state: 'broken' };
  const state = createContinuityState(nodes, [edges[0], brokenEdge, edges[2]], 'src');
  assert(isValidRepairSet(state, new Set(['e2'])), 'e2 is known');
  assert(isValidRepairSet(state, new Set(['e1'])), 'e1 is known');
  assert(!isValidRepairSet(state, new Set(['nonexistent'])), 'unknown edge not OK');
});

test('isEnergized helper', () => {
  const state = createContinuityState(nodes, edges, 'src');
  const r = computeReachability(state, new Set());
  assert(isEnergized(r, 'src'), 'src energized');
  assert(isEnergized(r, 'A'), 'A energized');
  assert(!isEnergized(r, 'unknown' as any), 'unknown returns false');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
