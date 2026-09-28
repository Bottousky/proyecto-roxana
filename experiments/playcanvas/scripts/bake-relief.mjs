// Hornea el relieve del reino: cada lugar queda en su valle. Donde se camina, se construye,
// corre agua o hay empedrado, el suelo sigue plano; lejos de eso se levantan colinas que
// crecen con la distancia (transformada exacta de distancia) y un ruido de crestas, con
// escalones de roca como los acantilados de las referencias HD-2D. Resultado: alturas en
// metros (Float32, gzip) en src/data/relief.bin.gz y su rejilla en src/data/relief.json.
// Uso: node scripts/bake-relief.mjs  (después de exportar el mundo y hornear la orilla)
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync, gzipSync } from 'node:zlib';
import { AREAS } from '../src/game/content.js';
import { isExterior, travelBounds } from '../src/game/kingdom-geography.js';
import { walkableTerrain } from '../src/terrain.js';

const root = new URL('../', import.meta.url);
const scene = JSON.parse(readFileSync(new URL('src/data/scene.json', root)));
const raw = gunzipSync(readFileSync(new URL('src/data/geometry.bin.gz', root)));
const buffer = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
const view = (m, key) => new (key === 'indices' ? Uint32Array : Float32Array)(buffer, m[key].offset, m[key].length);
const shore = JSON.parse(readFileSync(new URL('src/data/shore.json', root)));

const MARGIN = 60, CELL = 1;
const x0 = shore.x0 - MARGIN, z0 = shore.z0 - MARGIN, W = Math.round((shore.width + MARGIN * 2) / CELL) + 1, H = Math.round((shore.depth + MARGIN * 2) / CELL) + 1;
const flat = new Uint8Array(W * H);
const idx = (i, j) => j * W + i;

// 1. Lo caminable de cualquier lugar exterior (con sus pasajes).
const exteriors = Object.keys(AREAS).filter(isExterior).map(id => { const [ox, oz] = scene.areas[id].offset, [tw, td] = travelBounds(id); return { id, ox, oz, tw, td }; });
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  const X = x0 + i * CELL, Z = z0 + j * CELL;
  if (exteriors.some(a => { const x = X - a.ox, z = Z - a.oz; return Math.abs(x) <= a.tw / 2 && Math.abs(z) <= a.td / 2 && walkableTerrain(a.id, x, z); })) flat[idx(i, j)] = 1;
}
// 2. Todo lo construido, plantado o mojado: se rasteriza desde arriba.
function raster(mesh, lift = 0) {
  const p = view(mesh, 'positions'), t = view(mesh, 'indices'), pv = mesh.dynamic?.pivot || [0, 0, 0];
  for (let k = 0; k < t.length; k += 3) {
    const a = t[k] * 3, b = t[k + 1] * 3, c = t[k + 2] * 3;
    if (Math.max(p[a + 1], p[b + 1], p[c + 1]) + pv[1] < lift) continue;
    const pts = [a, b, c].map(v => [(p[v] + pv[0] - x0) / CELL, (p[v + 2] + pv[2] - z0) / CELL]);
    const minI = Math.max(0, Math.floor(Math.min(...pts.map(q => q[0])))), maxI = Math.min(W - 1, Math.ceil(Math.max(...pts.map(q => q[0]))));
    const minJ = Math.max(0, Math.floor(Math.min(...pts.map(q => q[1])))), maxJ = Math.min(H - 1, Math.ceil(Math.max(...pts.map(q => q[1]))));
    if ((maxI - minI) * (maxJ - minJ) > 40000) continue; // un plano de fondo, no una pieza
    for (let j = minJ; j <= maxJ; j++) for (let i = minI; i <= maxI; i++) flat[idx(i, j)] = 1;
  }
}
for (const m of scene.meshes) {
  if (m.area === 'workshop' || m.material.texture === 'ground' || m.material.alpha > 0) continue; // los árboles de tarjeta no piden llano
  raster(m, m.material.texture === 'water' ? -9 : 1.0);
}
// 3. El mar abierto al norte del Faro y la franja de la orilla del lago quedan a nivel.
const lighthouse = scene.areas.lighthouse.offset;
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (z0 + j * CELL < lighthouse[1] - 8) flat[idx(i, j)] = 1;

