import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

// Run against the Vite development server: node scripts/qa-workbench-ergonomics.mjs
// The isolated surface mounts the production workbench module; every connection,
// measurement, range adjustment and commissioning action uses the rendered UI.
const base = process.env.OHMDAL_QA_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: process.env.HEADED !== '1' });
const output = 'output/playwright/workbench-ergonomics';
await mkdir(output, { recursive: true });

async function visibleRect(page, locator) {
  const rect = await locator.boundingBox();
  const viewport = page.viewportSize();
  assert.ok(rect && rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= viewport.width + 1 && rect.y + rect.height <= viewport.height + 1, `Control must fit the viewport: ${JSON.stringify(rect)}`);
  const clickable = await locator.evaluate(el => {
    const r = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
  });
  assert.equal(clickable, true, 'Control center must not be hidden behind the sticky header');
  return rect;
}

try {
  for (const viewport of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
    const mobile = viewport.width < 530;
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/workbench-ergonomics-qa', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#0b1819"><main id="bench"></main><script type="module">import {PuzzleWorkbench} from '/src/puzzles.js';window.commissions=[];window.bench=new PuzzleWorkbench(document.getElementById('bench'),{onSolve:(id,result)=>window.commissions.push({id,result})});bench.open('awaken');</script></body></html>` }));
    await page.goto(`${base}/workbench-ergonomics-qa`);
    await page.locator('.wb-board').waitFor();
    const prefix = `${output}/${viewport.width}x${viewport.height}`;
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: `${prefix}-initial.png` });
    const terminal = id => page.locator(`[data-${mobile ? 'terminal' : 'port'}="${id}"]`);
    if (mobile) for (const id of ['positive','negative','heartIn','heartOut']) assert.ok((await terminal(id).boundingBox()).height >= 44);

    assert.equal(await page.locator('[data-action="mode"]').count(), 0, 'Ohm wakes before measurement tools are introduced');
    assert.equal(await page.locator('[data-action="numbers"]').count(), 0, 'The first encounter does not require numerical marks');
    await terminal('heartOut').click();
    await terminal('negative').click();
    await visibleRect(page, page.locator('.wb-commission-top'));
    assert.equal(await page.evaluate(() => commissions.length), 0, 'An operating network remains experimental until commissioned');
    await page.locator('.wb-wire-drawer>summary').click();
    const wireButton = page.locator('button[data-wire="0"]');
    await wireButton.scrollIntoViewIfNeeded();
    if (mobile) assert.ok((await wireButton.boundingBox()).height >= 44);
    await visibleRect(page, wireButton);
    await visibleRect(page, page.locator('.wb-commission-top'));
    await page.screenshot({ path: `${prefix}-cables-success.png` });

    await page.locator('.wb-commission-top').click();
    assert.equal(await page.evaluate(() => commissions.length), 1);
    assert.equal(await page.locator('.workbench-overlay').count(), 0);

    // Ohm can offer a measurement after waking. Keep the original 6 V probe
    // assertion, now reached through the deliberately optional reading layer.
    await page.evaluate(() => bench.open('awaken', bench.state));
    await page.locator('[data-action="mode"][data-mode="voltage"]').click();
    await terminal('positive').click();
    await terminal('negative').click();
    assert.match(await page.locator('.wb-meter-readout').innerText(), /Hay diferencia/);
    await page.locator('[data-action="numbers"]').click();
    assert.match(await page.locator('.wb-meter-readout').innerText(), /6,00/);
    if (mobile) await visibleRect(page, page.locator('.wb-compact-meter'));
    await page.screenshot({ path: `${prefix}-measurement.png` });
    await page.locator('.wb-close[data-action="close"]').click();
    assert.equal(await page.evaluate(() => commissions.length), 1, 'Inspecting an awakened Ohm does not commission him twice');

    await page.evaluate(() => bench.open('irrigation'));
    if (!mobile) assert.ok((await page.locator('.wb-board').boundingBox()).width >= 550, '720p must not shrink a regulated machine into a tiny thumbnail');
    for (const key of ['warmth','flow']) {
      const slider = page.locator(`[data-knob="${key}"]`);
      await slider.fill('12');
      await slider.dispatchEvent('change');
    }
    await page.locator('.wb-wire-drawer>summary').click();
    await page.locator('button[data-wire="5"]').scrollIntoViewIfNeeded();
    const before = await page.locator('.wb-case').evaluate(el => el.scrollTop);
    await page.locator('button[data-wire="5"]').click();
    const after = await page.locator('.wb-case').evaluate(el => el.scrollTop);
    assert.ok(after > 0 && Math.abs(after - before) < 100, 'Manipulating a cable should retain the scroll position');
    await page.locator('[data-action="undo"]').click();
    await visibleRect(page, page.locator('.wb-commission-top'));
    if (mobile) {
      for (const button of await page.locator('.wb-knob-row button').all()) assert.ok((await button.boundingBox()).height >= 44);
    }
    await page.screenshot({ path: `${prefix}-regulated-success.png` });
    assert.deepEqual(errors, []);
    console.log(`${viewport.width}×${viewport.height}: initial, voltage probes, cable drawer, touch targets, scroll preservation and fixed commissioning CTA PASS`);
    await context.close();
  }
} finally { await browser.close(); }
