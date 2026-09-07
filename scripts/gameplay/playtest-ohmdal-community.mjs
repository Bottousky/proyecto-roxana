import { chromium } from 'playwright';
import { createServer, Socket } from 'node:net';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { fastLaunchOptions } from '../visual/ohmdal-capture-contract.mjs';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const OUT = resolve(ROOT, 'output/playwright/ohmdal-audit-20260906/community');
const ROUTE = '/ohmdal-playcanvas';
const SAVE_KEY = 'ohmdal-playcanvas-arc1-v1';
const INTRO_KEY = 'ohmdal_intro_seen';
const VIEWPORT = { width: 844, height: 390 };
const NAV_TIMEOUT_MS = 30_000;
const SNAPSHOT_TIMEOUT_MS = 20_000;
const MOVEMENT_TIMEOUT_MS = 35_000;
const ONLY_CASE = process.argv.find((arg) => arg.startsWith('--case='))?.slice('--case='.length) ?? null;

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
      spawn('taskkill', ['/pid', String(vite.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
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
  assert(saved, 'el fixture de circuito no produjo ramas válidas');
  return saved;
}

function buildBitacoraSave() {
  const bitacora = new BitacoraManager();
  bitacora.unlock('despertar_ohm', 'discovered');
  bitacora.unlock('taller_lumen', 'investigating');
  return bitacora.getStatuses();
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
  return openCastleGate(state);
}

function buildCastleRestored() {
  let state = enterArc1Region(buildPlazaToolsArc1(), 'castillo');
  state = configureCastleNetwork(state, CASTLE_PARALLEL);
  state = measureCastleNetwork(state);
  state = energizeCastleNetwork(state);
  state = documentCastleNetwork(state);
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
  return documentForgeTerraces(state);
}

function buildFaroRestored() {
  let state = buildForgeRestored();
  state = enterArc1Region(state, 'faro');
  state = measureLighthouse(state);
  state = calibrateLighthouse(state, { voltageTrim: 0, phaseOffset: 0 });
  state = energizeLighthouse(state);
  state = synchronizeLighthouse(state, 0);
  state = synchronizeLighthouse(state, 0);
  return documentLighthouse(state);
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
  arrival: {
    councillor: makeSave({
      arc1: enterArc1Region(buildPlazaToolsArc1(), 'castillo'),
      storyStep: 'inside_castle',
      safeAnchor: { zone: 'castle', anchorId: 'plaza-to-castle' },
    }),
    yesca: makeSave({
      arc1: (() => {
        let state = buildCastleRestored();
        return enterArc1Region(state, 'forja');
      })(),
      storyStep: 'inside_forge_terraces',
      safeAnchor: { zone: 'forge-terraces', anchorId: 'castle-to-forge-terraces' },
    }),
    vega: makeSave({
      arc1: (() => {
        let state = buildCastleRestored();
        state = enterArc1Region(state, 'forja');
        return enterArc1Region(state, 'terrazas');
      })(),
      storyStep: 'inside_forge_terraces',
      safeAnchor: { zone: 'forge-terraces', anchorId: 'castle-to-forge-terraces' },
    }),
    nereo: makeSave({
      arc1: enterArc1Region(buildForgeRestored(), 'faro'),
      storyStep: 'inside_lighthouse',
      safeAnchor: { zone: 'lighthouse', anchorId: 'forge-terraces-to-lighthouse' },
    }),
  },
  restored: {
    councillor: makeSave({
      arc1: buildCastleRestored(),
      storyStep: 'castle_restored',
      safeAnchor: { zone: 'castle', anchorId: 'plaza-to-castle' },
    }),
    yesca: makeSave({
      arc1: buildForgeRestored(),
      storyStep: 'forge_terraces_restored',
      safeAnchor: { zone: 'forge-terraces', anchorId: 'castle-to-forge-terraces' },
    }),
    vega: makeSave({
      arc1: buildForgeRestored(),
      storyStep: 'forge_terraces_restored',
      safeAnchor: { zone: 'forge-terraces', anchorId: 'castle-to-forge-terraces' },
    }),
    nereo: makeSave({
      arc1: buildFaroRestored(),
      storyStep: 'lighthouse_restored',
      safeAnchor: { zone: 'lighthouse', anchorId: 'forge-terraces-to-lighthouse' },
    }),
  },
  finalClass: makeSave({
    arc1: enterArc1Region(buildFaroRestored(), 'retorno'),
    storyStep: 'returning',
    safeAnchor: { zone: 'plaza', anchorId: 'castle-to-plaza' },
  }),
};

function snapshot(page) {
  return page.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__?.getPlaytestSnapshot());
}

async function waitForHooks(page) {
  await page.waitForFunction(() => Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__), null, { timeout: NAV_TIMEOUT_MS });
  return waitForSnapshot(page, (current) => Boolean(current), 'snapshot inicial');
}

