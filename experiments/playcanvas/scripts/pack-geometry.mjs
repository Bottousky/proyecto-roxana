// Último paso de `npm run export:world`, después de hornear oclusión y relieve: cuantiza la
// geometría para descargarla y guardarla en memoria más liviana. Las posiciones y las
// coordenadas de textura siguen en coma flotante; las normales pasan a Int8 y los colores (que
// llevan la oclusión horneada) a Uint8, ambos normalizados y con cuatro componentes para que
// cada vértice quede alineado; los índices pasan a 16 bits en toda malla de menos de 65 536
// vértices. Formato en src/geometry-format.js.
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync, gzipSync } from 'node:zlib';
import { channel, channelType } from '../src/geometry-format.js';

const sceneUrl = new URL('../src/data/scene.json', import.meta.url), geometryUrl = new URL('../src/data/geometry.bin.gz', import.meta.url);
const scene = JSON.parse(readFileSync(sceneUrl, 'utf8'));
if (scene.meshes.some(m => m.normals.type)) { console.log('La geometría ya está empaquetada.'); process.exit(0); }
if (!scene.ao) { console.error('Empaquetar después de hornear la oclusión (bake-ao): los colores todavía no la llevan.'); process.exit(1); }
const raw = gunzipSync(readFileSync(geometryUrl)), buffer = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);

const parts = []; let size = 0;
const put = (typed, type) => { const offset = size, bytes = new Uint8Array(typed.buffer, typed.byteOffset, typed.byteLength); parts.push(bytes); size += bytes.length; const pad = (4 - size % 4) % 4; if (pad) { parts.push(new Uint8Array(pad)); size += pad; } return { offset, length: typed.length, ...(type ? { type } : {}) }; };
for (const m of scene.meshes) {
  const positions = channel(buffer, m, 'positions'), normals = channel(buffer, m, 'normals'), uvs = channel(buffer, m, 'uvs'), colors = channel(buffer, m, 'colors'), indices = channel(buffer, m, 'indices');
  const vertices = positions.length / 3, n = new Int8Array(vertices * 4), c = new Uint8Array(vertices * 4);
  for (let i = 0; i < vertices; i++) for (let k = 0; k < 3; k++) n[i * 4 + k] = Math.max(-127, Math.min(127, Math.round(normals[i * 3 + k] * 127)));
  const stride = colors.length / vertices;
  for (let i = 0; i < vertices; i++) for (let k = 0; k < 4; k++) c[i * 4 + k] = Math.round(Math.max(0, Math.min(1, k < stride ? colors[i * stride + k] : 1)) * 255);
  m.positions = put(positions); m.normals = { ...put(n, 'i8'), components: 4 }; m.uvs = put(uvs);
  m.colors = { ...put(c, 'u8'), components: 4 }; m.indices = vertices <= 65536 ? put(Uint16Array.from(indices), 'u16') : put(indices);
}
const packed = new Uint8Array(size); let at = 0; for (const p of parts) { packed.set(p, at); at += p.length; }
writeFileSync(geometryUrl, gzipSync(packed, { level: 9 }));
writeFileSync(sceneUrl, JSON.stringify(scene));
const u16 = scene.meshes.filter(m => channelType(m, 'indices') === 'u16').length;
console.log(`geometría empaquetada: ${(raw.length / 2 ** 20).toFixed(1)} → ${(size / 2 ** 20).toFixed(1)} MB sin comprimir; índices de 16 bits en ${u16}/${scene.meshes.length} mallas`);
