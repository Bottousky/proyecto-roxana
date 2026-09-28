// Captura el interior de cada casa con puerta desde la página de revisión.
// Uso: node scripts/home-review.mjs [lugar:casa,…]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const base = process.env.GAME_URL || 'http://127.0.0.1:4190/';
const homes = (process.argv[2] || 'portal:portal-keeper,plaza:plaza-bakery,plaza:plaza-civic-house,plaza:plaza-market,road:road-inn,spring:wheel-house,terraces:terrace-forge,terraces:terrace-mill,lake:lake-house').split(',').map(s => s.split(':'));
const out = fileURLToPath(new URL('../output/home-review/', import.meta.url));
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) console.log('console:', m.text()); });
page.on('pageerror', e => console.log('pageerror:', e.message));
await page.goto(base + 'scripts/qa-direction.html');
await page.waitForFunction(() => !document.querySelector('#visit').disabled, null, { timeout: 180000 });
await page.evaluate(() => document.body.classList.add('qa-controls-hidden'));
for (const [area, home] of homes) {
  await page.evaluate(a => { const s = document.querySelector('#area'); s.value = a; s.dispatchEvent(new Event('change')); document.querySelector('#visit').click(); }, area);
  await page.waitForTimeout(1500);
  const ok = await page.evaluate(h => window.__qaWorld.enterHome(h), home);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}${home}.png` });
  console.log('captura', home, ok);
  await page.evaluate(() => window.__qaWorld.leaveHome());
}
await browser.close();
