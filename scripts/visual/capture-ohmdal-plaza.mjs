import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer, Socket } from 'node:net';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';
import process from 'node:process';
import {
  FAST_CAPTURE_CONTRACT,
  FULL_CAPTURE_CONTRACT,
  assertRendererDiagnostics,
  fastLaunchOptions,
  getCaptureShotSpec,
  resolveCaptureViews,
} from './ohmdal-capture-contract.mjs';

function valueOf(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const mode = valueOf('--mode', process.argv.includes('--fast') ? 'fast' : 'full');
const stage = valueOf('--stage', 'a0-baseline-capture-readiness');
const defaultOutDir = mode === 'fast'
  ? (stage === 'a0-baseline-capture-readiness'
      ? 'output/playwright/ohmdal-plaza/stage-1/current'
      : `output/playwright/ohmdal-arco1-authored/${stage === 'a2-plaza-workshop-authored' ? 'a2-fast-iteration1' : stage === 'a3-manantial-central-authored' ? 'a3-fast-iteration1' : stage === 'a4-castle-authored' ? 'a4-fast-iteration1' : stage === 'a5-forge-terraces-authored' ? 'a5-fast-iteration1' : stage === 'a6-lighthouse-lake-return-authored' ? 'a6-fast-iteration1' : `${stage}-fast-iteration1`}`)
  : 'output/playwright/ohmdal-plaza/stage-1/current';
const outDir = path.resolve(valueOf('--out', defaultOutDir));
const headless = !process.argv.includes('--headed');

function getFreePort() {
  return new Promise((resolvePort, rejectPort) => {
    const server = createServer();
    server.once('error', rejectPort);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close((error) => (error ? rejectPort(error) : resolvePort(port)));
    });
  });
}

async function portReachable(port, timeoutMs = 3000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const reachable = await new Promise((resolveReachable) => {
      const socket = new Socket();
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolveReachable(value);
      };
      socket.setTimeout(400);
      socket.once('connect', () => finish(true));
      socket.once('timeout', () => finish(false));
      socket.once('error', () => finish(false));
      try {
        socket.connect(port, '127.0.0.1');
      } catch {
        finish(false);
      }
    });
    if (reachable) return true;
    await sleep(200);
  }
  return false;
}

