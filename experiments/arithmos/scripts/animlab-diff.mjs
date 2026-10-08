// Diferencia de píxeles entre dos PNG (para regresiones no buscadas, nunca para decir "mejoró").
// Uso: node scripts/animlab-diff.mjs a.png b.png → media |Δ| por canal (0–255), % de píxeles con |Δ| > 16, máximo y caja
// de los píxeles que difieren.
import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
const [, , A, B] = process.argv;
const url = async f => `data:image/png;base64,${(await readFile(f)).toString('base64')}`;
const b = await chromium.launch({channel: 'chrome'});
const p = await b.newPage();
const r = await p.evaluate(async ([a, c]) => {
  const load = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
  const [ia, ib] = await Promise.all([load(a), load(c)]);
  const cv = document.createElement('canvas'); cv.width = ia.width; cv.height = ia.height;
  const x = cv.getContext('2d');
  x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, cv.width, cv.height).data;
  x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, cv.width, cv.height).data;
  let sum = 0, big = 0, max = 0, x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (let i = 0; i < da.length; i += 4) { let d = 0; for (let k = 0; k < 3; k++) d = Math.max(d, Math.abs(da[i + k] - db[i + k])); sum += d; if (d > 16) { big++; const px = (i / 4) % cv.width, py = Math.floor(i / 4 / cv.width); x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); } if (d > max) max = d; }
  const n = da.length / 4;
  return {mean: +(sum / n).toFixed(3), pctOver16: +(100 * big / n).toFixed(3), max, bbox: big ? [x0, y0, x1, y1] : null};
}, [await url(A), await url(B)]);
console.log(JSON.stringify(r));
await b.close();
