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
const OUT = resolve(ROOT, 'output/playwright/ohmdal-hardening/persistence');
const ROUTE = '/ohmdal-playcanvas';
const ONLY_CASE = process.argv.find((arg) => arg.startsWith('--case='))?.slice('--case='.length) ?? null;
const SAVE_KEY = 'ohmdal-playcanvas-arc1-v1';
const INTRO_KEY = 'ohmdal_intro_seen';
const VIEWPORT = { width: 1440, height: 900 };
const NAV_TIMEOUT_MS = 30_000;
const SNAPSHOT_TIMEOUT_MS = 15_000;

const {
  calibrateLighthouse,
  configureCastleNetwork,
  createArc1GreyboxState,
  documentCastleNetwork,
  documentForgeTerraces,
  documentLighthouse,
  energizeCastleNetwork,
  energizeForgeTerraces,
  energizeLighthouse,
  energizeManantial,
  enterArc1Region,
  measureCastleNetwork,
  measureForgeTerraces,
  measureLighthouse,
  measureManantial,
  openCastleGate,
  pullCampana,
  repairManantial,
  setForgeTerracesAllocation,
  setForgeTerracesConductor,
  setForgeTerracesProtection,
  setManantialGate,
  synchronizeLighthouse,
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

function buildPartialArc1() {
  // B2 happens in the Plaza before the Arc1 region reducer advances. The
  // runtime's authored portal-to-plaza anchor supplies the visual location.
  return createArc1GreyboxState();
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

function buildFaroArc1() {
  const configuration = {
    topology: 'parallel',
    returnContinuity: true,
    branches: {
      'district-a': { wiring: 'parallel', priority: 'essential', protectionRating: 4 },
      'district-b': { wiring: 'parallel', priority: 'essential', protectionRating: 5 },
      'district-c': { wiring: 'parallel', priority: 'support', protectionRating: 2 },
    },
  };
  let state = buildPlazaToolsArc1();
  state = enterArc1Region(state, 'castillo');
  state = configureCastleNetwork(state, configuration);
  state = measureCastleNetwork(state);
  state = energizeCastleNetwork(state);
  state = documentCastleNetwork(state);
  state = enterArc1Region(state, 'forja');
  state = enterArc1Region(state, 'terrazas');
  state = setForgeTerracesAllocation(state, { forge: 5, terraces: 3 });
  state = setForgeTerracesConductor(state, 'medium');
  state = setForgeTerracesProtection(state, 'forge', 5);
  state = setForgeTerracesProtection(state, 'terraces', 3);
  state = measureForgeTerraces(state);
  state = energizeForgeTerraces(state);
  state = documentForgeTerraces(state);
  state = measureLighthouse(state);
  state = calibrateLighthouse(state, { voltageTrim: 0, phaseOffset: 0 });
  state = energizeLighthouse(state);
  state = synchronizeLighthouse(state);
  state = synchronizeLighthouse(state);
  state = documentLighthouse(state);
  state = enterArc1Region(state, 'faro');
  return state;
}

function makeSave({ arc1, storyStep, ohmAwake, inventory, safeAnchor, restoredCircuit = false, coveredIds = [] }) {
  return createArc1SaveData({
    storyStep,
    ohmAwake,
    inventory,
    arc1,
    circuit: buildCircuitSave(restoredCircuit),
    bitacora: buildBitacoraSave(),
    safeAnchor,
    b2: { coveredIds },
  });
}

const fixtures = {
  partialB2: makeSave({
    arc1: buildPartialArc1(),
    storyStep: 'portal_arrived',
    ohmAwake: false,
    inventory: { jumper: false, brush: false },
    safeAnchor: { zone: 'plaza', anchorId: 'portal-to-plaza' },
    coveredIds: ['g1'],
  }),
  plazaTools: makeSave({
    arc1: buildPlazaToolsArc1(),
    storyStep: 'restored_plaza',
    ohmAwake: true,
    inventory: { jumper: true, brush: true },
    safeAnchor: { zone: 'plaza', anchorId: 'workshop-to-plaza' },
    restoredCircuit: true,
    coveredIds: ['g1', 'g5', 'g4'],
  }),
  faro: makeSave({
    arc1: buildFaroArc1(),
    storyStep: 'inside_lighthouse',
    ohmAwake: true,
    inventory: { jumper: true, brush: true },
    safeAnchor: { zone: 'lighthouse', anchorId: 'forge-terraces-to-lighthouse' },
    restoredCircuit: true,
    coveredIds: ['g1', 'g5', 'g4'],
  }),
  awakenedDialogues: makeSave({
    arc1: buildPartialArc1(),
    storyStep: 'ohm_awakened',
    ohmAwake: true,
    inventory: { jumper: false, brush: false },
    safeAnchor: { zone: 'plaza', anchorId: 'portal-to-plaza' },
    coveredIds: ['g1', 'g5', 'g4'],
  }),
};

async function snapshot(page) {
  return page.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__?.getPlaytestSnapshot());
}

async function waitForHooks(page) {
  await page.waitForFunction(() => Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__), null, {
    timeout: NAV_TIMEOUT_MS,
  });
  const started = Date.now();
  let current;
  while (Date.now() - started < SNAPSHOT_TIMEOUT_MS) {
    current = await snapshot(page);
    if (current) return current;
    await sleep(100);
  }
  throw new Error(`No apareció snapshot: ${JSON.stringify(current)}`);
}