function startVite(port) {
  const root = path.resolve(process.cwd());
  const command = process.platform === 'win32'
    ? `npx.cmd vite --host 127.0.0.1 --port ${port} --strictPort`
    : `npx vite --host 127.0.0.1 --port ${port} --strictPort`;
  const vite = spawn(command, {
    cwd: root,
    shell: true,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const log = [];
  vite.stdout?.on('data', (chunk) => log.push(String(chunk)));
  vite.stderr?.on('data', (chunk) => log.push(`[stderr] ${String(chunk)}`));
  return { vite, log };
}

function stopVite(vite) {
  if (!vite || vite.killed) return;
  try {
    if (process.platform === 'win32' && vite.pid) {
      spawn('taskkill', ['/pid', String(vite.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      });
    } else {
      vite.kill('SIGTERM');
    }
  } catch {
    // Cleanup is best effort
  }
}
const requestedShots = valueOf('--shots', null)
  ?.split(',')
  .map((id) => id.trim())
  .filter(Boolean) ?? null;
const captureContract = mode === 'fast' ? FAST_CAPTURE_CONTRACT : FULL_CAPTURE_CONTRACT;
const views = resolveCaptureViews({ mode, stage, shots: requestedShots });

function browserCandidates(selection) {
  if (selection === 'chrome' || selection === 'msedge' || selection === 'bundled') {
    return [selection];
  }
  if (selection && selection !== 'auto') return [{ executablePath: path.resolve(selection) }];
  return ['chrome', 'msedge', 'bundled'];
}

async function launchCaptureBrowser() {
  if (mode === 'full') {
    // Keep the established FULL launch semantics unchanged. In CI/headless
    // Chromium this remains the reproducible SwiftShader-capable gate.
    return {
      browser: await chromium.launch({ headless }),
      launch: { selection: 'playwright-chromium', args: [], hardwareAccelerationRequested: false },
    };
  }

  const selection = valueOf('--browser', process.env.OHMDAL_FAST_BROWSER ?? 'auto');
  const normalizedSelection = selection.toLowerCase();
  const gpu = fastLaunchOptions({ headless });
  let lastError = null;
  const candidateSelection = ['auto', 'chrome', 'msedge', 'bundled'].includes(normalizedSelection)
    ? normalizedSelection
    : selection;
  for (const candidate of browserCandidates(candidateSelection)) {
    const launchOptions = { ...gpu };
    if (candidate === 'chrome' || candidate === 'msedge') launchOptions.channel = candidate;
    if (candidate === 'bundled') delete launchOptions.channel;
    if (typeof candidate === 'object') {
      delete launchOptions.channel;
      launchOptions.executablePath = candidate.executablePath;
    }
    try {
      return {
        browser: await chromium.launch(launchOptions),
        launch: {
          selection: candidate === 'bundled' ? 'playwright-chromium' : candidate,
          args: gpu.args,
          hardwareAccelerationRequested: true,
        },
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`No se pudo iniciar un navegador FAST local (${selection}): ${lastError?.message ?? 'unknown error'}`);
}

await mkdir(outDir, { recursive: true });

let managedVite = null;
let baseUrl = valueOf('--base-url', null);
if (!baseUrl) {
  const port = await getFreePort();
  managedVite = startVite(port);
  const reachable = await portReachable(port, 30000);
  if (!reachable) {
    stopVite(managedVite.vite);
    throw new Error(`Timeout starting Vite dev server on port ${port}; log: ${managedVite.log.join('').slice(-2000)}`);
  }
  baseUrl = `http://127.0.0.1:${port}`;
}

const { browser, launch } = await launchCaptureBrowser();
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
    const shot = mode === 'fast' ? getCaptureShotSpec(view.id) : null;
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
    await capturePage.evaluate(async ({ id, hideUi, post, shot }) => {
      const hooks = window.__ROXANA_VISUAL_TEST_HOOKS__;
      if (!hooks) throw new Error('Visual Harness hooks are not installed.');
      hooks.setPausedForScreenshot(false);
      if (shot?.runtimeHook === 'setCaptureShot') {
        if (typeof hooks.setCaptureShot !== 'function') {
          throw new Error(`Visual Harness hook setCaptureShot is required for FAST shot ${shot.id}.`);
        }
        await hooks.setCaptureShot(shot);
      } else {
        hooks.seed(shot?.deterministic?.seed ?? 1701);
        hooks.setState(shot?.state ?? 'portal-arrival');
        hooks.setCamera(shot?.camera ?? id);
        hooks.setReducedMotion(shot?.deterministic?.reducedMotion ?? true);
      }
      hooks.hideDebugUi(hideUi);
      hooks.setPostProcessing(post);
    }, { ...view, shot });
    await capturePage.waitForTimeout(500);
    await capturePage.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__?.setPausedForScreenshot(true));
    await capturePage.waitForTimeout(100);

    const screenshot = path.join(outDir, `${view.id}.png`);
    await capturePage.screenshot({ path: screenshot, animations: 'disabled' });
    const diagnostics = await capturePage.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__?.getDiagnostics());
    assertRendererDiagnostics(diagnostics, `${mode}/${view.id}`);
    const capture = {
      id: view.id,
      screenshot,
      viewport: view.viewport,
      diagnostics,
    };
    if (shot) capture.shot = shot;
    captures.push(capture);
    await captureContext?.close();
  }

  let touchSmoke;
  if (captureContract.includesTouchSmoke) {
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
    touchSmoke = {
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      bitacoraOpened,
      consoleErrors: touchConsoleMessages,
      pageErrors: touchPageErrors,
    };
  } else {
    touchSmoke = {
      skipped: true,
      reason: 'FAST capture intentionally omits full touch/mobile smoke.',
    };
  }

  const artifact = {
    schemaVersion: 1,
    route: '/ohmdal-playcanvas',
    capturedAt: new Date().toISOString(),
    browser: `chromium ${browser.version()}`,
    os: `${process.platform} ${process.arch}`,
    headless,
    captureMode: captureContract.id,
    stage: mode === 'fast' ? stage : null,
    contract: captureContract,
    launch,
    requestedShots: views.map((view) => view.id),
    captures,
    touchSmoke,
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
  if (managedVite) stopVite(managedVite.vite);
}
