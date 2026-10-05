// Lista los textos visibles por debajo del piso de lectura: 12 px para lo que informa y 11 px
// para los rótulos en versalitas (.eyebrow y equivalentes). Recorre título, diálogo, mundo,
// Bitácora, mapa, pausa y el primer banco. El texto SVG se mide con su escala en pantalla.
// Uso: GAME_URL=http://127.0.0.1:4190/ SIZE=1280x720 [SHOTS=carpeta] node scripts/qa-type-sizes.mjs
// Sale con código 1 si encuentra algo por debajo del piso (STRICT=0 sólo informa).
import { chromium } from 'playwright';
import { chromePath } from './chrome.mjs';

const url = process.env.GAME_URL || 'http://127.0.0.1:4190/';
const [width, height] = (process.env.SIZE || '1280x720').split('x').map(Number);
const phone = width < 640;
const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const page = await browser.newPage({ viewport: { width, height }, ...(phone ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) });
await page.goto(url, { waitUntil: 'networkidle' });

const shots = process.env.SHOTS;
if (shots) await (await import('node:fs/promises')).mkdir(shots, { recursive: true });
const scan = async label => { if (shots) await page.screenshot({ path: `${shots}/${width}x${height}-${label}.png` }); return page.evaluate(label => {
  const out = [];
  const label_ = el => el.closest('.eyebrow,.title-eyebrow,.title-foot,.wb-eyebrow,.book-heading .eyebrow,[data-label]') || getComputedStyle(el).textTransform === 'uppercase';
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    // Visible text counts even if hidden from assistive technology; lone glyphs (Ω, +, ×) are ornament.
    const text = n.textContent.trim(); if (!text || /^[Ω+−\-×↔·◈▾▸↵⏻✕]$/.test(text)) continue;
    const el = n.parentElement, r = el.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight || el.closest('.hidden,[hidden],.screen-reader-only')) continue;
    let o = el, visible = true; while (o && o.nodeType === 1) { const c = getComputedStyle(o); if (c.display === 'none' || c.visibility === 'hidden' || Number(c.opacity) === 0) { visible = false; break; } o = o.parentElement; }
    if (!visible) continue;
    let px = parseFloat(getComputedStyle(el).fontSize);
    if (el instanceof SVGElement) { const m = el.getScreenCTM(); if (m) px *= Math.hypot(m.a, m.b); }
    const floor = label_(el) ? 11 : 12;
    if (px < floor - .01) out.push(`${label} · ${px.toFixed(1)} px (piso ${floor}) · ${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList.length ? '.' + [...el.classList].join('.') : ''} «${text.slice(0, 38)}»`);
  }
  return out;
}, label); };

const findings = [];
const mode = () => page.evaluate(() => window.__ohmdal?.mode);
findings.push(...await scan('título'));
await page.locator('#new-game').click();
await page.waitForFunction(() => window.__ohmdal?.mode === 'dialogue', {}, { timeout: 60000 });
await page.waitForTimeout(900);
findings.push(...await scan('diálogo'));
while (await mode() === 'dialogue') { await page.keyboard.press('Enter'); await page.waitForTimeout(90); }
await page.waitForTimeout(600);
findings.push(...await scan('mundo'));
for (const [key, label] of [['j', 'bitácora'], ['m', 'mapa'], ['h', 'guía']]) { await page.keyboard.press(key); await page.waitForTimeout(500); findings.push(...await scan(label)); await page.keyboard.press('Escape'); await page.waitForTimeout(250); }
await page.keyboard.press('Escape'); await page.waitForTimeout(500); findings.push(...await scan('pausa')); await page.keyboard.press('Escape'); await page.waitForTimeout(250);
// El primer banco: caminar hasta el pedestal y abrirlo.
for (let i = 0; i < 60; i++) {
  const s = await page.evaluate(() => { const g = window.__ohmdal, o = g.world.getInteractions().find(o => o.id === 'ohm_pedestal'), p = g.world.getPlayerPosition(); return { o: [o.x, o.z], p, near: g.nearby?.id }; });
  if (s.near === 'ohm_pedestal') break;
  const dx = s.o[0] - s.p[0], dz = s.o[1] - s.p[1], key = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'd' : 'a') : (dz > 0 ? 's' : 'w');
  await page.keyboard.down(key); await page.waitForTimeout(140); await page.keyboard.up(key);
}
await page.keyboard.press('e');
for (let i = 0; i < 80 && await mode() !== 'puzzle'; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(90); }
await page.waitForTimeout(700);
findings.push(...await scan('banco'));

const unique = [...new Set(findings)];
console.log(`${width}×${height}: ${unique.length} textos por debajo del piso`);
console.log(unique.join('\n'));
await browser.close();
if (unique.length && process.env.STRICT !== '0') process.exitCode = 1;
