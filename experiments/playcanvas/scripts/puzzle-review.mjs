// Captura el banco de cada puzzle recién abierto, sin tocar partidas.
// Uso: node scripts/puzzle-review.mjs [id,id…]
import { chromium } from 'playwright';
import { chromePath, gpuArgs } from './chrome.mjs';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const base = process.env.GAME_URL || 'http://127.0.0.1:4190/';
const ids = (process.argv[2] || 'awaken,workshop,gate,pump,distribution,irrigation,beacon_supply,beacon_network,beacon_lens').split(',');
const out = fileURLToPath(new URL('../output/puzzle-review/', import.meta.url));
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
page.on('pageerror', e => console.log('pageerror:', e.message));
await page.goto(base);
await page.locator('#new-game').click();
await page.waitForFunction(() => window.__ohmdal?.mode === 'dialogue', null, { timeout: 180000 });
while (await page.evaluate(() => window.__ohmdal.mode) === 'dialogue') { await page.keyboard.press('Enter'); await page.waitForTimeout(80); }
for (const id of ids) {
  await page.evaluate(id => { const g = window.__ohmdal; g.workbench.open(id, null); document.querySelector('#workbench').classList.remove('hidden'); }, id);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}${id}.png` });
  console.log('captura', id);
  await page.evaluate(() => { window.__ohmdal.workbench.close(false); document.querySelector('#workbench').classList.add('hidden'); });
}
await browser.close();
