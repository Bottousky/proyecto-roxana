// Cleans a generated sprite sheet for the game: the semi-transparent edge pixels keep the colour
// of the haze around each figure in the source (a coloured fringe in game); their colour is
// replaced by the mean of the opaque pixels within 3 px, alpha untouched. Then it is scaled to the
// target width. The source file is not modified. Development tool.
//   node scripts/hoja-limpiar.mjs <source.png> <out.png> [width]
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const [src, out, width = '1024'] = process.argv.slice(2);
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage();
const res = await page.evaluate(async ({ b64, W2 }) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const W = img.width, H = img.height, cv = new OffscreenCanvas(W, H), g = cv.getContext('2d'); g.drawImage(img, 0, 0);
  const id = g.getImageData(0, 0, W, H), d = id.data, src = new Uint8ClampedArray(d);
  let fixed = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, a = src[i + 3];
    if (a <= 8 || a >= 250) continue;
    let r = 0, gg = 0, b = 0, n = 0;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
      const j = (yy * W + xx) * 4; if (src[j + 3] >= 250) { r += src[j]; gg += src[j + 1]; b += src[j + 2]; n++; }
    }
    if (n) { d[i] = r / n; d[i + 1] = gg / n; d[i + 2] = b / n; fixed++; }
  }
  g.putImageData(id, 0, 0);
  const H2 = Math.round(H * W2 / W), cv2 = new OffscreenCanvas(W2, H2), g2 = cv2.getContext('2d');
  g2.imageSmoothingQuality = 'high'; g2.drawImage(cv, 0, 0, W2, H2);
  const blob = await cv2.convertToBlob({ type: 'image/png' }), buf = new Uint8Array(await blob.arrayBuffer());
  let s = ''; for (let k = 0; k < buf.length; k += 0x8000) s += String.fromCharCode(...buf.subarray(k, k + 0x8000));
  return { fixed, W2, H2, png: btoa(s) };
}, { b64: readFileSync(src).toString('base64'), W2: +width });
writeFileSync(out, Buffer.from(res.png, 'base64'));
console.log(JSON.stringify({ edgePixelsRecoloured: res.fixed, size: [res.W2, res.H2] }));
await browser.close();
