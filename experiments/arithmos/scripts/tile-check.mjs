// Comprobación puntual: los lugares de la recta del cap. 6 en 844×390 son contiguos y no se pisan.
import {chromium} from 'playwright';
import {startServer} from './serve.mjs';
const port = 4290 + Math.floor(Math.random() * 50);
const server = await startServer(port);
const browser = await chromium.launch({channel: 'chrome'});
const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});
const page = await ctx.newPage();
await page.goto(`http://127.0.0.1:${port}/?seg=c6.dos-pasos`);
await page.waitForFunction(() => window.__ready === true, null, {timeout: 60000});
for (let i = 0; i < 400; i++) {
  const r = await page.evaluate(() => {
    const spots = [...document.querySelectorAll('#spots button, .spot')].filter(b => /^x-?\d+$/.test(b.dataset.id || ''));
    if (spots.length > 5) return spots.map(b => { const q = b.getBoundingClientRect(); return [b.dataset.id, Math.round(q.left), Math.round(q.right), Math.round(q.width)]; });
    const ch = document.querySelector('#choices');
    if (ch && !ch.hidden) { const btn = ch.querySelector('button:not(.peek)'); btn?.click(); return 'choice'; }
    const cap = document.querySelector('#caption');
    if (cap && !cap.hidden) { cap.click(); return 'cap'; }
    return null;
  });
  if (Array.isArray(r)) {
    r.sort((a, b) => a[1] - b[1]);
    let overlaps = 0, gaps = 0;
    for (let k = 1; k < r.length; k++) { if (r[k][1] < r[k - 1][2] - 1) overlaps++; if (r[k][1] > r[k - 1][2] + 1) gaps++; }
    console.log(JSON.stringify({n: r.length, widths: [...new Set(r.map(x => x[3]))], overlaps, gaps, first: r.slice(0, 4)}));
    break;
  }
  await page.waitForTimeout(300);
}
await browser.close();
server.close();
