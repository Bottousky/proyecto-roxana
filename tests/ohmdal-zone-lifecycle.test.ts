import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { OhmdalZoneLifecycle } from '../src/experiences/ohmdal-playcanvas/systems/zones/zoneLifecycle.ts';

const runtimeSource = readFileSync(new URL('../src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts', import.meta.url), 'utf8');
const manantialShellSource = readFileSync(new URL('../src/experiences/ohmdal-playcanvas/world/manantial/buildManantialShell.ts', import.meta.url), 'utf8');

const lifecycle = new OhmdalZoneLifecycle();
const loads = { plaza: 0, workshop: 0, manantial: 0 };
const activations: string[] = [];

for (const id of ['plaza', 'workshop', 'manantial'] as const) {
  lifecycle.register({
    id,
    load: () => { loads[id] += 1; },
    setActive: (active) => activations.push(`${id}:${active}`),
  });
}

await lifecycle.initializePlaza();
assert.deepEqual(loads, { plaza: 1, workshop: 0, manantial: 0 }, 'Portal arrival loads only Plaza');
assert.deepEqual(
  lifecycle.snapshot(),
  [
    { id: 'plaza', loaded: true, active: true },
    { id: 'workshop', loaded: false, active: false },
    { id: 'manantial', loaded: false, active: false },
  ],
  'future zones stay declared but unloaded at Portal arrival',
);

await Promise.all([lifecycle.preload('workshop'), lifecycle.preload('workshop')]);
assert.equal(loads.workshop, 1, 'concurrent preload is idempotent');
assert.equal(lifecycle.snapshot()[1]?.active, false, 'preload does not implicitly activate');

await lifecycle.activate('workshop');
lifecycle.deactivate('workshop');
await lifecycle.preload('manantial');
assert.equal(loads.manantial, 1, 'Omega progression may preload Manantial exactly once');
assert.equal(lifecycle.snapshot()[2]?.active, false, 'Manantial preload does not cross the boundary');
assert.deepEqual(activations, ['plaza:true', 'workshop:true', 'workshop:false']);
assert.match(runtimeSource, /zones\.activate\('workshop'\)/, 'Taller activation is tied to its player-facing door');
assert.match(runtimeSource, /zones\.preload\('manantial'\)/, 'Omega progression owns Manantial preload');
assert.match(runtimeSource, /zones\.activate\('manantial'\)/, 'crossing Omega activates the Manantial boundary');
assert.doesNotMatch(manantialShellSource, /new URL|assets\/runtime|\.glb/i, 'declared Manantial shell has no future heavy asset request');

console.log('Ohmdal zone lifecycle: OK (Plaza eager, Workshop on demand, Manantial progression-gated)');