async function waitForSnapshot(page, predicate, label, timeoutMs = SNAPSHOT_TIMEOUT_MS) {
  const started = Date.now();
  let current;
  while (Date.now() - started < timeoutMs) {
    current = await snapshot(page);
    if (await predicate(current)) return current;
    await sleep(150);
  }
  throw new Error(`${label}: no se alcanzó el estado esperado: ${JSON.stringify(current)}`);
}

function installSeed(page, raw, seedKey) {
  return page.addInitScript(({ key, introKey, save, sessionKey }) => {
    if (sessionStorage.getItem(sessionKey) !== 'true') {
      localStorage.setItem(key, save);
      localStorage.setItem(introKey, 'true');
      sessionStorage.setItem(sessionKey, 'true');
    }
  }, { key: SAVE_KEY, introKey: INTRO_KEY, save: raw, sessionKey: seedKey });
}

function attachErrors(page) {
  const errors = { pageErrors: [], consoleErrors: [] };
  page.on('pageerror', (error) => errors.pageErrors.push(String(error?.stack || error?.message || error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  return errors;
}

async function enterGame(page) {
  await page.goto(ROUTE, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
  await page.locator('#plaza-enter').tap();
  await waitForHooks(page);
  await sleep(1_000);
}

async function waitForResource(page, filename, label) {
  return waitForSnapshot(page, async () => page.evaluate((name) => (
    performance.getEntriesByType('resource').some((entry) => entry.name.includes(name))
  ), filename), label, NAV_TIMEOUT_MS);
}

async function touchDown(page, key) {
  const button = page.locator(`[data-move-key="${key}"]`);
  const bounds = await button.boundingBox();
  assert(bounds, `Control táctil ${key} no visible`);
  const session = await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [
    { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2, id: 1 },
  ] });
  return { button: session, pointerId: 1 };
}

async function touchUp(session) {
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await session.detach();
}

async function holdTouchUntil(page, key, predicate, description, timeoutMs = MOVEMENT_TIMEOUT_MS) {
  const { button, pointerId } = await touchDown(page, key);
  let current;
  try {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      current = await snapshot(page);
      if (predicate(current)) return current;
      await sleep(50);
    }
  } finally {
    await touchUp(button, pointerId);
  }
  throw new Error(`${description}: movimiento táctil no alcanzó el objetivo: ${JSON.stringify(current)}`);
}

async function dismissDialogue(page, expectedId, label) {
  await waitForSnapshot(page, (current) => current?.dialogue?.id === expectedId, `${label}: diálogo no abrió`);
  const firstLine = await page.locator('#dialog-text').textContent();
  const speaker = await page.locator('#dialog-speaker').textContent();
  let current = await snapshot(page);
  while (current?.dialogue?.id === expectedId) {
    await page.locator('.dialog-card').tap();
    await sleep(100);
    current = await snapshot(page);
  }
  assert(current?.dialogue === null, `${label}: diálogo no cerró: ${JSON.stringify(current?.dialogue)}`);
  return { firstLine, speaker, after: current };
}

async function walkToActor(page, actor) {
  if (actor === 'councillor') {
    await holdTouchUntil(page, 'a', (current) => (current?.position?.[0] ?? 0) >= 65.8,
      'Consejera: desplazamiento lateral');
    return holdTouchUntil(page, 's', (current) => current?.nearestInteractable === 'community_councillor',
      'Consejera: acercamiento al actor');
  }
  if (actor === 'yesca') {
    return holdTouchUntil(page, 'd', (current) => current?.nearestInteractable === 'community_yesca',
      'Yesca: acercamiento al actor');
  }
  if (actor === 'vega') {
    await holdTouchUntil(page, 'a', (current) => (current?.position?.[0] ?? 0) >= 127.3,
      'Vega: rodear la base de la forja por el este');
    return holdTouchUntil(page, 'w', (current) => current?.nearestInteractable === 'community_vega',
      'Vega: acercamiento al actor');
  }
  return holdTouchUntil(page, 'a', (current) => current?.nearestInteractable === 'community_nereo',
    'Nereo: acercamiento al actor');
}

async function runDialogueCase(browser, baseUrl, phase, actor, fixture) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    hasTouch: true,
    isMobile: true,
    baseURL: baseUrl,
  });
  const page = await context.newPage();
  const errors = attachErrors(page);
  const seedKey = `ohmdal-community-${phase}-${actor}`;
  await installSeed(page, serializeArc1SaveData(fixture), seedKey);
  try {
    await enterGame(page);
    const resumed = await waitForSnapshot(page, (current) => current?.nearestInteractable !== null || current?.zones?.some((zone) => zone.active),
      `${phase}/${actor}: zona no quedó activa`);
    await waitForResource(page, `${actor === 'councillor' ? 'consejera' : actor}.glb`, `${phase}/${actor}: GLB no cargó`);
    const before = JSON.stringify(resumed.arc1);
    await walkToActor(page, actor);
    await page.screenshot({ path: resolve(OUT, `${phase}-${actor}-actor-touch.png`), animations: 'disabled' });
    await page.locator('#touch-interact').tap();
    const expectedId = {
      councillor: phase === 'arrival' ? 'castle_councillor_arrival' : 'castle_councillor_restored',
      yesca: phase === 'arrival' ? 'forge_yesca_arrival' : 'forge_yesca_restored',
      vega: phase === 'arrival' ? 'terraces_vega_arrival' : 'terraces_vega_restored',
      nereo: phase === 'arrival' ? 'lighthouse_nereo_arrival' : 'lighthouse_nereo_restored',
    }[actor];
    const dialogue = await dismissDialogue(page, expectedId, `${phase}/${actor}`);
    assert(dialogue.speaker === ({ councillor: 'Consejera', yesca: 'Yesca', vega: 'Vega', nereo: 'Nereo' }[actor]),
      `${phase}/${actor}: speaker inesperado ${dialogue.speaker}`);
    assert(JSON.stringify(dialogue.after.arc1) === before,
      `${phase}/${actor}: cerrar el diálogo alteró progreso: ${JSON.stringify({ before, after: dialogue.after.arc1 })}`);
    assert(dialogue.after.storyStep === resumed.storyStep,
      `${phase}/${actor}: cerrar el diálogo alteró storyStep: ${resumed.storyStep} -> ${dialogue.after.storyStep}`);
    await page.screenshot({ path: resolve(OUT, `${phase}-${actor}-dialogue-touch.png`), animations: 'disabled' });
    return {
      phase,
      actor,
      dialogueId: expectedId,
      speaker: dialogue.speaker,
      firstLine: dialogue.firstLine,
      progressUnchanged: true,
      glb: actor === 'councillor' ? 'consejera.glb' : `${actor}.glb`,
      screenshots: [`${phase}-${actor}-actor-touch.png`, `${phase}-${actor}-dialogue-touch.png`],
      resumed: { storyStep: resumed.storyStep, region: resumed.arc1.currentRegion },
      errors,
    };
  } finally {
    await context.close();
  }
}

