// Gráfico de sondas del Animation Lab (p. ej., velocidad de la punta en el tiempo).
// Uso: node scripts/animlab-plot.mjs <probes.json> <salida.png> <serie,serie,...> [titulo]
//   serie = camino dentro de cada sonda, p. ej. A.v  B.v  C.v  punto.x
import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
const [, , file, out, spec, title = ''] = process.argv;
const probes = JSON.parse(await readFile(file, 'utf8'));
const get = (o, path) => path.split('.').reduce((a, k) => (a == null ? null : a[k]), o);
const series = spec.split(',').map(k => ({k, pts: probes.map(p => [p.t, get(p.p, k)]).filter(([, v]) => typeof v === 'number')}));
const browser = await chromium.launch({channel: 'chrome'});
const page = await browser.newPage({viewport: {width: 1200, height: 420}});
await page.setContent(`<canvas id=c width=1200 height=420></canvas>`);
await page.evaluate(({series, title}) => {
  const c = document.getElementById('c').getContext('2d');
  c.fillStyle = '#10201b'; c.fillRect(0, 0, 1200, 420);
  const all = series.flatMap(s => s.pts);
  // el eje de tiempo empieza en el primer instante de los datos (un tramo de 16 a 18 s no queda aplastado contra la derecha)
  const tA = Math.min(...all.map(p => p[0])), t1 = Math.max(...all.map(p => p[0])), v0 = Math.min(0, ...all.map(p => p[1])), v1 = Math.max(...all.map(p => p[1])) * 1.05 || 1;
  const X = t => 60 + ((t - tA) / (t1 - tA || 1)) * 1110, Y = v => 380 - ((v - v0) / (v1 - v0)) * 340;
  c.strokeStyle = '#2c4a40'; c.fillStyle = '#7fa094'; c.font = '12px sans-serif';
  for (let i = 0; i <= 10; i++) { const t = tA + (t1 - tA) * i / 10; c.beginPath(); c.moveTo(X(t), 40); c.lineTo(X(t), 380); c.stroke(); c.fillText(t.toFixed(2) + ' s', X(t) - 14, 398); }
  for (let i = 0; i <= 4; i++) { const v = v0 + (v1 - v0) * i / 4; c.beginPath(); c.moveTo(60, Y(v)); c.lineTo(1170, Y(v)); c.stroke(); c.fillText(v.toFixed(0), 8, Y(v) + 4); }
  const cols = ['#ff8f70', '#f2f2e6', '#7cc4ff', '#ffd76a', '#b48cff'];
  series.forEach((s, i) => {
    c.strokeStyle = cols[i % cols.length]; c.lineWidth = 2; c.beginPath();
    s.pts.forEach(([t, v], j) => (j ? c.lineTo(X(t), Y(v)) : c.moveTo(X(t), Y(v)))); c.stroke();
    c.fillStyle = cols[i % cols.length]; c.fillText(s.k, 70 + i * 90, 24);
  });
  c.fillStyle = '#cfe0d8'; c.fillText(title, 600, 24);
}, {series, title});
await page.screenshot({path: out});
await browser.close();