async function enterGame(page) {
  await page.goto(ROUTE, {
    waitUntil: 'networkidle',
    timeout: NAV_TIMEOUT_MS,
  });
  await page.locator('#plaza-enter').click();
  await waitForHooks(page);
  await sleep(1_200);
}

function installSeed(page, raw, { malformed = false, quotaFailure = false } = {}) {
  return page.addInitScript(({ key, introKey, save, isMalformed, quota }) => {
    // Seed once per test tab: reseeding on reload would hide broken autosave.
    if (sessionStorage.getItem('ohmdal-persistence-qa-seeded') !== 'true') {
      if (save !== null) localStorage.setItem(key, save);
      localStorage.setItem(introKey, 'true');
      if (isMalformed) localStorage.setItem(key, '{broken-save');
      sessionStorage.setItem('ohmdal-persistence-qa-seeded', 'true');
    }
    if (quota) {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function setItemWithQuotaFailure(candidateKey, value) {
        if (candidateKey === key) throw new DOMException('quota exceeded', 'QuotaExceededError');
        return originalSetItem.call(this, candidateKey, value);
      };
    }
  }, {
    key: SAVE_KEY,
    introKey: INTRO_KEY,
    save: raw,
    isMalformed: malformed,
    quota: quotaFailure,
  });
}

function relevantSnapshot(snapshotValue) {
  return {
    storyStep: snapshotValue?.storyStep,
    ohmAwake: snapshotValue?.ohmAwake,
    inventory: snapshotValue?.inventory,
    arc1Region: snapshotValue?.arc1?.currentRegion,
    visitedRegions: snapshotValue?.arc1?.visitedRegions,
    circuit: snapshotValue?.circuit,
    ohmPuzzle: snapshotValue?.ohmPuzzle,
    zones: snapshotValue?.zones,
  };
}

async function mutatePartialB2(page) {
  // Drive the real movement/interact path to Ohm's contact panel. This keeps
  // the autosave assertion independent from visual-test hooks or injected
  // world state.
  const holdUntil = async (key, predicate, description) => {
    await page.keyboard.down(key);
    const started = Date.now();
    let current = await snapshot(page);
    while (Date.now() - started < 15_000) {
      if (predicate(current)) {
        await page.keyboard.up(key);
        return current;
      }
      await sleep(500);
      current = await snapshot(page);
    }
    await page.keyboard.up(key);
    assert(false, `partial-b2: ${description}: ${JSON.stringify(current)}`);
  };

  await holdUntil('a', (current) => (current?.position?.[0] ?? 0) >= 1.4, 'no alcanzó el lateral del pedestal');
  await holdUntil('w', (current) => current?.nearestInteractable === 'ohm_contact_panel', 'no se pudo mover hasta el panel');
  await page.keyboard.press('e');
  await page.waitForSelector('#ohm-inspection-modal:not(.hidden)', { timeout: NAV_TIMEOUT_MS });
  await page.locator('#ohm-gap-g5').click();
  await sleep(250);
}

