import { chromium } from 'playwright';
import { createServer, Socket } from 'node:net';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { fastLaunchOptions } from '../visual/ohmdal-capture-contract.mjs';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const OUT = resolve(ROOT, 'output/playwright/ohmdal-hardening/zone-recovery');
const ROUTE = '/ohmdal-playcanvas';
const SAVE_KEY = 'ohmdal-playcanvas-arc1-v1';
const INTRO_KEY = 'ohmdal_intro_seen';
const SEED_KEY = 'ohmdal-zone-recovery-v1';
const VIEWPORT = { width: 844, height: 390 };
const NAV_TIMEOUT_MS = 60_000;
const SNAPSHOT_TIMEOUT_MS = 20_000;

const {
  createArc1GreyboxState,
  enterArc1Region,
  energizeManantial,
  measureManantial,
  openCastleGate,
  pullCampana,
  repairManantial,
  setManantialGate,
} = await import('../../src/experiences/ohmdal-playcanvas/systems/campaign/arc1GreyboxModel.ts');
const {
  captureArc1CircuitState,
  createArc1SaveData,
  serializeArc1SaveData,
} = await import('../../src/experiences/ohmdal-playcanvas/systems/campaign/arc1Save.ts');
const { createInitialCircuit, solveCircuit } = await import('../../src/experiences/ohmdal-plaza/simulation/circuitSolver.ts');
const { BitacoraManager } = await import('../../src/experiences/ohmdal-plaza/journal/bitacora.ts');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function getFreePort() {
  return new Promise((resolvePort, rejectPort) => {
    const server = createServer();
    server.once('error', rejectPort);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close((error) => error ? rejectPort(error) : resolvePort(port));
    });
  });
}

async function portReachable(port, timeoutMs = NAV_TIMEOUT_MS) {
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
      socket.setTimeout(600);
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
    await sleep(250);
  }
  return false;
}

function startVite(port) {
  const command = process.platform === 'win32'
    ? `npx.cmd vite --host 127.0.0.1 --port ${port} --strictPort`
    : `npx vite --host 127.0.0.1 --port ${port} --strictPort`;
  const vite = spawn(command, {
    cwd: ROOT,
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
    // Cleanup is best effort after the report is written.
  }
}

function buildCircuitSave() {
  const circuit = createInitialCircuit();
  circuit.branches.b_ida_rele.state = 'closed';
  circuit.branches.b_brecha_retorno.state = 'closed';
  circuit.branches.b_brecha_a_oxido.state = 'closed';
  circuit.branches.b_brecha_a_oxido.resistance = 0.05;
  solveCircuit(circuit);
  const saved = captureArc1CircuitState(circuit);
  assert(saved, 'El circuito fixture v1 no produjo ramas válidas.');
  return saved;
}

function buildBitacoraSave() {
  const bitacora = new BitacoraManager();
  bitacora.unlock('despertar_ohm', 'discovered');
  bitacora.unlock('taller_lumen', 'investigating');
  bitacora.unlock('lengueta_edda', 'rumor');
  return bitacora.getStatuses();
}

function buildPlazaGateFixture() {
  let arc1 = createArc1GreyboxState();
  arc1 = enterArc1Region(arc1, 'taller');
  arc1 = enterArc1Region(arc1, 'manantial');
  arc1 = measureManantial(arc1, 'generator');
  arc1 = setManantialGate(arc1, true);
  arc1 = repairManantial(energizeManantial(arc1));
  arc1 = energizeManantial(arc1);
  arc1 = measureManantial(arc1, 'load');
  arc1 = enterArc1Region(arc1, 'plaza');
  arc1 = pullCampana(arc1);
  arc1 = openCastleGate(arc1);
  assert(arc1.currentRegion === 'plaza' && arc1.plaza.castleGateOpened,
    `Fixture Plaza no quedó listo para la ruta Castle: ${JSON.stringify(arc1)}`);

  return createArc1SaveData({
    storyStep: 'gate_opened',
    ohmAwake: true,
    inventory: { jumper: true, brush: true },
    arc1,
    circuit: buildCircuitSave(),
    bitacora: buildBitacoraSave(),
    safeAnchor: { zone: 'plaza', anchorId: 'manantial-to-plaza' },
    b2: { coveredIds: ['g1', 'g5', 'g4'] },
  });
}

function buildCastleContinueFixture() {
  const plazaSave = buildPlazaGateFixture();
  const arc1 = enterArc1Region(plazaSave.arc1, 'castillo');
  assert(arc1.currentRegion === 'castillo',
    `Fixture Castle no quedó dentro del Castillo: ${JSON.stringify(arc1)}`);

  return createArc1SaveData({
    storyStep: 'inside_castle',
    ohmAwake: true,
    inventory: plazaSave.inventory,
    arc1,
    circuit: plazaSave.circuit,
    bitacora: plazaSave.bitacora,
    safeAnchor: { zone: 'castle', anchorId: 'plaza-to-castle' },
    b2: plazaSave.b2,
  });
}

function zone(snapshot, id) {
  return snapshot?.zones?.find((entry) => entry.id === id) ?? null;
}

function samePosition(a, b, tolerance = 0.05) {
  return a?.length === 3 && b?.length === 3
    && Math.hypot(a[0] - b[0], a[2] - b[2]) <= tolerance
    && Math.abs(a[1] - b[1]) <= tolerance;
}

async function snapshot(page) {
  return page.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__?.getPlaytestSnapshot());
}

