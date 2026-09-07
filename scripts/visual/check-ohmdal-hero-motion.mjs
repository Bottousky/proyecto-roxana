import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  fastLaunchOptions,
  getCaptureShotSpec,
} from './ohmdal-capture-contract.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const OUT = path.resolve(ROOT, 'output/playwright/ohmdal-quality-c1-c4/hero-motion');
const ACTIVE_SCREENSHOT = path.join(OUT, 'hero-motion-active.png');
const STOPPED_SCREENSHOT = path.join(OUT, 'hero-motion-reduced-motion.png');
const REPORT_PATH = path.join(OUT, 'hero-motion.json');
const ROUTE = '/ohmdal-playcanvas';
const NAV_TIMEOUT_MS = 30_000;
const HOOK_TIMEOUT_MS = 20_000;
const SAMPLE_FRAME_TIMEOUT_MS = 5_000;

function valueOf(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const baseUrl = valueOf('--base-url', process.env.OHMDAL_BASE_URL ?? 'http://127.0.0.1:54321').replace(/\/$/, '');
const hydroShot = getCaptureShotSpec('hydro-central-wide');
// The canonical hydro-wide shot intentionally shows the dormant intake. Keep
// that contract untouched, then clone it for the motion probe so the QA shot
// has a physically flowing gate while retaining the same camera/hero framing.
const diagnosticHydroShot = structuredClone(hydroShot);
diagnosticHydroShot.world.manantial.gateOpen = true;
const stoppedZoneShot = getCaptureShotSpec('workshop-interior-tools');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function length3(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function quaternionDelta(a, b) {
  const normA = Math.hypot(a[0], a[1], a[2], a[3]);
  const normB = Math.hypot(b[0], b[1], b[2], b[3]);
  const dot = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]) / Math.max(1e-12, normA * normB);
  return 1 - Math.abs(dot);
}

function metricSummary(first, second) {
  return {
    frameDeltaMs: second.timestamp - first.timestamp,
    pivotDelta: length3(first.pivot, second.pivot),
    localYAxisDelta: length3(first.localYAxis, second.localYAxis),
    quaternionDelta: quaternionDelta(first.quaternion, second.quaternion),
    bladeDistanceDelta: Math.abs(first.bladeDistance - second.bladeDistance),
    bladeDistance: first.bladeDistance,
  };
}

function validateStableGeometry(samples, label) {
  const metrics = metricSummary(samples.first, samples.second);
  assert(metrics.pivotDelta <= 1e-4,
    `${label}: el pivote mundial se movió ${metrics.pivotDelta}`);
  assert(metrics.localYAxisDelta <= 1e-4,
    `${label}: el eje local Y transformado cambió ${metrics.localYAxisDelta}`);
  assert(metrics.bladeDistanceDelta <= 1e-4,
    `${label}: la distancia de blade1 al pivote cambió ${metrics.bladeDistanceDelta}`);
  return metrics;
}

async function writeReport(report) {
  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

async function waitForSnapshot(page) {
  return page.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__?.getPlaytestSnapshot());
}

