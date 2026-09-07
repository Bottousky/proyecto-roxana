import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fastLaunchOptions, getCaptureShotSpec } from '../visual/ohmdal-capture-contract.mjs';

// Isolated contexts: this never reads or changes the player's browser save.
const base = process.env.OHMDAL_QA_URL ?? 'http://127.0.0.1:54321';
const out = resolve('output/playwright/ohmdal-world-quality-20260907/sensory');
await mkdir(out, { recursive: true });
const browser = await chromium.launch(fastLaunchOptions());
const results = [], errors = [];
const assert = (value, message) => { if (!value) throw new Error(message); };
try {
  for (const touch of [false, true]) {
    const context = await browser.newContext({ viewport: touch ? { width: 844, height: 390 } : { width: 1440, height: 900 }, hasTouch: touch, isMobile: touch });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      localStorage.setItem('ohmdal_intro_seen', 'true');
      window.__qaAudioContexts = [];
      const Original = window.AudioContext;
      window.AudioContext = class extends Original {
        constructor(...args) { super(...args); window.__qaAudioContexts.push(this); }
      };
    });
    const enter = async () => {
      await page.goto(`${base}/ohmdal-playcanvas?visualTest=1`, { waitUntil: 'networkidle' });
      await page.locator('#plaza-enter').click();
      await page.waitForFunction(() => Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__));
      await page.evaluate(() => {
        const h = window.__ROXANA_VISUAL_TEST_HOOKS__;
        h.setState('portal-arrival'); h.hideDebugUi(false); h.setPausedForScreenshot(false);
      });
    };
    const inspect = () => page.evaluate(async () => {
      const url = performance.getEntriesByType('resource').find(e => /\/playcanvas\.js\?/.test(e.name)).name;
      const pc = await import(url), app = pc.Application.getApplication();
      return {
        jets: [0, 1, 2, 3].map(i => {
          const entity = app.root.findByName(`FountainWaterJet${i}`);
          return { enabled: entity.enabled, paused: entity.particlesystem.isPlaying() === false };
        }),
        audio: window.__qaAudioContexts.map(c => c.state),
        circuit: window.__ROXANA_VISUAL_TEST_HOOKS__.getPlaytestSnapshot().circuit,
      };
    });
    await enter();
    // An actual gesture unlocks one shared context; UI mute survives reload.
    const button = page.locator('#ohmdal-audio-toggle');
    if (touch) await button.tap(); else await button.click();
    await page.waitForFunction(() => document.querySelector('#ohmdal-audio-toggle').getAttribute('aria-pressed') === 'true');
    assert(await page.evaluate(() => localStorage.getItem('ohmdal.audio.muted')) === 'true', 'Mute preference missing');
    await enter();
    assert(await button.getAttribute('aria-pressed') === 'true', 'Mute lost on reload');
    assert(await page.evaluate(() => window.__qaAudioContexts.length) === 0, 'Muted startup allocates audio');
    if (touch) await button.tap(); else await button.click();
    await page.waitForFunction(() => window.__qaAudioContexts.some(c => c.state === 'running'));
    assert(await button.getAttribute('aria-label') === 'Silenciar sonido', 'Unmute label incorrect');

    await page.evaluate(() => {
      const h = window.__ROXANA_VISUAL_TEST_HOOKS__;
      h.setState('portal-arrival'); h.setReducedMotion(false); h.setPausedForScreenshot(false); h.hideDebugUi(false);
    });
    await page.waitForTimeout(250);
    const dormant = await inspect();
    assert(dormant.jets.every(j => !j.enabled), 'Fountain flows before electricity');
    // A solver-backed visual fixture isolates presentation from the complete
    // Golden Path, which independently repairs this circuit through input.
    await page.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__.setState('restored-plaza'));
    await page.waitForTimeout(1000);
    const active = await inspect();
    assert(active.jets.every(j => j.enabled), 'Powered fountain has no jets');
    assert(active.audio.length === 1, 'More than one runtime AudioContext');
    await page.evaluate(async shot => {
      const h = window.__ROXANA_VISUAL_TEST_HOOKS__;
      await h.setCaptureShot(shot); h.setReducedMotion(false); h.setPausedForScreenshot(false); h.hideDebugUi(false);
    }, { ...structuredClone(getCaptureShotSpec('restored-plaza-wide')), anchor: { position: [1, 1.7, .2], yaw: -130, pitch: -8 } });
    await page.waitForTimeout(800);
    await page.screenshot({ path: resolve(out, touch ? 'fountain-touch.png' : 'fountain-desktop.png') });
    await page.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__.setPausedForScreenshot(true));
    await page.waitForTimeout(250);
    const paused = await inspect();
    assert(paused.jets.every(j => j.paused), 'Fountain ignores pause');
    await page.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__.setReducedMotion(true));
    await page.waitForTimeout(250);
    const reduced = await inspect();
    assert(reduced.jets.every(j => !j.enabled), 'Reduced motion keeps active jets');
    if (touch) {
      const shot = structuredClone(getCaptureShotSpec('lighthouse-lake-wide'));
      shot.anchor = { position: [173, 1.68, -6], yaw: 206, pitch: 4 };
      await page.evaluate(async s => {
        const h = window.__ROXANA_VISUAL_TEST_HOOKS__;
        await h.setCaptureShot(s); h.hideDebugUi(false); h.setReducedMotion(false); h.setPausedForScreenshot(false);
      }, shot);
      const before = await page.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__.getPlaytestSnapshot().position);
      const bounds = await page.locator('[data-move-key="w"]').boundingBox();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }] });
      await page.waitForTimeout(450);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(100);
      const after = await page.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__.getPlaytestSnapshot().position);
      assert(Math.hypot(after[0] - before[0], after[2] - before[2]) > .3, 'Faro touch movement blocked');
      await page.screenshot({ path: resolve(out, 'lighthouse-touch.png') });
      results.push({ lighthouseTouch: true, before, after, passed: true });
      await cdp.detach();
    }
    results.push({ touch, dormant, active, paused, reduced, passed: true });
    await context.close();
  }
  assert(errors.length === 0, errors.join('\n'));
} finally {
  await writeFile(resolve(out, 'sensory-run.json'), JSON.stringify({ results, errors }, null, 2));
  await browser.close();
}
console.log(`PASS ${results.length} desktop/touch sensory cases: circuit, fountain, pause, reduced motion, mute and reload.`);