async function waitForSnapshot(page, predicate, label, timeoutMs = SNAPSHOT_TIMEOUT_MS) {
  const started = Date.now();
  let current = null;
  while (Date.now() - started < timeoutMs) {
    current = await snapshot(page);
    if (current && predicate(current)) return current;
    await sleep(160);
  }
  throw new Error(`${label}: no se alcanzó el estado esperado: ${JSON.stringify(current)}`);
}

async function waitForToast(page, text) {
  await page.waitForFunction((expected) => {
    const toast = document.querySelector('#plaza-toast');
    return toast instanceof HTMLElement && !toast.classList.contains('hidden') && toast.textContent?.includes(expected);
  }, text, { timeout: SNAPSHOT_TIMEOUT_MS });
}

function installSeed(page, save) {
  return page.addInitScript(({ key, introKey, seedKey, serializedSave }) => {
    if (sessionStorage.getItem(seedKey) !== 'true') {
      localStorage.setItem(key, serializedSave);
      localStorage.setItem(introKey, 'true');
      sessionStorage.setItem(seedKey, 'true');
    }
  }, {
    key: SAVE_KEY,
    introKey: INTRO_KEY,
    seedKey: SEED_KEY,
    serializedSave: serializeArc1SaveData(save),
  });
}

function attachDiagnostics(page) {
  const errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      errors.console.push({ type: message.type(), text: message.text() });
    }
  });
  page.on('pageerror', (error) => errors.page.push(String(error?.stack || error?.message || error)));
  return errors;
}

const port = await getFreePort();
const baseUrl = `http://127.0.0.1:${port}`;
const { vite, log: viteLog } = startVite(port);
const reportPath = resolve(OUT, 'zone-recovery-run.json');
let browser = null;
let context = null;
let page = null;
let routeFailureInjected = false;
let consejeraRequests = 0;
let abortedConsejeraUrl = null;
let allowConsejeraRetry = false;
const report = {
  schemaVersion: 1,
  route: ROUTE,
  saveSchema: 'ohmdal-playcanvas-arc1-v1',
  viewport: { ...VIEWPORT, hasTouch: true, isMobile: true },
  result: 'RUNNING',
  request: { asset: 'consejera.glb', attempts: 0, abortedOnce: false, abortedUrl: null },
  checks: {},
  continueCase: null,
  errors: { console: [], page: [] },
};

