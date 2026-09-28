// Captura cada lugar desde la página de revisión, sin leer ni escribir partidas.
// Uso: node scripts/art-review.mjs [lugar,lugar…] [fase 0|3|4] [condición broken|ready|repaired] [x,z]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const base = process.env.GAME_URL || 'http://127.0.0.1:4190/';
const areas = (process.argv[2] || 'portal,plaza,workshop,road,spring,castle,terraces,lake,lighthouse').split(',');
const phase = process.argv[3] || '0';
const condition = process.argv[4] || 'repaired';
const at = process.argv[5]?.split(',').map(Number);
const out = fileURLToPath(new URL('../output/art-review/', import.meta.url));
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
await page.goto(base + 'scripts/qa-direction.html' + (process.env.LENS ? '?lens=' + process.env.LENS : ''));
await page.waitForFunction(() => !document.querySelector('#visit').disabled, null, { timeout: 180000 });
await page.evaluate(() => document.body.classList.add('qa-controls-hidden'));
for (const area of areas) {
  await page.evaluate(([area, condition, phase]) => {
    const set = (id, v) => { const s = document.querySelector(id); s.value = v; s.dispatchEvent(new Event('change')); };
    set('#area', area); set('#phase', phase); set('#condition', condition); document.querySelector('#visit').click();
  }, [area, condition, phase]);
  if (at) await page.evaluate(([x, z]) => window.__qaWorld?.setPlayerPosition([x, z]), at);
  await page.waitForTimeout(3500);
  const file = out + `${area}-${phase}${at ? '-' + at.join('_') : ''}${process.env.LENS ? '-lens' + process.env.LENS.replace(',', '_') : ''}.png`;
  await page.screenshot({ path: file });
  console.log('captura', file);
}
await browser.close();
