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
const OUT = resolve(ROOT, 'output/playwright/ohmdal-hardening/regional-puzzles');
const ROUTE = '/ohmdal-playcanvas';
const ONLY_CASE = process.argv.find((arg) => arg.startsWith('--case='))?.slice('--case='.length) ?? null;
const SAVE_KEY = 'ohmdal-playcanvas-arc1-v1';
const INTRO_KEY = 'ohmdal_intro_seen';
const SEED_KEY = 'ohmdal-regional-qa-seeded';
const VIEWPORT = { width: 844, height: 390 };
const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const NAV_TIMEOUT_MS = 30_000;
const SNAPSHOT_TIMEOUT_MS = 20_000;
const MOVEMENT_TIMEOUT_MS = 35_000;

const {
  calibrateLighthouse,
  configureCastleNetwork,
  createArc1GreyboxState,
  documentCastleNetwork,
  documentForgeTerraces,
  energizeCastleNetwork,
  energizeForgeTerraces,
  energizeManantial,
  enterArc1Region,
  measureCastleNetwork,
  measureForgeTerraces,
  measureManantial,
  openCastleGate,
  pullCampana,
  repairManantial,
  setForgeTerracesAllocation,
  setForgeTerracesConductor,
  setForgeTerracesProtection,
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
    // Cleanup is best effort after the result has been recorded.
  }
}

function buildCircuitSave(restored = false) {
  const circuit = createInitialCircuit();
  if (restored) {
    circuit.branches.b_ida_rele.state = 'closed';
    circuit.branches.b_brecha_retorno.state = 'closed';
    circuit.branches.b_brecha_a_oxido.state = 'closed';
    circuit.branches.b_brecha_a_oxido.resistance = 0.05;
    solveCircuit(circuit);
  }
  const saved = captureArc1CircuitState(circuit);
  assert(saved, 'el circuito fixture debe producir ramas fuente válidas');
  return saved;
}

function buildBitacoraSave() {
  const bitacora = new BitacoraManager();
  bitacora.unlock('despertar_ohm', 'discovered');
  bitacora.unlock('taller_lumen', 'investigating');
  return bitacora.getStatuses();
}

function buildPlazaToolsArc1() {
  let state = createArc1GreyboxState();
  state = enterArc1Region(state, 'taller');
  state = enterArc1Region(state, 'manantial');
  state = measureManantial(state, 'generator');
  state = setManantialGate(state, true);
  state = repairManantial(energizeManantial(state));
  state = energizeManantial(state);
  state = measureManantial(state, 'load');
  state = enterArc1Region(state, 'plaza');
  state = pullCampana(state);
  state = openCastleGate(state);
  return state;
}

const CASTLE_PARALLEL = {
  topology: 'parallel',
  returnContinuity: true,
  branches: {
    'district-a': { wiring: 'parallel', priority: 'essential', protectionRating: 4 },
    'district-b': { wiring: 'parallel', priority: 'essential', protectionRating: 5 },
    'district-c': { wiring: 'parallel', priority: 'support', protectionRating: 2 },
  },
};

function buildCastleRestored() {
  let state = buildPlazaToolsArc1();
  state = enterArc1Region(state, 'castillo');
  state = configureCastleNetwork(state, CASTLE_PARALLEL);
  state = measureCastleNetwork(state);
  state = energizeCastleNetwork(state);
  state = documentCastleNetwork(state);
  assert(state.castle.energized && state.castle.documented, 'fixture Castillo no quedó restaurado');
  return state;
}

function buildForgeRestored() {
  let state = buildCastleRestored();
  state = enterArc1Region(state, 'forja');
  state = enterArc1Region(state, 'terrazas');
  state = setForgeTerracesAllocation(state, { forge: 5, terraces: 3 });
  state = setForgeTerracesConductor(state, 'medium');
  state = setForgeTerracesProtection(state, 'forge', 5);
  state = setForgeTerracesProtection(state, 'terraces', 3);
  state = measureForgeTerraces(state);
  state = energizeForgeTerraces(state);
  state = documentForgeTerraces(state);
  assert(state.forgeTerraces.energized && state.forgeTerraces.documented, 'fixture Forja/Terrazas no quedó restaurado');
  return state;
}

