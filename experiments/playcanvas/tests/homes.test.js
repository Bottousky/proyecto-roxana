import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ROOM, HOMES, placements } from '../src/home-layouts.js';
import { footprint } from '../src/dressing.js';
import { findPath } from '../src/game/navigation.js';

const props = JSON.parse(readFileSync(new URL('../src/data/props.json', import.meta.url)));
const scene = JSON.parse(readFileSync(new URL('../src/data/scene.json', import.meta.url)));

test('toda casa con puerta tiene cuarto, y ninguna casa de fondo tiene puerta', () => {
  const doors = Object.values(scene.areas).flatMap(a => a.entrances || []).map(e => e.id).filter(id => id !== 'plaza-workshop').sort();
  assert.deepEqual(doors, Object.keys(HOMES).sort());
});

test('en cada cuarto se llega desde la puerta a lo que se mira y de vuelta a la salida', () => {
  for (const [id, home] of Object.entries(HOMES)) {
    const obstacles = placements(home.kind, props).filter(([kind, , , , y]) => !y && kind !== 'rug' && kind !== 'candle').map(([kind, x, z, r]) => { const f = footprint(kind, r, props); return { x: x + f.x, z: z + f.z, w: f.w, d: f.d }; });
    const spawn = [0, ROOM[1] / 2 - 1.4], [lx, lz] = home.look;
    const near = [[lx, lz + 1.2], [lx + 1.2, lz], [lx - 1.2, lz], [lx, lz - 1.2]].filter(p => !obstacles.some(o => Math.abs(p[0] - o.x) < o.w + .34 && Math.abs(p[1] - o.z) < o.d + .34));
    assert.ok(near.some(p => findPath(spawn, p, ROOM, obstacles, { radius: .34 }).length), `${id}: no se llega a mirar`);
    assert.ok(!obstacles.some(o => Math.abs(o.x) < o.w + .9 && Math.abs(spawn[1] - o.z) < o.d + .6), `${id}: la entrada está tapada`);
  }
});
