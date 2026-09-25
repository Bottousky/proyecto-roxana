// Exporta el arte de art-source/assets (PNG maestros) a WebP livianos en public/assets
// y en la copia de PlayCanvas. Requiere ffmpeg con libwebp en el PATH.
//
//   node scripts/optimize-images.mjs
//
// - Ilustraciones opacas: WebP con pérdidas de alta calidad.
// - Sprites recortados por color (personajes, Ohm, árboles): se aplica aquí el mismo
//   recorte del magenta que usa el juego, la transparencia se guarda sin pérdidas y
//   los bordes toman el color opaco más cercano. Así la compresión del color no deja
//   halos magenta y el recorte en tiempo de ejecución no cambia nada.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'art-source', 'assets');
const targets = [path.join(root, 'public', 'assets'), path.join(root, 'experiments', 'playcanvas', 'public', 'assets')];

// Hojas de sprites con fondo magenta que el juego recorta (crop con key=true).
const KEYED = /^(actors\/.+|ohm|trees)\.png$/;
// Maestros conservados como referencia, pero que el juego no carga.
const UNUSED = new Set(['npcs.png', 'characters.png']);
const QUALITY = { opaque: 86, keyed: 88 };

function ffmpeg(args, input) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { input, maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`ffmpeg falló: ${r.stderr?.toString() || r.error}`);
  return r.stdout;
}

function probe(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]);
  const [width, height] = r.stdout.toString().trim().split(',').map(Number);
  return { width, height };
}

/** La misma regla que crop(..., key=true) en src/world.js y experiments/playcanvas/src/art.ts. */
export function keyMagenta(p) {
  for (let i = 0; i < p.length; i += 4) {
    const magenta = Math.min(p[i], p[i + 2]) - p[i + 1];
    if (magenta > 50 && p[i] > 95 && p[i + 2] > 90) p[i + 3] = Math.min(p[i + 3], Math.max(0, 255 - (magenta - 50) * 5));
    if (p[i + 3] < 30) p[i + 3] = 0;
  }
}

/** Cada píxel no opaco toma el color del opaco más cercano (búsqueda en anchura). */
export function bleedEdges(p, width, height) {
  const n = width * height;
  const done = new Uint8Array(n);
  let queue = new Int32Array(n), head = 0, tail = 0;
  for (let i = 0; i < n; i++) if (p[i * 4 + 3] === 255) { done[i] = 1; queue[tail++] = i; }
  if (!tail) return;
  while (head < tail) {
    const i = queue[head++], x = i % width, y = (i - x) / width;
    for (const j of [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, y > 0 ? i - width : -1, y < height - 1 ? i + width : -1]) {
      if (j < 0 || done[j]) continue;
      done[j] = 1;
      p[j * 4] = p[i * 4]; p[j * 4 + 1] = p[i * 4 + 1]; p[j * 4 + 2] = p[i * 4 + 2];
      queue[tail++] = j;
    }
  }
}

function listPngs(dir, base = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? listPngs(path.join(dir, e.name), `${base}${e.name}/`) : e.name.endsWith('.png') ? [`${base}${e.name}`] : []);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let before = 0, after = 0;
  for (const rel of listPngs(source)) {
    if (UNUSED.has(rel)) continue;
    const input = path.join(source, rel);
    const out = rel.replace(/\.png$/, '.webp');
    let webp;
    if (KEYED.test(rel)) {
      const { width, height } = probe(input);
      const rgba = ffmpeg(['-i', input, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-']);
      keyMagenta(rgba);
      bleedEdges(rgba, width, height);
      const tmp = path.join(targets[0], out + '.tmp.webp');
      fs.mkdirSync(path.dirname(tmp), { recursive: true });
      ffmpeg(['-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${width}x${height}`, '-i', '-', '-c:v', 'libwebp', '-quality', String(QUALITY.keyed), '-compression_level', '6', '-pix_fmt', 'yuva420p', tmp], rgba);
      webp = fs.readFileSync(tmp); fs.rmSync(tmp);
    } else {
      const tmp = path.join(targets[0], out + '.tmp.webp');
      fs.mkdirSync(path.dirname(tmp), { recursive: true });
      ffmpeg(['-i', input, '-c:v', 'libwebp', '-quality', String(QUALITY.opaque), '-compression_level', '6', '-pix_fmt', 'yuva420p', tmp]);
      webp = fs.readFileSync(tmp); fs.rmSync(tmp);
    }
    for (const target of targets) {
      fs.mkdirSync(path.dirname(path.join(target, out)), { recursive: true });
      fs.writeFileSync(path.join(target, out), webp);
      fs.rmSync(path.join(target, rel), { force: true });
    }
    before += fs.statSync(input).size; after += webp.length;
    console.log(`${rel.padEnd(42)} ${(fs.statSync(input).size / 1024).toFixed(0).padStart(6)} KB → ${(webp.length / 1024).toFixed(0).padStart(5)} KB${KEYED.test(rel) ? '  (recorte previo)' : ''}`);
  }
  for (const target of targets) for (const rel of UNUSED) fs.rmSync(path.join(target, rel), { force: true });
  console.log(`\nTotal: ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB`);
}
