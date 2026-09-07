import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fastLaunchOptions, getCaptureShotSpec } from '../visual/ohmdal-capture-contract.mjs';

const base = process.env.OHMDAL_QA_URL ?? 'http://127.0.0.1:54321';
const out = resolve('output/playwright/ohmdal-world-quality-20260907/loading');
await mkdir(out, { recursive: true });
const browser = await chromium.launch(fastLaunchOptions());
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [], requests = {}, results = [];
const failing = new Set(['castle-distributor', 'lighthouse-tower']);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
page.on('pageerror', e => errors.push(e.message));
for (const asset of ['workshop-exterior', 'manantial-gorge', 'castle-distributor', 'lighthouse-tower']) {
  requests[asset] = 0;
  await page.route(`**/${asset}.glb`, async route => {
    requests[asset]++;
    if (requests[asset] === 1 || failing.has(asset)) await route.abort('failed');
    else await route.continue();
  });
}
try {
  await page.goto(`${base}/ohmdal-playcanvas?visualTest=1`, { waitUntil: 'networkidle' });
  await page.locator('#plaza-enter').click();
  await page.waitForFunction(() => Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__), null, { timeout: 45000 });
  for (const [shotId, asset, rootName, sourceName] of [
    ['castle-distribution-hall', 'castle-distributor', 'CastleDistributorCandidate', 'CastlePanelBody'],
    ['lighthouse-lake-wide', 'lighthouse-tower', 'LighthouseTowerCandidate', 'LighthouseBeaconTower'],
  ]) {
    const shot = getCaptureShotSpec(shotId);
    const first = await page.evaluate(async s => {
      try { await window.__ROXANA_VISUAL_TEST_HOOKS__.setCaptureShot(s); return 'unexpected-success'; }
      catch { return 'expected-load-failure'; }
    }, shot);
    assert(first === 'expected-load-failure', `${asset}: request failure was not propagated`);
    failing.delete(asset);
    await page.evaluate(s => window.__ROXANA_VISUAL_TEST_HOOKS__.setCaptureShot(s), shot);
    const evidence = await page.evaluate(async ({ rootName, sourceName }) => {
      const url = performance.getEntriesByType('resource').find(e => /\/playcanvas\.js\?/.test(e.name)).name;
      const pc = await import(url), root = pc.Application.getApplication().root;
      const find = name => root.findByName(name);
      return {
        roots: root.find(e => e.name === rootName).length,
        loadedVisible: find(rootName)?.enabled,
        sourceHidden: find(sourceName)?.render?.enabled === false,
        sourceBatch: find(sourceName)?.render?.batchGroupId,
        zones: window.__ROXANA_VISUAL_TEST_HOOKS__.getDiagnostics().zones,
      };
    }, { rootName, sourceName });
    assert(requests[asset] >= 2 && evidence.roots === 1 && evidence.loadedVisible && evidence.sourceHidden, `${asset}: ${JSON.stringify(evidence)}`);
    results.push({ asset, first, evidence, passed: true });
  }
  assert(requests['workshop-exterior'] === 2 && requests['manantial-gorge'] === 2, 'Startup retry did not recover');
  assert(errors.length === 0, errors.join('\n'));
} finally {
  await writeFile(resolve(out, 'authored-loading-run.json'), JSON.stringify({ requests, results, errors }, null, 2));
  await browser.close();
}
console.log('PASS: transient failures recover for all four authored assets; late zones retry without duplicate roots.');