async function persist() {
  await mkdir(OUT, { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

try {
  assert(await portReachable(port), `Vite no se levantó en ${port}: ${viteLog.join('').slice(-2000)}`);
  browser = await chromium.launch(process.argv.includes('--gpu')
    ? { ...fastLaunchOptions({ headless: true }) }
    : { headless: true });
  context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    baseURL: baseUrl,
  });
  page = await context.newPage();
  const errors = attachDiagnostics(page);
  report.errors = errors;
  await page.route('**/consejera.glb*', async (route) => {
    consejeraRequests += 1;
    // PlayCanvas may retry one failed HTTP fetch internally. Keep aborting
    // that same logical preload until the test performs the explicit retry.
    if (!allowConsejeraRetry) {
      routeFailureInjected = true;
      abortedConsejeraUrl = route.request().url();
      await route.abort('failed');
      return;
    }
    await route.continue();
  });
  await installSeed(page, buildPlazaGateFixture());

  await page.goto(`${baseUrl}${ROUTE}`, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
  await page.locator('#plaza-enter').tap();
  await page.waitForFunction(() => Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__), null, { timeout: NAV_TIMEOUT_MS });
  const before = await waitForSnapshot(page, (current) => current.storyStep === 'gate_opened'
    && current.arc1?.currentRegion === 'plaza'
    && current.nearestInteractable === 'castle_route'
    && zone(current, 'plaza')?.active === true,
  'fixture Plaza listo en la ruta Castle');
  assert(await page.locator('#touch-interact').isVisible(), 'La UI física táctil de interacción no está visible.');
  assert(zone(before, 'castle')?.loaded === false && zone(before, 'castle')?.active === false,
    `Castle ya estaba cargado antes del intento: ${JSON.stringify(before.zones)}`);

  const beforePosition = [...before.position];
  const beforeArc1 = JSON.stringify(before.arc1);
  const beforeStoryStep = before.storyStep;
  await page.screenshot({ path: resolve(OUT, 'before-castle-recovery.png'), animations: 'disabled' });

  await page.locator('#touch-interact').tap();
  await waitForToast(page, 'No se pudo cargar');
  const failed = await waitForSnapshot(page, (current) => current.storyStep === beforeStoryStep
    && current.arc1?.currentRegion === 'plaza'
    && current.nearestInteractable === 'castle_route'
    && zone(current, 'plaza')?.active === true
    && zone(current, 'castle')?.active === false,
  'fallo de carga conserva Plaza y progreso');
  assert(routeFailureInjected, 'La ruta consejera.glb no fue interceptada.');
  assert(consejeraRequests >= 2,
    `El primer intento no mostró los reintentos HTTP esperados de consejera.glb: ${consejeraRequests}`);
  const failedConsejeraRequests = consejeraRequests;
  assert(samePosition(failed.position, beforePosition),
    `El jugador se movió durante el fallo: antes ${JSON.stringify(beforePosition)}, después ${JSON.stringify(failed.position)}`);
  assert(failed.yaw === before.yaw, `El yaw cambió durante el fallo: ${before.yaw} → ${failed.yaw}`);
  assert(JSON.stringify(failed.arc1) === beforeArc1,
    `El progreso/estado Arc1 cambió pese al fallo: antes ${beforeArc1}, después ${JSON.stringify(failed.arc1)}`);
  assert(zone(failed, 'plaza')?.active === true && zone(failed, 'castle')?.active === false,
    `La zona origen no quedó intacta tras el fallo: ${JSON.stringify(failed.zones)}`);
  await page.screenshot({ path: resolve(OUT, 'castle-load-failed-origin-preserved.png'), animations: 'disabled' });

  allowConsejeraRetry = true;
  await page.locator('#touch-interact').tap();
  const recovered = await waitForSnapshot(page, (current) => current.storyStep === 'inside_castle'
    && current.arc1?.currentRegion === 'castillo'
    && zone(current, 'castle')?.loaded === true
    && zone(current, 'castle')?.active === true
    && zone(current, 'plaza')?.active === false,
  'reintento entra al Castillo tras recuperar el GLB');
  assert(consejeraRequests === failedConsejeraRequests + 1,
    `El reintento no hizo una sola nueva carga de consejera.glb: ${failedConsejeraRequests} → ${consejeraRequests}`);
  assert(recovered.arc1.progress?.castleGateOpen === true,
    `El reintento perdió la progresión de la puerta Castle: ${JSON.stringify(recovered.arc1.progress)}`);
  assert(zone(recovered, 'plaza')?.active === false && zone(recovered, 'castle')?.active === true,
    `Las zonas no cambiaron al Castle tras el reintento: ${JSON.stringify(recovered.zones)}`);
  assert(samePosition(recovered.position, [60, 1.68, -8]),
    `El reintento no usó el ancla Castle: ${JSON.stringify(recovered.position)}`);
  await page.screenshot({ path: resolve(OUT, 'castle-load-recovered.png'), animations: 'disabled' });

  report.request = {
    asset: 'consejera.glb',
    attempts: consejeraRequests,
    abortedOnce: routeFailureInjected,
    abortedUrl: abortedConsejeraUrl,
  };
  report.checks = {
    originPlayerPreserved: true,
    originProgressPreserved: true,
    originZonePreserved: true,
    retryReloadedAsset: true,
    retryEnteredCastle: true,
    recoveredAnchor: recovered.position,
    before: { position: before.position, storyStep: before.storyStep, zones: before.zones },
    failed: { position: failed.position, storyStep: failed.storyStep, zones: failed.zones },
    recovered: { position: recovered.position, storyStep: recovered.storyStep, zones: recovered.zones },
  };

  // Run the saved-Castle hydration path in a fresh context so its one-shot
  // failed asset request and localStorage invariants are independent of the
  // Plaza transition case above.
  await context.close();
  context = null;
  page = null;
  routeFailureInjected = false;
  consejeraRequests = 0;
  abortedConsejeraUrl = null;
  allowConsejeraRetry = false;

  context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    baseURL: baseUrl,
  });
  page = await context.newPage();
  const continueErrors = attachDiagnostics(page);
  report.continueErrors = continueErrors;
  await page.route('**/consejera.glb*', async (route) => {
    consejeraRequests += 1;
    // Keep the initial hydration failure deterministic across PlayCanvas'
    // internal HTTP retries; release only after the physical retry tap.
    if (!allowConsejeraRetry) {
      routeFailureInjected = true;
      abortedConsejeraUrl = route.request().url();
      await route.abort('failed');
      return;
    }
    await route.continue();
  });
  await installSeed(page, buildCastleContinueFixture());

  await page.goto(`${baseUrl}${ROUTE}`, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
  const continueSaveBefore = await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY);
  const continueIntroBefore = await page.evaluate((key) => localStorage.getItem(key), INTRO_KEY);
  assert(continueSaveBefore, 'El fixture Continue no quedó sembrado en localStorage.');
  assert(continueIntroBefore === 'true', `La marca de intro inicial no quedó sembrada: ${continueIntroBefore}`);
  await page.locator('#plaza-enter').tap();
  await page.waitForFunction(() => Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__), null, { timeout: NAV_TIMEOUT_MS });
  assert(await page.locator('#touch-interact').isVisible(), 'La UI táctil no quedó visible durante Continue.');
  await waitForToast(page, 'No se pudo cargar tu partida');
  const continueFailed = await waitForSnapshot(page, (current) => current.storyStep === 'portal_arrived'
    && current.arc1?.currentRegion === 'portal'
    && zone(current, 'plaza')?.active === true
    && zone(current, 'castle')?.active === false,
  'fallo Continue conserva el estado inicial sin mutar el guardado');
  assert(routeFailureInjected, 'La ruta consejera.glb no fue interceptada durante Continue.');
  assert(consejeraRequests >= 2, `Continue no agotó los reintentos HTTP antes del fallo: ${consejeraRequests}`);
  const continueFailedConsejeraRequests = consejeraRequests;
  const dialogueHiddenAfterFailure = await page.evaluate(() => {
    const dialogue = document.querySelector('#plaza-dialog');
    return dialogue instanceof HTMLElement && dialogue.classList.contains('hidden');
  });
  assert(dialogueHiddenAfterFailure, 'Continue fallido abrió una intro/dialogo inesperado.');
  assert(continueFailed.dialogue == null, `Continue fallido dejó diálogo activo: ${JSON.stringify(continueFailed.dialogue)}`);
  const continueSaveAfterFailure = await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY);
  const continueIntroAfterFailure = await page.evaluate((key) => localStorage.getItem(key), INTRO_KEY);
  assert(continueSaveAfterFailure === continueSaveBefore,
    'El fallo Continue mutó el save de localStorage antes del reintento.');
  assert(continueIntroAfterFailure === continueIntroBefore,
    'El fallo Continue mutó la marca de intro de localStorage.');
  await page.screenshot({ path: resolve(OUT, 'continue-castle-load-failed-no-intro.png'), animations: 'disabled' });

  allowConsejeraRetry = true;
  await page.locator('#touch-interact').tap();
  const continueRecovered = await waitForSnapshot(page, (current) => current.storyStep === 'inside_castle'
    && current.arc1?.currentRegion === 'castillo'
    && zone(current, 'castle')?.loaded === true
    && zone(current, 'castle')?.active === true
    && zone(current, 'plaza')?.active === false,
  'reintento Continue hidrata el Castillo guardado');
  await page.waitForFunction(() => {
    const prompt = document.querySelector('#plaza-prompt');
    return !(prompt?.textContent ?? '').includes('Reintentar carga');
  }, null, { timeout: SNAPSHOT_TIMEOUT_MS });
  await sleep(200);
  const continueSaveAfterRetry = await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY);
  const continueIntroAfterRetry = await page.evaluate((key) => localStorage.getItem(key), INTRO_KEY);
  assert(consejeraRequests === continueFailedConsejeraRequests + 1,
    `Continue no reintentó una sola vez consejera.glb: ${continueFailedConsejeraRequests} → ${consejeraRequests}`);
  assert(continueRecovered.arc1.progress?.castleGateOpen === true,
    `Continue perdió la progresión guardada de Castle: ${JSON.stringify(continueRecovered.arc1.progress)}`);
  assert(samePosition(continueRecovered.position, [60, 1.68, -8]),
    `Continue no restauró el ancla Castle guardada: ${JSON.stringify(continueRecovered.position)}`);
  assert(continueSaveAfterRetry === continueSaveBefore,
    'El reintento Continue mutó el save de localStorage inesperadamente.');
  assert(continueIntroAfterRetry === continueIntroBefore,
    'El reintento Continue mutó la marca de intro de localStorage.');
  const dialogueHiddenAfterRetry = await page.evaluate(() => {
    const dialogue = document.querySelector('#plaza-dialog');
    return dialogue instanceof HTMLElement && dialogue.classList.contains('hidden');
  });
  assert(dialogueHiddenAfterRetry && continueRecovered.dialogue == null,
    'Continue reintentado abrió una intro/dialogo inesperado.');
  await page.screenshot({ path: resolve(OUT, 'continue-castle-recovered-no-intro.png'), animations: 'disabled' });
  report.continueCase = {
    request: {
      asset: 'consejera.glb',
      attempts: consejeraRequests,
      abortedOnce: routeFailureInjected,
      abortedUrl: abortedConsejeraUrl,
    },
    loadFailurePreservedDefaultState: true,
    introHiddenOnFailure: dialogueHiddenAfterFailure,
    dialogueAbsentOnFailure: true,
    localStorageUnchangedOnFailure: true,
    localStorageUnchangedAfterRetry: true,
    campaignResumed: true,
    before: { storyStep: 'inside_castle', saveBytes: continueSaveBefore?.length ?? 0 },
    failed: { storyStep: continueFailed.storyStep, currentRegion: continueFailed.arc1?.currentRegion },
    recovered: { position: continueRecovered.position, storyStep: continueRecovered.storyStep, zones: continueRecovered.zones },
  };
  assert(errors.page.length === 0, `Errores de página inesperados: ${JSON.stringify(errors.page)}`);
  assert(continueErrors.page.length === 0,
    `Errores de página inesperados durante Continue: ${JSON.stringify(continueErrors.page)}`);
  report.result = 'PASS';
  report.finishedAt = new Date().toISOString();
  report.viteLogTail = viteLog.join('').slice(-2000);
  await persist();
  console.log(JSON.stringify({ result: report.result, report: reportPath }, null, 2));
} catch (error) {
  report.result = 'FAIL';
  report.finishedAt = new Date().toISOString();
  report.request = {
    asset: 'consejera.glb',
    attempts: consejeraRequests,
    abortedOnce: routeFailureInjected,
    abortedUrl: abortedConsejeraUrl,
  };
  report.failure = String(error?.stack || error?.message || error);
  report.viteLogTail = viteLog.join('').slice(-2000);
  await persist();
  console.error(JSON.stringify({ result: report.result, report: reportPath, failure: report.failure }, null, 2));
  process.exitCode = 1;
} finally {
  await context?.close().catch(() => {});
  await browser?.close().catch(() => {});
  stopVite(vite);
}