async function runFinalClassCase(browser, baseUrl, fixture) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    hasTouch: true,
    isMobile: true,
    baseURL: baseUrl,
  });
  const page = await context.newPage();
  const errors = attachErrors(page);
  await installSeed(page, serializeArc1SaveData(fixture), 'ohmdal-community-final-class');
  try {
    await enterGame(page);
    const before = await waitForSnapshot(page, (current) => current?.storyStep === 'returning' && current?.arc1?.currentRegion === 'retorno',
      'primera clase: fixture de regreso no reanudó');
    assert(before.arc1.progress.arcComplete === false, 'primera clase: fixture ya estaba completo');
    await waitForResource(page, 'edda.glb', 'primera clase: GLB de Edda no cargó');
    await holdTouchUntil(page, 'a', (current) => current?.position?.[0] <= -3,
      'primera clase: rodear pedestal por el oeste');
    await holdTouchUntil(page, 'w', (current) => current?.position?.[2] <= -2,
      'primera clase: avanzar al encuentro sin atravesar a Ohm');
    await holdTouchUntil(page, 'd', (current) => current?.nearestInteractable === 'ohm_automaton_pedestal',
      'primera clase: llegada al encuentro de Ohm');
    await page.locator('#touch-interact').tap();
    await waitForSnapshot(page, (current) => current?.dialogue?.id === 'arc1_first_class',
      'primera clase: diálogo no abrió');
    await waitForResource(page, 'lumen.glb', 'primera clase: GLB de Lumen no cargó');
    await page.screenshot({ path: resolve(OUT, 'final-class-actors-touch.png'), animations: 'disabled' });
    const observed = await snapshot(page);
    const untouchedNetwork = JSON.stringify({ arc1: observed.arc1, circuit: observed.circuit });
    assert(observed.firstClass.phase === 'observe' && observed.firstClass.current === 0
      && !observed.firstClass.bridgeClosed && !observed.firstClass.verified,
      'primera clase: debe empezar con retorno abierto y sin corriente');
    await page.locator('.dialog-card').tap();
    await waitForSnapshot(page, (current) => current?.firstClass?.phase === 'operate', 'primera clase: Edda no operó');
    const operated = await waitForSnapshot(page, (current) => current?.firstClass?.readyToVerify, 'primera clase: el puente no terminó de colocarse');
    assert(operated.firstClass.current > 0 && operated.firstClass.lightOn && !operated.firstClass.verified,
      'primera clase: cerrar debe cambiar lectura, pero no verificar por sí solo');
    assert(JSON.stringify({ arc1: operated.arc1, circuit: operated.circuit }) === untouchedNetwork,
      'primera clase: la práctica modificó la red de campaña');
    await page.screenshot({ path: resolve(OUT, 'final-class-operated-touch.png'), animations: 'disabled' });
    await page.locator('.dialog-card').tap();
    const verified = await waitForSnapshot(page, (current) => current?.firstClass?.verified, 'primera clase: falta verificación');
    assert(verified.storyStep === 'returning' && !verified.arc1.progress.arcComplete,
      'primera clase: el cierre se concedió antes de terminar la escena');
    await page.screenshot({ path: resolve(OUT, 'final-class-verified-touch.png'), animations: 'disabled' });
    const completed = await dismissDialogue(page, 'arc1_first_class', 'primera clase');
    assert(JSON.stringify(completed.after.position) === JSON.stringify(observed.position)
      && completed.after.yaw === before.yaw,
      'primera clase: la cámara no devolvió orientación y pies del jugador');
    assert(completed.after.storyStep === 'arc1_complete',
      `primera clase: cierre no completó el arco: ${JSON.stringify(completed.after)}`);
    assert(completed.after.arc1.progress.arcComplete === true,
      `primera clase: progreso final no quedó completo: ${JSON.stringify(completed.after.arc1.progress)}`);
    const rawBeforeReload = await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY);
    assert(rawBeforeReload, 'primera clase: no existe save final antes de reload');
    await page.screenshot({ path: resolve(OUT, 'final-class-complete-touch.png'), animations: 'disabled' });
    await page.reload({ waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
    await page.locator('#plaza-enter').tap();
    const afterReload = await waitForSnapshot(page, (current) => current?.storyStep === 'arc1_complete' && current?.dialogue === null,
      'primera clase: estado final no persistió tras reload');
    assert(afterReload.arc1.progress.arcComplete === true,
      `primera clase: reload perdió progreso final: ${JSON.stringify(afterReload.arc1.progress)}`);
    assert(afterReload.firstClass.verified && afterReload.firstClass.lightOn,
      'primera clase: el banco no conservó su presentación verificada tras reload');
    await page.screenshot({ path: resolve(OUT, 'final-class-reload-touch.png'), animations: 'disabled' });
    return {
      before: { storyStep: before.storyStep, region: before.arc1.currentRegion },
      dialogueId: 'arc1_first_class',
      progressAfterDialogue: completed.after.arc1.progress,
      persistedAfterReload: {
        storyStep: afterReload.storyStep,
        region: afterReload.arc1.currentRegion,
        arcComplete: afterReload.arc1.progress.arcComplete,
      },
      characterAssets: ['edda.glb', 'lumen.glb'],
      recordOwnership: 'source-contract: LumenFirstClassRecord is attached to LumenNPC, not its fallback child',
      screenshots: ['final-class-actors-touch.png', 'final-class-complete-touch.png', 'final-class-reload-touch.png'],
      errors,
    };
  } finally {
    await context.close();
  }
}

