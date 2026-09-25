// Hornea la distancia a la orilla de todas las superficies de agua del reino (R) y el
// empedrado que pinta el shader del suelo (G: cobertura suavizada, B: color regional).
// Rasteriza desde arriba la geometría exportada: donde una superficie queda por encima
// del agua hay costa (terreno, muelles, puentes, pilotes). El resultado es un PNG en
// escala de grises en coordenadas de reino que el shader de agua usa para la espuma y
// el gradiente de profundidad. Uso: node scripts/bake-shore.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync, deflateSync } from 'node:zlib';

const root = new URL('../', import.meta.url);
const scene = JSON.parse(readFileSync(new URL('src/data/scene.json', root)));
const raw = gunzipSync(readFileSync(new URL('src/data/geometry.bin.gz', root)));
const buffer = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
const PX = 4, MAX = 6; // píxeles por metro, metros representados
const view = (m, key) => new (key === 'indices' ? Uint32Array : Float32Array)(buffer, m[key].offset, m[key].length);

const waters = scene.meshes.filter(m => m.material.texture === 'water' && !m.dynamic); // fountains are pivoted, local meshes
let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
for (const m of waters) { const p = view(m, 'positions'); for (let i = 0; i < p.length; i += 3) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); z0 = Math.min(z0, p[i + 2]); z1 = Math.max(z1, p[i + 2]); } }
x0 = Math.floor(x0) - 2; z0 = Math.floor(z0) - 2; x1 = Math.ceil(x1) + 2; z1 = Math.ceil(z1) + 2;
const W = (x1 - x0) * PX, H = (z1 - z0) * PX;
const water = new Float32Array(W * H).fill(-Infinity), land = new Float32Array(W * H).fill(-Infinity);
const paving = new Float32Array(W * H).fill(-Infinity), tone = new Uint8Array(W * H);

function raster(mesh, target, { flatOnly }) {
  const p = view(mesh, 'positions'), idx = view(mesh, 'indices');
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ax = (p[a] - x0) * PX, az = (p[a + 2] - z0) * PX, bx = (p[b] - x0) * PX, bz = (p[b + 2] - z0) * PX, cx = (p[c] - x0) * PX, cz = (p[c + 2] - z0) * PX;
    const area = (bx - ax) * (cz - az) - (cx - ax) * (bz - az);
    if (Math.abs(area) < 1e-6) continue; // vertical walls project to a line
    if (flatOnly) { // ignore steep faces: a wall is covered by the ground it holds up
      const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2], vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (Math.abs(ny) / Math.hypot(nx, ny, nz) < .35) continue;
    }
    const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx))), maxX = Math.min(W - 1, Math.ceil(Math.max(ax, bx, cx)));
    const minZ = Math.max(0, Math.floor(Math.min(az, bz, cz))), maxZ = Math.min(H - 1, Math.ceil(Math.max(az, bz, cz)));
    for (let z = minZ; z <= maxZ; z++) for (let x = minX; x <= maxX; x++) {
      const px = x + .5, pz = z + .5;
      const w0 = ((bx - px) * (cz - pz) - (cx - px) * (bz - pz)) / area, w1 = ((cx - px) * (az - pz) - (ax - px) * (cz - pz)) / area, w2 = 1 - w0 - w1;
      if (w0 < -1e-4 || w1 < -1e-4 || w2 < -1e-4) continue;
      const y = w0 * p[a + 1] + w1 * p[b + 1] + w2 * p[c + 1], i = z * W + x;
      if (y > target[i]) target[i] = y;
    }
  }
}
for (const m of waters) raster(m, water, { flatOnly: false });
const palette = [...new Set(scene.meshes.filter(m => m.material.paving).map(m => m.material.color))];
for (const m of scene.meshes.filter(m => m.material.paving)) {
  const before = paving.slice(); raster(m, paving, { flatOnly: true });
  const index = palette.indexOf(m.material.color); for (let i = 0; i < paving.length; i++) if (paving[i] !== before[i]) tone[i] = index;
}
for (const m of scene.meshes) {
  if (m.material.paving || m.material.texture === 'water' || m.dynamic || m.material.alpha || m.material.opacity < 1) continue;
  raster(m, land, { flatOnly: true });
}

