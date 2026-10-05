// Lista los textos visibles de menos de 12 px en título, diálogo, mundo, Bitácora, mapa y pausa.
// Uso: GAME_URL=http://127.0.0.1:4190/ SIZE=1280x720 node scripts/qa-type-sizes.mjs
import { chromium } from 'playwright';
import { chromePath } from './chrome.mjs';
const url = process.env.GAME_URL || 'http://127.0.0.1:4192/';
const [w, h] = (process.env.SIZE || '1280x720').split('x').map(Number);
const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const page = await browser.newPage({ viewport: { width: w, height: h } });
await page.goto(url, { waitUntil: 'networkidle' });
const scan = label => page.evaluate(label => {
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.textContent.trim(); if (!t) continue;
    const el = n.parentElement, cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (!r.width || !r.height || cs.visibility === 'hidden' || el.closest('.hidden,[hidden],.screen-reader-only')) continue;
    let o = el, visible = true; while (o) { const c = getComputedStyle(o); if (c.display === 'none' || Number(c.opacity) === 0) { visible = false; break; } o = o.parentElement; }
    if (!visible) continue;
    const px = parseFloat(cs.fontSize); if (px < 12) out.push(`${label} ${px}px ${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].join('.')} «${t.slice(0, 40)}»`);
  }
  return out;
}, label);
const all = [];
all.push(...await scan('título'));
await page.locator('#new-game').click();
await page.waitForFunction(() => window.__ohmdal?.mode === 'dialogue', {}, { timeout: 60000 });
await page.waitForTimeout(800);
all.push(...await scan('diálogo'));
while (await page.evaluate(() => window.__ohmdal.mode) === 'dialogue') { await page.keyboard.press('Enter'); await page.waitForTimeout(80); }
await page.waitForTimeout(500);
all.push(...await scan('mundo'));
await page.keyboard.press('j'); await page.waitForTimeout(500); all.push(...await scan('bitácora')); await page.keyboard.press('Escape');
await page.keyboard.press('m'); await page.waitForTimeout(500); all.push(...await scan('mapa')); await page.keyboard.press('Escape');
await page.keyboard.press('Escape'); await page.waitForTimeout(500); all.push(...await scan('pausa')); await page.keyboard.press('Escape');
console.log([...new Set(all)].join('\n'));
await browser.close();
