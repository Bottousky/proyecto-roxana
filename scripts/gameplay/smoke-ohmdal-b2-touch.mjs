import { spawn } from 'node:child_process';
import { createServer, Socket } from 'node:net';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const OUT = resolve(ROOT, 'output/playwright/ohmdal-audit-20260906/b2');
const ROUTE = '/ohmdal-playcanvas';
const VIEWPORT = { width: 844, height: 390 };
const NAV_TIMEOUT_MS = 60_000;
const STEP_TIMEOUT_MS = 20_000;

await mkdir(OUT, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function distanceXZ(position, target) {
  return Math.hypot(position[0] - target.x, position[2] - target.z);
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
    // Best-effort cleanup after the artifact is written.
  }
}

function gpuArgs() {
  const configured = process.env.OHMDAL_GPU_ARGS?.trim();
  if (configured) return configured.split(/\s+/).filter(Boolean);
  return process.platform === 'win32'
    ? ['--enable-gpu', '--use-angle=d3d11']
    : ['--enable-gpu', '--ignore-gpu-blocklist'];
}

async function launchLocalChrome() {
  const configured = process.env.OHMDAL_BROWSER_CHANNEL?.trim();
  const candidates = configured ? [configured, undefined] : ['chrome', 'msedge', undefined];
  let lastError = null;
  for (const channel of candidates) {
    try {
      const options = { headless: true, args: gpuArgs() };
      if (channel) options.channel = channel;
      return await chromium.launch(options);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('No se pudo iniciar un navegador local para el smoke táctil.');
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
  schemaVersion: 2,
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
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleMessages.push({ type: message.type(), text: message.text() });
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
  throw new Error(`Timeout esperando ${label}; estado: ${JSON.stringify(await snapshot())}`);
}

async function tap(selector, label) {
  const target = page.locator(selector);
  await target.waitFor({ state: 'visible', timeout: STEP_TIMEOUT_MS });
  await target.tap();
  touchActions.push({ action: 'tap', target: selector, label, timestamp: Date.now() });
  await sleep(160);
}

async function drainDialogue(expectedId, label = expectedId) {
  for (let advance = 0; advance < 24; advance += 1) {
    const current = await snapshot();
    if (!current?.dialogue || current.dialogue.id !== expectedId) return current;
    await tap('.dialog-card', `${label} #${advance + 1}`);
  }
  throw new Error(`El diálogo ${label} no avanzó tras 24 toques.`);
}

function movementCandidates(yaw) {
  const radians = (yaw * Math.PI) / 180;
  const forwardX = -Math.sin(radians);
  const forwardZ = -Math.cos(radians);
  const rightX = Math.cos(radians);
  const rightZ = -Math.sin(radians);
  return [
    { key: 'w', x: forwardX, z: forwardZ },
    { key: 's', x: -forwardX, z: -forwardZ },
    { key: 'a', x: -rightX, z: -rightZ },
    { key: 'd', x: rightX, z: rightZ },
  ];
}

async function moveTo(x, z, tolerance = 0.45, label = `(${x}, ${z})`) {
  let current = await snapshot();
  let lastDistance = Number.POSITIVE_INFINITY;
  let stalledPulses = 0;
  for (let pulse = 0; pulse < 280; pulse += 1) {
    assert(current, `No hay snapshot durante el movimiento a ${label}.`);
    const remaining = distanceXZ(current.position, { x, z });
    if (remaining <= tolerance) return current;
    const dx = (x - current.position[0]) / remaining;
    const dz = (z - current.position[2]) / remaining;
    const candidates = movementCandidates(current.yaw)
      .map((candidate) => ({ ...candidate, score: candidate.x * dx + candidate.z * dz }))
      .sort((a, b) => b.score - a.score);
    const selected = stalledPulses >= 8 ? candidates[1] ?? candidates[0] : candidates[0];
    if (stalledPulses >= 28) throw new Error(`Movimiento bloqueado hacia ${label}: ${JSON.stringify(current.position)}.`);
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
  throw new Error(`No se pudo llegar a ${label}.`);
}

async function checkpoint(id, filename) {
  await page.screenshot({ path: resolve(OUT, filename) });
  checkpoints.push({ id, filename, recordedAt: new Date().toISOString() });
  await persistRun();
}

try {
  assert(await portReachable(port), `Vite no se levantó en ${port}: ${viteLog.join('').slice(-2000)}`);
  browser = await launchLocalChrome();
  artifact.browser = `chromium ${browser.version()}`;
  context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });
  page = await context.newPage();
  attachPageDiagnostics(page);
  await page.goto(`${baseUrl}${ROUTE}`, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });

  await tap('#plaza-enter', 'entrar a Ohmdal');
  await page.waitForFunction(() => Boolean(window.__ROXANA_VISUAL_TEST_HOOKS__), null, { timeout: NAV_TIMEOUT_MS });
  await waitForSnapshot((state) => state.dialogue?.id === 'intro_portal_edda', 'diálogo de llegada');
  await drainDialogue('intro_portal_edda', 'llegada al portal');
  await waitForSnapshot((state) => !state.dialogue && state.storyStep === 'portal_arrived', 'portal listo');

  // Desde la entrada sur se rodea el collider del pedestal por el este.
  // Leave a full player-radius margin; 1.75 ± 0.45 can clip the pedestal.
  await moveTo(2.9, -4.3, 0.45, 'pasillo este del pedestal');
  await moveTo(2.9, -1.1, 0.35, 'panel lateral trasero de Ohm');
  await checkpoint('01-rear-approach', 'b2-touch-01-rear-approach.png');

  await tap('#touch-interact', 'abrir panel de contactos');
  await waitForSnapshot((state) => state.ohmInspecting === true, 'inspección de Ohm abierta');
  await page.locator('#ohm-inspection-modal').waitFor({ state: 'visible', timeout: STEP_TIMEOUT_MS });
  await checkpoint('02-inspection-open', 'b2-touch-02-inspection-open.png');

  await tap('#ohm-gap-g1', 'colocar g1');
  await tap('#ohm-gap-g3', 'probar tramo roto g3');
  await tap('#ohm-gap-g2', 'colocar atajo g2');
  await checkpoint('03-partial-progress', 'b2-touch-03-partial-progress.png');
  await tap('#ohm-gap-g2', 'retirar atajo g2');
  await tap('#ohm-svg-gap-g5', 'colocar g5 desde SVG');
  await tap('#ohm-gap-g4', 'cerrar el lazo antes de reiniciar');
  await tap('#ohm-reset-btn', 'reiniciar durante la estabilización');
  await sleep(900);
  const resetState = await snapshot();
  assert(!resetState.ohmAwake && !resetState.ohmPuzzle.complete,
    'Reiniciar el panel debe cancelar el despertar diferido');
  await tap('#ohm-gap-g1', 'reponer alimentación');
  await tap('#ohm-gap-g5', 'reponer retorno este');
  await tap('#ohm-gap-g4', 'colocar g4 y cerrar el lazo');
  await waitForSnapshot((state) => state.ohmPuzzle?.complete === true, 'circuito B2 cerrado');
  await checkpoint('04-puzzle-solved', 'b2-touch-04-puzzle-solved.png');

  await waitForSnapshot((state) => state.ohmAwake && state.storyStep === 'ohm_awakened', 'Ohm despierto');
  await waitForSnapshot((state) => state.dialogue?.id === 'ohm_awakening_event', 'diálogo de despertar');
  await drainDialogue('ohm_awakening_event', 'despertar de Ohm');
  await waitForSnapshot((state) => state.dialogue?.id === 'edda_surprised_awakening', 'reacción de Edda');
  await drainDialogue('edda_surprised_awakening', 'reacción de Edda');
  const finalState = await waitForSnapshot((state) => state.storyStep === 'invited_to_workshop', 'invitación al taller');
  assert(finalState.ohmAwake, 'Ohm perdió el estado despierto tras la secuencia táctil.');
  await checkpoint('05-ohm-awakened', 'b2-touch-05-ohm-awakened.png');

  artifact.result = 'PASS';
  artifact.finishedAt = new Date().toISOString();
  await persistRun();
  console.log(`[b2-touch] PASS · ${runPath}`);
} catch (error) {
  artifact.result = 'FAIL';
  artifact.failure = String(error?.stack || error?.message || error);
  artifact.finishedAt = new Date().toISOString();
  await persistRun();
  console.error('[b2-touch] ERROR:', error);
  process.exitCode = 1;
} finally {
  await context?.close();
  await browser?.close();
  stopVite(vite);
}
