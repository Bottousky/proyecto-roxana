import test from 'node:test';
import assert from 'node:assert/strict';
import { walkableTerrain } from '../src/terrain.js';
import { AREAS } from '../src/game/content.js';
import { isExterior, inTravelCorridor } from '../src/game/kingdom-geography.js';

// Where a road meets a place's border there is no corner to catch on: just inside the border, the
// ground within a metre of the road's edge is walkable too, so walking in at an angle slides through.
test('every road mouth flares into its place', () => {
  for (const id of Object.keys(AREAS).filter(isExterior)) {
    const [w, d] = AREAS[id].bounds;
    for (const sgn of [-1, 1]) {
      const z = sgn * (d / 2 - .1);
      for (let x = -w / 2 + 1.5; x <= w / 2 - 1.5; x += .25) {
        if (!inTravelCorridor(id, x, z)) continue;
        for (const dx of [-1, 1]) if (Math.abs(x + dx) <= w / 2 - .45 && !inTravelCorridor(id, x + dx, z)) assert.ok(walkableTerrain(id, x + dx, z), `${id}: (${(x + dx).toFixed(2)}, ${z.toFixed(2)}) beside the road mouth`);
      }
    }
  }
});

test('the castle entry from the Manantial no longer catches a walker heading in', () => {
  // The automated journey stuck here, between the road and the castle's border.
  for (let s = 0; s <= 4; s += .25) assert.ok(walkableTerrain('castle', 3.3 + .27 * s, 18.4 - .96 * s), `step ${s}`);
});
