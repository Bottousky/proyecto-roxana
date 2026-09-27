// Captura el HUD al comenzar un viaje nuevo, en escritorio y en teléfono, con un guardado aparte.
// Uso: node scripts/hud-review.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const base = process.env.GAME_URL || 'http://127.0.0.1:4190/';
const out = fileURLToPath(new URL('../output/hud-review/', import.meta.url));
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const [name, viewport, touch] of [['desktop', { width: 1440, height: 900 }, false], ['phone', { width: 390, height: 844 }, true]]) {
  const page = await browser.newPage({ viewport, hasTouch: touch, isMobile: touch });
  page.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
  await page.goto(base);
  await page.locator('#new-game').click();
  await page.waitForFunction(() => window.__ohmdal?.mode === 'dialogue', null, { timeout: 180000 });
  await page.screenshot({ path: `${out}${name}-dialogue.png` });
  while (await page.evaluate(() => window.__ohmdal.mode) === 'dialogue') { await page.keyboard.press('Enter'); await page.waitForTimeout(120); }
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}${name}-world.png` });
  await page.waitForTimeout(13000);
  await page.screenshot({ path: `${out}${name}-settled.png` });
  console.log('captura', name);
  await page.close();
}
await browser.close();
