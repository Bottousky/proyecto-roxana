import { spawn } from 'node:child_process';
import { createServer, Socket } from 'node:net';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const OUT = resolve(ROOT, 'output/playwright/ohmdal-hardening/touch-smoke');
const VIEWPORT = { width: 844, height: 390 }; // Mobile landscape (iPhone 12/13/14 landscape)
const ROUTE = '/ohmdal-playcanvas';
const NAV_TIMEOUT_MS = 60_000;
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

async function portReachable(port, timeoutMs = 60_000) {
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
  const localViteCmd = resolve(ROOT, 'node_modules/.bin/vite.cmd');
  const command = process.platform === 'win32'
    ? (existsSync(localViteCmd)
      ? `"${localViteCmd}" --host 127.0.0.1 --port ${port} --strictPort`
      : `npx.cmd vite --host 127.0.0.1 --port ${port} --strictPort`)
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
    // Cleanup is best effort
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
const touchActions = [];
const artifact = {
  schemaVersion: 1,
  route: ROUTE,
  startedAt: new Date().toISOString(),
  baseUrl,
  viewport: VIEWPORT,
  device: 'mobile-landscape (touch enabled)',
  browser: null,
  checkpoints,
  touchActions,
  errors: { console: consoleMessages, page: pageErrors },
  result: 'RUNNING',
};

const runPath = resolve(OUT, 'b2-touch-run.json');

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

async function waitForSnapshot(predicate, label, timeoutMs = STEP_TIMEOUT_MS) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const state = await snapshot();
    if (state && predicate(state)) return state;
    await sleep(60);
  }
  const lastState = await snapshot();
  throw new Error(`Timeout esperando condición de snapshot para ${label}; estado final: ${JSON.stringify(lastState)}`);
}

async function waitForDialogue(expectedId, label = expectedId) {
  return waitForSnapshot((current) => current.dialogue?.id === expectedId, `diálogo ${label}`);
}

async function tapDialogueCard(label = 'dialogue advance') {
  console.log(`[touch-smoke] tap dialogue card: ${label}`);
  const card = page.locator('.dialog-card');
  await card.waitFor({ state: 'visible', timeout: 5_000 });
  await card.tap();
  touchActions.push({ action: 'tap', target: '.dialog-card', label, timestamp: Date.now() });
  await sleep(180);
}

async function drainDialogueByTouch(expectedId, label = expectedId) {
  console.log(`[touch-smoke] drain dialogue by touch: ${label}`);
  for (let advance = 0; advance < 24; advance += 1) {
    const current = await snapshot();
    if (!current?.dialogue || current.dialogue.id !== expectedId) {
      return current;
    }
    await tapDialogueCard(`${label} #${advance + 1}`);
  }
  throw new Error(`Diálogo ${label} no avanzó fuera de ${expectedId} tras 24 taps táctiles`);
}

async function advanceDialogueByTouch(expectedId, label = expectedId) {
  console.log(`[touch-smoke] advance dialogue out of ${label}`);
  for (let advance = 0; advance < 24; advance += 1) {
    const current = await snapshot();
    if (!current?.dialogue || current.dialogue.id !== expectedId) {
      return current;
    }
    await tapDialogueCard(`${label} #${advance + 1}`);
  }
  throw new Error(`Diálogo ${label} no avanzó fuera de ${expectedId} tras 24 taps táctiles`);
}