if (process.env.RELIEF_DEBUG) writeFileSync(new URL('output/relief-flat.raw', root), flat);
// Transformada exacta de distancia (Felzenszwalb), en metros.
const INF = 1e20, f = new Float64Array(W * H);
for (let k = 0; k < W * H; k++) f[k] = flat[k] ? 0 : INF;
function edt1d(src, n) {
  const d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1); let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
  for (let q = 1; q < n; q++) { let s; do { const r = v[k]; s = ((src[q] + q * q) - (src[r] + r * r)) / (2 * q - 2 * r); } while (s <= z[k] && --k >= 0); k++; v[k] = q; z[k] = s; z[k + 1] = INF; }
  k = 0; for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) ** 2 + src[v[k]]; } return d;
}
for (let i = 0; i < W; i++) { const col = new Float64Array(H); for (let j = 0; j < H; j++) col[j] = f[idx(i, j)]; const d = edt1d(col, H); for (let j = 0; j < H; j++) f[idx(i, j)] = d[j]; }
for (let j = 0; j < H; j++) { const d = edt1d(f.subarray(j * W, j * W + W), W); for (let i = 0; i < W; i++) f[idx(i, j)] = d[i]; }

// Ruido de valor con octavas: crestas y cumbres que no se repiten.
const hash = (x, z, s) => { let h = Math.imul(x * 374761393 + z * 668265263 + s * 2246822519, 1274126177); h ^= h >>> 13; h = Math.imul(h, 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const smooth = t => t * t * (3 - 2 * t);
function noise(x, z, s) { const xi = Math.floor(x), zi = Math.floor(z), fx = smooth(x - xi), fz = smooth(z - zi); const a = hash(xi, zi, s), b = hash(xi + 1, zi, s), c = hash(xi, zi + 1, s), d = hash(xi + 1, zi + 1, s); return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz; }
const fbm = (x, z, s) => noise(x, z, s) * .55 + noise(x * 2.1, z * 2.1, s + 1) * .3 + noise(x * 4.3, z * 4.3, s + 2) * .15;
const ramp = (a, b, t) => Math.min(1, Math.max(0, (t - a) / (b - a)));

const height = new Float32Array(W * H);
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  const X = x0 + i * CELL, Z = z0 + j * CELL, d = Math.sqrt(f[idx(i, j)]) * CELL;
  // El pie de la ladera ondula: el valle no copia el rectángulo del lugar.
  const foot = 1.5 + 3.5 * fbm(X * .05, Z * .05, 11);
  if (d < foot) continue;
  const peak = 5 + 13 * fbm(X * .018, Z * .018, 7);
  let h = (smooth(ramp(foot, foot + 7, d)) * .55 + smooth(ramp(foot + 5, foot + 26, d)) * .45) * peak;
  // Escalones: la ladera se corta en repisas de ~2,4 m con frente de roca.
  const step = 2.4, k = Math.floor(h / step), frac = h / step - k;
  h = (k + smooth(ramp(.55, 1, frac))) * step * .92 + h * .08;
  h += (fbm(X * .12, Z * .12, 3) - .5) * .8 * ramp(2, 6, d);
  // Del lado de la cámara (al sur de un llano cercano) la tierra queda baja: el relieve
  // enmarca desde atrás y a los costados, nunca tapa lo que se juega.
  let front = 0; for (let k = 1; k <= 12; k++) if (j - k >= 0 && flat[idx(i, j - k)]) { front = 1 - k / 12; break; }
  if (front > 0) h = Math.min(h, .5 + 6 * (1 - front) ** 2);
  height[idx(i, j)] = Math.max(0, h);
}

writeFileSync(new URL('src/data/relief.bin.gz', root), gzipSync(Buffer.from(height.buffer), { level: 9 }));
writeFileSync(new URL('src/data/relief.json', root), JSON.stringify({ x0, z0, cell: CELL, cols: W, rows: H }) + '\n');
let raised = 0, max = 0; for (const h of height) { if (h > .05) raised++; max = Math.max(max, h); }
console.log(`relieve ${W}×${H}, ${Math.round(raised / (W * H) * 100)} % en alto, cumbre ${max.toFixed(1)} m`);
