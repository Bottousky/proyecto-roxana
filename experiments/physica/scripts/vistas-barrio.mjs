// Views of the neighbourhood that the play camera does not frame by itself (development inspection):
// what shows over the Terraza's back wall before and after the Mirador (the city seen), and the
// whole square from above, with a free camera. The explorer is placed (declared); no keys.
//   node scripts/vistas-barrio.mjs [url] [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const url = process.argv[2] || 'http://127.0.0.1:4210/';
const out = process.argv[3] || 'vistas-barrio-out';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto(url + '?nopause&fresh&nointro');
await page.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60);
const put = (x, y, z = 0) => page.evaluate(({ x, y, z }) => { const a = window.__physica.world.avatar; a.x = a.px = x; a.y = a.py = y + a.hh; a.z = a.pz = z; a.vx = a.vy = a.vz = 0; }, { x, y, z });
const shot = async name => { await page.waitForTimeout(2500); await page.screenshot({ path: join(out, `${name}.png`) }); };
// The Terraza beside the arch, before and after the Mirador.
await put(5.6, 4.4); await shot('1-terraza-antes-del-mirador');
await put(14, 5.15); await page.waitForTimeout(800); await shot('2-desde-el-mirador');
await put(5.6, 4.4); await shot('3-terraza-despues-del-mirador');
// The whole square, from above the passage's mouth (arch open).
await page.evaluate(() => { const w = window.__physica.world, d = w.doors[0]; d.open = true; d.openT = d.swing; });
await put(7.6, 4.4, -12.2);
await page.evaluate(() => window.__physica.look([7.6, 13.5, -6.0], [7.8, 4.4, -16.5])); await shot('4-plaza-entera');
await page.evaluate(() => window.__physica.look([1.0, 10.5, -21.5], [9.5, 4.6, -12.0])); await shot('5-plaza-desde-el-fondo');
await page.evaluate(() => window.__physica.look(null));
console.log('errors', errors);
await browser.close();
