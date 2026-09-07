import assert from 'node:assert/strict';

import { OhmdalZoneLifecycle } from '../src/experiences/ohmdal-playcanvas/systems/zones/zoneLifecycle.ts';

const lifecycle = new OhmdalZoneLifecycle();
let attempts = 0;
const activations: boolean[] = [];

lifecycle.register({
  id: 'workshop',
  load: () => {
    attempts += 1;
    if (attempts === 1) return Promise.reject(new Error('temporary character load failure'));
  },
  setActive: (active) => activations.push(active),
});

await assert.rejects(
  lifecycle.activate('workshop'),
  /temporary character load failure/,
  'a failed zone load is surfaced to the transition caller',
);
assert.deepEqual(
  lifecycle.snapshot(),
  [{ id: 'workshop', loaded: false, active: false }],
  'a failed load does not leave the zone marked active or loaded',
);

await lifecycle.activate('workshop');
assert.equal(attempts, 2, 'the next activation retries the failed loader');
assert.deepEqual(activations, [true], 'activation runs after the retry succeeds');
assert.deepEqual(
  lifecycle.snapshot(),
  [{ id: 'workshop', loaded: true, active: true }],
  'a successful retry settles the zone normally',
);

console.log('Ohmdal zone load retry: OK');
