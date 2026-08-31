import { spawn } from 'node:child_process';
import { createServer, Socket } from 'node:net';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const OUT = resolve(ROOT, 'output/playwright/ohmdal-hardening/golden-path');
const VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const ROUTE = '/ohmdal-playcanvas';
const NAV_TIMEOUT_MS = 30_000;
const STEP_TIMEOUT_MS = 20_000;

await mkdir(OUT, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function distanceXZ(a, b) {
  return Math.hypot(a[0] - b.x, a[2] - b.z);
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

async function portReachable(port, timeoutMs = 30_000) {
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
  // .cmd is required on Windows; shell=true keeps the invocation compatible
  // with both npm's Windows shims and POSIX shells.
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
    // Cleanup is best effort; the test result is already recorded.
  }
}

const port = await getFreePort();
const baseUrl = `http://127.0.0.1:${port}`;
const { vite, log: viteLog } = startVite(port);
let browser = null;
let context = null;
let page = null;
const consoleMessages = [];
const pageErrors = [];
const checkpoints = [];
const artifact = {
  schemaVersion: 1,
  route: ROUTE,
  startedAt: new Date().toISOString(),
  baseUrl,
  browser: null,
  checkpoints,
  errors: { console: consoleMessages, page: pageErrors },
  movement: [],
  result: 'RUNNING',
};

const runPath = resolve(OUT, 'golden-path-run.json');

async function persistRun() {
  await writeFile(runPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
}

function attachPageDiagnostics(targetPage) {
  targetPage.on('console', (message) => {
    const type = message.type();
    if (type === 'error' || type === 'warning') {
      consoleMessages.push({ type, text: message.text() });
    }
  });
  targetPage.on('pageerror', (error) => {
    pageErrors.push(String(error?.stack || error?.message || error));
  });
}

async function snapshot() {
  return page.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__?.getPlaytestSnapshot());
}

async function diagnostics() {
  return page.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__?.getDiagnostics());
}

async function waitForSnapshot(predicate, label, timeoutMs = STEP_TIMEOUT_MS) {
  const started = Date.now();
  let latest;
  while (Date.now() - started < timeoutMs) {
    latest = await snapshot();
    if (latest && predicate(latest)) return latest;
    await sleep(100);
  }
  throw new Error(`Timeout esperando ${label}; último snapshot: ${JSON.stringify(latest)}`);
}

async function recordCheckpoint(id, options = {}) {
  console.log(`[golden-path] checkpoint ${id}`);
  const current = await snapshot();
  assert(current, `No hay snapshot para checkpoint ${id}`);
  const checkpointPath = resolve(OUT, `${id}.png`);
  await page.screenshot({ path: checkpointPath, animations: 'disabled' });
  const entry = {
    id,
    at: new Date().toISOString(),
    screenshot: checkpointPath,
    snapshot: current,
    diagnostics: options.includeDiagnostics === false ? null : await diagnostics(),
  };
  checkpoints.push(entry);
  await persistRun();
  return current;
}

function candidateMovementKeys(yaw) {
  const rad = (yaw * Math.PI) / 180;
  return [
    { key: 'w', x: -Math.sin(rad), z: -Math.cos(rad) },
    { key: 's', x: Math.sin(rad), z: Math.cos(rad) },
    { key: 'a', x: -Math.cos(rad), z: Math.sin(rad) },
    { key: 'd', x: Math.cos(rad), z: -Math.sin(rad) },
  ];
}