function makeSave({ arc1, storyStep, safeAnchor }) {
  return createArc1SaveData({
    storyStep,
    ohmAwake: true,
    inventory: { jumper: true, brush: true },
    arc1,
    circuit: buildCircuitSave(true),
    bitacora: buildBitacoraSave(),
    safeAnchor,
    b2: { coveredIds: ['g1', 'g5', 'g4'] },
  });
}

const fixtures = {
  castle: makeSave({
    arc1: enterArc1Region(buildPlazaToolsArc1(), 'castillo'),
    storyStep: 'inside_castle',
    safeAnchor: { zone: 'castle', anchorId: 'plaza-to-castle' },
  }),
  forge: makeSave({
    arc1: (() => {
      let state = buildCastleRestored();
      state = enterArc1Region(state, 'forja');
      return enterArc1Region(state, 'terrazas');
    })(),
    storyStep: 'inside_forge_terraces',
    safeAnchor: { zone: 'forge-terraces', anchorId: 'castle-to-forge-terraces' },
  }),
  lighthouse: makeSave({
    arc1: enterArc1Region(buildForgeRestored(), 'faro'),
    storyStep: 'inside_lighthouse',
    safeAnchor: { zone: 'lighthouse', anchorId: 'forge-terraces-to-lighthouse' },
  }),
};

async function snapshot(page) {
  return page.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__?.getPlaytestSnapshot());
}

async function waitForHooks(page) {
  await page.waitForFunction(() => Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__), null, {
    timeout: NAV_TIMEOUT_MS,
  });
  return waitForSnapshot(page, (current) => Boolean(current), 'snapshot inicial');
}

async function waitForSnapshot(page, predicate, label, timeoutMs = SNAPSHOT_TIMEOUT_MS) {
  const started = Date.now();
  let current;
  while (Date.now() - started < timeoutMs) {
    current = await snapshot(page);
    if (predicate(current)) return current;
    await sleep(200);
  }
  throw new Error(`${label}: no se alcanzó el estado esperado: ${JSON.stringify(current)}`);
}

async function enterGame(page) {
  await page.goto(ROUTE, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
  await page.locator('#plaza-enter').click();
  await waitForHooks(page);
  await sleep(1_000);
}

function installSeed(page, raw) {
  return page.addInitScript(({ key, introKey, seedKey, save }) => {
    // The session guard keeps a reload on the real autosave instead of
    // replacing it with the fixture again.
    if (sessionStorage.getItem(seedKey) !== 'true') {
      localStorage.setItem(key, save);
      localStorage.setItem(introKey, 'true');
      sessionStorage.setItem(seedKey, 'true');
    }
  }, { key: SAVE_KEY, introKey: INTRO_KEY, seedKey: SEED_KEY, save: raw });
}

function attachErrors(page) {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error?.message || error)));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  return { pageErrors, consoleErrors };
}

async function holdUntil(page, key, predicate, description, timeoutMs = MOVEMENT_TIMEOUT_MS) {
  const bounds = await page.locator(`[data-move-key="${key}"]`).boundingBox();
  assert(bounds, `Control táctil ${key} no visible`);
  const session = await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [
    { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2, id: 1 },
  ] });
  let current;
  try {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      current = await snapshot(page);
      if (predicate(current)) return current;
      await sleep(350);
    }
  } finally {
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
  }
  throw new Error(`${description}: movimiento real no alcanzó el objetivo: ${JSON.stringify(current)}`);
}

async function moveToInteractable(page, id) {
  const current = await snapshot(page);
  if (current?.nearestInteractable === id) return current;
  throw new Error(`No hay un tramo de navegación declarado para ${id} desde ${JSON.stringify(current?.position)}`);
}

async function interact(page, id, description = id, { allowPostChange = false } = {}) {
  await moveToInteractable(page, id);
  await page.locator('#touch-interact').tap();
  await sleep(350);
  if (allowPostChange) return snapshot(page);
  const after = await waitForSnapshot(page, (current) => current?.nearestInteractable === id || current?.regionalInspection !== null,
    `${description}: interacción no estabilizada`, 5_000);
  if (after?.regionalInspection !== null) {
    await page.locator('[data-testid="regional-maintenance-panel"]:not([hidden])').waitFor({ state: 'visible', timeout: NAV_TIMEOUT_MS });
  }
  return after;
}

async function walkTo(page, id, key, predicate, description) {
  return walkSequence(page, id, [{ key, predicate }], description);
}

