// Filma una escena aislada y arma su hoja de contactos.
// Uso: node scripts/film-seg.mjs <escena> <segundos> <dir-salida> [--from=s] [--to=s] [--size=1600x900] [--advance]
// --advance pulsa Enter cuando el texto espera (como alguien que lee rápido).
import {chromium} from 'playwright';
import {mkdir, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {startServer} from './serve.mjs';

const args = process.argv.slice(2);
const [seg, secs = '10', out = 'film-seg'] = args.filter(a => !a.startsWith('--'));
const val = (n, d) => (args.find(a => a.startsWith(`--${n}=`)) || '').split('=')[1] || d;
const [W, H] = val('size', '1600x900').split('x').map(Number);
const from = Number(val('from', 0)), to = Number(val('to', secs));
await mkdir(`${out}/film`, {recursive: true});
const server = await startServer(4500 + Math.floor(Math.random() * 300));
const port = server.address().port;
const browser = await chromium.launch({channel: 'chrome'});
const page = await browser.newPage({viewport: {width: W, height: H}});
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e.stack || e)));
const cdp = await page.context().newCDPSession(page);
const frames = [];
let t0 = null;
cdp.on('Page.screencastFrame', async f => {
  cdp.send('Page.screencastFrameAck', {sessionId: f.sessionId}).catch(() => {});
  t0 ??= f.metadata.timestamp;
  const t = f.metadata.timestamp - t0;
  if (frames.length && t - frames.at(-1)[1] < 0.15) return;
  const name = `${String(frames.length).padStart(5, '0')}.jpg`;
  frames.push([name, +t.toFixed(2)]);
  await writeFile(`${out}/film/${name}`, Buffer.from(f.data, 'base64'));
});
await cdp.send('Page.startScreencast', {format: 'jpeg', quality: 60, maxWidth: 800, maxHeight: 450, everyNthFrame: 1});
await page.goto(`http://127.0.0.1:${port}/?seg=${seg}`);
const end = Date.now() + Number(secs) * 1000;
while (Date.now() < end) {
  if (args.includes('--advance')) {
    await page.evaluate(() => { const g = window.__game; if (g?.ui.waiting && !g.ui.typing) g.ui.advance(); }).catch(() => {});
    // elige la opción indicada con --pick=texto (o la última, para no tomar siempre la primera)
    const want = val('pick', '');
    if (args.includes('--tap')) {
      const spots = await page.$$eval('#spots .spot', bs => bs.map(b => ({id: b.dataset.id, label: b.getAttribute('aria-label'), sel: b.classList.contains('selected')}))).catch(() => []);
      const sel = spots.find(x => x.sel);
      const cands = spots.filter(x => /sin (contar|marca|unir)|libre|en la fila|Cruzar|Seguir|buscar|Mirar|Repasar|se tiene|se debe|perdonarla|un paso más|Subir|y la otra/.test(x.label) && !x.sel);
      const t = (sel ? cands.find(x => x.label.split(',')[0] !== sel.label.split(',')[0]) : cands[0]) || null;
      if (t) await page.click(`#spots [data-id="${t.id}"]`, {force: true, timeout: 2000}).catch(() => {});
    }
    const opts = await page.$$eval('#choices:not([hidden]) button', bs => bs.map(b => b.textContent)).catch(() => []);
    if (opts.length) {
      const o = opts.find(t => want && t.includes(want)) || opts[opts.length - 1];
      await page.click(`#choices button:has-text("${o}")`).catch(() => {});
    }
  }
  await page.waitForTimeout(250);
}
await cdp.send('Page.stopScreencast');
const pick = frames.filter(([, t]) => t >= from && t <= to);
const step = Math.max(1, Math.floor(pick.length / 16));
const sel = pick.filter((_, i) => i % step === 0).slice(0, 16);
const base = resolve(`${out}/film`);
await writeFile(`${base}/_contact.html`, `<body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(4,1fr);gap:2px">${sel.map(([n, t]) => `<div style="position:relative"><img src="${n}" style="width:100%;display:block"><b style="position:absolute;left:4px;top:2px;color:#ff0;font:13px monospace;background:#000a">${t.toFixed(1)}s</b></div>`).join('')}</body>`);
const sheet = await browser.newPage({viewport: {width: 1600, height: 900}});
await sheet.goto(`file://${base}/_contact.html`);
await sheet.waitForTimeout(400);
await sheet.screenshot({path: `${out}/contact.png`, fullPage: true});
console.log(`${frames.length} cuadros; hoja: ${out}/contact.png${errors.length ? '\nERRORES:\n' + errors.join('\n') : ''}`);
await browser.close();
server.close();