async function waitForDialogue(page, id, label = id) {
  const started = Date.now();
  let current;
  while (Date.now() - started < SNAPSHOT_TIMEOUT_MS) {
    current = await snapshot(page);
    if (current?.dialogue?.id === id) return current;
    await sleep(100);
  }
  throw new Error(`${label}: no apareció el diálogo ${id}: ${JSON.stringify(current?.dialogue)}`);
}

async function advanceDialogueNode(page, expectedId, label = expectedId) {
  for (let index = 0; index < 24; index += 1) {
    const current = await snapshot(page);
    if (!current?.dialogue || current.dialogue.id !== expectedId) return current;
    await page.keyboard.press('e');
    await sleep(110);
  }
  throw new Error(`${label}: no avanzó fuera de ${expectedId} después de 24 avances`);
}

async function drainDialogue(page, expectedId, label = expectedId) {
  for (let index = 0; index < 24; index += 1) {
    const current = await snapshot(page);
    if (!current?.dialogue) return current;
    assert(current.dialogue.id === expectedId,
      `${label}: cambió inesperadamente a ${current.dialogue.id}`);
    await page.keyboard.press('e');
    await sleep(110);
  }
  throw new Error(`${label}: no terminó después de 24 avances`);
}

async function waitForSavedStoryStep(page, storyStep, label = storyStep) {
  await page.waitForFunction(({ key, expected }) => {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    try {
      return JSON.parse(raw)?.storyStep === expected;
    } catch {
      return false;
    }
  }, { key: SAVE_KEY, expected: storyStep }, { timeout: SNAPSHOT_TIMEOUT_MS });
  const raw = await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY);
  assert(raw !== null, `${label}: el save no quedó disponible`);
  return JSON.parse(raw);
}

