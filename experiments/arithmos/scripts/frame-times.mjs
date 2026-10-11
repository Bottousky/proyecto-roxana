// Tiempos de cuadro de una escena real (20 s, pasando el texto): los peores cuadros y la mediana. Para el costo de la
// migración (?anim=2). Uso: node scripts/frame-times.mjs <escena> [anim=2]
import {chromium} from 'playwright';
import {startServer} from './serve.mjs';
const [seg, q] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const server = await startServer(0);
const b = await chromium.launch({channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu']});
const p = await b.newPage({viewport: {width: 1600, height: 900}});
// todos los cuadros desde que carga (frameTimes del juego guarda sólo los últimos 240 y recorta a 50 ms)
await p.addInitScript(() => { window.__ft = []; let last = 0; const tick = now => { if (last) window.__ft.push(now - last); last = now; requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
await p.goto(`http://127.0.0.1:${server.address().port}/?seg=${seg}${q ? '&' + q : ''}`);
await p.waitForFunction(() => window.__ready === true);
// --new: empieza desde el título como el bot (Empezar)
if (process.argv.includes('--new')) { await p.waitForTimeout(800); await p.click('#title [data-act=new]'); }
const end = Date.now() + 20000;
while (Date.now() < end) { await p.evaluate(() => { const g = window.__game; if (g?.ui.waiting && !g.ui.typing) g.ui.advance(); const o = [...document.querySelectorAll('#choices button:not([disabled])')]; if (o.length) o.at(-1).click(); }); await p.waitForTimeout(250); }
const f = await p.evaluate(() => window.__ft.map(x => x / 1000));
const s = [...f].sort((a, b) => b - a);
const over = f.filter(x => x > 0.034).length;
console.log(seg, q || 'A', 'cuadros', f.length, '> 34 ms:', over, 'peor (ms):', s.slice(0, 6).map(x => Math.round(x * 1000)).join(' '), 'mediana', Math.round(s[s.length >> 1] * 1000));
await b.close(); server.close();
