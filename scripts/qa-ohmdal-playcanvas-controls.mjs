import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer, Socket } from 'node:net';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { fastLaunchOptions, getCaptureShotSpec } from './visual/ohmdal-capture-contract.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT = resolve(ROOT, 'output/playwright/ohmdal-audit-20260906/controls');
const ROUTE = '/ohmdal-playcanvas';
const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 844, height: 390 };
const PORTRAIT_VIEWPORT = { width: 390, height: 844 };
const TIMEOUT_MS = 12_000;

await mkdir(OUT, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close((error) => (error ? reject(error) : resolvePort(port)));
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
      socket.connect(port, '127.0.0.1');
    });
    if (reachable) return true;
    await sleep(250);
  }
  return false;
}

function startVite(port) {
  const command = resolve(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');
  const vite = spawn(command, ['--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: ROOT,
    shell: process.platform === 'win32',
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
  if (process.platform === 'win32' && vite.pid) {
    spawn('taskkill', ['/pid', String(vite.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  } else {
    vite.kill('SIGTERM');
  }
}

async function snapshot(page) {
  return page.evaluate(() => window.__ROXANA_VISUAL_TEST_HOOKS__?.getPlaytestSnapshot() ?? null);
}

async function waitForSnapshot(page, predicate, label, timeoutMs = TIMEOUT_MS) {
  const started = Date.now();
  let latest = null;
  while (Date.now() - started < timeoutMs) {
    latest = await snapshot(page);
    if (latest && predicate(latest)) return latest;
    await sleep(80);
  }
  throw new Error(`Timeout esperando ${label}; último snapshot: ${JSON.stringify(latest)}`);
}

async function openExperience(page, touch = false) {
  await page.goto(`${baseUrl}${ROUTE}`, { waitUntil: 'networkidle' });
  const enter = page.locator('#plaza-enter');
  if (touch) await enter.tap();
  else await enter.click();
  await page.waitForFunction(() => Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__), null, {
    timeout: touch ? 30_000 : TIMEOUT_MS,
  });
}

async function drainDialogue(page, touch = false) {
  for (let index = 0; index < 16; index += 1) {
    const current = await snapshot(page);
    if (!current?.dialogue) return current;
    if (touch) await page.locator('.dialog-card').tap();
    else await page.keyboard.press('e');
    await sleep(100);
  }
  throw new Error('El diálogo no terminó durante el smoke de controles.');
}

function assertSamePosition(before, after, label) {
  const distance = Math.hypot(
    before.position[0] - after.position[0],
    before.position[2] - after.position[2],
  );
  assert(distance < 0.02, `${label}: la posición cambió ${distance.toFixed(3)}m`);
}

function signedYawDelta(before, after) {
  return ((after - before + 540) % 360) - 180;
}

function cdpTouchPoint(point, id) {
  return {
    id,
    x: point.x,
    y: point.y,
    radiusX: 8,
    radiusY: 8,
    force: 1,
  };
}

async function dispatchTouch(client, type, points) {
  await client.send('Input.dispatchTouchEvent', {
    type,
    touchPoints: points,
  });
}

async function cdpTouchDrag(client, start, end, id = 401, steps = 5) {
  await dispatchTouch(client, 'touchStart', [cdpTouchPoint(start, id)]);
  for (let index = 1; index <= steps; index += 1) {
    const progress = index / steps;
    await dispatchTouch(client, 'touchMove', [cdpTouchPoint({
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress,
    }, id)]);
    await sleep(20);
  }
  await dispatchTouch(client, 'touchEnd', []);
}

async function centerOf(locator, label) {
  const box = await locator.boundingBox();
  assert(box, `No se encontró la caja táctil de ${label}`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

const port = await getFreePort();
const { vite, log: viteLog } = startVite(port);
const baseUrl = `http://127.0.0.1:${port}`;
let browser = null;
let desktopContext = null;
let touchContext = null;
let portraitContext = null;
const errors = { console: [], page: [] };
const artifact = {
  schemaVersion: 1,
  route: ROUTE,
  startedAt: new Date().toISOString(),
  baseUrl,
  launch: null,
  desktop: {},
  touch: {},
  harness: {},
  errors,
  result: 'RUNNING',
};
const manifestPath = resolve(OUT, 'controls-regression.json');

function attachDiagnostics(page, label) {
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      errors.console.push({ label, type: message.type(), text: message.text() });
    }
  });
  page.on('pageerror', (error) => errors.page.push({ label, text: String(error?.stack || error?.message || error) }));
}

async function persist() {
  await writeFile(manifestPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
}

async function exercisePlayerControlsModule(page, moduleUrl) {
  return page.evaluate(async (sourceUrl) => {
    const controlsModule = await import(sourceUrl);
    const host = document.createElement('main');
    host.id = 'player-controls-qa-fixture';
    host.style.cssText = 'position:fixed;inset:0;z-index:200;pointer-events:none;';
    host.innerHTML = '<div id="qa-look-surface"></div><button data-move-key="w" type="button">W</button><button data-move-key="d" type="button">D</button>';
    document.body.appendChild(host);

    const surface = host.querySelector('#qa-look-surface');
    const forward = host.querySelector('button[data-move-key="w"]');
    const strafe = host.querySelector('button[data-move-key="d"]');
    if (!(surface instanceof HTMLElement) || !(forward instanceof HTMLElement) || !(strafe instanceof HTMLElement)) {
      throw new Error('No se pudo montar la fixture de playerControls.');
    }
    surface.style.cssText = 'position:absolute;left:0;top:0;width:100vw;height:260px;touch-action:none;';
    forward.style.cssText = 'position:absolute;left:16px;top:280px;width:64px;height:48px;';
    strafe.style.cssText = 'position:absolute;left:88px;top:280px;width:64px;height:48px;';

    const lookEvents = [];
    const directionEvents = [];
    const controls = controlsModule.createPlayerControls({
      lookSurface: surface,
      directionalButtons: [forward, strafe],
      initialYaw: 0,
      initialPitch: 0,
      isTouchDevice: () => true,
      onLook: (event) => lookEvents.push({ deltaYaw: event.deltaYaw, deltaPitch: event.deltaPitch, pointerId: event.pointerId }),
      onDirection: (event) => directionEvents.push({ key: event.key, active: event.active, pointerId: event.pointerId }),
      compass: { mount: host, initialHeading: 0, label: 'Rumbo' },
      orientationGate: { mount: host, isTouchDevice: () => true },
    });
    const fire = (target, type, init) => target.dispatchEvent(new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerId: init.pointerId,
      pointerType: init.pointerType,
      isPrimary: init.isPrimary ?? false,
      button: init.button ?? 0,
      clientX: init.clientX ?? 0,
      clientY: init.clientY ?? 0,
    }));

    // First finger looks from the right half. A left-half drag is ignored.
    fire(surface, 'pointerdown', { pointerId: 11, pointerType: 'touch', clientX: 600, clientY: 120 });
    fire(surface, 'pointermove', { pointerId: 11, pointerType: 'touch', clientX: 640, clientY: 100 });
    const lookAfterRightHalf = lookEvents.length;
    fire(surface, 'pointerdown', { pointerId: 10, pointerType: 'touch', clientX: 100, clientY: 120 });
    const leftHalfIgnored = lookEvents.length === lookAfterRightHalf;

    // A second finger can hold movement while the look finger remains active.
    fire(forward, 'pointerdown', { pointerId: 12, pointerType: 'touch', clientX: 32, clientY: 304 });
    const secondFingerMovementAccepted = directionEvents.at(-1)?.active === true;
    window.dispatchEvent(new Event('blur'));
    const releasedOnBlur = directionEvents.at(-1)?.active === false;
    const lookCountAfterBlur = lookEvents.length;
    fire(surface, 'pointermove', { pointerId: 11, pointerType: 'touch', clientX: 680, clientY: 100 });
    const lookCancelledOnBlur = lookEvents.length === lookCountAfterBlur;

    // Exercise the inverse ordering too: movement is already held when the
    // second touch starts a right-half look drag.
    fire(forward, 'pointerdown', { pointerId: 20, pointerType: 'touch', clientX: 32, clientY: 304 });
    fire(surface, 'pointerdown', { pointerId: 21, pointerType: 'touch', clientX: 700, clientY: 120 });
    fire(surface, 'pointermove', { pointerId: 21, pointerType: 'touch', clientX: 720, clientY: 110 });
    const moveHeldThenLookAccepted = directionEvents.some((event) => event.pointerId === 20 && event.active)
      && lookEvents.some((event) => event.pointerId === 21);
    window.dispatchEvent(new Event('blur'));
    const moveHeldThenLookReleased = directionEvents.at(-1)?.active === false;

    controls.compass?.setHeading(90);
    const westLabel = controls.compass?.element.getAttribute('aria-label') ?? '';
    controls.compass?.setHeading(270);
    const eastLabel = controls.compass?.element.getAttribute('aria-label') ?? '';
    const touchActionApplied = surface.style.touchAction === 'none';
    controls.dispose();
    host.remove();
    return {
      lookAfterRightHalf,
      leftHalfIgnored,
      secondFingerMovementAccepted,
      releasedOnBlur,
      lookCancelledOnBlur,
      moveHeldThenLookAccepted,
      moveHeldThenLookReleased,
      westLabel,
      eastLabel,
      touchActionApplied,
    };
  }, moduleUrl);
}

async function exercisePointerLockModule(page, moduleUrl) {
  return page.evaluate(async (sourceUrl) => {
    const controlsModule = await import(sourceUrl);
    const element = document.createElement('div');
    let requests = 0;
    Object.defineProperty(element, 'requestPointerLock', {
      configurable: true,
      value: () => {
        requests += 1;
      },
    });
    const lock = controlsModule.createPointerLockRestore({ element, isTouchDevice: () => false });
    const mouseGesture = new MouseEvent('pointerdown', { bubbles: true });
    const touchGesture = new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 1 });
    const requested = lock.requestFromGesture(mouseGesture);
    const restored = lock.restoreFromGesture(mouseGesture);
    const touchRejected = !lock.requestFromGesture(touchGesture);
    const intentBeforeEscape = lock.hasIntent();
    window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    const clearedByEscape = !lock.hasIntent();
    const restoreAfterEscape = lock.restoreFromGesture(mouseGesture);
    lock.dispose();
    return { requested, restored, touchRejected, intentBeforeEscape, clearedByEscape, restoreAfterEscape, requests };
  }, moduleUrl);
}

async function exerciseOrientationGate(page, moduleUrl) {
  const initial = await page.evaluate(async (sourceUrl) => {
    const controlsModule = await import(sourceUrl);
    const host = document.createElement('main');
    host.id = 'orientation-gate-qa-fixture';
    document.body.appendChild(host);
    const gateChanges = [];
    const gate = controlsModule.createOrientationGate({
      mount: host,
      isTouchDevice: () => true,
      onChange: (blocked) => gateChanges.push(blocked),
    });
    window.__ohmdalOrientationGateQa = { gate, host, gateChanges };
    return { blocked: gate.isBlocked(), hidden: gate.element.hidden, gateChanges };
  }, moduleUrl);
  await page.screenshot({ path: resolve(OUT, 'player-controls-portrait-gate.png'), animations: 'disabled' });
  const portrait = await page.evaluate(() => {
    const state = window.__ohmdalOrientationGateQa;
    if (!state) throw new Error('Orientation gate QA state missing.');
    return { blocked: state.gate.isBlocked(), hidden: state.gate.element.hidden, gateChanges: state.gateChanges };
  });
  await page.setViewportSize(MOBILE_VIEWPORT);
  await page.screenshot({ path: resolve(OUT, 'player-controls-landscape.png'), animations: 'disabled' });
  const landscape = await page.evaluate(() => {
    const state = window.__ohmdalOrientationGateQa;
    if (!state) throw new Error('Orientation gate QA state missing.');
    const blocked = state.gate.refresh();
    const result = { blocked, hidden: state.gate.element.hidden, gateChanges: state.gateChanges };
    state.gate.dispose();
    state.host.remove();
    delete window.__ohmdalOrientationGateQa;
    return result;
  });

  await page.setViewportSize(PORTRAIT_VIEWPORT);
  const desktopNarrow = await page.evaluate(async (sourceUrl) => {
    const controlsModule = await import(sourceUrl);
    const host = document.createElement('main');
    document.body.appendChild(host);
    const gate = controlsModule.createOrientationGate({ mount: host, isTouchDevice: () => false });
    const result = { blocked: gate.isBlocked(), hidden: gate.element.hidden };
    gate.dispose();
    host.remove();
    return result;
  }, moduleUrl);
  return {
    portrait: { viewport: PORTRAIT_VIEWPORT, hasTouch: true, isMobile: true, ...portrait },
    landscape: { viewport: MOBILE_VIEWPORT, hasTouch: true, isMobile: true, ...landscape },
    desktopNarrowPortrait: { viewport: PORTRAIT_VIEWPORT, hasTouch: false, isMobile: false, ...desktopNarrow },
    initial,
  };
}

try {
  assert(await portReachable(port), `Vite no se levantó en ${port}; ${viteLog.join('').slice(-1500)}`);

  const headless = !process.argv.includes('--headed');
  const gpu = process.argv.includes('--gpu');
  const browserChannel = process.env.OHMDAL_FAST_BROWSER ?? 'chrome';
  const launchOptions = gpu
    ? { ...fastLaunchOptions({ headless }), channel: browserChannel }
    : { headless };
  browser = await chromium.launch(launchOptions);
  artifact.launch = {
    browser: gpu ? browserChannel : 'playwright-chromium',
    headless,
    gpuRequested: gpu,
    args: launchOptions.args ?? [],
  };

  desktopContext = await browser.newContext({ viewport: DESKTOP_VIEWPORT, deviceScaleFactor: 1 });
  await desktopContext.addInitScript(() => localStorage.setItem('ohmdal_intro_seen', 'true'));
  const desktop = await desktopContext.newPage();
  attachDiagnostics(desktop, 'desktop');
  await openExperience(desktop);
  await waitForSnapshot(desktop, (current) => current.dialogue?.id === 'intro_portal_edda', 'diálogo inicial desktop');

  const dialogueBefore = await snapshot(desktop);
  await desktop.keyboard.down('w');
  await sleep(250);
  await desktop.keyboard.up('w');
  const dialogueAfterMove = await snapshot(desktop);
  assertSamePosition(dialogueBefore, dialogueAfterMove, 'movimiento durante diálogo');

  await desktop.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', repeat: true })));
  await sleep(100);
  const dialogueAfterRepeat = await snapshot(desktop);
  assert(dialogueAfterRepeat.dialogue?.lineIndex === dialogueBefore.dialogue?.lineIndex,
    'autorepeat de E avanzó el diálogo');
  await desktop.keyboard.press('e');
  await waitForSnapshot(desktop, (current) => current.dialogue?.lineIndex === (dialogueBefore.dialogue?.lineIndex ?? 0) + 1, 'avance de diálogo desktop');
  await desktop.screenshot({ path: resolve(OUT, 'desktop-dialogue.png'), animations: 'disabled' });
  await drainDialogue(desktop);

  await desktop.locator('#plaza-game canvas').click({ position: { x: 200, y: 400 } });
  await desktop.waitForFunction(() => document.pointerLockElement?.tagName === 'CANVAS');

  await desktop.keyboard.press('Tab');
  const bitacoraOpen = await waitForSnapshot(desktop, (current) => current.mode === 'bitacora', 'apertura de Bitácora desktop');
  assert(!(await desktop.locator('#bitacora-modal').evaluate((element) => element.classList.contains('hidden'))), 'Bitácora desktop no quedó visible');
  const bitacoraPosition = bitacoraOpen.position;
  await desktop.keyboard.down('w');
  await sleep(250);
  await desktop.keyboard.up('w');
  assertSamePosition(bitacoraOpen, await snapshot(desktop), 'movimiento durante Bitácora');
  await desktop.screenshot({ path: resolve(OUT, 'desktop-bitacora.png'), animations: 'disabled' });
  await desktop.locator('#bitacora-close').click();
  const bitacoraClosed = await waitForSnapshot(desktop, (current) => current.mode === 'explore', 'cierre de Bitácora por botón');
  await desktop.waitForFunction(() => document.pointerLockElement?.tagName === 'CANVAS');
  await desktop.keyboard.press('Tab');
  await waitForSnapshot(desktop, (current) => current.mode === 'bitacora', 'Bitácora antes de Escape');
  await desktop.keyboard.press('Escape');
  await waitForSnapshot(desktop, (current) => current.mode === 'explore', 'Escape cierra Bitácora');
  assert(await desktop.evaluate(() => document.pointerLockElement === null), 'Escape no debe recapturar el ratón');
  await desktop.keyboard.press('Tab');
  await desktop.locator('#bitacora-close').click();
  assert(await desktop.evaluate(() => document.pointerLockElement === null), 'La intención cancelada por Escape no debe reaparecer');
  assert(await desktop.locator('#bitacora-modal').evaluate((element) => element.classList.contains('hidden')), 'Bitácora desktop no se ocultó al cerrar');
  artifact.desktop = {
    viewport: DESKTOP_VIEWPORT,
    dialogueGate: { positionStable: true, autorepeatIgnored: true, advanceWorked: true },
    bitacoraGate: { positionStable: true, opened: bitacoraOpen.mode === 'bitacora', closed: bitacoraClosed.mode === 'explore' },
    finalSnapshot: bitacoraClosed,
    pointerLock: { acquiredFromMouse: true, restoredFromCloseClick: true, escapeRespected: true },
  };

  const lighthouseShot = getCaptureShotSpec('lighthouse-lake-wide');
  await desktop.evaluate(async (shot) => {
    const hooks = window.__ROXANA_VISUAL_TEST_HOOKS__;
    if (!hooks?.setCaptureShot) throw new Error('Falta setCaptureShot para la regresión Faro→Plaza.');
    await hooks.setCaptureShot(shot);
  }, lighthouseShot);
  const lighthouse = await waitForSnapshot(desktop, (current) => current.zones.some((zone) => zone.id === 'lighthouse' && zone.active), 'zona Faro activa');
  await desktop.screenshot({ path: resolve(OUT, 'harness-lighthouse.png'), animations: 'disabled' });
  const finalShot = getCaptureShotSpec('final-return-plaza');
  await desktop.evaluate(async (shot) => {
    const hooks = window.__ROXANA_VISUAL_TEST_HOOKS__;
    if (!hooks?.setCaptureShot) throw new Error('Falta setCaptureShot para la regresión de retorno.');
    await hooks.setCaptureShot(shot);
  }, finalShot);
  const finalReturn = await waitForSnapshot(desktop, (current) => current.zones.some((zone) => zone.id === 'plaza' && zone.active), 'zona Plaza activa tras retorno');
  assert(!finalReturn.zones.some((zone) => zone.id === 'lighthouse' && zone.active), 'Faro sigue activo después del retorno a Plaza');
  await desktop.screenshot({ path: resolve(OUT, 'harness-final-return-plaza.png'), animations: 'disabled' });
  artifact.harness = {
    lighthouseActive: lighthouse.zones.some((zone) => zone.id === 'lighthouse' && zone.active),
    plazaActiveAfterReturn: finalReturn.zones.some((zone) => zone.id === 'plaza' && zone.active),
    lighthouseInactiveAfterReturn: !finalReturn.zones.some((zone) => zone.id === 'lighthouse' && zone.active),
    finalSnapshot: finalReturn,
  };

  // Release the desktop WebGL context before creating the emulated touch context.
  // Chromium can otherwise leave the second PlayCanvas device waiting indefinitely
  // on software-GPU resource contention.
  await desktopContext.close();
  desktopContext = null;

  touchContext = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  });
  await touchContext.addInitScript(() => localStorage.setItem('ohmdal_intro_seen', 'true'));
  const touch = await touchContext.newPage();
  attachDiagnostics(touch, 'touch');
  await openExperience(touch, true);
  await waitForSnapshot(touch, (current) => current.dialogue?.id === 'intro_portal_edda', 'diálogo inicial touch');
  assert(!(await touch.locator('#touch-interact').isVisible()), 'interacción se superpone al diálogo táctil');
  assert(!(await touch.locator('button[data-move-key="w"]').isVisible()), 'movimiento se superpone al diálogo táctil');
  const touchBefore = await snapshot(touch);
  await touch.locator('.dialog-card').tap();
  await waitForSnapshot(touch, (current) => current.dialogue?.lineIndex === (touchBefore.dialogue?.lineIndex ?? 0) + 1, 'avance de diálogo touch');
  await drainDialogue(touch, true);
  assert(await touch.locator('#touch-interact').isVisible(), 'interacción no reaparece al cerrar el diálogo táctil');
  assert(await touch.locator('button[data-move-key="w"]').isVisible(), 'movimiento no reaparece al cerrar el diálogo táctil');
  await touch.locator('#btn-bitacora').tap();
  const touchBitacora = await waitForSnapshot(touch, (current) => current.mode === 'bitacora', 'apertura de Bitácora touch');
  await touch.screenshot({ path: resolve(OUT, 'touch-bitacora.png'), animations: 'disabled' });
  await touch.locator('#bitacora-close').tap();
  const touchClosed = await waitForSnapshot(touch, (current) => current.mode === 'explore', 'cierre de Bitácora touch');
  assert(await touch.locator('#bitacora-modal').evaluate((element) => element.classList.contains('hidden')), 'Bitácora touch no se ocultó al cerrar');
  artifact.touch = {
    viewport: MOBILE_VIEWPORT,
    hasTouch: true,
    isMobile: true,
    controlsVisible: true,
    dialogueTapAdvanced: true,
    bitacoraOpened: touchBitacora.mode === 'bitacora',
    bitacoraClosed: touchClosed.mode === 'explore',
    finalSnapshot: touchClosed,
  };

  // Exercise the live app with CDP touch input. This covers the route that
  // drives the legacy touch buttons through KeyboardEvents, including the
  // capture-phase q/r adapter and modal cancellation. It deliberately keeps
  // one q contact alive while opening Bitácora with a second contact.
  const qButton = touch.locator('button[data-move-key="q"]');
  const rButton = touch.locator('button[data-move-key="r"]');
  const bitacoraButton = touch.locator('#btn-bitacora');
  const qPoint = await centerOf(qButton, 'giro izquierdo');
  const rPoint = await centerOf(rButton, 'giro derecho');
  const bitacoraPoint = await centerOf(bitacoraButton, 'Bitácora');
  const touchClient = await touchContext.newCDPSession(touch);
  const turnBefore = await snapshot(touch);
  const turnBeforeYaw = turnBefore?.yaw;
  assert(Number.isFinite(turnBeforeYaw), `Snapshot táctil sin yaw antes del giro: ${JSON.stringify(turnBefore)}`);

  await dispatchTouch(touchClient, 'touchStart', [cdpTouchPoint(qPoint, 501)]);
  await sleep(145);
  const qTurning = await snapshot(touch);
  const qDelta = signedYawDelta(turnBeforeYaw, qTurning?.yaw);
  await dispatchTouch(touchClient, 'touchEnd', []);
  assert(qDelta > 1, `El botón Q no giró la cámara en la app real: ${JSON.stringify({ turnBeforeYaw, yaw: qTurning?.yaw, qDelta })}`);

  const rBefore = await snapshot(touch);
  await dispatchTouch(touchClient, 'touchStart', [cdpTouchPoint(rPoint, 502)]);
  await sleep(145);
  const rTurning = await snapshot(touch);
  const rDelta = signedYawDelta(rBefore?.yaw, rTurning?.yaw);
  await dispatchTouch(touchClient, 'touchEnd', []);
  assert(rDelta < -1, `El botón R no giró en el sentido inverso: ${JSON.stringify({ before: rBefore?.yaw, yaw: rTurning?.yaw, rDelta })}`);

  const modalTurnStart = await snapshot(touch);
  await dispatchTouch(touchClient, 'touchStart', [cdpTouchPoint(qPoint, 503)]);
  await sleep(90);
  const modalTurnBefore = await snapshot(touch);
  // Add Bitácora as a second real touch contact while Q remains held. The
  // main document capture listener must cancel only the Q interval.
  await dispatchTouch(touchClient, 'touchStart', [
    cdpTouchPoint(qPoint, 503),
    cdpTouchPoint(bitacoraPoint, 504),
  ]);
  // CDP touchEnd lists the contacts being released, not those remaining.
  await dispatchTouch(touchClient, 'touchEnd', [cdpTouchPoint(bitacoraPoint, 504)]);
  const touchBitacoraFromHeldTurn = await waitForSnapshot(
    touch,
    (current) => current.mode === 'bitacora',
    'apertura de Bitácora mientras gira',
  );
  const modalYaw = touchBitacoraFromHeldTurn.yaw;
  await sleep(180);
  const modalTurnAfter = await snapshot(touch);
  await dispatchTouch(touchClient, 'touchEnd', []);
  assert(Math.abs(signedYawDelta(modalYaw, modalTurnAfter?.yaw)) < 0.1,
    `El giro Q continuó tras abrir Bitácora: ${JSON.stringify({ modalTurnStart, modalTurnBefore, modalYaw, after: modalTurnAfter?.yaw })}`);
  await touch.locator('#bitacora-close').tap();
  await waitForSnapshot(touch, (current) => current.mode === 'explore', 'cierre de Bitácora tras prueba de giro');

  // Use a real CDP drag on the canvas, then dispatch the plain MouseEvent that
  // Safari/WebViews may synthesize after touchend. The adapter's capture
  // guard must consume both the delayed browser click and this simple event.
  const canvas = touch.locator('#plaza-game canvas');
  const canvasBox = await canvas.boundingBox();
  assert(canvasBox, 'No se encontró el canvas táctil para la prueba de drag');
  const dragStart = {
    x: canvasBox.x + canvasBox.width * 0.75,
    y: canvasBox.y + canvasBox.height * 0.55,
  };
  const dragEnd = { x: dragStart.x + 76, y: dragStart.y - 24 };
  const dragBefore = await snapshot(touch);
  await touch.evaluate(() => {
    const element = document.querySelector('#plaza-game canvas');
    if (!(element instanceof HTMLCanvasElement)) throw new Error('Canvas ausente para ghost-click QA');
    (window).__ohmdalQaCanvasClicks = 0;
    (window).__ohmdalQaCanvasClickHandler = () => { (window).__ohmdalQaCanvasClicks += 1; };
    element.addEventListener('click', (window).__ohmdalQaCanvasClickHandler);
  });
  await cdpTouchDrag(touchClient, dragStart, dragEnd, 505, 6);
  await sleep(250);
  const dragAfter = await snapshot(touch);
  await touch.evaluate(() => {
    const element = document.querySelector('#plaza-game canvas');
    element?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  });
  await sleep(30);
  const ghostClickQa = await touch.evaluate(() => ({
    canvasClicks: (window).__ohmdalQaCanvasClicks ?? 0,
  }));
  assert(Math.abs(signedYawDelta(dragBefore?.yaw, dragAfter?.yaw)) > 0.1,
    `El drag táctil real no cambió yaw: ${JSON.stringify({ before: dragBefore?.yaw, after: dragAfter?.yaw })}`);
  assert(ghostClickQa.canvasClicks === 0,
    `El MouseEvent simple atravesó el canvas después del drag: ${JSON.stringify(ghostClickQa)}`);
  await touch.evaluate(() => {
    const element = document.querySelector('#plaza-game canvas');
    const handler = window.__ohmdalQaCanvasClickHandler;
    if (element && handler) element.removeEventListener('click', handler);
  });
  await touchClient.detach();

  artifact.touch.liveInput = {
    qTurned: qDelta > 1,
    qDelta,
    rTurnedOpposite: rDelta < -1,
    rDelta,
    modalOpenedWhileQHeld: touchBitacoraFromHeldTurn.mode === 'bitacora',
    modalTurnStopped: true,
    dragChangedYaw: Math.abs(signedYawDelta(dragBefore?.yaw, dragAfter?.yaw)) > 0.1,
    ghostClick: ghostClickQa,
  };

  const moduleUrl = new URL('/src/experiences/ohmdal-playcanvas/systems/controls/playerControls.ts', baseUrl).href;
  const moduleCssUrl = new URL('/src/experiences/ohmdal-playcanvas/systems/controls/playerControls.css', baseUrl).href;
  await touch.addStyleTag({ url: moduleCssUrl });
  const moduleQa = await exercisePlayerControlsModule(touch, moduleUrl);
  assert(moduleQa.lookAfterRightHalf === 1, 'playerControls no aplicó el drag de mirada en la mitad derecha');
  assert(moduleQa.leftHalfIgnored, 'playerControls aceptó drag de mirada en la mitad izquierda');
  assert(moduleQa.secondFingerMovementAccepted, 'playerControls rechazó el segundo dedo de movimiento');
  assert(moduleQa.releasedOnBlur && moduleQa.lookCancelledOnBlur, 'playerControls no canceló entradas en blur');
  assert(moduleQa.moveHeldThenLookAccepted && moduleQa.moveHeldThenLookReleased,
    'playerControls rechazó la mirada al iniciar como segundo dedo después de movimiento');
  assert(moduleQa.westLabel.includes('Oeste') && moduleQa.eastLabel.includes('Este'),
    `Brújula con cardinales incorrectos: ${JSON.stringify(moduleQa)}`);
  assert(moduleQa.touchActionApplied, 'playerControls no aplicó touch-action:none');
  artifact.touch.playerControlsModule = moduleQa;

  portraitContext = await browser.newContext({
    viewport: PORTRAIT_VIEWPORT,
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  });
  const portraitPage = await portraitContext.newPage();
  attachDiagnostics(portraitPage, 'portrait-controls');
  await portraitPage.route('**/ohmdal-controls-qa', (route) => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"></head><body></body></html>',
  }));
  await portraitPage.goto(`${baseUrl}/ohmdal-controls-qa`, { waitUntil: 'networkidle' });
  await portraitPage.addStyleTag({ url: moduleCssUrl });
  const orientationQa = await exerciseOrientationGate(portraitPage, moduleUrl);
  const pointerLockQa = await exercisePointerLockModule(portraitPage, moduleUrl);
  assert(orientationQa.portrait.blocked && !orientationQa.portrait.hidden,
    'La compuerta portrait táctil no bloqueó o quedó oculta');
  assert(!orientationQa.landscape.blocked && orientationQa.landscape.hidden,
    'La compuerta no se liberó al volver a landscape');
  assert(!orientationQa.desktopNarrowPortrait.blocked && orientationQa.desktopNarrowPortrait.hidden,
    'La compuerta bloqueó un desktop estrecho sin touch');
  assert(pointerLockQa.requested && pointerLockQa.restored && pointerLockQa.touchRejected,
    `Contrato pointer-lock inválido: ${JSON.stringify(pointerLockQa)}`);
  assert(pointerLockQa.intentBeforeEscape && pointerLockQa.clearedByEscape && !pointerLockQa.restoreAfterEscape,
    `Escape no limpió la intención de pointer-lock: ${JSON.stringify(pointerLockQa)}`);
  artifact.controls = {
    module: moduleQa,
    orientationGate: orientationQa,
    pointerLock: pointerLockQa,
  };

  assert(errors.page.length === 0, `Errores de página: ${JSON.stringify(errors.page)}`);
  assert(errors.console.filter((entry) => entry.type === 'error').length === 0,
    `Errores de consola: ${JSON.stringify(errors.console.filter((entry) => entry.type === 'error'))}`);
  artifact.result = 'PASS';
  artifact.finishedAt = new Date().toISOString();
  artifact.viteLogTail = viteLog.join('').slice(-1500);
  await persist();
  console.log(JSON.stringify({ result: artifact.result, manifest: manifestPath }, null, 2));
} catch (error) {
  artifact.result = 'FAIL';
  artifact.finishedAt = new Date().toISOString();
  artifact.failure = { message: String(error?.stack || error?.message || error) };
  artifact.viteLogTail = viteLog.join('').slice(-1500);
  await persist();
  console.error(JSON.stringify({ result: artifact.result, manifest: manifestPath, failure: artifact.failure }, null, 2));
  process.exitCode = 1;
} finally {
  await touchContext?.close().catch(() => {});
  await portraitContext?.close().catch(() => {});
  await desktopContext?.close().catch(() => {});
  await browser?.close().catch(() => {});
  stopVite(vite);
}
