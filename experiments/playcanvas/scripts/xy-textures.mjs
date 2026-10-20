// Prepara las texturas del estilo X e Y (art-src/xy → public/assets/xy): cada una se vuelve continua
// en sus bordes con un fundido cruzado (la franja final se funde sobre la inicial, en x y después en
// y), se reduce a 512 px y se le ajusta la saturación. Escribe también una vista de 2×2 sin
// separación para mirar las costuras. Uso: node scripts/xy-textures.mjs [nombre…]
import { chromium } from 'playwright';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromePath } from './chrome.mjs';

const root = resolve(import.meta.dirname, '..'), src = resolve(root, 'art-src/xy'), out = resolve(root, 'public/assets/xy'), preview = resolve(root, 'output/xy-textures');
await mkdir(out, { recursive: true }); await mkdir(preview, { recursive: true });
// Saturation per surface: the generator paints lawns brighter than a lit scene wants.
const SATURATION = { meadow: .78, moss: .82 };
// Fade band (share of the width): structured surfaces (stones, tiles, beams) tile as generated, with
// at most a hairline band; a cross-fade there would ghost one stone over another.
const BAND = { meadow: .14, moss: .14, plaster: .14 };
const band = name => process.env.BAND !== undefined ? Number(process.env.BAND) : BAND[name] ?? .02;
const names = process.argv.slice(2).length ? process.argv.slice(2) : (await readdir(src)).filter(f => /^xy-.*\.png$/.test(f)).map(f => f.slice(3, -4));
const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const page = await browser.newPage();
for (const name of names) {
  const data = (await readFile(resolve(src, `xy-${name}.png`))).toString('base64');
  const [tile, sheet] = await page.evaluate(async ({ data, saturation, share }) => {
    const img = new Image(); img.src = `data:image/png;base64,${data}`; await img.decode();
    const W = img.width, H = img.height, band = Math.max(1, Math.round(W * share));
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    let px = g.getImageData(0, 0, W, H).data, w = W, h = H;
    // Seamless along x: width w - band; the last band fades into the first one.
    const crossX = (p, w, h) => { const nw = w - band, o = new Uint8ClampedArray(nw * h * 4);
      for (let y = 0; y < h; y++) for (let x = 0; x < nw; x++) { const k = (y * nw + x) * 4, a = (y * w + x) * 4;
        if (x < band) { const t = x / band, b = (y * w + x + nw) * 4; for (let i = 0; i < 4; i++) o[k + i] = p[b + i] * (1 - t) + p[a + i] * t; } else for (let i = 0; i < 4; i++) o[k + i] = p[a + i]; }
      return [o, nw]; };
    const transpose = (p, w, h) => { const o = new Uint8ClampedArray(p.length); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let i = 0; i < 4; i++) o[(x * h + y) * 4 + i] = p[(y * w + x) * 4 + i]; return o; };
    [px, w] = crossX(px, w, h); px = transpose(px, w, h); [px, h] = crossX(px, h, w); px = transpose(px, h, w);
    // Saturation around the pixel's own luminance.
    for (let i = 0; i < px.length; i += 4) { const l = px[i] * .3 + px[i + 1] * .59 + px[i + 2] * .11; for (let j = 0; j < 3; j++) px[i + j] = l + (px[i + j] - l) * saturation; }
    const full = document.createElement('canvas'); full.width = w; full.height = h; full.getContext('2d').putImageData(new ImageData(px, w, h), 0, 0);
    const small = document.createElement('canvas'); small.width = small.height = 512; const sg = small.getContext('2d'); sg.imageSmoothingQuality = 'high'; sg.drawImage(full, 0, 0, 512, 512);
    const twice = document.createElement('canvas'); twice.width = twice.height = 1024; const tg = twice.getContext('2d'); for (const [x, y] of [[0, 0], [512, 0], [0, 512], [512, 512]]) tg.drawImage(small, x, y);
    return [small.toDataURL('image/png'), twice.toDataURL('image/png')];
  }, { data, saturation: SATURATION[name] ?? 1, share: band(name) });
  await writeFile(resolve(out, `${name}.png`), Buffer.from(tile.split(',')[1], 'base64'));
  await writeFile(resolve(preview, `${name}-2x2.png`), Buffer.from(sheet.split(',')[1], 'base64'));
  console.log(`${name}: public/assets/xy/${name}.png`);
  console.log('El juego carga WebP: correr python -I scripts/texturas-webp.py (Pillow).');
}
await browser.close();
