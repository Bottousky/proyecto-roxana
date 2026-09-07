import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fastLaunchOptions, getCaptureShotSpec } from './visual/ohmdal-capture-contract.mjs';

const out = resolve('output/playwright/ohmdal-world-quality-20260907/hero-states');
await mkdir(out, { recursive: true });
const browser = await chromium.launch(fastLaunchOptions());
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const states = [], errors = [];
page.on('pageerror', e => errors.push(e.message));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
try {
  await page.goto(`${process.env.OHMDAL_QA_URL ?? 'http://127.0.0.1:54321'}/ohmdal-playcanvas?visualTest=1`, { waitUntil: 'networkidle' });
  await page.locator('#plaza-enter').click();
  await page.waitForFunction(() => Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__));
  for (const energized of [false, true]) {
    const shot = structuredClone(getCaptureShotSpec('forge-core'));
    shot.world.forgeTerraces.energized = energized;
    await page.evaluate(s => window.__ROXANA_VISUAL_TEST_HOOKS__.setCaptureShot(s), shot);
    await page.waitForTimeout(350);
    const materials = await page.evaluate(async () => {
      const url = performance.getEntriesByType('resource').find(e => /\/playcanvas\.js\?/.test(e.name)).name;
      const pc = await import(url), root = pc.Application.getApplication().root.findByName('RegionalHero-forge');
      return [...new Set(root.findComponents('render').flatMap(r => r.meshInstances.map(m => m.material)))].map(m => ({ name: m.name, emission: m.emissiveIntensity, gloss: m.gloss, color: [m.diffuse.r, m.diffuse.g, m.diffuse.b] }));
    });
    const thermal = materials.find(m => m.name === 'ForgeHearth_ThermalElement');
    assert(thermal && (energized ? thermal.emission > 0 : thermal.emission === 0), 'Thermal emission disagrees with power');
    await page.screenshot({ path: resolve(out, energized ? 'forge-powered.png' : 'forge-dormant.png') });
    states.push({ energized, materials });
  }
  await page.evaluate(async s => {
    const h = window.__ROXANA_VISUAL_TEST_HOOKS__;
    await h.setCaptureShot(s); h.setPausedForScreenshot(false); h.setReducedMotion(false);
  }, getCaptureShotSpec('lighthouse-lake-wide'));
  const waterState = () => page.evaluate(async () => {
    const url = performance.getEntriesByType('resource').find(e => /\/playcanvas\.js\?/.test(e.name)).name;
    const pc = await import(url), root = pc.Application.getApplication().root;
    const water = root.findByName('LighthouseLakeSurface').script.get('ohmdalZonedWater');
    return { enabled: water.enabled, time: water._time };
  });
  const waterActive = await waterState();
  await page.waitForTimeout(250);
  const waterAdvanced = await waterState();
  assert(waterActive.enabled && waterAdvanced.time > waterActive.time, 'Active lake is not advancing');
  await page.evaluate(s => window.__ROXANA_VISUAL_TEST_HOOKS__.setCaptureShot(s), getCaptureShotSpec('workshop-exterior'));
  const waterInactive = await waterState();
  await page.waitForTimeout(250);
  const waterLater = await waterState();
  assert(!waterInactive.enabled && waterLater.time === waterInactive.time, 'Inactive lake keeps advancing');
  states.push({ waterActive, waterAdvanced, waterInactive, waterLater });
  assert(errors.length === 0, errors.join('\n'));
} finally {
  await writeFile(resolve(out, 'hero-states.json'), JSON.stringify({ states, errors }, null, 2));
  await browser.close();
}
console.log('PASS: hearth off/on material states and inactive lake update gate.');
