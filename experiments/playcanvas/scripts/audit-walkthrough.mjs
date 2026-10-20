// Busca geometría sólida a la altura del pecho, dentro de lo caminable, sin colisión que la
// respalde: cosas que el jugador atravesaría. Uso: node scripts/audit-walkthrough.mjs
import { channel } from '../src/geometry-format.js';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { walkableTerrain } from '../src/terrain.js';
import { travelBounds, isExterior } from '../src/game/kingdom-geography.js';
import { AREAS } from '../src/game/content.js';
import { dressingObstacles } from '../src/dressing.js';
const scene = JSON.parse(readFileSync(new URL('../src/data/scene.json', import.meta.url)));
const props = JSON.parse(readFileSync(new URL('../src/data/props.json', import.meta.url)));
const raw = gunzipSync(readFileSync(new URL('../src/data/geometry.bin.gz', import.meta.url)));
const buf = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
const view = (m, key) => channel(buf, m, key);
for (const id of Object.keys(AREAS).filter(isExterior)) {
  const [ox, oz] = scene.areas[id].offset, [bw, bd] = AREAS[id].bounds, obs = [...scene.areas[id].obstacles.map(o => ({ ...o, x: o.x - ox, z: o.z - oz })), ...dressingObstacles(id, props)];
  const cells = new Map(), names = {};
  for (const m of scene.meshes) {
    if (m.area !== id || m.material.alpha > 0 || m.material.opacity < 1 || m.material.texture === 'water' || m.dynamic) continue;
    const p = view(m, 'positions'), t = view(m, 'indices');
    for (let k = 0; k < t.length; k += 3) {
      const v = [t[k], t[k + 1], t[k + 2]].map(i => [p[i * 3] - ox, p[i * 3 + 1], p[i * 3 + 2] - oz]);
      const lo = Math.min(...v.map(q => q[1])), hi = Math.max(...v.map(q => q[1]));
      if (lo > 1.2 || hi < 1.0) continue; // crosses chest height: a body would hit it
      const xs = v.map(q => q[0]), zs = v.map(q => q[2]);
      if (Math.max(...xs) - Math.min(...xs) > 3 || Math.max(...zs) - Math.min(...zs) > 3) continue;
      const cx = xs.reduce((a, b) => a + b) / 3, cz = zs.reduce((a, b) => a + b) / 3;
      if (Math.abs(cx) > bw / 2 || Math.abs(cz) > bd / 2 || !walkableTerrain(id, cx, cz)) continue;
      // The traveller's body (radius .34, as in navigation) never gets closer than that to a collider.
      if (obs.some(o => Math.abs(cx - o.x) < o.w + .34 && Math.abs(cz - o.z) < o.d + .34)) continue;
      const k2 = Math.round(cx * 2) + ',' + Math.round(cz * 2); cells.set(k2, (cells.get(k2) || 0) + 1);
      (names[k2] ??= new Set()).add(`${m.owner || '·'}/${m.material.texture || m.material.color}`);
    }
  }
  // cluster
  const seen = new Set(), groups = [];
  for (const k of cells.keys()) { if (seen.has(k)) continue; const stack = [k], g = []; seen.add(k); while (stack.length) { const c = stack.pop(); g.push(c); const [a, b] = c.split(',').map(Number); for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = (a + da) + ',' + (b + db); if (cells.has(n) && !seen.has(n)) { seen.add(n); stack.push(n); } } } groups.push(g); }
  for (const g of groups) { const pts = g.map(c => c.split(',').map(v => v / 2)); const x = pts.reduce((s, p) => s + p[0], 0) / pts.length, z = pts.reduce((s, p) => s + p[1], 0) / pts.length; console.log(id, 'walk-through at', x.toFixed(1), z.toFixed(1), 'cells', g.length, [...new Set(g.flatMap(c => [...(names[c] || [])]))].join(' ')); }
}