async function sourceContracts() {
  const [actorsSource, runtimeSource] = await Promise.all([
    readFile(resolve(ROOT, 'src/experiences/ohmdal-playcanvas/world/arc1/communityActors.ts'), 'utf8'),
    readFile(resolve(ROOT, 'src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts'), 'utf8'),
  ]);
  return {
    rolePropOutsideFallback: actorsSource.includes('const roleProp = addRoleProp(root,'),
    firstClassRecordOnLumenRoot: runtimeSource.includes("world.lumenNpcEntity.addChild(firstClassRecord)"),
    sourceActorRoots: ['councillor', 'yesca', 'vega', 'nereo'].every((id) => runtimeSource.includes(`communityActors.actors.${id}`)),
  };
}

await mkdir(OUT, { recursive: true });
const port = await getFreePort();
const baseUrl = `http://127.0.0.1:${port}`;
const { vite, log: viteLog } = startVite(port);
const report = {
  schemaVersion: 1,
  route: ROUTE,
  viewport: { ...VIEWPORT, hasTouch: true, isMobile: true },
  saveKey: SAVE_KEY,
  result: 'RUNNING',
  cases: {},
  contracts: await sourceContracts(),
};
let browser = null;

try {
  assert(await portReachable(port), `Vite no se levantó en ${port}: ${viteLog.join('').slice(-2000)}`);
  browser = await chromium.launch(process.argv.includes('--gpu') ? fastLaunchOptions() : { headless: true });
  report.browser = `chromium ${browser.version()}`;
  assert(report.contracts.rolePropOutsideFallback && report.contracts.firstClassRecordOnLumenRoot && report.contracts.sourceActorRoots,
    `contratos de actores incompletos: ${JSON.stringify(report.contracts)}`);

  if (!ONLY_CASE || ONLY_CASE === 'arrival') {
    report.cases.arrival = {};
    for (const actor of ['councillor', 'yesca', 'vega', 'nereo']) {
      report.cases.arrival[actor] = await runDialogueCase(browser, baseUrl, 'arrival', actor, fixtures.arrival[actor]);
    }
  }
  if (!ONLY_CASE || ONLY_CASE === 'restored') {
    report.cases.restored = {};
    for (const actor of ['councillor', 'yesca', 'vega', 'nereo']) {
      report.cases.restored[actor] = await runDialogueCase(browser, baseUrl, 'restored', actor, fixtures.restored[actor]);
    }
  }
  if (!ONLY_CASE || ONLY_CASE === 'final') {
    report.cases.finalClass = await runFinalClassCase(browser, baseUrl, fixtures.finalClass);
  }

  for (const phase of Object.values(report.cases)) {
    const cases = phase && !Array.isArray(phase) && !phase.dialogueId ? Object.values(phase) : [phase];
    for (const entry of cases) {
      assert(entry?.errors?.pageErrors?.length === 0, `pageerror en caso comunitario: ${JSON.stringify(entry.errors.pageErrors)}`);
      assert(entry?.errors?.consoleErrors?.length === 0, `console.error en caso comunitario: ${JSON.stringify(entry.errors.consoleErrors)}`);
    }
  }
  report.result = 'PASS';
  report.finishedAt = new Date().toISOString();
  const reportPath = resolve(OUT, 'community-run.json');
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ result: report.result, report: reportPath, cases: Object.keys(report.cases) }, null, 2));
} catch (error) {
  report.result = 'FAIL';
  report.failure = String(error?.stack || error?.message || error);
  report.finishedAt = new Date().toISOString();
  report.viteLogTail = viteLog.join('').slice(-2000);
  const reportPath = resolve(OUT, 'community-run.json');
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.error(JSON.stringify({ result: report.result, report: reportPath, failure: report.failure }, null, 2));
  process.exitCode = 1;
} finally {
  await browser?.close().catch(() => {});
  stopVite(vite);
}