async function runAwakenedDialoguesCase(browser, baseUrl) {
  const context = await browser.newContext({ viewport: VIEWPORT, baseURL: baseUrl });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error?.message || error)));
  await installSeed(page, serializeArc1SaveData(fixtures.awakenedDialogues));
  await enterGame(page);

  const resumed = await waitForDialogue(page, 'ohm_awakening_event', 'awakenedDialogues resume Ohm');
  assert(resumed.storyStep === 'ohm_awakened' && resumed.ohmAwake === true,
    `awakenedDialogues: Ohm no reanudó desde ohm_awakened: ${JSON.stringify(relevantSnapshot(resumed))}`);
  assert(resumed.ohmPuzzle?.covered?.includes('g1') && resumed.ohmPuzzle?.covered?.includes('g5')
    && resumed.ohmPuzzle?.covered?.includes('g4'),
  'awakenedDialogues: B2 completo no se reconstruyó al reanudar');

  const afterOhm = await advanceDialogueNode(page, 'ohm_awakening_event', 'awakenedDialogues completar Ohm');
  assert(afterOhm?.dialogue?.id === 'edda_surprised_awakening',
    `awakenedDialogues: completar Ohm no abrió Edda: ${JSON.stringify(afterOhm?.dialogue)}`);
  const ohmCompletedSave = await waitForSavedStoryStep(page, 'edda_surprised',
    'awakenedDialogues completar Ohm');
  assert(ohmCompletedSave.ohmAwake === true,
    'awakenedDialogues: el save tras Ohm perdió ohmAwake');

  await page.reload({ waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
  await page.locator('#plaza-enter').click();
  await waitForHooks(page);
  await sleep(1_200);
  const eddaResumed = await waitForDialogue(page, 'edda_surprised_awakening',
    'awakenedDialogues reload durante Edda');
  assert(eddaResumed.storyStep === 'edda_surprised' && eddaResumed.ohmAwake === true,
    `awakenedDialogues: Edda reload perdió estado: ${JSON.stringify(relevantSnapshot(eddaResumed))}`);

  const afterEdda = await drainDialogue(page, 'edda_surprised_awakening',
    'awakenedDialogues completar Edda');
  assert(afterEdda?.dialogue === null && afterEdda.storyStep === 'invited_to_workshop',
    `awakenedDialogues: completar Edda no avanzó a invited_to_workshop: ${JSON.stringify(relevantSnapshot(afterEdda))}`);
  const invitedSave = await waitForSavedStoryStep(page, 'invited_to_workshop',
    'awakenedDialogues completar Edda');
  assert(invitedSave.ohmAwake === true,
    'awakenedDialogues: el save tras Edda perdió ohmAwake');

  await page.reload({ waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
  await page.locator('#plaza-enter').click();
  await waitForHooks(page);
  await sleep(1_200);
  const finalResume = await snapshot(page);
  assert(finalResume.storyStep === 'invited_to_workshop' && finalResume.dialogue === null,
    `awakenedDialogues: reload tras Edda repitió diálogo o perdió avance: ${JSON.stringify(relevantSnapshot(finalResume))}`);
  assert(pageErrors.length === 0, `awakenedDialogues: pageerror: ${JSON.stringify(pageErrors)}`);
  await page.screenshot({ path: resolve(OUT, 'awakened-dialogues-reload.png'), animations: 'disabled' });
  await context.close();
  return {
    beforeReload: relevantSnapshot(resumed),
    afterOhm: relevantSnapshot(afterOhm),
    afterEddaReload: relevantSnapshot(eddaResumed),
    afterEdda: relevantSnapshot(afterEdda),
    finalResume: relevantSnapshot(finalResume),
    pageErrors,
  };
}

async function runResumeCase(browser, baseUrl, name, save, expected, options = {}) {
  const context = await browser.newContext({ viewport: VIEWPORT, baseURL: baseUrl });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error?.message || error)));
  await installSeed(page, serializeArc1SaveData(save));
  await enterGame(page);
  const beforeReload = await snapshot(page);
  assert(expected(beforeReload), `${name}: estado reanudado inválido: ${JSON.stringify(relevantSnapshot(beforeReload))}`);
  assert(await page.locator('#plaza-cinematic-overlay').evaluate((element) => element.classList.contains('hidden')),
    `${name}: se repitió la cinemática al reanudar`);
  assert(beforeReload.dialogue === null, `${name}: diálogo de introducción sobrescribió el estado reanudado`);
  const seededRaw = await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY);
  assert(seededRaw !== null, `${name}: el save válido desapareció durante el arranque`);

  if (options.mutate) {
    await options.mutate(page);
    await page.waitForFunction(({ key, previous }) => localStorage.getItem(key) !== previous,
      { key: SAVE_KEY, previous: seededRaw }, { timeout: 5_000 });
    const mutatedRaw = await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY);
    assert(mutatedRaw !== null && mutatedRaw !== seededRaw, `${name}: la mutación aceptada no produjo autosave`);
    assert(JSON.parse(mutatedRaw).b2?.coveredIds?.includes('g5'), `${name}: autosave no conservó el nuevo puente B2`);
  }

  await page.reload({ waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
  await page.locator('#plaza-enter').click();
  await waitForHooks(page);
  await sleep(1_200);
  const afterReload = await snapshot(page);
  const expectedAfterReload = options.expectedAfterReload ?? expected;
  assert(expectedAfterReload(afterReload), `${name}: estado tras reload inválido: ${JSON.stringify(relevantSnapshot(afterReload))}`);
  assert(afterReload.dialogue === null, `${name}: diálogo diferido sobrescribió el estado tras reload`);
  assert(pageErrors.length === 0, `${name}: pageerror: ${JSON.stringify(pageErrors)}`);
  await page.screenshot({ path: resolve(OUT, `${name}-reload.png`), animations: 'disabled' });
  await context.close();
  return { beforeReload: relevantSnapshot(beforeReload), afterReload: relevantSnapshot(afterReload), pageErrors };
}

async function runMalformedCase(browser, baseUrl) {
  const context = await browser.newContext({ viewport: VIEWPORT, baseURL: baseUrl });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error?.message || error)));
  await installSeed(page, null, { malformed: true });
  await enterGame(page);
  const current = await snapshot(page);
  assert(current.arc1.currentRegion === 'portal', `malformed: no volvió al baseline: ${JSON.stringify(relevantSnapshot(current))}`);
  assert(current.storyStep === 'portal_arrived', `malformed: story inesperado: ${current.storyStep}`);
  assert(pageErrors.length === 0, `malformed: pageerror: ${JSON.stringify(pageErrors)}`);
  await context.close();
  return { baseline: relevantSnapshot(current), pageErrors };
}

