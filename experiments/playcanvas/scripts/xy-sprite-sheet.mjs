// Limpia una hoja de sprites del estilo X e Y (art-src/xy/viajero/hoja-sprites.png → public/assets/xy/player-dibujo.png;
// el juego carga la versión WebP: después correr python -I scripts/texturas-webp.py):
// quita el halo rojizo que dejó el fondo violeta de la hoja original (píxeles semitransparentes o
// casi rojos puros en el borde) y lleva la hoja a la misma grilla 5×4 que usa actorArt.
import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromePath } from './chrome.mjs';
const root = resolve(import.meta.dirname, '..');
const [src = 'art-src/xy/viajero/hoja-sprites.png', dst = 'public/assets/xy/player-dibujo.png'] = process.argv.slice(2);
const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const page = await browser.newPage();
const png = await page.evaluate(async data => {
  const img = new Image(); img.src = `data:image/png;base64,${data}`; await img.decode();
  const W = 1402, H = 1122, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i], gr = p[i + 1], b = p[i + 2], a = p[i + 3];
    const reddish = r > 120 && r > gr * 1.9 && r > b * 1.6;      // the halo is red, not skin or scarf
    if (a < 200 && reddish) p[i + 3] = 0;
    else if (a < 60) p[i + 3] = 0;
  }
  g.putImageData(d, 0, 0); return c.toDataURL('image/png');
}, (await readFile(resolve(root, src))).toString('base64'));
await writeFile(resolve(root, dst), Buffer.from(png.split(',')[1], 'base64'));
console.log('hoja', dst);
await browser.close();
