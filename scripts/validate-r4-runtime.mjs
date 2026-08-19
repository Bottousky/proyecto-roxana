import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, '.playtest');
await mkdir(OUT, { recursive: true });

const headless = process.env.ROXANA_R4_HEADLESS !== 'false';
const browserMode = headless ? 'headless' : 'headed';
const port = process.env.ROXANA_R4_PORT
  ? parseInt(process.env.ROXANA_R4_PORT, 10)
  : await new Promise((resolvePort, rejectPort) => {
  const server = createServer();
  server.unref();
  server.on('error', rejectPort);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    server.close(() => resolvePort(typeof address === 'object' && address ? address.port : 0));
  });
});
const viteCommand = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'npx';
const viteArgs = process.platform === 'win32'
  ? ['/d', '/s', '/c', 'npx.cmd', 'vite', '--port', String(port), '--strictPort']
  : ['vite', '--port', String(port), '--strictPort'];
const vite = spawn(viteCommand, viteArgs, {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});
const viteOutput = [];
vite.stdout.on('data', (chunk) => viteOutput.push(String(chunk)));
vite.stderr.on('data', (chunk) => viteOutput.push(String(chunk)));

let viteKilled = false;
async function killVite() {
  if (viteKilled) return;
  viteKilled = true;
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(vite.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    vite.kill('SIGTERM');
  }
  await sleep(200);
}

let browser;
const consoleErrors = [];
const result = {
  browserMode,
  route: `/jugar/?from=portal&room=plaza`,
  substitutions: {
    requestRoomTransition: false,
    loadRoom: false,
    manualTriggerLoop: false,
  },
};