async function waitForEngineFrames(page, count, label) {
  await page.evaluate(async ({ frameCount, frameLabel, timeoutMs }) => {
    await new Promise((resolve, reject) => {
      let remaining = frameCount;
      const timeout = window.setTimeout(() => reject(new Error(`${frameLabel}: no llegaron frames del motor`)), timeoutMs);
      const tick = () => {
        remaining -= 1;
        if (remaining <= 0) {
          window.clearTimeout(timeout);
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { frameCount: count, frameLabel: label, timeoutMs: SAMPLE_FRAME_TIMEOUT_MS });
}

async function sampleRotorPair(page, moduleUrl, label) {
  const pair = await page.evaluate(async ({ moduleUrl: exactModuleUrl, label: sampleLabel, timeoutMs }) => {
    const pc = await import(exactModuleUrl);
    const app = pc.Application?.getApplication?.();
    if (!app?.root) throw new Error(`${sampleLabel}: pc.Application.getApplication() no está accesible`);
    const rotor = app.root.findByName('ManantialGeneratorRotorAssembly');
    if (!rotor) throw new Error(`${sampleLabel}: falta ManantialGeneratorRotorAssembly en app.root`);
    const blade = rotor.findByName('ManantialGeneratorRotorBlade1');
    if (!blade) throw new Error(`${sampleLabel}: falta ManantialGeneratorRotorBlade1 bajo el rotor`);

    const read = () => {
      const pivot = rotor.getPosition();
      const quaternion = rotor.getRotation();
      // World direction of the assembly's local +Y, derived from the exact
      // PlayCanvas quaternion module already loaded by the runtime.
      const localYAxis = new pc.Vec3(
        2 * (quaternion.x * quaternion.y - quaternion.z * quaternion.w),
        1 - 2 * (quaternion.x * quaternion.x + quaternion.z * quaternion.z),
        2 * (quaternion.y * quaternion.z + quaternion.x * quaternion.w),
      );
      localYAxis.normalize();
      return {
        timestamp: performance.now(),
        enabled: rotor.enabled,
        pivot: [pivot.x, pivot.y, pivot.z],
        localYAxis: [localYAxis.x, localYAxis.y, localYAxis.z],
        quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
        bladePosition: [blade.getPosition().x, blade.getPosition().y, blade.getPosition().z],
        bladeDistance: blade.getPosition().distance(pivot),
      };
    };
    const first = read();
    await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error(`${sampleLabel}: no llegó el siguiente frame`)), timeoutMs);
      requestAnimationFrame(() => {
        window.clearTimeout(timeout);
        resolve();
      });
    });
    const second = read();
    return { first, second };
  }, { moduleUrl, label, timeoutMs: SAMPLE_FRAME_TIMEOUT_MS });
  return pair;
}

async function configureShot(page, shot, { reducedMotion, paused }) {
  await page.evaluate(async ({ captureShot, reduced, pause }) => {
    const hooks = window.__ROXANA_VISUAL_TEST_HOOKS__;
    if (!hooks) throw new Error('Visual Harness hooks are not installed.');
    if (typeof hooks.setCaptureShot !== 'function') throw new Error('Falta setCaptureShot para hero motion QA.');
    await hooks.setCaptureShot(captureShot);
    hooks.setReducedMotion(reduced);
    hooks.setPausedForScreenshot(pause);
    hooks.hideDebugUi(Boolean(captureShot.hideUi));
    hooks.setPostProcessing(Boolean(captureShot.post));
  }, { captureShot: shot, reduced: reducedMotion, pause: paused });
}

async function findLoadedPlayCanvasUrl(page) {
  return page.evaluate(() => {
    const entries = performance.getEntriesByType('resource');
    const candidate = entries
      .map((entry) => entry.name)
      .find((entryName) => {
        const url = new URL(entryName, window.location.href);
        return /(?:^|\/)playcanvas\.js$/.test(url.pathname) && url.searchParams.has('v');
      });
    if (!candidate) {
      const observed = entries.map((entry) => entry.name).filter((entryName) => entryName.includes('playcanvas'));
      throw new Error(`No se encontró URL exacta playcanvas.js?v=... en performance: ${JSON.stringify(observed)}`);
    }
    return candidate;
  });
}

await mkdir(OUT, { recursive: true });
const report = {
  schemaVersion: 1,
  result: 'RUNNING',
  baseUrl,
  route: ROUTE,
  shot: hydroShot,
  diagnosticShot: diagnosticHydroShot,
  harnessOverride: {
    'world.manantial.gateOpen': {
      canonical: hydroShot.world.manantial.gateOpen,
      diagnostic: diagnosticHydroShot.world.manantial.gateOpen,
      reason: 'El contrato hydro-central-wide es una vista dormida; el probe de movimiento necesita caudal abierto.',
    },
  },
  stoppedZoneShot: stoppedZoneShot.id,
  moduleUrl: null,
  assertions: {},
  samples: {},
  screenshots: [],
  pageErrors: [],
  consoleErrors: [],
};

let browser = null;
let context = null;
try {
  browser = await chromium.launch(fastLaunchOptions());
  context = await browser.newContext({ viewport: hydroShot.viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', (error) => report.pageErrors.push(String(error?.stack || error?.message || error)));
  page.on('console', (message) => {
    if (message.type() === 'error') report.consoleErrors.push(message.text());
  });

  await page.goto(`${baseUrl}${ROUTE}`, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
  await page.locator('#plaza-enter').click();
  await page.waitForFunction(() => Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__), null, { timeout: HOOK_TIMEOUT_MS });
  await page.waitForTimeout(1_200);

  await configureShot(page, diagnosticHydroShot, { reducedMotion: false, paused: false });
  const snapshot = await waitForSnapshot(page);
  assert(snapshot?.zones?.some((zone) => zone.id === 'manantial' && zone.active),
    `hydro-central-wide: Manantial no está activo: ${JSON.stringify(snapshot?.zones)}`);
  assert(snapshot?.arc1?.manantial?.gateOpen === true,
    `hydro-central-wide motion probe: la compuerta diagnóstica no quedó abierta: ${JSON.stringify(snapshot?.arc1?.manantial)}`);
  report.assertions.manantialActive = true;
  report.assertions.diagnosticGateOpen = true;

  report.moduleUrl = await findLoadedPlayCanvasUrl(page);
  // Import the URL observed from the loaded page verbatim in every sample.
  await waitForEngineFrames(page, 4, 'active warmup');
  const activeSamples = await sampleRotorPair(page, report.moduleUrl, 'active');
  const activeMetrics = validateStableGeometry(activeSamples, 'active');
  assert(activeMetrics.quaternionDelta > 1e-8,
    `active: el quaternion del rotor no cambió (${activeMetrics.quaternionDelta})`);
  report.samples.active = { ...activeSamples, metrics: activeMetrics, passed: true };
  report.assertions.activeRotation = true;
  await page.screenshot({ path: ACTIVE_SCREENSHOT, animations: 'disabled' });
  report.screenshots.push(ACTIVE_SCREENSHOT);

  await configureShot(page, diagnosticHydroShot, { reducedMotion: true, paused: false });
  await waitForEngineFrames(page, 4, 'reduced-motion warmup');
  const reducedSamples = await sampleRotorPair(page, report.moduleUrl, 'reduced-motion');
  const reducedMetrics = validateStableGeometry(reducedSamples, 'reduced-motion');
  assert(reducedMetrics.quaternionDelta <= 1e-8,
    `reduced-motion: el rotor continuó girando (${reducedMetrics.quaternionDelta})`);
  report.samples.reducedMotion = { ...reducedSamples, metrics: reducedMetrics, passed: true };
  report.assertions.reducedMotionStops = true;
  await page.screenshot({ path: STOPPED_SCREENSHOT, animations: 'disabled' });
  report.screenshots.push(STOPPED_SCREENSHOT);

  // Reapply the canonical dormant shot with Manantial still active. This
  // proves the runtime gate, rather than reducedMotion alone, stops the rotor.
  await configureShot(page, hydroShot, { reducedMotion: false, paused: false });
  const closedGateSnapshot = await waitForSnapshot(page);
  assert(closedGateSnapshot?.zones?.some((zone) => zone.id === 'manantial' && zone.active)
    && closedGateSnapshot?.arc1?.manantial?.gateOpen === false,
  `closed-gate: el fixture canónico no quedó dormido con Manantial activo: ${JSON.stringify(closedGateSnapshot)}`);
  await waitForEngineFrames(page, 4, 'closed-gate warmup');
  const closedGateSamples = await sampleRotorPair(page, report.moduleUrl, 'closed-gate');
  const closedGateMetrics = validateStableGeometry(closedGateSamples, 'closed-gate');
  assert(closedGateMetrics.quaternionDelta <= 1e-8,
    `closed-gate: el rotor continuó girando con la compuerta cerrada (${closedGateMetrics.quaternionDelta})`);
  report.samples.closedGate = { ...closedGateSamples, metrics: closedGateMetrics, passed: true };
  report.assertions.closedGateStops = true;

  await configureShot(page, stoppedZoneShot, { reducedMotion: false, paused: false });
  const stoppedSnapshot = await waitForSnapshot(page);
  assert(stoppedSnapshot?.zones?.some((zone) => zone.id === 'workshop' && zone.active)
    && !stoppedSnapshot?.zones?.some((zone) => zone.id === 'manantial' && zone.active),
  `other-zone: la zona secundaria no reemplazó Manantial: ${JSON.stringify(stoppedSnapshot?.zones)}`);
  report.assertions.otherZoneActive = true;
  const otherZoneSamples = await sampleRotorPair(page, report.moduleUrl, 'other-zone');
  const otherZoneMetrics = validateStableGeometry(otherZoneSamples, 'other-zone');
  assert(otherZoneMetrics.quaternionDelta <= 1e-8,
    `other-zone: el rotor continuó girando con Manantial inactivo (${otherZoneMetrics.quaternionDelta})`);
  report.samples.otherZone = { ...otherZoneSamples, metrics: otherZoneMetrics, passed: true };
  report.assertions.otherZoneStops = true;

  assert(report.pageErrors.length === 0, `pageerror durante hero motion QA: ${JSON.stringify(report.pageErrors)}`);
  assert(report.consoleErrors.length === 0, `console error durante hero motion QA: ${JSON.stringify(report.consoleErrors)}`);
  report.result = 'PASS';
  report.finishedAt = new Date().toISOString();
  await writeReport(report);
  console.log(JSON.stringify({ result: report.result, report: REPORT_PATH, screenshots: report.screenshots }, null, 2));
} catch (error) {
  report.result = 'FAIL';
  report.failure = String(error?.stack || error?.message || error);
  report.finishedAt = new Date().toISOString();
  await writeReport(report);
  console.error(JSON.stringify({ result: report.result, report: REPORT_PATH, failure: report.failure }, null, 2));
  process.exitCode = 1;
} finally {
  await context?.close().catch(() => {});
  await browser?.close().catch(() => {});
}
