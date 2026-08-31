import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';

const world = readFileSync(new URL('../src/experiences/ohmdal-playcanvas/playcanvasWorld.ts', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('../src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts', import.meta.url), 'utf8');
const tuning = readFileSync(new URL('../src/experiences/ohmdal-playcanvas/omegaGateTuning.ts', import.meta.url), 'utf8');
const glb = new URL('../assets/runtime/ohmdal/plaza/heroes/omega-gate/omega-gate.glb', import.meta.url);

assert.ok(existsSync(glb), 'Stage 2B ships the canonical Omega gate GLB');
assert.ok(statSync(glb).size < 1_000_000, 'Omega gate remains below the 1 MB asset target');
assert.match(world, /omega-gate\/omega-gate\.glb/, 'PlayCanvas loads the canonical gate');
assert.match(world, /findByName\('DoorLeaves'\)/, 'door leaves are wired to the existing moving wrapper');
assert.doesNotMatch(world, /solenoidGate\.addComponent\('render'/, 'the primitive gate leaf placeholder is removed');
assert.match(tuning, /boundsSource: 'vertices'/, 'calibration records exact vertex bounds');
assert.match(tuning, /yaw: 180/, 'authored gate facing correction is recorded once');
assert.match(runtime, /OMEGA_GATE_TUNING\.openY/, 'existing open state uses the calibrated gate travel');

console.log('M26 Omega gate Stage 2B: OK (canonical GLB, calibrated hierarchy, placeholder removed)');
