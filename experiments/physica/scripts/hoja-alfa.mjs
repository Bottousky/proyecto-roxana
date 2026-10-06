// Alpha check of a generated sprite sheet: alpha histogram, semi-transparent haze, and per-cell
// bounding boxes in a 4×2 grid (plus pixels touching a cell's border). Development tool.
//   node scripts/hoja-alfa.mjs <sheet.png>
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const file = process.argv[2];
const b64 = readFileSync(file).toString('base64');
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage();
const res = await page.evaluate(async b64 => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const W = img.width, H = img.height, cv = new OffscreenCanvas(W, H), g = cv.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, W, H).data;
  const hist = new Array(11).fill(0); for (let i = 3; i < d.length; i += 4) hist[Math.min(10, Math.floor(d[i] / 25.6))]++;
  const cw = W / 4, ch = H / 2, cells = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, edge = 0;
    for (let y = r * ch; y < (r + 1) * ch; y++) for (let x = c * cw; x < (c + 1) * cw; x++) {
      const a = d[(y * W + x) * 4 + 3];
      if (a > 128) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); if (x === c * cw || x === (c + 1) * cw - 1 || y === r * ch || y === (r + 1) * ch - 1) edge++; }
    }
    cells.push({ cell: r * 4 + c, bbox: [x0 - c * cw, y0 - r * ch, x1 - c * cw, y1 - r * ch], edgePixels: edge });
  }
  // halo: fraction of pixels with 10 < alpha < 128 (semi-transparent haze)
  let halo = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 10 && d[i] < 128) halo++;
  return { W, H, hist, haloFrac: halo / (W * H), cells };
}, b64);
console.log(JSON.stringify(res));
await browser.close();