async function runQuotaCase(browser, baseUrl) {
  const context = await browser.newContext({ viewport: VIEWPORT, baseURL: baseUrl });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error?.message || error)));
  await installSeed(page, serializeArc1SaveData(fixtures.partialB2), { quotaFailure: true });
  await enterGame(page);
  const current = await snapshot(page);
  assert(current, 'quota: el runtime debe seguir montando aunque falle setItem');
  assert(pageErrors.length === 0, `quota: pageerror: ${JSON.stringify(pageErrors)}`);
  await context.close();
  return { mounted: true, pageErrors };
}

await mkdir(OUT, { recursive: true });
const port = await getFreePort();
const baseUrl = `http://127.0.0.1:${port}`;
const { vite, log: viteLog } = startVite(port);
let browser = null;
const report = { schemaVersion: 1, route: ROUTE, saveKey: SAVE_KEY, result: 'RUNNING', cases: {} };
const reportPath = resolve(OUT, 'reload-run.json');

try {
  assert(await portReachable(port), `Vite no se levantó en ${port}: ${viteLog.join('').slice(-2000)}`);
  browser = await chromium.launch(process.argv.includes('--gpu') ? fastLaunchOptions() : { headless: true });
  report.browser = `chromium ${browser.version()}`;
  if (!ONLY_CASE || ONLY_CASE === 'partialB2') {
    report.cases.partialB2 = await runResumeCase(browser, baseUrl, 'partial-b2', fixtures.partialB2, (current) =>
      current?.storyStep === 'portal_arrived' && current.ohmAwake === false
        && current.ohmPuzzle?.covered?.includes('g1'), {
        mutate: mutatePartialB2,
        expectedAfterReload: (current) => current?.storyStep === 'portal_arrived' && current.ohmAwake === false
          && current.ohmPuzzle?.covered?.includes('g1') && current.ohmPuzzle?.covered?.includes('g5'),
      });
  }
  if (!ONLY_CASE || ONLY_CASE === 'plazaTools') {
    report.cases.plazaTools = await runResumeCase(browser, baseUrl, 'plaza-tools', fixtures.plazaTools, (current) =>
      current?.storyStep === 'restored_plaza' && current.ohmAwake === true && current.inventory?.jumper === true
        && current.inventory?.brush === true && current.arc1?.currentRegion === 'plaza');
  }
  if (!ONLY_CASE || ONLY_CASE === 'faro') {
    report.cases.faro = await runResumeCase(browser, baseUrl, 'faro', fixtures.faro, (current) =>
      current?.storyStep === 'inside_lighthouse' && current.arc1?.currentRegion === 'faro'
        && current.zones?.some((zone) => zone.id === 'lighthouse' && zone.active));
  }
  if (!ONLY_CASE || ONLY_CASE === 'malformed') report.cases.malformed = await runMalformedCase(browser, baseUrl);
  if (!ONLY_CASE || ONLY_CASE === 'quota') report.cases.quota = await runQuotaCase(browser, baseUrl);
  if (!ONLY_CASE || ONLY_CASE === 'settlingB2') {
    const settlingContext = await browser.newContext({ viewport: VIEWPORT, baseURL: baseUrl });
    const settlingPage = await settlingContext.newPage();
    const settlingSave = createArc1SaveData({ ...fixtures.partialB2, b2: { coveredIds: ['g1', 'g5', 'g4'] } });
    await installSeed(settlingPage, serializeArc1SaveData(settlingSave));
    await enterGame(settlingPage);
    const resumed = await snapshot(settlingPage);
    assert(resumed.ohmAwake && resumed.dialogue?.id === 'ohm_awakening_event',
      'Reload durante estabilización debe continuar el despertar ganado, sin intro ni panel estancado');
    report.cases.settlingB2 = { awakened: true, dialogue: resumed.dialogue.id };
    await settlingContext.close();
  }
  if (!ONLY_CASE || ONLY_CASE === 'awakenedDialogues') {
    report.cases.awakenedDialogues = await runAwakenedDialoguesCase(browser, baseUrl);
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
