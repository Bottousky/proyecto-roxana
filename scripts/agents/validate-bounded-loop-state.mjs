#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const arg = process.argv[2] || 'agent-work/loops/ohmdal-plaza/state.json';
const file = path.resolve(root, arg);

function fail(message) {
  console.error(`BOUNDED_LOOP_STATE FAIL: ${message}`);
  process.exit(1);
}

let state;
try {
  state = JSON.parse(await readFile(file, 'utf8'));
} catch (error) {
  fail(`cannot read/parse ${arg}: ${error.message}`);
}

const validStatuses = new Set([
  'ready',
  'reviewing',
  'planning',
  'implementing',
  'validating',
  'capturing',
  'stage_pass',
  'stage_partial',
  'human_gate',
  'complete',
]);

if (state.schemaVersion !== 1) fail('schemaVersion must be 1');
if (!state.loopId) fail('loopId is required');
if (!state.branch) fail('branch is required');
if (!validStatuses.has(state.status)) fail(`invalid status ${state.status}`);
if (!state.currentStage) fail('currentStage is required');

for (const [key, max] of [
  ['maxIterationsPerStage', 3],
  ['maxFixesPerIteration', 5],
  ['maxStructuralFixesPerIteration', 1],
  ['maxConcurrentLunaWorkers', 2],
]) {
  if (!Number.isInteger(state[key]) || state[key] < 1 || state[key] > max) {
    fail(`${key} must be integer 1..${max}`);
  }
}

if (state.maxConcurrentMiniMaxWorkers != null) {
  if (!Number.isInteger(state.maxConcurrentMiniMaxWorkers) || state.maxConcurrentMiniMaxWorkers !== 1) {
    fail('maxConcurrentMiniMaxWorkers must be exactly 1 when present');
  }
}

if (!Number.isInteger(state.iteration) || state.iteration < 0 || state.iteration > state.maxIterationsPerStage) {
  fail('iteration is outside bounded range');
}

const reviewer = state.routing?.reviewer;
if (!reviewer) fail('routing.reviewer is required');
if (reviewer.harness !== 'antigravity-cli') fail('reviewer harness must be antigravity-cli');
const reviewerModel = String(reviewer.model || '').toLowerCase();
if (!reviewerModel.includes('gemini') || !reviewerModel.includes('flash')) {
  fail('automatic reviewer must remain in the Gemini Flash family');
}
if (!String(reviewer.fallback || '').toLowerCase().includes('flash')) {
  fail('reviewer fallback must remain Flash-family only');
}

const decision = state.routing?.decision;
if (!decision || decision.harness !== 'codex' || decision.modelAlias !== 'Sol' || decision.effort !== 'high') {
  fail('decision routing must be Codex / Sol / high');
}

const worker = state.routing?.mechanicalWorker;
if (!worker || worker.harness !== 'codex-subagent' || worker.modelAlias !== 'Luna' || worker.effort !== 'max') {
  fail('mechanical worker routing must be Codex subagent / Luna / max');
}

const experimentalWorker = state.routing?.experimentalWorker;
if (experimentalWorker) {
  if (experimentalWorker.harness !== 'gmi-api-sidecar') fail('experimental worker harness must be gmi-api-sidecar');
  if (!String(experimentalWorker.model || '').toLowerCase().includes('minimax')) fail('experimental worker must be MiniMax family');
  if (experimentalWorker.mode !== 'proposal-only') fail('experimental worker must remain proposal-only');
  if (!String(experimentalWorker.fallback || '').includes('no-human-gate')) {
    fail('experimental worker fallback must not create a HUMAN_GATE');
  }
}

const limits = state.limits || {};
for (const key of [
  'allowPaidGenerativeWithoutHumanGate',
  'allowEngineChange',
  'allowCanonChange',
  'allowLargeDependencyChange',
  'allowNewAgentFramework',
]) {
  if (limits[key] !== false) fail(`${key} must be false`);
}

if (!Array.isArray(state.queue) || state.queue.length < 1) fail('queue must be non-empty');
const ids = new Set();
for (const item of state.queue) {
  if (!item?.id) fail('every queue item needs id');
  if (ids.has(item.id)) fail(`duplicate queue id ${item.id}`);
  ids.add(item.id);
}
if (!ids.has(state.currentStage)) fail('currentStage must exist in queue');

if (state.status === 'human_gate' && !state.humanGate) fail('human_gate status requires humanGate details');
if (state.status !== 'human_gate' && state.humanGate != null) fail('humanGate must be null unless status=human_gate');

console.log(`BOUNDED_LOOP_STATE PASS: ${state.loopId} stage=${state.currentStage} iteration=${state.iteration}/${state.maxIterationsPerStage}`);
console.log(`reviewer=${reviewer.model} decision=${decision.modelAlias}/${decision.effort} worker=${worker.modelAlias}/${worker.effort}`);
if (experimentalWorker) console.log(`experimental=${experimentalWorker.model}/${experimentalWorker.mode}`);
