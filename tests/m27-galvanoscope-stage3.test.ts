import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';

const worldPath = new URL('../src/experiences/ohmdal-playcanvas/playcanvasWorld.ts', import.meta.url);
const world = readFileSync(worldPath, 'utf8');
const glb = new URL('../assets/runtime/ohmdal/plaza/heroes/galvanoscope/galvanoscope.glb', import.meta.url);

assert.ok(existsSync(glb), 'Stage 3 ships the canonical Galvanoscope GLB');
assert.ok(statSync(glb).size < 500_000, 'Galvanoscope remains below the 500 KB viewmodel target');
assert.match(world, /heroes\/galvanoscope\/galvanoscope\.glb/, 'PlayCanvas loads the canonical Galvanoscope');
assert.match(world, /findByName\('GalvanoscopeHero'\)/, 'the authored hero root is located');

for (const nodeName of ['NeedlePivot', 'NeedleVisual', 'SelectorPivot', 'ProbeRedPivot', 'ProbePalePivot']) {
  assert.match(world, new RegExp(`findByName\\('${nodeName}'\\)`), `the ${nodeName} semantic node is wired`);
}

assert.doesNotMatch(world, /VM_Box|VM_Bezel|VM_Needle|VM_Filament/, 'primitive viewmodel placeholders are removed');
assert.match(world, /GalvanoscopeNeedleBinding/, 'the runtime needle binding remains available');
assert.match(world, /viewmodelFilament\.enabled = false/, 'the filament compatibility entity is inert');
assert.match(world, /galvanoscopeReady/, 'the asset promise is named');
assert.match(world, /omegaGateReady,\s*galvanoscopeReady,/, 'ready waits for the Galvanoscope asset');
assert.match(world, /setLocalPosition\(0\.25, -0\.22, -0\.48\)/, 'the Sol-authored viewmodel position is preserved');
assert.match(world, /setLocalEulerAngles\(8, -12, 3\)/, 'the Sol-authored viewmodel rotation is preserved');

const bytes = readFileSync(glb);
assert.equal(bytes.toString('ascii', 0, 4), 'glTF', 'asset uses the binary glTF container');
const jsonLength = bytes.readUInt32LE(12);
const document = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString('utf8').trim()) as {
  nodes?: Array<{ name?: string }>;
};
const nodeNames = new Set((document.nodes ?? []).map((node) => node.name));
for (const nodeName of ['GalvanoscopeHero', 'NeedlePivot', 'NeedleVisual', 'SelectorPivot', 'ProbeRedPivot', 'ProbePalePivot']) {
  assert.ok(nodeNames.has(nodeName), `canonical GLB contains ${nodeName}`);
}

console.log('M27 Galvanoscope Stage 3: OK (canonical GLB wired, semantic hierarchy guarded, placeholder removed)');
