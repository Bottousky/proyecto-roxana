import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DRESSING, dressingObstacles } from '../src/dressing.js';
import { AREAS } from '../src/game/content.js';
import { travelBounds } from '../src/game/kingdom-geography.js';
import { findPath } from '../src/game/navigation.js';
import { walkableTerrain } from '../src/terrain.js';
import { AREA_LAYOUTS } from '../src/game/world-layout.js';

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

// Distancia de un rectángulo (centro, medias medidas) al eje de un tramo de camino.
function axisGap(o, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], length = dx * dx + dz * dz;
  let best = Infinity;
  for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
    const p = [o.x + o.w * i / 4, o.z + o.d * j / 4], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / length));
    best = Math.min(best, Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz));
  }
  return best;
}

test('la utilería deja libre el eje de cada camino: a lo sumo roza su borde', () => {
  for (const id of Object.keys(DRESSING)) for (const path of AREA_LAYOUTS[id]?.paths || []) for (const o of dressingObstacles(id, props))
    for (let i = 0; i < path.points.length - 1; i++) {
      const gap = axisGap(o, path.points[i], path.points[i + 1]);
      assert.ok(gap >= path.width / 2 - .6, `${id}: ${o.dressing} a ${gap.toFixed(2)} m del eje de ${path.id} (ancho ${path.width})`);
    }
});
