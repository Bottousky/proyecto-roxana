// Captura del juego real en un instante de una escena, opcionalmente recortada y a dpr alto (A/B de la migración).
// Uso: node scripts/game-shot.mjs <escena> <segundos> <salida.png> [--q=anim=2] [--crop=x,y,w,h] [--dpr=2] [--advance]
// `segundos` es tiempo de reloj desde que la escena arranca; con --advance se pasa el texto como alguien que lee rápido.
import {chromium} from 'playwright';
import {startServer} from './serve.mjs';

const args = process.argv.slice(2);
const [seg, secs = '5', out = 'shot.png'] = args.filter(a => !a.startsWith('--'));
const val = n => (args.find(a => a.startsWith(`--${n}=`)) || '').slice(n.length + 3);
const extra = val('q'), dpr = Number(val('dpr') || 1), crop = val('crop');
const server = await startServer(0); // puerto libre que elige el sistema (dos capturas en paralelo chocaban)
const browser = await chromium.launch({channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu']});
const page = await browser.newPage({viewport: {width: 1600, height: 900}, deviceScaleFactor: dpr});
const errors = [];
page.on('pageerror', e => errors.push(String(e.stack || e)));
await page.goto(`http://127.0.0.1:${server.address().port}/?seg=${seg}${extra ? '&' + extra : ''}`);
await page.waitForFunction(() => window.__ready === true, null, {timeout: 20000});
const end = Date.now() + Number(secs) * 1000;
while (Date.now() < end) {
  if (args.includes('--advance')) await page.evaluate(() => { const g = window.__game; if (g?.ui.waiting && !g.ui.typing) g.ui.advance(); }).catch(() => {});
  await page.waitForTimeout(200);
}
const clip = crop ? (([x, y, width, height]) => ({x, y, width, height}))(crop.split(',').map(Number)) : undefined;
await page.screenshot({path: out, clip});
console.log(JSON.stringify({out, errors}));
await browser.close(); server.close();
