// Makes a texture tile without seams: blends it with a copy shifted by half its size, the copy
// weighing in only near the edges (where the original does not wrap). The copy's centre is
// continuous across the wrap, so the result is too. Writes a JPEG. Development tool.
//   node scripts/textura-sin-costura.mjs <in.png> <out.jpg> [band=0.18] [quality=0.86]
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const [src, out, band = '0.18', q = '0.86'] = process.argv.slice(2);
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage();
const b64 = await page.evaluate(async ({ b64, band, q }) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const W = img.width, H = img.height, cv = new OffscreenCanvas(W, H), g = cv.getContext('2d'); g.drawImage(img, 0, 0);
  const a = g.getImageData(0, 0, W, H), d = a.data, src = new Uint8ClampedArray(d);
  const sm = t => t * t * (3 - 2 * t);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ex = Math.min(x, W - 1 - x) / W, ey = Math.min(y, H - 1 - y) / H;
    const w = Math.max(1 - sm(Math.min(1, ex / band)), 1 - sm(Math.min(1, ey / band)));
    const i = (y * W + x) * 4, j = (((y + H / 2) % H) * W + ((x + W / 2) % W)) * 4;
    for (let c = 0; c < 3; c++) d[i + c] = src[i + c] * (1 - w) + src[j + c] * w;
  }
  g.putImageData(a, 0, 0);
  const blob = await cv.convertToBlob({ type: 'image/jpeg', quality: q }), buf = new Uint8Array(await blob.arrayBuffer());
  let s = ''; for (let k = 0; k < buf.length; k += 0x8000) s += String.fromCharCode(...buf.subarray(k, k + 0x8000));
  return btoa(s);
}, { b64: readFileSync(src).toString('base64'), band: +band, q: +q });
writeFileSync(out, Buffer.from(b64, 'base64'));
await browser.close();