// Exact Euclidean distance transform (Felzenszwalb) from every water pixel to the shore.
const INF = 1e20, f = new Float64Array(W * H);
for (let i = 0; i < W * H; i++) f[i] = water[i] === -Infinity || land[i] > water[i] + .03 ? 0 : INF;
function edt1d(src, n) {
  const d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1); let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
  for (let q = 1; q < n; q++) { let s; do { const r = v[k]; s = ((src[q] + q * q) - (src[r] + r * r)) / (2 * q - 2 * r); } while (s <= z[k] && --k >= 0); k++; v[k] = q; z[k] = s; z[k + 1] = INF; }
  k = 0; for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) ** 2 + src[v[k]]; } return d;
}
for (let x = 0; x < W; x++) { const col = new Float64Array(H); for (let z = 0; z < H; z++) col[z] = f[z * W + x]; const d = edt1d(col, H); for (let z = 0; z < H; z++) f[z * W + x] = d[z]; }
for (let z = 0; z < H; z++) { const d = edt1d(f.subarray(z * W, z * W + W), W); for (let x = 0; x < W; x++) f[z * W + x] = d[x]; }

// Separable Gaussian: rounds the stepped outline of the paving cells before the shader
// breaks it up with noise.
const SIGMA = .45 * PX, R = Math.ceil(SIGMA * 3), kernel = Array.from({ length: 2 * R + 1 }, (_, i) => Math.exp(-((i - R) ** 2) / (2 * SIGMA * SIGMA)));
const norm = kernel.reduce((a, b) => a + b, 0); kernel.forEach((v, i) => kernel[i] = v / norm);
let cover = Float32Array.from(paving, v => v === -Infinity ? 0 : 1), tmp = new Float32Array(W * H);
for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { let sum = 0; for (let k = -R; k <= R; k++) { const xx = Math.min(W - 1, Math.max(0, x + k)); sum += cover[z * W + xx] * kernel[k + R]; } tmp[z * W + x] = sum; }
for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { let sum = 0; for (let k = -R; k <= R; k++) { const zz = Math.min(H - 1, Math.max(0, z + k)); sum += tmp[zz * W + x] * kernel[k + R]; } cover[z * W + x] = sum; }
// Spread each region's tone outward so blurred edges never read index 0 by accident.
for (let pass = 0; pass < R + 2; pass++) for (let i = 0; i < W * H; i++) if (paving[i] === -Infinity && !tone[i]) { const x = i % W; for (const j of [i - 1, i + 1, i - W, i + W]) if (j >= 0 && j < W * H && Math.abs((j % W) - x) <= 1 && tone[j]) { tone[i] = tone[j]; break; } }

// PNG RGBA de 8 bits. La fila 0 corresponde a z0 (norte), como lee el shader.
const pixels = Buffer.alloc((W * 4 + 1) * H);
for (let z = 0; z < H; z++) { const row = z * (W * 4 + 1); pixels[row] = 0; for (let x = 0; x < W; x++) { const i = z * W + x, o = row + 1 + x * 4; pixels[o] = Math.round(Math.min(1, Math.sqrt(f[i]) / PX / MAX) * 255); pixels[o + 1] = Math.round(Math.min(1, cover[i]) * 255); pixels[o + 2] = tone[i]; pixels[o + 3] = 255; } }
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = 0xffffffff; for (const byte of b) c = crcTable[(c ^ byte) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const body = Buffer.concat([Buffer.from(type), data]); const sum = Buffer.alloc(4); sum.writeUInt32BE(crc(body)); return Buffer.concat([len, body, sum]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
writeFileSync(new URL('public/assets/shore-distance.png', root), Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(pixels, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
writeFileSync(new URL('src/data/shore.json', root), JSON.stringify({ x0, z0, width: x1 - x0, depth: z1 - z0, pixels: [W, H], metres: MAX, paving: palette }) + '\n');
console.log(`orilla y empedrado ${W}×${H} px, reino x ${x0}…${x1}, z ${z0}…${z1}, ${palette.length} tonos`);
