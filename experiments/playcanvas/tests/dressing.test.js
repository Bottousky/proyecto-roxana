import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DRESSING, dressingObstacles } from '../src/dressing.js';
import { AREAS } from '../src/game/content.js';
import { travelBounds } from '../src/game/kingdom-geography.js';
import { findPath } from '../src/game/navigation.js';
import { walkableTerrain } from '../src/terrain.js';

const scene = JSON.parse(readFileSync(new URL('../src/data/scene.json', import.meta.url)));
const props = JSON.parse(readFileSync(new URL('../src/data/props.json', import.meta.url)));
const local = id => { const [ox, oz] = scene.areas[id].offset; return scene.areas[id].obstacles.filter(o => !o.gate).map(o => ({ ...o, x: o.x - ox, z: o.z - oz })); };
const gap = (p, o) => Math.hypot(Math.max(0, Math.abs(p[0] - o.x) - o.w), Math.max(0, Math.abs(p[1] - o.z) - o.d));

test('cada pieza de utilería existe en el kit', () => {
  for (const [id, list] of Object.entries(DRESSING)) for (const [kind] of list) assert.ok(props[kind], `${id}: ${kind} no está en props.json`);
});

test('la utilería no se acerca a lo que se usa ni cierra caminos', () => {
  for (const id of Object.keys(DRESSING)) {
    const area = AREAS[id], bounds = travelBounds(id), base = local(id), extra = dressingObstacles(id, props);
    const targets = [...area.objects.filter(o => Number.isFinite(o.x)).map(o => [o.id, [o.x, o.z]]), ...area.exits.map(e => [e.id, [e.x, e.z]])];
    for (const [name, p] of targets) for (const o of extra) assert.ok(gap(p, o) >= 1.4, `${id}: ${o.dressing} a ${gap(p, o).toFixed(2)} m de ${name}`);
    const walk = (obstacles, goal) => findPath(area.spawn, goal, bounds, obstacles, { radius: .34, isWalkable: (x, z) => walkableTerrain(id, x, z) });
    for (const [name, p] of targets) {
      const before = walk(base, p).length > 0, after = walk([...base, ...extra], p).length > 0;
      assert.ok(!before || after, `${id}: la utilería corta el camino hasta ${name}`);
    }
  }
});
