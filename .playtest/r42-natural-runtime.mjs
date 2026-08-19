import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 960, height: 540 } });
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push(e.message));

const url = 'http://localhost:5173/jugar/?from=portal&room=plaza';
const waitReady = async () => {
  await page.waitForFunction(() => window.__game?.scene?.getScene('explore')?.activeRoom?.id === 'plaza' && window.__roxana?.state, null, { timeout: 25000 });
};
const dismissDialog = async () => {
  for (let i = 0; i < 8; i++) {
    const visible = await page.locator('#dialog').evaluate((el) => !el.classList.contains('hidden'));
    if (!visible) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(280);
  }
  await page.waitForFunction(() => document.querySelector('#dialog')?.classList.contains('hidden'), null, { timeout: 3000 });
};
const setRouteFlags = async () => {
  await page.evaluate(() => {
    window.__roxana.state.flags.ohmAwake = true;
    window.__roxana.state.flags.puertaIntro = true;
  });
};
const read = async () => page.evaluate(() => {
  const s = window.__game.scene.getScene('explore');
  const c = s.cameras.main;
  const b = c.getBounds();
  const f = c.fadeEffect;
  const local = s.activeRoom?.playerLocal;
  return {
    room: s.activeRoom?.id ?? null,
    local: local ? { x: +local.x.toFixed(2), y: +local.y.toFixed(2) } : null,
    sprite: s.player ? { x: +s.player.x.toFixed(2), y: +s.player.y.toFixed(2) } : null,
    width: s.activeRoom?.width ?? null,
    height: s.activeRoom?.height ?? null,
    ticks: s.updateTickCount,
    requestCount: s.transitionRequestCount,
    cooldown: s.doorCooldown,
    lock: s.transitionLock?.phase ?? null,
    armed: Object.fromEntries(s.exitArmed ?? {}),
    onEnter: { ...(s.onEnterCounts ?? {}) },
    fade: f ? { running: f.isRunning, complete: f.isComplete, progress: f.progress, alpha: f.alpha, direction: f.direction } : null,
    camera: { x: b.x, y: b.y, w: b.width, h: b.height },
  };
});
const beginTrace = async (label) => page.evaluate((label) => {
  const s = window.__game.scene.getScene('explore');
  s.updateTraceEnabled = true;
  s.updateTrace = [{ label, kind: 'start' }];
}, label);
const endTrace = async () => page.evaluate(() => {
  const s = window.__game.scene.getScene('explore');
  s.updateTraceEnabled = false;
  return s.updateTrace;
});
const waitForRoom = async (room, timeoutMs = 7000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const state = await read();
    if (state.room === room) return state;
    await page.waitForTimeout(100);
  }
  throw new Error(`Timeout waiting for room ${room}; state=${JSON.stringify(await read())}`);
};
const moveUntil = async (key, predicate, timeoutMs, label) => {
  const startAt = Date.now();
  const samples = [];
  let state = await read();
  samples.push({ t: 0, ...state });
  await page.keyboard.down(key);
  try {
    while (Date.now() - startAt < timeoutMs) {
      await page.waitForTimeout(100);
      state = await read();
      samples.push({ t: Date.now() - startAt, ...state });
      if (predicate(state)) return { label, key, start: samples[0], end: state, samples };
    }
  } finally {
    await page.keyboard.up(key);
  }
  throw new Error(`Movement timeout for ${label}; state=${JSON.stringify(state)}`);
};
const waitForFadeSettle = async (label) => {
  const samples = [];
  for (const delay of [0, 50, 100, 150, 250, 350]) {
    if (delay) await page.waitForTimeout(delay - (samples.at(-1)?.t ?? 0));
    const state = await read();
    samples.push({ t: delay, ...state });
  }
  return { label, samples };
};

await page.goto(url, { waitUntil: 'load' });
await waitReady();
await dismissDialog();
await setRouteFlags();
await page.waitForFunction(() => window.__game.scene.getScene('explore').doorCooldown === 0, null, { timeout: 3000 });

// Path A: supported debug hook sets the sprite; the normal Phaser update synchronizes
// authoritative local state and the natural trigger loop performs the transition.
await beginTrace('deterministic-position-injection');
const beforeA = await read();
await page.evaluate(() => window.__pos(1870, 540));
const plazaToTallerA = await waitForRoom('taller', 7000);
const traceA = await endTrace();
const fadeA = await waitForFadeSettle('fade-after-injection');

// Reload for the no-teleport keyboard acceptance path.
await page.goto(url, { waitUntil: 'load' });
await waitReady();
await dismissDialog();
await setRouteFlags();
await page.waitForFunction(() => window.__game.scene.getScene('explore').doorCooldown === 0, null, { timeout: 3000 });
await beginTrace('keyboard-plaza-to-taller');
await page.evaluate(() => window.__pos(1700, 540));
const keyboardStart = await read();
const moveEast = await moveUntil('d', (s) => s.room !== 'plaza', 6000, 'plaza-east-to-taller');
const plazaToTaller = await read();
const traceKeyboardForward = await endTrace();
const fadeKeyboardForward = await waitForFadeSettle('fade-after-keyboard-plaza-taller');

// Keep the forward key released. Movement from the Taller entry to its local exit.
const tallerStart = plazaToTaller;
const movePlazaExit = await moveUntil('s', (s) => s.room !== 'taller', 5000, 'taller-to-plaza-exit');
const tallerToPlaza = await read();
const keyboardEnd = await read();
const fadeKeyboardReturn = await waitForFadeSettle('fade-after-keyboard-taller-plaza');

const report = {
  route: url,
  pathA: {
    method: 'window.__pos(1870, 540) (supported debug hook; no requestRoomTransition, loadRoom, or manual trigger loop)',
    before: beforeA,
    result: plazaToTallerA,
    fade: fadeA,
    requestCountDelta: plazaToTallerA.requestCount - beforeA.requestCount,
    onEnterTallerDelta: (plazaToTallerA.onEnter.taller ?? 0) - (beforeA.onEnter.taller ?? 0),
    fullTrace: traceA,
    decisiveFrames: traceA.filter((f) => f && f.phase === 'before' && f.inside).slice(-4),
  },
  keyboard: {
    forward: {
      start: keyboardStart,
      east: moveEast,
      method: 'supported debug staging at (1700, 540), then held keyboard D through Plaza → Taller',
      result: plazaToTaller,
      fade: fadeKeyboardForward,
      fullTrace: traceKeyboardForward,
      decisiveFrames: traceKeyboardForward.filter((f) => f && f.phase === 'before' && f.inside).slice(-6),
    },
    return: {
      start: tallerStart,
      south: movePlazaExit,
      result: tallerToPlaza,
      final: keyboardEnd,
      fade: fadeKeyboardReturn,
    },
    requestCountDelta: keyboardEnd.requestCount - keyboardStart.requestCount,
    onEnterTallerTotal: keyboardEnd.onEnter.taller ?? 0,
    onEnterPlazaTotal: keyboardEnd.onEnter.plaza ?? 0,
    noStuckLock: keyboardEnd.lock === 'idle',
  },
  consoleErrors,
  pass: consoleErrors.length === 0
    && plazaToTallerA.room === 'taller'
    && moveEast.end.room === 'taller'
    && tallerToPlaza.room === 'plaza'
    && keyboardEnd.lock === 'idle',
};
writeFileSync('.playtest/r42-natural-runtime.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
if (!report.pass) process.exit(1);