try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      const response = await fetch(`http://localhost:${port}/jugar/?from=portal&room=plaza`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) { ready = true; break; }
    } catch {}
    await sleep(250);
  }
  if (!ready) throw new Error(`Vite did not start; ${viteOutput.join('').slice(-2000)}`);

  browser = await chromium.launch({ headless });
  const context = await browser.newContext({ viewport: { width: 960, height: 540 } });
  const page = await context.newPage();
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  async function waitReady() {
    await page.waitForFunction(() => {
      const scene = window.__game?.scene?.getScene('explore');
      return scene?.activeRoom?.id === 'plaza' && scene.activeRoom.width === 1920 && window.__roxana?.state;
    }, null, { timeout: 25000 });
  }

  async function dismissDialog() {
    for (let i = 0; i < 8; i++) {
      const visible = await page.locator('#dialog').evaluate((node) => !node.classList.contains('hidden'));
      if (!visible) break;
      await page.keyboard.press('Enter');
      await page.waitForTimeout(280);
    }
    await page.waitForFunction(() => document.querySelector('#dialog')?.classList.contains('hidden'), null, { timeout: 3000 });
  }

  async function setRouteFlags() {
    await page.evaluate(() => {
      window.__roxana.state.flags.ohmAwake = true;
      window.__roxana.state.flags.puertaIntro = true;
    });
  }

  async function installProbe() {
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('explore');
      window.__r42RuntimeProbe = { ticks: 0, sceneUpdates: 0 };
      scene.events.on('preupdate', () => {
        window.__r42RuntimeProbe.ticks++;
        window.__r42RuntimeProbe.sceneUpdates++;
      });
    });
  }

  async function read() {
    return page.evaluate(() => {
      const scene = window.__game.scene.getScene('explore');
      const camera = scene.cameras.main;
      const bounds = camera.getBounds();
      const fade = camera.fadeEffect;
      const local = scene.activeRoom?.playerLocal;
      return {
        room: scene.activeRoom?.id ?? null,
        local: local ? { x: local.x, y: local.y } : null,
        sprite: { x: scene.player.x, y: scene.player.y },
        width: scene.activeRoom.width,
        height: scene.activeRoom.height,
        sceneTicks: window.__r42RuntimeProbe?.ticks ?? 0,
        cooldown: scene.doorCooldown,
        lock: scene.transitionLock.phase,
        transitionRequestCount: scene.transitionRequestCount ?? null,
        onEnter: { ...(scene.onEnterCounts ?? {}) },
        armed: Object.fromEntries(scene.exitArmed),
        fade: fade ? {
          running: fade.isRunning,
          complete: fade.isComplete,
          progress: fade.progress,
          alpha: fade.alpha,
        } : null,
        camera: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
      };
    });
  }

  async function waitForRoom(room, timeoutMs = 7000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const state = await read();
      if (state.room === room) return state;
      await page.waitForTimeout(100);
    }
    throw new Error(`Timed out waiting for ${room}: ${JSON.stringify(await read())}`);
  }

  async function holdKeyTo(key, predicate, timeoutMs) {
    const samples = [];
    const start = await read();
    const startedAt = Date.now();
    samples.push({ t: 0, ...start });
    await page.keyboard.down(key);
    try {
      while (Date.now() - startedAt < timeoutMs) {
        await page.waitForTimeout(100);
        const state = await read();
        samples.push({ t: state.sceneTicks - start.sceneTicks, ...state });
        if (predicate(state)) return { key, start, end: state, samples };
      }
    } finally {
      await page.keyboard.up(key);
    }
    throw new Error(`Timed out moving with ${key}: ${JSON.stringify({ start: samples[0], end: samples.at(-1) })}`);
  }

  await page.goto(`http://localhost:${port}/jugar/?from=portal&room=plaza`, { waitUntil: 'load' });
  await waitReady();
  await dismissDialog();
  await setRouteFlags();
  await page.waitForFunction(() => window.__game.scene.getScene('explore').doorCooldown === 0, null, { timeout: 3000 });
  await installProbe();

  // Path A: supported debug hook → natural Phaser update → graph transition.
  const injectionBefore = await read();
  await page.evaluate(() => window.__pos(1870, 540));
  const injectionResult = await waitForRoom('taller');
  const injectionEnd = await read();
  const injectionSettle = await page.waitForTimeout(350);
  const injectionSettled = await read();

  // Path B forward: supported debug staging just outside the exit, then real D-key movement.
  await page.goto(`http://localhost:${port}/jugar/?from=portal&room=plaza`, { waitUntil: 'load' });
  await waitReady();
  await dismissDialog();
  await setRouteFlags();
  await page.waitForFunction(() => window.__game.scene.getScene('explore').doorCooldown === 0, null, { timeout: 3000 });
  await installProbe();
  const keyboardForwardStart = await read();
  await page.evaluate(() => window.__pos(1700, 540));
  const keyboardForwardMove = await holdKeyTo(
    'd',
    (state) => state.room !== 'plaza',
    6000,
  );
  const keyboardForwardResult = await read();
  const keyboardForwardSettle = await page.waitForTimeout(350);
  const keyboardForwardSettled = await read();

  // Reciprocal path: move from the actual Taller entry with the real S key.
  const keyboardReturnStart = keyboardForwardSettled;
  const keyboardReturnMove = await holdKeyTo(
    's',
    (state) => state.room !== 'taller',
    5000,
  );
  const keyboardReturnResult = await read();
  const keyboardReturnSettle = await page.waitForTimeout(350);
  const keyboardReturnSettled = await read();

  const approximately = (value, expected, tolerance) => Math.abs(value - expected) <= tolerance;
  result.deterministicPositionInjection = {
    method: 'window.__pos(1870, 540), then Phaser update only',
    before: injectionBefore,
    result: injectionResult,
    after: injectionEnd,
    settled: injectionSettled,
    graph: injectionResult.room === 'taller' ? 'RoomGraph.resolve(plaza, taller)' : null,
  };
  result.keyboardPlazaToTaller = {
    method: 'window.__pos(1700, 540) as legal staging, then real Playwright keydown D',
    start: keyboardForwardStart,
    move: {
      start: keyboardForwardMove.start,
      end: keyboardForwardMove.end,
      path: keyboardForwardMove.samples,
    },
    result: keyboardForwardResult,
    settled: keyboardForwardSettled,
    graph: keyboardForwardResult.room === 'taller' ? 'RoomGraph.resolve(plaza, taller)' : null,
  };
  result.keyboardTallerToPlaza = {
    method: 'real Playwright keydown S from Taller entry to local plaza exit',
    start: keyboardReturnStart,
    move: {
      start: keyboardReturnMove.start,
      end: keyboardReturnMove.end,
      path: keyboardReturnMove.samples,
    },
    result: keyboardReturnResult,
    settled: keyboardReturnSettled,
    graph: keyboardReturnResult.room === 'plaza' ? 'RoomGraph.resolve(taller, plaza)' : null,
  };
  result.transitionLock = {
    afterBothDirections: keyboardReturnSettled.lock,
    noStuckLock: keyboardReturnSettled.lock === 'idle',
  };
  result.consoleErrors = consoleErrors;
  result.pass = consoleErrors.length === 0
    && injectionResult.room === 'taller'
    && injectionResult.local
    && approximately(injectionResult.local.x, 480, 1)
    && approximately(injectionResult.local.y, 410, 1)
    && keyboardForwardMove.end.room === 'taller'
    && keyboardForwardResult.room === 'taller'
    && keyboardReturnMove.end.room === 'plaza'
    && keyboardReturnResult.room === 'plaza'
    && keyboardReturnResult.local
    && approximately(keyboardReturnResult.local.x, 1820, 1)
    && approximately(keyboardReturnResult.local.y, 540, 10)
    && keyboardReturnSettled.lock === 'idle';

  await writeFile(resolve(OUT, 'r42-validation-report.json'), JSON.stringify(result, null, 2));
  await browser.close();
  browser = undefined;
  if (!result.pass) throw new Error(`R4.2 acceptance failed; report=${resolve(OUT, 'r42-validation-report.json')}`);
} finally {
  if (browser) await browser.close().catch(() => {});
  await killVite();
}