async function moveTo(x, z, tolerance = 1.35, label = `(${x}, ${z})`) {
  console.log(`[golden-path] move ${label}`);
  const started = Date.now();
  const trace = { label, target: { x, z }, pulses: 0, start: null, end: null };
  let lastDistance = Number.POSITIVE_INFINITY;
  let stalledPulses = 0;
  let current = await snapshot();
  try {
    for (let pulse = 0; pulse < 260; pulse += 1) {
      assert(current, `No hay snapshot durante movimiento a ${label}`);
      trace.start ??= current.position;
      const remaining = distanceXZ(current.position, { x, z });
      if (remaining <= tolerance) {
        trace.end = current.position;
        trace.pulses = pulse;
        console.log(`[golden-path] arrived ${label} at ${JSON.stringify(current.position)}`);
        artifact.movement.push(trace);
        await persistRun();
        return current;
      }

      const dx = (x - current.position[0]) / remaining;
      const dz = (z - current.position[2]) / remaining;
      const candidates = candidateMovementKeys(current.yaw)
        .map((candidate) => ({ ...candidate, score: candidate.x * dx + candidate.z * dz }))
        .sort((a, b) => b.score - a.score);
      const selected = stalledPulses >= 8 ? candidates[1] ?? candidates[0] : candidates[0];
      if (stalledPulses >= 24) {
        throw new Error(`Movimiento bloqueado hacia ${label}; distancia ${remaining.toFixed(2)}m`);
      }
      const pulseMs = Math.max(90, Math.min(220, Math.round(remaining * 30)));

      await page.keyboard.down(selected.key);
      await sleep(pulseMs);
      await page.keyboard.up(selected.key);
      await sleep(35);

      current = await snapshot();
      const afterDistance = current ? distanceXZ(current.position, { x, z }) : remaining;
      stalledPulses = afterDistance >= lastDistance - 0.035 ? stalledPulses + 1 : 0;
      lastDistance = afterDistance;
      trace.pulses = pulse + 1;
    }
    throw new Error(`No se pudo llegar a ${label}; distancia final ${lastDistance.toFixed(2)}m`);
  } finally {
    trace.end ??= current?.position ?? (await snapshot())?.position ?? null;
    if (!artifact.movement.includes(trace)) {
      artifact.movement.push(trace);
      await persistRun();
    }
    if (Date.now() - started > STEP_TIMEOUT_MS * 2) {
      trace.slow = true;
    }
  }
}

async function pressInteraction(label) {
  console.log(`[golden-path] interact ${label}`);
  await page.keyboard.press('e');
  await sleep(150);
  return waitForSnapshot(() => true, `${label} snapshot`, 2_000);
}

async function pressTouchInteraction(label) {
  console.log(`[golden-path] touch interact ${label}`);
  const button = page.locator('#touch-interact');
  assert(await button.isVisible(), `${label}: control táctil no visible`);
  await button.click();
  await sleep(150);
  return waitForSnapshot(() => true, `${label} touch snapshot`, 2_000);
}

async function recordResponsiveCheckpoint(id) {
  await page.setViewportSize(MOBILE_VIEWPORT);
  await sleep(180);
  assert(await page.locator('#touch-interact').isVisible(), `${id}: controles touch no visibles`);
  await recordCheckpoint(`${id}-mobile`, { includeDiagnostics: true });
  await page.setViewportSize(VIEWPORT);
  await sleep(180);
  await recordCheckpoint(`${id}-desktop`, { includeDiagnostics: true });
  await page.setViewportSize(MOBILE_VIEWPORT);
  await sleep(180);
}

async function waitForDialogue(id) {
  console.log(`[golden-path] wait dialogue ${id}`);
  return waitForSnapshot((current) => current.dialogue?.id === id, `diálogo ${id}`);
}

async function drainDialogue(label) {
  console.log(`[golden-path] drain dialogue ${label}`);
  for (let index = 0; index < 24; index += 1) {
    const current = await snapshot();
    if (!current?.dialogue) return current;
    await page.keyboard.press('e');
    await sleep(110);
  }
  throw new Error(`Diálogo ${label} no terminó después de 24 avances`);
}

async function advanceDialogueNode(expectedId, label = expectedId) {
  console.log(`[golden-path] advance dialogue ${label}`);
  for (let index = 0; index < 24; index += 1) {
    const current = await snapshot();
    if (!current?.dialogue || current.dialogue.id !== expectedId) return current;
    await page.keyboard.press('e');
    await sleep(110);
  }
  throw new Error(`Diálogo ${label} no avanzó fuera de ${expectedId} después de 24 avances`);
}

