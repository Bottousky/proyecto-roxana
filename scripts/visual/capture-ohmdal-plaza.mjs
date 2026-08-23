import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function valueOf(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const baseUrl = valueOf('--base-url', 'http://127.0.0.1:5173');
const outDir = path.resolve(valueOf('--out', 'output/playwright/ohmdal-plaza/stage-1/current'));
const headless = !process.argv.includes('--headed');

const views = [
  { id: 'portal-arrival', viewport: { width: 1440, height: 900 }, hideUi: true, post: true },
  { id: 'workshop-approach', viewport: { width: 1440, height: 900 }, hideUi: true, post: true },
  { id: 'ohm-landmark', viewport: { width: 1440, height: 900 }, hideUi: true, post: true },
  { id: 'omega-gate', viewport: { width: 1440, height: 900 }, hideUi: true, post: true },
  { id: 'plaza-wide', viewport: { width: 1440, height: 900 }, hideUi: true, post: true },
  { id: 'active-play-desktop', viewport: { width: 1440, height: 900 }, hideUi: false, post: true },
  { id: 'active-play-mobile', viewport: { width: 390, height: 844 }, hideUi: false, post: true },
  { id: 'no-post', viewport: { width: 1440, height: 900 }, hideUi: true, post: false },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless });
const context = await browser.newContext({ viewport: views[0].viewport, deviceScaleFactor: 1 });
const page = await context.newPage();
const consoleMessages = [];
const pageErrors = [];

function recordPageErrors(targetPage) {
  targetPage.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      consoleMessages.push({ type: message.type(), text: message.text() });
    }
  });
  targetPage.on('pageerror', (error) => pageErrors.push(error.message));
}

recordPageErrors(page);

async function openExperience(targetPage) {
  await targetPage.goto(`${baseUrl}/ohmdal-playcanvas`, { waitUntil: 'networkidle' });
  await targetPage.locator('#plaza-enter').click();
  await targetPage.waitForFunction(() => Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__), null, { timeout: 20_000 });
  await targetPage.waitForTimeout(1_200);
}

try {
  await openExperience(page);

  const captures = [];
  for (const view of views) {
    let captureContext = null;
    let capturePage = page;
    if (view.id === 'active-play-mobile') {
      // PlayCanvas must bootstrap at the target aspect ratio. Resizing an
      // already-running desktop canvas produced a cropped pseudo-mobile frame
      // and cached transfer diagnostics, so mobile receives a cold context.
      captureContext = await browser.newContext({ viewport: view.viewport, deviceScaleFactor: 1 });
      capturePage = await captureContext.newPage();
      recordPageErrors(capturePage);
      await openExperience(capturePage);
    } else {
      const previousViewport = capturePage.viewportSize();
      await capturePage.setViewportSize(view.viewport);
      if (previousViewport?.width !== view.viewport.width || previousViewport?.height !== view.viewport.height) {
        await openExperience(capturePage);
      }
    }
    await capturePage.evaluate(({ id, hideUi, post }) => {
      const hooks = window.__ROXANA_VISUAL_TEST_HOOKS__;
      if (!hooks) throw new Error('Visual Harness hooks are not installed.');
      hooks.setPausedForScreenshot(false);
      hooks.seed(1701);
      hooks.setState('portal-arrival');
      hooks.setCamera(id);
      hooks.setReducedMotion(true);
      hooks.hideDebugUi(hideUi);
      hooks.setPostProcessing(post);
    }, view);
    await capturePage.waitForTimeout(500);
    await capturePage.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__?.setPausedForScreenshot(true));
    await capturePage.waitForTimeout(100);

    const screenshot = path.join(outDir, `${view.id}.png`);
    await capturePage.screenshot({ path: screenshot, animations: 'disabled' });
    const diagnostics = await capturePage.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__?.getDiagnostics());
    captures.push({
      id: view.id,
      screenshot,
      viewport: view.viewport,
      diagnostics,
    });
    await captureContext?.close();
  }

  const touchConsoleMessages = [];
  const touchPageErrors = [];
  const touchContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  });
  const touchPage = await touchContext.newPage();
  touchPage.on('console', (message) => {
    if (message.type() === 'error') touchConsoleMessages.push(message.text());
  });
  touchPage.on('pageerror', (error) => touchPageErrors.push(error.message));
  await touchPage.goto(`${baseUrl}/ohmdal-playcanvas`, { waitUntil: 'networkidle' });
  await touchPage.locator('#plaza-enter').tap();
  await touchPage.locator('#btn-bitacora').waitFor({ state: 'visible' });
  await touchPage.locator('#btn-bitacora').tap();
  const bitacoraOpened = await touchPage.locator('#bitacora-modal').evaluate((element) =>
    !element.classList.contains('hidden'));
  await touchContext.close();

  const artifact = {
    schemaVersion: 1,
    route: '/ohmdal-playcanvas',
    capturedAt: new Date().toISOString(),
    browser: `chromium ${browser.version()}`,
    os: `${process.platform} ${process.arch}`,
    headless,
    captures,
    touchSmoke: {
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      bitacoraOpened,
      consoleErrors: touchConsoleMessages,
      pageErrors: touchPageErrors,
    },
    errors: {
      console: consoleMessages,
      page: pageErrors,
    },
  };
  const manifestPath = path.join(outDir, 'capture-manifest.json');
  await writeFile(manifestPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
  console.log(manifestPath);
} finally {
  await browser.close();
}