function candidateMovementKeys(yaw) {
  const normalizedYaw = ((yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const forwardX = -Math.sin(normalizedYaw);
  const forwardZ = -Math.cos(normalizedYaw);
  const rightX = Math.cos(normalizedYaw);
  const rightZ = -Math.sin(normalizedYaw);
  return [
    { key: 'w', x: forwardX, z: forwardZ },
    { key: 's', x: -forwardX, z: -forwardZ },
    { key: 'a', x: -rightX, z: -rightZ },
    { key: 'd', x: rightX, z: rightZ },
  ];
}

async function moveTo(x, z, tolerance = 1.35, label = `(${x}, ${z})`) {
  console.log(`[touch-smoke] move ${label}`);
  let lastDistance = Number.POSITIVE_INFINITY;
  let stalledPulses = 0;
  let current = await snapshot();
  for (let pulse = 0; pulse < 260; pulse += 1) {
    assert(current, `No hay snapshot durante movimiento a ${label}`);
    const remaining = distanceXZ(current.position, { x, z });
    if (remaining <= tolerance) {
      console.log(`[touch-smoke] arrived ${label} at ${JSON.stringify(current.position)}`);
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
  }
  throw new Error(`No se pudo llegar a ${label}; distancia final ${lastDistance.toFixed(2)}m`);
}

async function recordCheckpoint(id, filename) {
  const filePath = resolve(OUT, filename);
  await page.screenshot({ path: filePath });
  checkpoints.push({ id, filename, recordedAt: new Date().toISOString() });
  console.log(`[touch-smoke] checkpoint ${id} -> ${filename}`);
  await persistRun();
}

try {
  assert(await portReachable(port), `Vite no se levantó en ${port}; log: ${viteLog.join('').slice(-2000)}`);

  for (const candidate of ['chrome', 'msedge', undefined]) {
    try {
      const launchOptions = {
        headless: true,
        args: process.platform === 'win32' ? ['--enable-gpu', '--use-angle=d3d11'] : [],
      };
      if (candidate) launchOptions.channel = candidate;
      browser = await chromium.launch(launchOptions);
      break;
    } catch {
      // try next candidate
    }
  }
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }

  artifact.browser = `chromium ${browser.version()}`;

  // Create mobile touch context
  context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });

  page = await context.newPage();
  attachPageDiagnostics(page);

  console.log(`[touch-smoke] navigating to ${baseUrl}${ROUTE} in mobile touch context`);
  await page.goto(`${baseUrl}${ROUTE}`, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });

  // 1. Enter plaza via touch tap
  const enterBtn = page.locator('#plaza-enter');
  await enterBtn.waitFor({ state: 'visible', timeout: NAV_TIMEOUT_MS });
  await enterBtn.tap();
  touchActions.push({ action: 'tap', target: '#plaza-enter', label: 'enter plaza', timestamp: Date.now() });

  await page.waitForFunction(() => Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__), null, { timeout: NAV_TIMEOUT_MS });
  await sleep(1_100);

  // 2. Advance opening dialogue via touch
  await waitForDialogue('intro_portal_edda');
  await drainDialogueByTouch('intro_portal_edda');
  let current = await waitForSnapshot((state) => !state.dialogue && state.storyStep === 'portal_arrived', 'portal dialogue complete');
  console.log('[touch-smoke] portal arrival dialogue cleared via touch');

  // 3. Move to Ohm rear inspection position
  await moveTo(0, -3.4, 0.4, 'Ohm rear inspection position');
  await sleep(200);

  // 4. Verify touch interact button is visible and tap it
  const touchInteractBtn = page.locator('#touch-interact');
  await touchInteractBtn.waitFor({ state: 'visible', timeout: 5_000 });
  await recordCheckpoint('01-rear-approach', 'b2-touch-01-rear-approach.png');

  console.log('[touch-smoke] tapping #touch-interact to enter rear inspection');
  await touchInteractBtn.tap();
  touchActions.push({ action: 'tap', target: '#touch-interact', label: 'open rear inspection', timestamp: Date.now() });

  // 5. Verify inspection modal opens
  await waitForSnapshot((state) => state.ohmInspecting, 'Ohm inspection open');
  const modal = page.locator('#ohm-inspection-modal');
  await modal.waitFor({ state: 'visible', timeout: STEP_TIMEOUT_MS });
  await sleep(250);
  await recordCheckpoint('02-inspection-open', 'b2-touch-02-inspection-open.png');

  // 6. Touch-manipulate puzzle controls
  console.log('[touch-smoke] testing touch interaction on continuity gaps');

  // Step 6a: Tap g1 (upper feed bridge) via button
  console.log('[touch-smoke] tap #ohm-gap-g1');
  await page.locator('#ohm-gap-g1').tap();
  touchActions.push({ action: 'tap', target: '#ohm-gap-g1', label: 'place g1 bridge', timestamp: Date.now() });
  await sleep(180);

  // Step 6b: Tap g3 (calcined broken gap) — must reject and not consume bridge
  console.log('[touch-smoke] tap #ohm-gap-g3 (broken gap)');
  await page.locator('#ohm-gap-g3').tap();
  touchActions.push({ action: 'tap', target: '#ohm-gap-g3', label: 'attempt broken g3', timestamp: Date.now() });
  await sleep(180);

  // Step 6c: Tap g2 (shortcut decoy)
  console.log('[touch-smoke] tap #ohm-gap-g2 (decoy bridge)');
  await page.locator('#ohm-gap-g2').tap();
  touchActions.push({ action: 'tap', target: '#ohm-gap-g2', label: 'place g2 decoy bridge', timestamp: Date.now() });
  await sleep(180);
  await recordCheckpoint('03-partial-progress', 'b2-touch-03-partial-progress.png');

  // Step 6d: Tap g2 again to remove it and recover supply
  console.log('[touch-smoke] tap #ohm-gap-g2 again (remove decoy)');
  await page.locator('#ohm-gap-g2').tap();
  touchActions.push({ action: 'tap', target: '#ohm-gap-g2', label: 'remove g2 bridge', timestamp: Date.now() });
  await sleep(180);

  // Step 6e: Tap g5 via interactive SVG group (tests direct SVG touch handling!)
  console.log('[touch-smoke] tap #ohm-svg-gap-g5 via SVG');
  await page.locator('#ohm-svg-gap-g5').tap();
  touchActions.push({ action: 'tap', target: '#ohm-svg-gap-g5', label: 'place g5 via SVG tap', timestamp: Date.now() });
  await sleep(180);

  // Step 6f: Tap g4 via button to complete the loop
  console.log('[touch-smoke] tap #ohm-gap-g4 (close loop)');
  await page.locator('#ohm-gap-g4').tap();
  touchActions.push({ action: 'tap', target: '#ohm-gap-g4', label: 'place g4 bridge (solve)', timestamp: Date.now() });
  await sleep(250);
  await recordCheckpoint('04-puzzle-solved', 'b2-touch-04-puzzle-solved.png');

  // 7. Wait for auto-close and awakening sequence
  console.log('[touch-smoke] waiting for Ohm awakening dialogue');
  await waitForDialogue('ohm_awakening_event');
  current = await waitForSnapshot((state) => state.ohmAwake && state.storyStep === 'ohm_awakened', 'Ohm awakened');
  assert(current.ohmAwake, 'Ohm no quedó despierto tras resolver el puzzle por touch');

  // 8. Advance dialogue by touch
  await advanceDialogueByTouch('ohm_awakening_event');
  await waitForDialogue('edda_surprised_awakening');
  await drainDialogueByTouch('edda_surprised_awakening');

  // 9. Confirm story step invited_to_workshop
  current = await waitForSnapshot((state) => state.storyStep === 'invited_to_workshop', 'invited to workshop');
  assert(current.ohmAwake, 'Ohm perdió estado despierto tras reacción de Edda');
  await recordCheckpoint('05-ohm-awakened', 'b2-touch-05-ohm-awakened.png');

  artifact.result = 'PASS';
  artifact.finishedAt = new Date().toISOString();
  await persistRun();

  console.log('[touch-smoke] ========================================');
  console.log('[touch-smoke] RESULT: PASS');
  console.log(`[touch-smoke] Checkpoints: ${checkpoints.length}`);
  console.log(`[touch-smoke] Touch Actions: ${touchActions.length}`);
  console.log(`[touch-smoke] Artifact: ${runPath}`);
  console.log('[touch-smoke] ========================================');

} catch (error) {
  artifact.result = 'FAIL';
  artifact.failure = String(error?.stack || error?.message || error);
  artifact.finishedAt = new Date().toISOString();
  await persistRun();
  console.error('[touch-smoke] ERROR:', error);
  process.exitCode = 1;
} finally {
  await context?.close();
  await browser?.close();
  stopVite(vite);
}
