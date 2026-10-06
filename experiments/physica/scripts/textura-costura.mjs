// Seam check for a tileable texture: mean colour difference across the wrap (last column against
// the first, last row against the first) compared with the typical difference between adjacent
// columns and rows inside the image. A seamless tile has a wrap difference like the interior one.
//   node scripts/textura-costura.mjs <texture.png>
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage();
console.log(await page.evaluate(async b64 => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const W = img.width, H = img.height, cv = new OffscreenCanvas(W, H), g = cv.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, W, H).data, px = (x, y) => (y * W + x) * 4;
  const colDiff = (a, b) => { let s = 0; for (let y = 0; y < H; y++) for (let c = 0; c < 3; c++) s += Math.abs(d[px(a, y) + c] - d[px(b, y) + c]); return s / (H * 3); };
  const rowDiff = (a, b) => { let s = 0; for (let x = 0; x < W; x++) for (let c = 0; c < 3; c++) s += Math.abs(d[px(x, a) + c] - d[px(x, b) + c]); return s / (W * 3); };
  let ci = 0, ri = 0; const n = 16;
  for (let k = 1; k <= n; k++) { const x = Math.floor(k * W / (n + 1)), y = Math.floor(k * H / (n + 1)); ci += colDiff(x, x + 1); ri += rowDiff(y, y + 1); }
  return JSON.stringify({ size: [W, H], wrapX: +colDiff(W - 1, 0).toFixed(1), interiorX: +(ci / n).toFixed(1), wrapY: +rowDiff(H - 1, 0).toFixed(1), interiorY: +(ri / n).toFixed(1) });
}, readFileSync(process.argv[2]).toString('base64')));
await browser.close();
