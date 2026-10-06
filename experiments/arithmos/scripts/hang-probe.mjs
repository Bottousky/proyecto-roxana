// Si la página deja de responder, pausa el depurador y muestra dónde está trabada.
// Uso: node scripts/hang-probe.mjs <escena> [segundos]
import {chromium} from 'playwright';
import {startServer} from './serve.mjs';
const [, , seg = 'c1.puerta', secs = '120'] = process.argv;
const server = await startServer(4900 + Math.floor(Math.random() * 90));
const port = server.address().port;
const browser = await chromium.launch({channel: 'chrome'});
const page = await browser.newPage({viewport: {width: 1600, height: 900}});
const cdp = await page.context().newCDPSession(page);
await cdp.send('Debugger.enable');
let paused = null;
cdp.on('Debugger.paused', e => { paused = e; });
await page.goto(`http://127.0.0.1:${port}/?seg=${seg}`);
await page.waitForFunction(() => window.__ready);
const end = Date.now() + Number(secs) * 1000;
let hung = false;
while (Date.now() < end && !hung) {
  const alive = await Promise.race([
    page.evaluate(() => {
      const g = window.__game, u = g.ui;
      if (u.waiting && !u.typing) u.advance();
      const b = [...document.querySelectorAll('#choices:not([hidden]) button')];
      if (b.length) b[b.length - 1].click();
      const sp = u.spots[0];
      if (sp && !u.waiting && Math.random() < 0.3) sp.onActivate?.(sp.id);
      return g.state.segment;
    }).then(() => true),
    new Promise(r => setTimeout(() => r(false), 4000)),
  ]);
  if (!alive) hung = true;
  else await new Promise(r => setTimeout(r, 400));
}
if (hung) {
  await cdp.send('Debugger.pause');
  for (let i = 0; i < 50 && !paused; i++) await new Promise(r => setTimeout(r, 100));
  console.log('TRABADA. Pila:');
  for (const f of paused?.callFrames?.slice(0, 12) || []) console.log(`  ${f.functionName || '(anónima)'}  ${f.url.split('/src/')[1] || f.url}:${f.location.lineNumber + 1}`);
} else console.log('sin bloqueos en', secs, 's');
await browser.close().catch(() => {});
server.close();
process.exit(0);
