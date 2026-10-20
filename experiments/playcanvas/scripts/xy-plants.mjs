// Prepara las plantas y los árboles del estilo X e Y (art-src/xy/xy-plants-{a,b}.png, xy-trees.png →
// public/assets/xy/): las hojas de plantas se reducen a 512 px (suaves, no píxeles), se corta el alfa,
// el color se extiende hacia lo transparente para que los mipmaps no dejen halo, y se anota el recuadro
// y la proporción de cada planta en src/data/plants-xy.json (misma forma que plants.json).
// Uso: node scripts/xy-plants.mjs
import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromePath } from './chrome.mjs';

const root = resolve(import.meta.dirname, '..'), src = resolve(root, 'art-src/xy'), out = resolve(root, 'public/assets/xy');
const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const page = await browser.newPage();
const prepare = (file, side, grid) => readFile(resolve(src, file)).then(b => page.evaluate(async ({ data, side, grid }) => {
  const img = new Image(); img.src = `data:image/png;base64,${data}`; await img.decode();
  const W = grid ? side : img.width, H = grid ? side : img.height;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H), p = d.data, solid = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) { const a = p[i * 4 + 3]; solid[i] = a > 110 ? 1 : 0; p[i * 4 + 3] = a < 24 ? 0 : a;
    // A little less saturated than generated: the leaves sit beside painted walls, not a sticker sheet.
    const l = p[i * 4] * .3 + p[i * 4 + 1] * .59 + p[i * 4 + 2] * .11; for (let k = 0; k < 3; k++) p[i * 4 + k] = l + (p[i * 4 + k] - l) * .84; }
  // Colour bleed: every transparent pixel takes its nearest opaque neighbour's colour (eight passes).
  let known = solid.slice();
  for (let pass = 0; pass < 8; pass++) { const next = known.slice();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (known[i]) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const j = Y * W + X; if (!known[j]) continue; for (let k = 0; k < 3; k++) p[i * 4 + k] = p[j * 4 + k]; next[i] = 1; break; } }
    known = next; }
  g.putImageData(d, 0, 0);
  const cells = [];
  if (grid) { const s = side / grid;
    for (let r = 0; r < grid; r++) for (let col = 0; col < grid; col++) { let x0 = s, y0 = s, x1 = -1, y1 = -1;
      for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) if (solid[(r * s + y) * W + col * s + x]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      const r5 = v => Math.round(v * 1e5) / 1e5;
      cells.push(x1 < 0 ? null : { uv: [r5((col * s + x0) / W), r5((r * s + y0) / H), r5((col * s + x1 + 1) / W), r5((r * s + y1 + 1) / H)], aspect: Math.round((x1 + 1 - x0) / (y1 + 1 - y0) * 1000) / 1000 }); } }
  return { png: c.toDataURL('image/png'), cells };
}, { data: b.toString('base64'), side, grid }));
const meta = {};
for (const key of ['a', 'b']) {
  const { png, cells } = await prepare(`xy-plants-${key}.png`, 512, 4);
  await writeFile(resolve(out, `plants-${key}.png`), Buffer.from(png.split(',')[1], 'base64')); meta[key] = cells;
  console.log(`plants-${key}: ${cells.filter(Boolean).length}/16 plantas`);
}
await writeFile(resolve(root, 'src/data/plants-xy.json'), JSON.stringify(meta, null, 1));
const trees = await prepare('xy-trees.png', 0, 0);
await writeFile(resolve(out, 'trees.png'), Buffer.from(trees.png.split(',')[1], 'base64'));
console.log('trees: public/assets/xy/trees.png');
console.log('El juego carga WebP: correr python -I scripts/texturas-webp.py (Pillow).');
await browser.close();
