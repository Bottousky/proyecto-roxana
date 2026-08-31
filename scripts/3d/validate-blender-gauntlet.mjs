import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const input = process.argv[2] ?? 'agent-work/gauntlets/galvanoscope.json';
const absoluteInput = path.resolve(input);
const fail = (message) => { throw new Error(`Blender Gauntlet: ${message}`); };
if (!existsSync(absoluteInput)) fail(`missing run manifest ${input}`);

const run = JSON.parse(readFileSync(absoluteInput, 'utf8'));
if (run.schemaVersion !== 1) fail('schemaVersion must be 1');
if (!['accepted', 'candidate'].includes(run.status)) fail('status must be accepted or candidate');
if (run.route !== 'blender-deterministic-first') fail('route must be blender-deterministic-first');
if (!Number.isInteger(run.iterations) || run.iterations < 1 || run.iterations > 3) fail('iterations must be 1..3');
if (!Number.isInteger(run.maxFixesPerIteration) || run.maxFixesPerIteration < 0 || run.maxFixesPerIteration > 3) fail('maxFixesPerIteration must be 0..3');
if (run.paidProvider !== null || run.creditsSpent !== 0) fail('paid provider use requires a separate HUMAN_GATE');

const required = [
  run.heroReference, run.buildScript, run.blenderMaster, run.canonicalGlb,
  run.independentReview, run.provenance,
  ...['front', 'three-quarter', 'side', 'back'].map((view) => run.previews?.[view]),
];
for (const file of required) {
  if (typeof file !== 'string' || !existsSync(path.resolve(file))) fail(`missing artifact ${String(file)}`);
}

for (const [script, args] of [
  ['scripts/3d/validate-hero-reference-pack.mjs', [run.heroReference]],
  ['scripts/3d/validate-glb.mjs', [run.canonicalGlb]],
]) {
  const result = spawnSync(process.execPath, [script, ...args], { stdio: 'inherit' });
  if (result.status !== 0) fail(`${script} exited ${result.status}`);
}

console.log(`Blender Gauntlet PASS: ${run.assetId} (${run.iterations}/3 iteration, 0 paid credits)`);
