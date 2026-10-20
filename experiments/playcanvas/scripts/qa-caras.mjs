// La cara del viajero de cerca: la cámara del registro (portrait) con mucho acercamiento y sin
// interfaz, para comparar texturas. Uso: GAME_URL=… OUT=carpeta TAG=nombre [ZOOM=6] node scripts/qa-caras.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { chromePath, gpuArgs, nameTraveller } from './chrome.mjs';

const url = process.env.GAME_URL || 'http://127.0.0.1:4190/', out = process.env.OUT || 'output/qa-caras', tag = process.env.TAG || 'cara';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.locator('#new-game').click(); await nameTraveller(page);
await page.waitForFunction(() => window.__ohmdal?.mode === 'dialogue', {}, { timeout: 60000 });
for (let i = 0; i < 60 && await page.evaluate(() => window.__ohmdal.mode === 'dialogue'); i++) { await page.locator('#dialogue-next').click(); await page.waitForTimeout(120); }
await page.waitForFunction(() => !!window.__ohmdal.world.playerActor?.figure, {}, { timeout: 30000 });
await page.evaluate(zoom => { const w = window.__ohmdal.world; w.portraitAim = { x: .5, y: .9 }; w.portraitZoom = zoom; w.portrait = true; document.querySelector('#hud')?.classList.add('hidden'); document.querySelector('#touch-controls')?.classList.add('hidden'); }, Number(process.env.ZOOM || 6));
await page.waitForTimeout(3500);
await page.screenshot({ path: `${out}/${tag}.png`, clip: { x: 340, y: 60, width: 600, height: 700 } });
console.log(`${out}/${tag}.png`);
await browser.close();
