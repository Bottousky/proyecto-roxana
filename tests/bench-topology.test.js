import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { PUZZLES, initialPuzzleSnapshot, evaluatePuzzle, wireNodes, wireRole, wireFlow } from '../src/puzzle-model.js';

const source = (await readFile(new URL('../src/puzzles.js', import.meta.url), 'utf8'))
  .replace("import './puzzles.css';", '')
  .replace(/'\.\/(electrical|puzzle-model|bench-evidence)\.js'/g, (_, name) => JSON.stringify(pathToFileURL(resolve(`src/${name}.js`)).href));
const { PuzzleWorkbench } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

const solvedDistribution = () => ({
  ...initialPuzzleSnapshot('distribution'),
  wires: [['positive', 'clinicIn'], ['clinicOut', 'negative'], ['positive', 'kitchenIn'], ['kitchenOut', 'negative']],
});

/** Renders the bench markup without a browser: the shell only needs to accept HTML. */
function renderMarkup(id, state) {
  const element = { style: { setProperty() {} }, offsetHeight: 0, value: '', scrollTop: 0 };
  const shell = { innerHTML: '', contains: () => false, querySelector: () => element, querySelectorAll: () => [] };
  const bench = Object.assign(Object.create(PuzzleWorkbench.prototype), { id, puzzle: PUZZLES[id], state, history: [], selected: null, mode: 'wire', showNumbers: false, active: true, feedback: '', shell, callbacks: {} });
  bench.evaluate(false);
  const previous = globalThis.document;
  globalThis.document = { activeElement: null };
  try { bench.render(); } finally { globalThis.document = previous; }
  return shell.innerHTML;
}

test('copper nodes follow wires only, never through a component', () => {
  const series = wireNodes('distribution', initialPuzzleSnapshot('distribution'));
  // The initial castle montage runs the clinic's return into the kitchen: one node.
  assert.equal(series.nodeOf.clinicOut, series.nodeOf.kitchenIn);
  assert.equal(series.nodeOf.clinicIn, series.nodeOf.positive);
  // A lamp's own two terminals are separate nodes; the lamp is not copper.
  assert.notEqual(series.nodeOf.clinicIn, series.nodeOf.clinicOut);
  assert.notEqual(series.nodeOf.positive, series.nodeOf.negative);

  const parallel = wireNodes('distribution', solvedDistribution());
  // In parallel both services share the source's two nodes.
  assert.deepEqual(new Set(parallel.members[parallel.nodeOf.positive]), new Set(['positive', 'clinicIn', 'kitchenIn']));
  assert.deepEqual(new Set(parallel.members[parallel.nodeOf.negative]), new Set(['negative', 'clinicOut', 'kitchenOut']));
});

test('wire colour depends on its own ends, so it cannot give away hidden topology', () => {
  assert.equal(wireRole(['positive', 'lampIn']), 'supply');
  assert.equal(wireRole(['lampOut', 'negative']), 'return');
  assert.equal(wireRole(['spliceB', 'lampIn']), 'link');
  assert.equal(wireRole(['negative', 'positive']), 'short');
});

test('current flow appears only where the simulation carries current, in its direction', () => {
  const state = solvedDistribution();
  const result = evaluatePuzzle('distribution', state);
  assert.equal(result.solved, true);
  const flows = state.wires.map((_, i) => wireFlow(result, i, true));
  assert.ok(flows.every(Boolean), 'every service wire carries current');
  // positive → clinicIn is drawn forward and conventional current leaves the + terminal.
  assert.equal(flows[0].forward, true);
  // clinicOut → negative also carries current towards the return terminal.
  assert.equal(flows[1].forward, true);
  assert.ok(flows[0].seconds >= .7 && flows[0].seconds <= 2.4);

  assert.equal(wireFlow(result, 0, false), null, 'no pulses without supply');
  const open = initialPuzzleSnapshot('workshop');
  const openResult = evaluatePuzzle('workshop', open);
  assert.ok(open.wires.every((_, i) => wireFlow(openResult, i, true) === null), 'an interrupted path carries nothing');
});

test('stronger current moves faster, and a reversed wire flows backwards along its drawing', () => {
  const state = solvedDistribution();
  state.wires[0] = ['clinicIn', 'positive'];
  const result = evaluatePuzzle('distribution', state);
  assert.equal(wireFlow(result, 0, true).forward, false);
  const weak = evaluatePuzzle('distribution', initialPuzzleSnapshot('distribution'));
  assert.ok(wireFlow(weak, 0, true).seconds > wireFlow(result, 0, true).seconds);
});

test('the rendered bench marks nodes, uses the convention and draws flow only when powered', () => {
  const html = renderMarkup('distribution', solvedDistribution());
  assert.match(html, /data-node="/);
  assert.match(html, /wb-node-caption/);
  assert.match(html, /wire-supply/);
  assert.match(html, /wire-return/);
  assert.doesNotMatch(html, /wire-[0-3]\b/, 'index colours are gone');
  assert.equal((html.match(/class="wb-wire-flow/g) ?? []).length, 4);

  const off = { ...solvedDistribution(), sourceOn: false };
  assert.doesNotMatch(renderMarkup('distribution', off), /class="wb-wire-flow/);
});