async function waitUntilStory(step, label = step) {
  return waitForSnapshot((current) => current.storyStep === step, `storyStep ${label}`);
}

function zone(current, id) {
  return current.zones.find((entry) => entry.id === id);
}

async function assertNoBlockingModals(label) {
  const modals = await page.evaluate(() => ['#plaza-dialog', '#workbench-modal', '#bitacora-modal']
    .map((selector) => ({ selector, hidden: document.querySelector(selector)?.classList.contains('hidden') ?? true })));
  assert(modals.every((modal) => modal.hidden), `${label}: modal bloqueante activo: ${JSON.stringify(modals)}`);
}

try {
  assert(await portReachable(port), `Vite no se levantó en ${port}; log: ${viteLog.join('').slice(-2000)}`);

  browser = await chromium.launch({ headless: true });
  artifact.browser = `chromium ${browser.version()}`;
  context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  page = await context.newPage();
  attachPageDiagnostics(page);

  await page.goto(`${baseUrl}${ROUTE}`, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
  await page.locator('#plaza-enter').click();
  await page.waitForFunction(() => Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__), null, { timeout: NAV_TIMEOUT_MS });
  await sleep(1_100);

  let current = await waitForDialogue('intro_portal_edda');
  await drainDialogue('intro_portal_edda');
  current = await waitForSnapshot((state) => !state.dialogue && state.storyStep === 'portal_arrived', 'portal dialogue complete');
  assert(zone(current, 'plaza')?.active, 'Plaza no está activa al entrar');
  assert(!zone(current, 'workshop')?.active, 'Workshop activo antes de entrar');
  assert(!zone(current, 'manantial')?.loaded, 'Manantial cargado antes de abrir Omega');
  await recordCheckpoint('portal', { includeDiagnostics: true });

  await moveTo(0, -2, 1.7, 'Ohm pedestal');
  await pressInteraction('Ohm awakening');
  await waitForDialogue('ohm_awakening_event');
  current = await waitUntilStory('ohm_awakened');
  assert(current.ohmAwake, 'Ohm no quedó despierto');
  await advanceDialogueNode('ohm_awakening_event');
  await waitForDialogue('edda_surprised_awakening');
  await drainDialogue('edda_surprised_awakening');
  current = await waitUntilStory('invited_to_workshop');
  assert(current.ohmAwake, 'Ohm perdió estado despierto tras diálogo de Edda');
  await recordCheckpoint('ohm-awakened', { includeDiagnostics: false });

  await moveTo(-7.4, -4.0, 1.9, 'workshop_exterior_door');
  await pressInteraction('workshop exterior door');
  current = await waitUntilStory('inside_workshop');
  assert(zone(current, 'workshop')?.active, 'Workshop no activo dentro');
  await recordCheckpoint('inside-workshop', { includeDiagnostics: true });

  // The workbench collider occupies the direct centre approach. Stop just
  // outside its west edge, still inside Lumen's 3.5m interaction radius.
  await moveTo(-63.0, -0.6, 0.8, 'Lumen workshop bench approach');
  await pressInteraction('Lumen workshop dialogue');
  await waitForDialogue('lumen_workshop_interior');
  await drainDialogue('lumen_workshop_interior');
  current = await waitUntilStory('tools_received');
  assert(current.inventory.jumper && current.inventory.brush, 'No se recibieron Puente y Cepillo');
  await recordCheckpoint('tools-received', { includeDiagnostics: false });

  await moveTo(-60, -4.6, 1.8, 'workshop_exit_door');
  await pressInteraction('workshop exit door');
  current = await waitUntilStory('returned_to_plaza');
  assert(!zone(current, 'workshop')?.active, 'Workshop sigue activo después de salir');
  await recordCheckpoint('returned-to-plaza', { includeDiagnostics: false });

  // fuente_motor_in is enclosed by its authored collision volume, so its
  // centre cannot be reached with real movement. retorno_sur is an exposed
  // probe target with no dominant interactable and exercises the same tool
  // path without teleporting or bypassing collision.
  await moveTo(-3.5, -4.0, 1.2, 'workshop exit corridor waypoint');
  await moveTo(-3.0, 6.5, 1.2, 'retorno_sur north waypoint');
  await moveTo(-0.8, 6.5, 1.65, 'retorno_sur probe');
  current = await waitForSnapshot((state) => state.nearestInteractable === null, 'probe target sin interactuable dominante');
  await page.keyboard.press('e');
  current = await waitForSnapshot((state) => state.galvanoscope.probeA === 'retorno_sur', 'probe A en retorno_sur');
  assert(current.galvanoscope.probeA === 'retorno_sur', 'El Galvanoscopio no conectó la punta A');
  assert(Number.isFinite(current.galvanoscope.measuredVoltage), 'Medición de voltaje no observable');
  assert(Number.isFinite(current.galvanoscope.measuredResistance), 'Medición de resistencia no observable');
  assert(Number.isFinite(current.galvanoscope.measuredCurrent), 'Medición de corriente no observable');
  await recordCheckpoint('galvanoscope-measurement', { includeDiagnostics: false });

  await moveTo(-3.0, 6.5, 1.2, 'moho_oxido west waypoint');
  await moveTo(-3.0, -4.0, 1.2, 'moho_oxido south waypoint');
  await moveTo(-3.2, -4.4, 0.35, 'moho_oxido interaction edge');
  current = await waitForSnapshot((state) => state.nearestInteractable === 'moho_oxido', 'moho_oxido dominante');
  current = await pressInteraction('moho_oxido');
  current = await waitForSnapshot((state) => state.circuit.corrosionClosed && Math.abs(state.circuit.corrosionResistance - 0.05) < 0.001, 'moho_oxido limpiado');
  assert(current.inventory.brush, 'Cepillo no disponible al limpiar moho');
  await recordCheckpoint('corrosion-cleaned', { includeDiagnostics: false });

  // Brecha and Ohm's generous interaction radii overlap at the centre. Use
  // the open northern edge of the brecha: it remains within its radius while
  // staying outside Ohm before the ordered interaction scan runs.
  await moveTo(-0.9, 3.5, 0.45, 'brecha_retorno north edge');
  current = await waitForSnapshot((state) => state.nearestInteractable === 'brecha_retorno', 'brecha_retorno dominante');
  await pressInteraction('brecha_retorno');
  current = await waitForSnapshot((state) => state.circuit.jumperClosed, 'brecha_retorno instalada');
  assert(current.inventory.jumper, 'Puente no disponible al instalarlo');
  await recordCheckpoint('jumper-installed', { includeDiagnostics: false });
  // Keep the branch sequence deterministic if a transient circuit dialogue
  // is rendered between the second and third player-facing actions.
  await sleep(300);
  current = await snapshot();
  if (current?.dialogue?.id === 'circuit_solved_dialog') {
    await drainDialogue('pre-bell circuit state');
  }
  current = await waitForSnapshot((state) => state.dialogue === null, 'diálogo previo a campana cerrado');

  await moveTo(-3.0, 0.5, 0.45, 'campana south waypoint');
  await moveTo(-5.2, 0.8, 0.45, 'campana interaction edge');
  current = await waitForSnapshot((state) => state.nearestInteractable === 'campana', 'campana dominante');
  await pressInteraction('campana');
  current = await waitForSnapshot((state) => state.circuit.relayClosed && state.circuit.gateOpen, 'campana y relé');
  assert(current.circuit.corrosionClosed && current.circuit.jumperClosed, 'La campana abrió antes de cerrar las tres ramas');
  await waitForDialogue('circuit_solved_dialog');
  await recordCheckpoint('after-gate-open', { includeDiagnostics: true });
  await drainDialogue('circuit_solved_dialog');
  current = await waitUntilStory('gate_opened');
  assert(zone(current, 'manantial')?.loaded, 'Manantial no fue precargado tras abrir Omega');

  await moveTo(-3.0, 0.5, 0.45, 'puerta_ohm campana exit waypoint');
  await moveTo(-3.0, 6.5, 1.0, 'puerta_ohm west waypoint');
  await moveTo(0, 8.0, 0.8, 'puerta_ohm approach');
  current = await waitForSnapshot((state) => state.nearestInteractable === 'puerta_ohm', 'puerta_ohm dominante');
  await pressInteraction('puerta_ohm');
  current = await waitUntilStory('inside_manantial');
  assert(zone(current, 'plaza')?.active, 'Plaza dejó de estar activa al cruzar');
  assert(zone(current, 'manantial')?.loaded, 'Manantial no está loaded al cruzar');
  assert(zone(current, 'manantial')?.active, 'Manantial no está active al cruzar');
  await assertNoBlockingModals('inside_manantial');
  await recordCheckpoint('inside-manantial', { includeDiagnostics: true });

  // G1 — diagnose, provoke one informative protection trip, restore, verify.
  await page.setViewportSize(MOBILE_VIEWPORT);
  await sleep(200);
  await pressTouchInteraction('Manantial lectura inicial');
  current = await waitForSnapshot((state) => state.arc1.manantial.measurements.length === 1, 'primera medición Manantial');

  await moveTo(-4.2, 16.0, 1.0, 'Manantial intake x waypoint');
  await moveTo(-4.2, 18.4, 0.8, 'Manantial intake gate');
  current = await waitForSnapshot((state) => state.nearestInteractable === 'manantial_intake_gate', 'compuerta Manantial');
  await pressTouchInteraction('abrir compuerta Manantial');
  assert((await snapshot()).arc1.manantial.gateOpen, 'La compuerta hidráulica no quedó abierta');

  await moveTo(-4.2, 16.0, 0.8, 'Manantial breaker west waypoint');
  await moveTo(2.2, 16.0, 0.7, 'Manantial output breaker');
  await pressTouchInteraction('energización fallida Manantial');
  current = await waitForSnapshot((state) => state.arc1.manantial.protectiveTrip, 'protección Manantial actuada');
  assert(current.arc1.manantial.failedEnergizations === 1, 'G1 no registró la falla productiva');

  await moveTo(4.2, 16.0, 0.8, 'Manantial exciter south waypoint');
  await moveTo(4.2, 18.4, 0.7, 'Manantial exciter bridge');
  await pressTouchInteraction('reparar retorno Manantial');
  current = await waitForSnapshot((state) => state.arc1.manantial.returnBridgeInstalled && !state.arc1.manantial.protectiveTrip, 'retorno Manantial reparado');

  await moveTo(4.2, 16.0, 0.8, 'Manantial breaker east waypoint');
  await moveTo(2.2, 16.0, 0.7, 'Manantial output breaker restored');
  await pressTouchInteraction('energizar Manantial restaurado');
  current = await waitForSnapshot((state) => state.arc1.manantial.excitationEnabled, 'excitación Manantial activa');

  await moveTo(0, 16.0, 0.55, 'Manantial verification point');
  await pressTouchInteraction('verificar salida Manantial');
  current = await waitForSnapshot((state) => state.arc1.progress.manantialRestored, 'Manantial restaurado');
  assert(current.arc1.manantial.measurements.length >= 2, 'G1 no conserva mediciones antes/después');
  await recordResponsiveCheckpoint('manantial-restored');

  await moveTo(0, 13.5, 0.6, 'Manantial return gate');
  await pressTouchInteraction('regreso Plaza restaurada');
  current = await waitUntilStory('restored_plaza');
  assert(current.arc1.currentRegion === 'plaza', 'El retorno de G1 no actualizó región Plaza');
  await recordResponsiveCheckpoint('plaza-restored');

  // G2 — the same physical bell closes the relay fed by restored Manantial.
  await moveTo(-3.0, 6.5, 0.8, 'restored Plaza bell west waypoint');
  await moveTo(-3.2, 0.5, 0.55, 'restored Plaza bell south waypoint');
  await moveTo(-5.2, 0.8, 0.75, 'restored Plaza bell interaction edge');
  await pressTouchInteraction('Campana con red restaurada');
  current = await waitForSnapshot((state) => state.arc1.progress.castleGateOpen, 'apertura Castle derivada');
  assert(current.arc1.plaza.bellPulls === 1, 'G2 no registró la Campana física');

  await moveTo(-3.0, 6.5, 0.8, 'Castle route west waypoint');
  await moveTo(0, 8.0, 0.75, 'Castle route');
  current = await waitForSnapshot((state) => state.nearestInteractable === 'castle_route', 'ruta Castle dominante');
  await pressTouchInteraction('entrar al Castillo');
  current = await waitUntilStory('inside_castle');
  assert(zone(current, 'castle')?.active, 'Castle no está active al entrar');
  assert(!zone(current, 'plaza')?.active, 'Plaza sigue active durante Castle');

  // G3 — choose one of two model-valid layouts, measure that exact layout,
  // energize, document and leave through the physical gate.
  await moveTo(53.8, -4.0, 0.9, 'Castle parallel south waypoint');
  await moveTo(53.8, 0, 0.75, 'Castle parallel layout');
  await pressTouchInteraction('configurar paralelo Castle');
  await moveTo(60, -4.0, 0.8, 'Castle bus south waypoint');
  await moveTo(60, -8.0, 0.65, 'Castle bus measure');
  await pressTouchInteraction('medir Castle configurado');
  current = await waitForSnapshot((state) => state.arc1.castle.measurements.at(-1)?.topology === 'parallel', 'medición Castle paralela');
  await moveTo(60, 0, 0.7, 'Castle distribution panel');
  await pressTouchInteraction('energizar Castle');
  current = await waitForSnapshot((state) => state.arc1.castle.energized, 'Castle energizado');
  await moveTo(66.2, 0, 0.75, 'Castle document station');
  await pressTouchInteraction('documentar Castle');
  current = await waitForSnapshot((state) => state.arc1.progress.castleRestored, 'Castle restaurado');
  assert(current.arc1.castle.protectiveTrip === false, 'Castle quedó con protección actuada');
  await recordResponsiveCheckpoint('castle-restored');

  await moveTo(63.0, 4.0, 0.8, 'Castle exit east waypoint');
  await moveTo(60, 8.0, 0.75, 'Castle exit gate');
  await pressTouchInteraction('salir hacia Forja');
  current = await waitUntilStory('inside_forge_terraces');
  assert(zone(current, 'forge-terraces')?.active, 'Forge/Terraces no está active');

  // G4 — explicit 5A/3A trade-off, medium conductor and matched protection.
  await moveTo(124.2, -12.0, 0.9, 'Forge heater south waypoint');
  await moveTo(124.2, -8.0, 0.75, 'Forge heater allocation');
  await pressTouchInteraction('priorizar Forja');
  await moveTo(120, -4.0, 0.8, 'Forge panel south waypoint');
  await moveTo(120, 0, 0.7, 'Forge distribution panel');
  await pressTouchInteraction('dimensionar conductor y protecciones');
  await moveTo(120, -8.0, 0.65, 'Forge bus measure');
  await pressTouchInteraction('medir Forja/Terrazas');
  current = await waitForSnapshot((state) => state.arc1.forgeTerraces.measurements.length > 0, 'medición Forja/Terrazas');
  await moveTo(120, 0, 0.7, 'Forge distribution panel energized');
  await pressTouchInteraction('energizar Forja/Terrazas');
  current = await waitForSnapshot((state) => state.arc1.forgeTerraces.energized, 'Forja/Terrazas energizadas');
  await moveTo(120, 16, 0.75, 'Terraces pump control');
  await pressTouchInteraction('documentar trade-off Forja/Terrazas');
  current = await waitForSnapshot((state) => state.arc1.progress.forgeTerracesRestored, 'Forja/Terrazas restauradas');
  assert(current.arc1.visitedRegions.includes('terrazas'), 'La ruta no atravesó Terrazas');
  await recordResponsiveCheckpoint('forge-terraces-restored');

  await moveTo(120, 24, 0.75, 'Terraces exit');
  await pressTouchInteraction('continuar al Faro');
  current = await waitUntilStory('inside_lighthouse');
  assert(zone(current, 'lighthouse')?.active, 'Lighthouse no está active');

  // G5 — validated DC culmination; no RC/capacitor seam is introduced.
  await pressTouchInteraction('medir barra DC Faro');
  current = await waitForSnapshot((state) => state.arc1.lighthouse.measurements.length === 1, 'medición Faro');
  await moveTo(180, 0, 0.7, 'Lighthouse calibration panel');
  await pressTouchInteraction('calibrar Faro');
  await moveTo(180, 8, 0.75, 'Lighthouse beacon control');
  await pressTouchInteraction('energizar Faro');
  await pressTouchInteraction('sincronización Faro 1');
  await pressTouchInteraction('sincronización Faro 2');
  current = await waitForSnapshot((state) => state.arc1.lighthouse.synchronizationSamples === 2, 'dos sincronizaciones Faro');
  await moveTo(180, 14, 0.7, 'Lighthouse return marker');
  await pressTouchInteraction('registrar Faro e iniciar retorno');
  current = await waitUntilStory('returning');
  assert(current.arc1.progress.lighthouseRestored, 'Faro no quedó restaurado antes del retorno');
  assert(current.arc1.lighthouse.mode === 'dc', 'Faro inventó una capa distinta de la culminación DC');
  await recordResponsiveCheckpoint('lighthouse-restored-return');

  // G6 — physically backtrack through restored loaded zones, then close at
  // the Portal marker without fabricated epilogue dialogue.
  await pressTouchInteraction('retorno por Terrazas');
  current = await waitForSnapshot((state) => zone(state, 'castle')?.active, 'retorno Castle active');
  await pressTouchInteraction('retorno por Castillo');
  current = await waitForSnapshot((state) => zone(state, 'plaza')?.active, 'retorno Plaza active');
  await moveTo(-3.0, 6.5, 0.8, 'final Plaza west waypoint');
  await moveTo(-3.0, -2.0, 0.8, 'final Portal south waypoint');
  await moveTo(0, -2.0, 2.0, 'final Ohm marker');
  await waitForSnapshot((state) => state.nearestInteractable === 'ohm_automaton_pedestal', 'marcador final de Ohm');
  await pressTouchInteraction('cerrar Arco I greybox');
  current = await waitUntilStory('arc1_complete');
  assert(current.arc1.progress.arcComplete, 'El cierre no deriva de todos los estados y el retorno');
  assert(current.arc1.finalReturnReached, 'El retorno final no quedó registrado');
  await recordResponsiveCheckpoint('arc1-complete');

  assert(consoleMessages.filter((entry) => entry.type === 'error').length === 0,
    `Console errors observados: ${JSON.stringify(consoleMessages.filter((entry) => entry.type === 'error'))}`);
  assert(pageErrors.length === 0, `Page errors observados: ${JSON.stringify(pageErrors)}`);
  await assertNoBlockingModals('final');

  artifact.result = 'PASS';
  artifact.finishedAt = new Date().toISOString();
  artifact.viteLogTail = viteLog.join('').slice(-2000);
  await persistRun();
  console.log(JSON.stringify({ result: artifact.result, run: runPath, checkpoints: checkpoints.length }, null, 2));
} catch (error) {
  artifact.result = 'FAIL';
  artifact.failure = { message: String(error?.stack || error?.message || error) };
  artifact.finishedAt = new Date().toISOString();
  artifact.viteLogTail = viteLog.join('').slice(-2000);
  if (page) {
    try {
      const failurePath = resolve(OUT, 'failure.png');
      await page.screenshot({ path: failurePath, animations: 'disabled' });
      artifact.failure.screenshot = failurePath;
    } catch (screenshotError) {
      artifact.failure.screenshotError = String(screenshotError?.message || screenshotError);
    }
  }
  await persistRun();
  console.error(JSON.stringify({ result: artifact.result, run: runPath, failure: artifact.failure }, null, 2));
  process.exitCode = 1;
} finally {
  await context?.close().catch(() => {});
  await browser?.close().catch(() => {});
  stopVite(vite);
}