async function walkSequence(page, id, steps, description) {
  let current = await snapshot(page);
  if (current?.nearestInteractable === id) return current;
  for (const step of steps) {
    current = await snapshot(page);
    if (current?.nearestInteractable === id) return current;
    await holdUntil(page, step.key, step.predicate, description);
  }
  return waitForSnapshot(page, (next) => next?.nearestInteractable === id,
    `${description}: no quedó frente a ${id}`);
}

async function openPanel(page, kind, id, steps, description) {
  await walkSequence(page, id, steps, description);
  await page.locator('#touch-interact').tap();
  await page.locator('[data-testid="regional-maintenance-panel"]:not([hidden])').waitFor({ state: 'visible', timeout: NAV_TIMEOUT_MS });
  await waitForSnapshot(page, (current) => current?.regionalInspection === kind, `${kind}: panel no abrió`);
}

async function closePanel(page) {
  await page.locator('[data-testid="regional-maintenance-close"]').tap();
  await page.locator('[data-testid="regional-maintenance-panel"]').waitFor({ state: 'hidden', timeout: NAV_TIMEOUT_MS });
  await waitForSnapshot(page, (current) => current?.regionalInspection === null, 'panel no cerró');
}

async function assertFocusTrap(page, label) {
  const panel = page.locator('[data-testid="regional-maintenance-panel"]');
  for (let index = 0; index < 24; index += 1) await page.keyboard.press('Tab');
  assert(await page.evaluate(() => {
    const element = document.querySelector('[data-testid="regional-maintenance-panel"]');
    return Boolean(element && element.contains(document.activeElement));
  }), `${label}: Tab escapó del panel`);
  await page.keyboard.press('Shift+Tab');
  assert(await page.evaluate(() => {
    const element = document.querySelector('[data-testid="regional-maintenance-panel"]');
    return Boolean(element && element.contains(document.activeElement));
  }), `${label}: Shift+Tab escapó del panel`);
  assert(await panel.isVisible(), `${label}: el panel dejó de ser visible durante el focus trap`);
}

async function capturePanel(page, name) {
  await resetPanelViewport(page, VIEWPORT);
  await page.screenshot({ path: resolve(OUT, `${name}-touch.png`), animations: 'disabled' });
  await resetPanelViewport(page, DESKTOP_VIEWPORT);
  await page.screenshot({ path: resolve(OUT, `${name}-desktop.png`), animations: 'disabled' });
  await resetPanelViewport(page, VIEWPORT);
}

async function resetPanelViewport(page, viewport) {
  await page.setViewportSize(viewport);
  await page.waitForFunction(({ width, height }) => window.innerWidth === width && window.innerHeight === height,
    { width: viewport.width, height: viewport.height }, { timeout: 5_000 });
  await page.evaluate(() => {
    const panel = document.querySelector('.ohmdal-regional-panel__window');
    if (panel instanceof HTMLElement) panel.scrollTop = 0;
  });
  await sleep(350);
}

async function setSelect(page, testId, value) {
  await page.locator(`[data-testid="${testId}"]`).selectOption(String(value));
  await sleep(90);
}

async function clickTestId(page, testId) {
  await page.locator(`[data-testid="${testId}"]`).tap();
  await sleep(90);
}

async function waitForStorageChange(page, previous, label, timeoutMs = 5_000) {
  const started = Date.now();
  let current = previous;
  while (Date.now() - started < timeoutMs) {
    current = await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY);
    if (current !== previous) return current;
    await sleep(120);
  }
  throw new Error(`${label}: el autosave no cambió dentro del plazo`);
}

async function screenshotConsequence(page, name) {
  await page.screenshot({ path: resolve(OUT, `${name}-consequence-touch.png`), animations: 'disabled' });
  const current = await snapshot(page);
  return {
    energized: current?.arc1?.castle?.energized ?? current?.arc1?.forgeTerraces?.energized ?? current?.arc1?.lighthouse?.energized,
    protectiveTrip: current?.arc1?.castle?.protectiveTrip ?? current?.arc1?.forgeTerraces?.protectiveTrip ?? current?.arc1?.lighthouse?.protectiveTrip,
  };
}

async function preparePage(browser, baseUrl, fixture, name) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    hasTouch: true,
    isMobile: true,
    baseURL: baseUrl,
  });
  const page = await context.newPage();
  const errors = attachErrors(page);
  await installSeed(page, serializeArc1SaveData(fixture));
  await enterGame(page);
  const resumed = await snapshot(page);
  assert(resumed?.arc1, `${name}: no se reanudó Arc1: ${JSON.stringify(resumed)}`);
  assert(resumed.dialogue === null, `${name}: diálogo de introducción inesperado al reanudar`);
  assert(!resumed.ohmInspecting && resumed.regionalInspection === null,
    `${name}: un overlay de inspección bloqueó el arranque`);
  return { context, page, errors, resumed };
}

async function finishErrors(errors, name) {
  assert(errors.pageErrors.length === 0, `${name}: pageerror: ${JSON.stringify(errors.pageErrors)}`);
  assert(errors.consoleErrors.length === 0, `${name}: console.error: ${JSON.stringify(errors.consoleErrors)}`);
}

async function runCastleCase(browser, baseUrl) {
  const { context, page, errors, resumed } = await preparePage(browser, baseUrl, fixtures.castle, 'castle');
  try {
    const before = resumed.arc1.castle.branches;
    await openPanel(page, 'castle', 'castle_parallel_layout', [
      { key: 'd', predicate: (current) => (current?.position?.[0] ?? 0) <= 54.8 },
      { key: 'w', predicate: (current) => current?.nearestInteractable === 'castle_parallel_layout' },
    ],
      'Castillo: acercamiento lateral');
    await assertFocusTrap(page, 'Castillo');
    await capturePanel(page, 'castle-panel');

    await setSelect(page, 'castle-district-a-wiring', 'parallel');
    const afterA = (await snapshot(page)).arc1.castle.branches;
    assert(afterA['district-b'].wiring === before['district-b'].wiring
      && afterA['district-b'].priority === before['district-b'].priority
      && afterA['district-b'].protectionRating === before['district-b'].protectionRating
      && afterA['district-c'].wiring === before['district-c'].wiring
      && afterA['district-c'].priority === before['district-c'].priority
      && afterA['district-c'].protectionRating === before['district-c'].protectionRating,
    `Castillo: cambiar Distrito A alteró B/C: ${JSON.stringify({ before, afterA })}`);

    // Mixed configuration: A/B in parallel and C in series, with C as support.
    await setSelect(page, 'castle-district-a-priority', 'essential');
    await setSelect(page, 'castle-district-a-protection', '4');
    await setSelect(page, 'castle-district-b-wiring', 'parallel');
    await setSelect(page, 'castle-district-b-priority', 'essential');
    await setSelect(page, 'castle-district-b-protection', '5');
    await setSelect(page, 'castle-district-c-wiring', 'series');
    await setSelect(page, 'castle-district-c-priority', 'support');
    await setSelect(page, 'castle-district-c-protection', '2');
    await clickTestId(page, 'castle-return-continuity');
    await closePanel(page);

    await walkSequence(page, 'castle_bus_measure', [
      { key: 'a', predicate: (current) => (current?.position?.[0] ?? 0) >= 59.0 },
      { key: 's', predicate: (current) => current?.nearestInteractable === 'castle_bus_measure' },
    ], 'Castillo: regreso a la barra de medición');
    await interact(page, 'castle_bus_measure', 'Castillo: medición mixta');
    await walkTo(page, 'castle_distribution_panel', 'w',
      (current) => current?.nearestInteractable === 'castle_distribution_panel',
      'Castillo: llegada al panel de distribución');
    await interact(page, 'castle_distribution_panel', 'Castillo: energización mixta');
    let current = await waitForSnapshot(page, (next) => next?.arc1?.castle?.energized === true,
      'Castillo: la configuración mixta no energizó');
    assert(current.arc1.castle.protectiveTrip === false && current.arc1.castle.topology === 'mixed',
      `Castillo: consecuencia inesperada en configuración mixta: ${JSON.stringify(current.arc1.castle)}`);
    const mixedState = {
      topology: current.arc1.castle.topology,
      energized: current.arc1.castle.energized,
      protectiveTrip: current.arc1.castle.protectiveTrip,
    };
    const mixedConsequence = await screenshotConsequence(page, 'castle-mixed');

    // A second physical arrangement is accepted: all three branches in parallel.
    await openPanel(page, 'castle', 'castle_parallel_layout', [
      { key: 'd', predicate: (next) => next?.nearestInteractable === 'castle_parallel_layout' },
    ], 'Castillo: reapertura de placa');
    await setSelect(page, 'castle-district-c-wiring', 'parallel');
    await closePanel(page);
    await walkSequence(page, 'castle_bus_measure', [
      { key: 'a', predicate: (next) => (next?.position?.[0] ?? 0) >= 59.0 },
      { key: 's', predicate: (next) => next?.nearestInteractable === 'castle_bus_measure' },
    ], 'Castillo: barra para alternativa paralela');
    await interact(page, 'castle_bus_measure', 'Castillo: medición paralela');
    await walkTo(page, 'castle_distribution_panel', 'w',
      (next) => next?.nearestInteractable === 'castle_distribution_panel',
      'Castillo: distribución para alternativa paralela');
    await interact(page, 'castle_distribution_panel', 'Castillo: energización paralela');
    current = await waitForSnapshot(page, (next) => next?.arc1?.castle?.energized === true,
      'Castillo: alternativa paralela no energizó');
    assert(current.arc1.castle.protectiveTrip === false && current.arc1.castle.topology === 'parallel',
      `Castillo: alternativa paralela inválida: ${JSON.stringify(current.arc1.castle)}`);
    const parallelConsequence = await screenshotConsequence(page, 'castle-parallel');
    return {
      resumed: { position: resumed.position, region: resumed.arc1.currentRegion },
      branchIsolation: { before, afterA },
      mixed: { ...mixedState, consequence: mixedConsequence },
      parallel: { topology: current.arc1.castle.topology, consequence: parallelConsequence },
      screenshots: ['castle-panel-touch.png', 'castle-panel-desktop.png', 'castle-mixed-consequence-touch.png', 'castle-parallel-consequence-touch.png'],
      errors,
    };
  } finally {
    await context.close();
  }
}

async function runForgeCase(browser, baseUrl) {
  const { context, page, errors, resumed } = await preparePage(browser, baseUrl, fixtures.forge, 'forge');
  try {
    await openPanel(page, 'forge', 'forge_heater_allocation', [
      { key: 'a', predicate: (current) => (current?.position?.[0] ?? 0) >= 123.2 },
      { key: 'w', predicate: (current) => current?.nearestInteractable === 'forge_heater_allocation' },
    ],
      'Forja: llegada al regulador');
    await assertFocusTrap(page, 'Forja');
    await capturePanel(page, 'forge-panel');

    // Exercise the canonical upper range. Each load is capped at 5 A, so
    // 5+5 exceeds the shared 8 A supply and is the overload fixture.
    for (const load of ['forge', 'terraces']) {
      assert((await snapshot(page)).arc1.forgeTerraces.allocation[load] === 0, `${load}: initial allocation must be zero`);
      for (let index = 0; index < 5; index += 1) {
        await clickTestId(page, `forge-allocation-${load}-plus`);
        const actual = (await snapshot(page)).arc1.forgeTerraces.allocation[load];
        console.log(`[regional] ${load} tap ${index + 1}: ${actual} A`);
        assert(actual === index + 1, `${load}: one tap must increment once, expected ${index + 1}, got ${actual}`);
      }
    }
    await setSelect(page, 'forge-conductor', 'wide');
    await setSelect(page, 'forge-conductor', 'narrow');
    await setSelect(page, 'forge-protection-forge', '5');
    await setSelect(page, 'forge-protection-forge', 'none');
    await setSelect(page, 'forge-protection-terraces', '5');
    await setSelect(page, 'forge-protection-terraces', 'none');
    await closePanel(page);

    await walkSequence(page, 'forge_bus_measure', [
      { key: 'd', predicate: (current) => (current?.position?.[0] ?? 0) <= 120.8 },
      { key: 'w', predicate: (current) => current?.nearestInteractable === 'forge_bus_measure' },
    ], 'Forja: barra de medición tras ajuste defectuoso');
    await interact(page, 'forge_bus_measure', 'Forja: medición defectuosa');
    await walkTo(page, 'forge_distribution_panel', 'w',
      (current) => current?.nearestInteractable === 'forge_distribution_panel',
      'Forja: panel de distribución tras medición defectuosa');
    await interact(page, 'forge_distribution_panel', 'Forja: disparo de protección');
    let current = await waitForSnapshot(page, (next) => next?.arc1?.forgeTerraces?.protectiveTrip === true,
      'Forja: la configuración estrecha no disparó protección');
    assert(current.arc1.forgeTerraces.energized === false,
      'Forja: una protección disparada dejó la salida energizada');
    const tripped = {
      allocation: current.arc1.forgeTerraces.allocation,
      conductor: current.arc1.forgeTerraces.conductor,
      protection: current.arc1.forgeTerraces.protection,
      measurements: current.arc1.forgeTerraces.measurements.length,
    };
    const badConsequence = await screenshotConsequence(page, 'forge-trip');

    // Rearm at the same station before changing the physical setup.
    await interact(page, 'forge_distribution_panel', 'Forja: rearme');
    await openPanel(page, 'forge', 'forge_heater_allocation', [
      { key: 's', predicate: (next) => (next?.position?.[2] ?? 0) <= -10.9 },
      { key: 'a', predicate: (next) => (next?.position?.[0] ?? 0) >= 123.2 },
      { key: 'w', predicate: (next) => next?.nearestInteractable === 'forge_heater_allocation' },
    ], 'Forja: regreso al regulador');
    await clickTestId(page, 'forge-allocation-terraces-minus');
    await clickTestId(page, 'forge-allocation-terraces-minus');
    await setSelect(page, 'forge-conductor', 'medium');
    await setSelect(page, 'forge-protection-forge', '5');
    await setSelect(page, 'forge-protection-terraces', '3');
    await closePanel(page);

    await walkSequence(page, 'forge_bus_measure', [
      { key: 'd', predicate: (next) => (next?.position?.[0] ?? 0) <= 120.8 },
      { key: 'w', predicate: (next) => next?.nearestInteractable === 'forge_bus_measure' },
    ], 'Forja: barra para nueva medición');
    await interact(page, 'forge_bus_measure', 'Forja: nueva medición válida');
    await walkTo(page, 'forge_distribution_panel', 'w',
      (next) => next?.nearestInteractable === 'forge_distribution_panel',
      'Forja: distribución para nueva energización');
    const rawBeforeValidEnergy = await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY);
    assert(rawBeforeValidEnergy !== null, 'Forja: no existe save previo a la energización válida');
    await interact(page, 'forge_distribution_panel', 'Forja: energización válida');
    current = await waitForSnapshot(page, (next) => next?.arc1?.forgeTerraces?.energized === true,
      'Forja: configuración 5+3 no energizó');
    assert(current.arc1.forgeTerraces.protectiveTrip === false,
      `Forja: la protección siguió activa tras reparar: ${JSON.stringify(current.arc1.forgeTerraces)}`);
    const repaired = {
      allocation: current.arc1.forgeTerraces.allocation,
      conductor: current.arc1.forgeTerraces.conductor,
      protection: current.arc1.forgeTerraces.protection,
      measurements: current.arc1.forgeTerraces.measurements.length,
    };
    const rawAfterSave = await waitForStorageChange(page, rawBeforeValidEnergy,
      'Forja: la configuración válida no produjo autosave estable');
    assert(rawAfterSave !== null, 'Forja: autosave vacío después de energizar');
    await page.screenshot({ path: resolve(OUT, 'forge-repaired-touch.png'), animations: 'disabled' });

    await page.reload({ waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
    await page.locator('#plaza-enter').click();
    await waitForHooks(page);
    current = await waitForSnapshot(page, (next) => next?.arc1?.forgeTerraces?.energized === true,
      'Forja: estado no restaurado tras reload');
    assert(current.arc1.currentRegion === 'terrazas'
      && current.arc1.forgeTerraces.protectiveTrip === false
      && current.arc1.forgeTerraces.allocation.forge === repaired.allocation.forge
      && current.arc1.forgeTerraces.allocation.terraces === repaired.allocation.terraces
      && current.arc1.forgeTerraces.conductor === 'medium'
      && current.arc1.forgeTerraces.protection.forge === 5
      && current.arc1.forgeTerraces.protection.terraces === 3,
    `Forja: fuentes no persistieron tras reload: ${JSON.stringify(current.arc1.forgeTerraces)}`);
    await page.screenshot({ path: resolve(OUT, 'forge-reload-touch.png'), animations: 'disabled' });
    return {
      resumed: { position: resumed.position, region: resumed.arc1.currentRegion },
      tripped,
      repaired,
      afterReload: {
        region: current.arc1.currentRegion,
        energized: current.arc1.forgeTerraces.energized,
        allocation: current.arc1.forgeTerraces.allocation,
        conductor: current.arc1.forgeTerraces.conductor,
        protection: current.arc1.forgeTerraces.protection,
      },
      screenshots: ['forge-panel-touch.png', 'forge-panel-desktop.png', 'forge-trip-consequence-touch.png', 'forge-repaired-touch.png', 'forge-reload-touch.png'],
      errors,
    };
  } finally {
    await context.close();
  }
}

async function runLighthouseCase(browser, baseUrl) {
  const { context, page, errors, resumed } = await preparePage(browser, baseUrl, fixtures.lighthouse, 'lighthouse');
  try {
    await openPanel(page, 'lighthouse', 'lighthouse_calibration_panel', [
      { key: 'w', predicate: (current) => current?.nearestInteractable === 'lighthouse_calibration_panel' },
    ],
      'Faro: llegada a calibración');
    const opened = await snapshot(page);
    assert(opened.arc1.lighthouse.calibration === null, 'Abrir el panel no debe calibrar ni mutar el circuito');
    const initialValue = await page.locator('[data-testid="lighthouse-trim-value"]').textContent();
    assert(initialValue?.includes('4 V'), `Faro: el ajuste inicial esperado +4 V no se mostró: ${initialValue}`);
    await assertFocusTrap(page, 'Faro');
    await capturePanel(page, 'lighthouse-panel');
    for (let index = 0; index < 4; index += 1) await clickTestId(page, 'lighthouse-trim-minus');
    const zeroValue = await page.locator('[data-testid="lighthouse-trim-value"]').textContent();
    assert(zeroValue?.includes('0 V'), `Faro: el ajuste manual no llegó a 0 V: ${zeroValue}`);
    await closePanel(page);

    await walkTo(page, 'lighthouse_bus_measure', 's',
      (current) => (current?.position?.[2] ?? 0) <= -7.0,
      'Faro: llegada a alimentación');
    await interact(page, 'lighthouse_bus_measure', 'Faro: medición de alimentación');
    await walkTo(page, 'lighthouse_beacon_control', 'w',
      (current) => current?.nearestInteractable === 'lighthouse_beacon_control',
      'Faro: llegada a baliza');
    await interact(page, 'lighthouse_beacon_control', 'Faro: energización de baliza');
    let current = await waitForSnapshot(page, (next) => next?.arc1?.lighthouse?.energized === true,
      'Faro: la baliza no quedó energizada');
    assert(current.arc1.lighthouse.protectiveTrip === false,
      `Faro: energización inesperadamente protegida: ${JSON.stringify(current.arc1.lighthouse)}`);

    // First E energizes, second records beacon, third repeats beacon. The
    // repeated spatial check must remain one point, never fake two samples.
    await interact(page, 'lighthouse_beacon_control', 'Faro: primera comprobación de baliza');
    const afterBeacon = await snapshot(page);
    assert(JSON.stringify(afterBeacon.arc1.lighthouse.verificationPoints) === JSON.stringify(['beacon'])
      && afterBeacon.arc1.lighthouse.synchronizationSamples === 1
      && afterBeacon.arc1.lighthouse.documented === false,
    `Faro: la primera comprobación no quedó acotada a beacon: ${JSON.stringify(afterBeacon.arc1.lighthouse)}`);
    await interact(page, 'lighthouse_beacon_control', 'Faro: comprobación repetida de baliza');
    const repeatedBeacon = await snapshot(page);
    assert(JSON.stringify(repeatedBeacon.arc1.lighthouse.verificationPoints) === JSON.stringify(['beacon'])
      && repeatedBeacon.arc1.lighthouse.synchronizationSamples === 1
      && repeatedBeacon.arc1.lighthouse.documented === false,
    `Faro: repetir beacon concedió el segundo punto: ${JSON.stringify(repeatedBeacon.arc1.lighthouse)}`);
    const beaconConsequence = await screenshotConsequence(page, 'lighthouse-beacon');

    await walkTo(page, 'lighthouse_bus_measure', 's',
      (next) => (next?.position?.[2] ?? 0) <= -7.0,
      'Faro: regreso a alimentación');
    await interact(page, 'lighthouse_bus_measure', 'Faro: segunda comprobación en alimentación');
    current = await waitForSnapshot(page, (next) => {
      const points = next?.arc1?.lighthouse?.verificationPoints ?? [];
      return points.includes('feed') && points.includes('beacon');
    }, 'Faro: alimentación no completó los dos puntos');
    assert(current.arc1.lighthouse.synchronizationSamples === 2
      && current.arc1.lighthouse.energized === true
      && current.arc1.lighthouse.protectiveTrip === false,
    `Faro: estado inválido tras comprobar alimentación: ${JSON.stringify(current.arc1.lighthouse)}`);

    // The real recording station commits the valid evidence; this is the
    // player-facing consequence of both spatial checks being present.
    await walkTo(page, 'lighthouse_return_marker', 'w',
      (next) => next?.nearestInteractable === 'lighthouse_return_marker',
      'Faro: llegada al registro final');
    await interact(page, 'lighthouse_return_marker', 'Faro: registro de evidencia', { allowPostChange: true });
    current = await waitForSnapshot(page, (next) => next?.arc1?.lighthouse?.documented === true,
      'Faro: evidencia completa no quedó documentada');
    assert(current.arc1.progress.lighthouseRestored === true,
      `Faro: progress no refleja restauración: ${JSON.stringify(current.arc1.progress)}`);
    await page.screenshot({ path: resolve(OUT, 'lighthouse-restored-touch.png'), animations: 'disabled' });
    return {
      resumed: { position: resumed.position, region: resumed.arc1.currentRegion },
      opened: { trim: opened.arc1.lighthouse.calibration?.voltageTrim ?? null, panelValue: initialValue },
      beacon: { points: repeatedBeacon.arc1.lighthouse.verificationPoints, samples: repeatedBeacon.arc1.lighthouse.synchronizationSamples, consequence: beaconConsequence },
      completed: {
        points: current.arc1.lighthouse.verificationPoints,
        samples: current.arc1.lighthouse.synchronizationSamples,
        documented: current.arc1.lighthouse.documented,
        restored: current.arc1.progress.lighthouseRestored,
      },
      screenshots: ['lighthouse-panel-touch.png', 'lighthouse-panel-desktop.png', 'lighthouse-beacon-consequence-touch.png', 'lighthouse-restored-touch.png'],
      errors,
    };
  } finally {
    await context.close();
  }
}

await mkdir(OUT, { recursive: true });
const port = await getFreePort();
const baseUrl = `http://127.0.0.1:${port}`;
const { vite, log: viteLog } = startVite(port);
let browser = null;
const report = {
  schemaVersion: 1,
  route: ROUTE,
  viewport: { ...VIEWPORT, hasTouch: true, isMobile: true },
  saveKey: SAVE_KEY,
  result: 'RUNNING',
  cases: {},
};
const reportPath = resolve(OUT, 'regional-puzzles-run.json');

try {
  assert(await portReachable(port), `Vite no se levantó en ${port}: ${viteLog.join('').slice(-2000)}`);
  browser = await chromium.launch(process.argv.includes('--gpu') ? fastLaunchOptions() : { headless: true });
  report.browser = `chromium ${browser.version()}`;
  if (!ONLY_CASE || ONLY_CASE === 'castle') {
    report.cases.castle = await runCastleCase(browser, baseUrl);
    await finishErrors(report.cases.castle.errors, 'castle');
  }
  if (!ONLY_CASE || ONLY_CASE === 'forge') {
    report.cases.forge = await runForgeCase(browser, baseUrl);
    await finishErrors(report.cases.forge.errors, 'forge');
  }
  if (!ONLY_CASE || ONLY_CASE === 'lighthouse') {
    report.cases.lighthouse = await runLighthouseCase(browser, baseUrl);
    await finishErrors(report.cases.lighthouse.errors, 'lighthouse');
  }
  report.result = 'PASS';
  report.finishedAt = new Date().toISOString();
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ result: report.result, report: reportPath, cases: Object.keys(report.cases) }, null, 2));
} catch (error) {
  report.result = 'FAIL';
  report.failure = String(error?.stack || error?.message || error);
  report.finishedAt = new Date().toISOString();
  report.viteLogTail = viteLog.join('').slice(-2000);
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.error(JSON.stringify({ result: report.result, report: reportPath, failure: report.failure }, null, 2));
  process.exitCode = 1;
} finally {
  await browser?.close().catch(() => {});
  stopVite(vite);
}
