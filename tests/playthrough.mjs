/**
 * Real-input Arc I gauntlet. Run with the development server on port 4173:
 *   node tests/playthrough.mjs
 * Uses fresh browser storage. Reads the development inspection surface only to
 * observe positions and state; every game change is a keyboard or DOM click.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const output = resolve('output/playwright');
await mkdir(output, { recursive: true });
const report = { startedAt: new Date().toISOString(), inputPolicy: 'UI input only; read-only game inspection for navigation and assertions', stages: [], measurements: [], errors: [], completed: false };
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();
page.setDefaultTimeout(12000);
await page.routeWebSocket('**', socket => socket.close());
page.on('pageerror', error => report.errors.push({ type: 'pageerror', message: error.message }));
page.on('console', message => { if (message.type() === 'error' && !/WebSocket|ERR_CONNECTION_CLOSED/.test(message.text())) report.errors.push({ type: 'console', message: message.text() }); });
let stage = 'launch';
let finishModalSeen = false;
let finishModalCount = 0;
let shots = 0;

const inspect = () => page.evaluate(() => {
  const game = window.__ohmdal;
  if (!game) return null;
  return {
    mode: game.mode, area: game.state.area, position: game.world?.getPlayerPosition(),
    flags: { ...game.state.flags }, nearby: game.nearby?.id, visited: [...game.state.visited], secrets: [...game.state.secrets],
    seen: [...game.state.seen], target: game.world?.target ? [...game.world.target] : null,
    puzzle: game.workbench?.active ? { id: game.workbench.id, mode: game.workbench.mode, state: JSON.parse(JSON.stringify(game.workbench.state)), result: { solved: game.workbench.result.solved, current: game.workbench.result.current } } : null,
  };
});

function log(event, data = {}) {
  report.stages.push({ at: new Date().toISOString(), event, ...data });
  process.stdout.write(`${event}${Object.keys(data).length ? ` ${JSON.stringify(data)}` : ''}\n`);
}

async function screenshot(name) {
  const file = `playthrough-${String(++shots).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: resolve(output, file), animations: 'disabled' });
  report.stages.push({ event: 'screenshot', file });
}

async function settle({ stable = 1300, allowPuzzle = true, timeout = 35000 } = {}) {
  const start = Date.now();
  let quietSince = null;
  while (Date.now() - start < timeout) {
    const info = await inspect();
    if (!info) { await page.waitForTimeout(100); continue; }
    if (info.mode === 'dialogue') {
      quietSince = null;
      await page.keyboard.press('Enter');
      await page.waitForTimeout(55);
    } else if (info.mode === 'puzzle' && allowPuzzle) return info;
    else if (info.mode === 'modal' && await page.locator('#keep-exploring').isVisible()) {
      finishModalSeen = true;
      finishModalCount++;
      await screenshot('arc-complete');
      await page.locator('#keep-exploring').click();
      quietSince = null;
    } else if (info.mode === 'world') {
      quietSince ??= Date.now();
      if (Date.now() - quietSince >= stable) return info;
      await page.waitForTimeout(100);
    } else {
      quietSince = null;
      await page.waitForTimeout(120);
    }
  }
  throw new Error(`Timed out settling after ${stage}: ${JSON.stringify(await inspect())}`);
}

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// The authored collisions are observed to plan ordinary clicks around obstacles.
function navigationPath(start, goal, bounds, obstacles) {
  const spacing = 0.75;
  const halfW = bounds[0] / 2 - 0.7, halfD = bounds[1] / 2 - 0.7;
  const clear = point => Math.abs(point[0]) <= halfW && Math.abs(point[1]) <= halfD && !obstacles.some(o => Math.abs(point[0] - o.x) < o.w + 0.43 && Math.abs(point[1] - o.z) < o.d + 0.43);
  const lineClear = (a, b) => {
    const n = Math.ceil(distance(a, b) / 0.22);
    for (let i = 1; i <= n; i++) if (!clear([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n])) return false;
    return true;
  };
  if (lineClear(start, goal)) return [goal];
  const cell = p => [Math.round(p[0] / spacing), Math.round(p[1] / spacing)];
  const pos = p => [p[0] * spacing, p[1] * spacing];
  const key = p => p.join(',');
  const from = cell(start), target = cell(goal), open = [{ p: from, g: 0, f: distance(start, goal) }];
  const parents = new Map(), costs = new Map([[key(from), 0]]), visited = new Set();
  let end = null;
  for (let guard = 0; open.length && guard < 10000; guard++) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift(), k = key(current.p);
    if (visited.has(k)) continue;
    visited.add(k);
    if (distance(pos(current.p), goal) < 1 && lineClear(pos(current.p), goal)) { end = current.p; break; }
    for (const dx of [-1, 0, 1]) for (const dz of [-1, 0, 1]) {
      if (!dx && !dz) continue;
      const next = [current.p[0] + dx, current.p[1] + dz], point = pos(next), nk = key(next);
      if (!clear(point) || !lineClear(pos(current.p), point)) continue;
      const cost = current.g + Math.hypot(dx, dz) * spacing;
      if (cost >= (costs.get(nk) ?? Infinity)) continue;
      costs.set(nk, cost); parents.set(nk, current.p);
      open.push({ p: next, g: cost, f: cost + distance(point, goal) });
    }
  }
  if (!end) throw new Error(`No physical navigation route from ${start} to ${goal}; obstacles=${JSON.stringify(obstacles)}`);
  const raw = [goal];
  while (key(end) !== key(from)) { raw.unshift(pos(end)); end = parents.get(key(end)); }
  const smooth = [];
  let point = start, index = 0;
  while (index < raw.length) {
    let far = index;
    for (let next = index + 1; next < raw.length; next++) {
      if (lineClear(point, raw[next])) far = next;
      else break;
    }
    smooth.push(raw[far]); point = raw[far]; index = far + 1;
  }
  return smooth;
}

async function worldGeometry(id) {
  return page.evaluate(id => {
    const world = window.__ohmdal.world;
    const object = [...world.area.objects, ...world.area.exits].find(o => o.id === id);
    return { object, bounds: [...world.bounds], obstacles: world.obstacles.map(o => ({ x: o.x, z: o.z, w: o.w, d: o.d })) };
  }, id);
}

async function clickGround(point) {
  const screen = await page.evaluate(point => {
    const world = window.__ohmdal.world;
    const projected = world.player.position.clone().set(point[0], 0, point[1]).project(world.camera);
    const rect = world.canvas.getBoundingClientRect();
    const x = rect.left + (projected.x * 0.5 + 0.5) * rect.width, y = rect.top + (-projected.y * 0.5 + 0.5) * rect.height;
    return { x, y, unobscured: document.elementFromPoint(x, y) === world.canvas };
  }, point);
  if (!screen.unobscured || !(screen.x > 10 && screen.x < 1430 && screen.y > 120 && screen.y < 855)) return false;
  await page.mouse.click(screen.x, screen.y);
  return true;
}

async function keyboardNudge(from, toward) {
  const dx = toward[0] - from[0], dz = toward[1] - from[1];
  const screenX = dx, screenZ = dz;
  const scale = Math.max(Math.abs(screenX), Math.abs(screenZ), 0.001);
  const keys = [];
  if (Math.abs(screenX) > scale * 0.35) keys.push(screenX > 0 ? 'ArrowRight' : 'ArrowLeft');
  if (Math.abs(screenZ) > scale * 0.35) keys.push(screenZ > 0 ? 'ArrowDown' : 'ArrowUp');
  for (const key of keys) await page.keyboard.down(key);
  await page.waitForTimeout(150);
  for (const key of keys) await page.keyboard.up(key);
}

async function walkTo(id) {
  stage = `walk:${id}`;
  await settle({ stable: 160 });
  const geometry = await worldGeometry(id);
  assert.ok(geometry.object, `${id} exists in the current physical area`);
  const goal = [geometry.object.x, geometry.object.z];
  let info = await inspect();
  const startingArea = info.area;
  let path = navigationPath(info.position, goal, geometry.bounds, geometry.obstacles);
  let waypoint = 0, lastProgress = Date.now(), best = distance(info.position, goal), replans = 0;
  const started = Date.now();
  while (Date.now() - started < 65000) {
    info = await inspect();
    assert.equal(info.area, startingArea, `Walking toward ${id} must remain in its authored area`);
    if (info.mode !== 'world') { await page.keyboard.up('Shift'); await settle({ stable: 180 }); continue; }
    if (info.nearby === id) { await page.keyboard.up('Shift'); return geometry.object; }
    if (distance(info.position, goal) < best - 0.12) { best = distance(info.position, goal); lastProgress = Date.now(); }
    if (waypoint < path.length - 1 && distance(info.position, path[waypoint]) < 0.5) waypoint++;
    const target = path[waypoint];
    const dist = distance(info.position, target);
    const step = Math.min(3.4, dist);
    const partial = dist < 0.01 ? target : [info.position[0] + (target[0] - info.position[0]) / dist * step, info.position[1] + (target[1] - info.position[1]) / dist * step];
    await page.keyboard.down('Shift');
    if (!info.target || distance(info.target, partial) > 0.85) {
      if (!await clickGround(partial)) await keyboardNudge(info.position, partial);
    }
    if (Date.now() - lastProgress > 6500) {
      if (++replans > 3) throw new Error(`Movement blocked approaching ${id}: ${JSON.stringify({ position: info.position, goal, nearby: info.nearby, obstacles: geometry.obstacles })}`);
      // A player caught in a corner steps back the way they came before trying again.
      await page.keyboard.up('Shift'); await keyboardNudge(target, info.position); await keyboardNudge(target, info.position);
      path = navigationPath(info.position, goal, geometry.bounds, geometry.obstacles); waypoint = 0; lastProgress = Date.now();
      log('navigation-replan', { id, position: info.position });
    }
    await page.waitForTimeout(160);
  }
  throw new Error(`Walking timed out for ${id}: ${JSON.stringify(await inspect())}`);
}

async function interact(id, { settleAfter = true } = {}) {
  const object = await walkTo(id);
  stage = `interact:${id}`;
  await page.keyboard.press('e');
  log('interact', { area: (await inspect()).area, id });
  if (settleAfter) await settle();
  return object;
}

async function operate(id, desired) {
  const geometry = await worldGeometry(id);
  if (Boolean((await inspect()).flags[geometry.object.action.flag]) === desired) return;
  await interact(id);
  assert.equal(Boolean((await inspect()).flags[geometry.object.action.flag]), desired, `${id}: control changes through E`);
}

async function fieldToggle(id, desired) {
  const object = await walkTo(id);
  stage = `field-measurement:${id}`;
  assert.notEqual(Boolean((await inspect()).flags[object.action.flag]), desired, 'The field probe observes a real change of control');
  await page.keyboard.press('q');
  await page.locator('#field-meter').waitFor({ state: 'visible' });
  const readings = page.locator('#field-details');
  assert.equal(await readings.evaluate(element => element.open), false, 'Field observations precede optional numbers');
  await readings.locator('summary').click();
  const before = { voltage: await page.locator('#field-voltage').innerText(), current: await page.locator('#field-current').innerText() };
  assert.equal((await inspect()).mode, 'world', 'The field instrument does not open a separate modal');
  await page.keyboard.press('e');
  await page.waitForFunction(before => document.querySelector('#field-voltage')?.textContent !== before.voltage || document.querySelector('#field-current')?.textContent !== before.current, before);
  const after = { voltage: await page.locator('#field-voltage').innerText(), current: await page.locator('#field-current').innerText() };
  assert.equal((await inspect()).mode, 'world', 'Operating the mechanism keeps the player in the world');
  assert.notDeepEqual(after, before, 'Real circuit readings respond to the world control');
  assert.equal(Boolean((await inspect()).flags[object.action.flag]), desired);
  await page.keyboard.press('q');
  await page.locator('#field-meter').waitFor({ state: 'hidden' });
  report.measurements.push({ worldObject: id, before, after, mode: 'field-live' });
  log('live-world-measurement', { id, before, after });
  await settle();
}

async function travel(id, target) {
  await interact(id);
  assert.equal((await inspect()).area, target, `The ${id} passage enters ${target}`);
  await screenshot(`${target}-arrival`);
}

async function setMode(mode) {
  const selector = `[data-action="mode"][data-mode="${mode}"]`;
  const control = page.locator(selector);
  if (!(await control.count())) {
    assert.equal((await inspect()).puzzle.mode, mode, 'The first bench already starts in its only available tool');
    return;
  }
  const extraTools = page.locator('[data-drawer="tools"]');
  if (await extraTools.locator(selector).count() && !await extraTools.evaluate(element => element.open)) {
    await extraTools.locator('summary').click();
  }
  await control.click();
}
async function showNumericReadings() {
  const control = page.locator('[data-action="numbers"]');
  if (await control.getAttribute('aria-pressed') !== 'true') await control.click();
}
async function wire(a, b) {
  await setMode('wire');
  await page.locator(`button[data-port="${a}"]`).click();
  await page.locator(`button[data-port="${b}"]`).click();
}
async function removeWire(a, b) {
  await setMode('wire');
  const wires = (await inspect()).puzzle.state.wires;
  const index = wires.findIndex(w => w.includes(a) && w.includes(b));
  assert.ok(index >= 0, `The physical cable ${a} ↔ ${b} exists before removal`);
  const drawer = page.locator('.wb-wire-drawer');
  if (!await drawer.evaluate(element => element.open)) await drawer.locator('summary').click();
  await page.locator(`button[data-wire="${index}"]`).click();
}
async function knob(key, value) {
  const input = page.locator(`input[data-knob="${key}"]:visible`);
  const min = Number(await input.getAttribute('min')), step = Number(await input.getAttribute('step'));
  await input.press('Home');
  for (let i = 0; i < Math.round((value - min) / step); i++) await input.press('ArrowRight');
  assert.equal((await inspect()).puzzle.state.values[key], value, `The ${key} dial reaches ${value} using keyboard arrows`);
}
async function measure(mode, a, b) {
  await setMode(mode);
  await page.locator(`button[data-port="${a}"]`).click();
  await page.locator(`button[data-port="${b}"]`).click();
  await showNumericReadings();
  const reading = await page.locator('.wb-meter-readout').innerText();
  report.measurements.push({ puzzle: (await inspect()).puzzle.id, mode, a, b, reading });
  return reading;
}

async function solvePanel(objectId, id) {
  await interact(objectId);
  stage = `puzzle:${id}`;
  let info = await inspect();
  assert.equal(info.mode, 'puzzle');
  assert.equal(info.puzzle.id, id);
  assert.equal(info.puzzle.result.solved, false, `${id} begins with an actual fault`);
  await screenshot(`${id}-inspection`);

  if (id === 'gate') {
    const reading = await measure('voltage', 'latchIn', 'latchOut');
    assert.match(reading, /[−-]/, 'The reversed actuator has negative voltage');
  }
  if (id === 'pump') {
    await measure('voltage', 'positive', 'negative');
    await measure('voltage', 'pumpIn', 'pumpOut');
  }
  if (id === 'awaken') assert.equal(await page.locator('[data-action="mode"]').count(), 0, 'The first encounter does not introduce instrument modes');
  if (id !== 'awaken' && info.puzzle.state.sourceOn && !info.puzzle.state.tripped) await page.locator('[data-action="power"]').click();
  if (id === 'workshop') {
    assert.match(await measure('continuity', 'spliceA', 'spliceB'), /ABIERTO/, 'Continuity exposes the concealed break');
    await screenshot('workshop-continuity-open');
  }
  switch (id) {
    case 'awaken': await wire('heartOut', 'negative'); break;
    case 'workshop': await wire('spliceA', 'spliceB'); break;
    case 'gate':
      await removeWire('trimB', 'latchOut'); await removeWire('latchIn', 'negative');
      await wire('trimB', 'latchIn'); await wire('latchOut', 'negative'); break;
    case 'pump': await wire('lineA', 'lineB'); break;
    case 'distribution':
      await page.locator('[data-action="switch"][data-key="archive"]:visible').click();
      await removeWire('clinicOut', 'kitchenIn');
      await wire('clinicOut', 'negative'); await wire('positive', 'kitchenIn'); break;
    case 'irrigation': await knob('warmth', 12); await knob('flow', 12); break;
    case 'beacon_supply': await knob('ballast', 3); break;
    case 'beacon_network':
      await removeWire('opticOut', 'bearingIn'); await removeWire('bearingOut', 'signalIn');
      await wire('opticOut', 'negative'); await wire('positive', 'bearingIn');
      await wire('bearingOut', 'negative'); await wire('positive', 'signalIn'); break;
    case 'beacon_lens':
      // Nereo's comparison, first half: the tap with the lens elsewhere.
      if (!(await inspect()).puzzle.state.sourceOn) await page.locator('[data-action="power"]').click();
      await measure('voltage', 'tap', 'negative');
      await page.locator('[data-action="power"]').click(); await setMode('wire');
      await removeWire('positive', 'lensIn'); await wire('tap', 'lensIn'); await knob('upper', 12); break;
    default: throw new Error(`No UI repair sequence for ${id}`);
  }
  info = await inspect();
  if (info.puzzle.state.tripped) await page.locator('[data-action="rearm"]').click();
  else if (!info.puzzle.state.sourceOn) await page.locator('[data-action="power"]').click();
  if (id === 'distribution') {
    // Ivara's request: show the infirmary lit while the kitchen is isolated, then reopen it.
    await page.locator('.wb-proof').waitFor({ state: 'visible' });
    await page.locator('[data-action="switch"][data-key="kitchen"]:visible').click();
    assert.equal((await inspect()).puzzle.state.proofs.clinicAlone, true, 'The infirmary stays lit with the kitchen isolated');
    await page.locator('[data-action="switch"][data-key="kitchen"]:visible').click();
    log('proof', { id, proof: 'clinicAlone' });
  }
  if (id === 'beacon_lens') {
    await page.locator('.wb-proof').waitFor({ state: 'visible' });
    await measure('voltage', 'tap', 'negative');
    assert.equal((await inspect()).puzzle.state.proofs.loadEffect, true, 'The tap was read unloaded and loaded');
    log('proof', { id, proof: 'loadEffect' });
  }
  await page.locator('.wb-success:not(.wb-proof)').waitFor({ state: 'visible' });
  assert.equal((await inspect()).puzzle.result.solved, true, `${id}: electrical model verifies UI repair`);
  if (id === 'beacon_lens') await measure('voltage', 'lensIn', 'lensOut');
  await screenshot(`${id}-operating`);
  await page.locator('.wb-success [data-action="commission"]').first().click();
  await settle({ timeout: 40000 });
  assert.equal((await inspect()).flags[id], true, `${id}: putting in service persists the repair`);
  log('commissioned', { id });
}

try {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.locator('#title-settings').click();
  await page.locator('#text-speed').check();
  await page.locator('#resume-option').click();
  await screenshot('title');
  await page.locator('#new-game').click();
  await settle({ stable: 1600 });
  await screenshot('portal-arrival');
  await solvePanel('ohm_pedestal', 'awaken');
  await interact('portal_seed');
  await travel('portal_to_plaza', 'plaza');
  await interact('marin');
  await interact('plaza_bell');
  await travel('plaza_to_workshop', 'workshop');
  await interact('lumen');
  await operate('workshop_feed', true); await fieldToggle('workshop_return', true);
  await solvePanel('workbench', 'workshop');
  await interact('workshop_cup');
  await travel('workshop_to_plaza', 'plaza');
  await travel('plaza_to_road', 'road');
  await interact('edda_road');
  await operate('road_send', true); await operate('road_return', true);
  assert.equal((await inspect()).flags.bridge_ready, false, 'All-on world controls do not solve the bypass');
  await screenshot('road-bypass-inhibits');
  await operate('road_bypass', false);
  await solvePanel('gate_panel', 'gate');
  await interact('road_nest');
  await travel('road_to_spring', 'spring');
  await operate('spring_sluice', true); await operate('spring_coupling', true);
  await solvePanel('pump_panel', 'pump');
  await interact('spring_bottle');
  await travel('spring_to_castle', 'castle');
  await operate('castle_service', true);
  assert.equal((await inspect()).flags.castle_ready, false, 'Healthy service does not bypass isolation');
  await operate('castle_isolated', false);
  await solvePanel('distribution_panel', 'distribution');
  await interact('castle_hidden');
  await travel('castle_to_terraces', 'terraces');
  await interact('yesca');
  await operate('forge_limited', true); await operate('irrigation_open', true);
  await solvePanel('irrigation_panel', 'irrigation');
  await interact('terraces_secret');
  await travel('terraces_to_lake', 'lake');
  await interact('nereo_lake');
  await operate('lake_cable', true); await operate('lake_return', true);
  await interact('lake_secret');
  await travel('lake_to_lighthouse', 'lighthouse');
  await interact('nereo_tower');
  await operate('tower_feed', true); await operate('tower_return', true);
  await solvePanel('beacon_supply_panel', 'beacon_supply');
  await operate('tower_isolated', true); await operate('tower_motor', true);
  await solvePanel('beacon_network_panel', 'beacon_network');
  await operate('tower_shutter', true); await operate('tower_lens_free', true);
  await solvePanel('beacon_lens_panel', 'beacon_lens');
  assert.equal(finishModalSeen, true, 'The full audiovisual finale reached its ending card');
  await interact('lighthouse_ohm_note');
  await interact('edda_tower');
  assert.ok((await inspect()).seen.includes('lighthouse_epilogue'), 'The first lesson epilogue is playable');
  await screenshot('lighthouse-restored');
  await interact('beacon_lens_panel');
  const commissioned = (await inspect()).puzzle;
  assert.equal(commissioned?.id, 'beacon_lens', 'A restored mechanism remains inspectable');
  assert.equal(commissioned.state.completed, true);
  assert.equal(await page.locator('[data-action="power"],[data-action="rearm"]').first().isDisabled(), true, 'Commissioned supply control is secured');
  assert.equal(await page.locator('[data-action="reset"]').isDisabled(), true, 'Commissioned topology cannot be reset');
  await measure('voltage', 'lensIn', 'lensOut');
  assert.deepEqual((await inspect()).puzzle.state.wires, commissioned.state.wires, 'Read-only measurement preserves connections');
  await screenshot('commissioned-lens-measurement');
  await page.locator('.wb-close[data-action="close"]').click();
  await settle();
  assert.equal(finishModalCount, 1, 'Inspecting a restored board does not repeat the finale');
  log('commissioned-board-inspected', { id: 'beacon_lens' });
  await page.keyboard.press('j');
  await screenshot('completed-journal');
  await page.keyboard.press('Escape');
  let finished = await inspect();
  assert.equal(finished.visited.length, 9);
  assert.equal(finished.secrets.length, 9);
  assert.equal(finished.flags.beacon_lens, true);
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('#continue').click();
  await settle({ stable: 1600 });
  finished = await inspect();
  assert.equal(finished.flags.beacon_lens, true, 'Completed restoration survives a real page reload');
  assert.equal(finished.secrets.length, 9, 'Optional discoveries survive reload');
  assert.ok(finished.seen.includes('lighthouse_epilogue'), 'Epilogue progress survives reload');
  await screenshot('resumed-completed-save');
  assert.equal(report.errors.length, 0, `No browser errors: ${JSON.stringify(report.errors)}`);
  report.completed = true;
  report.final = finished;
  log('arc-complete-and-reloaded', { areas: finished.visited.length, secrets: finished.secrets.length });
} catch (error) {
  report.failure = { stage, message: error.message, stack: error.stack, state: await inspect().catch(() => null) };
  await screenshot('failure').catch(() => {});
  process.stderr.write(`${error.stack}\n`);
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  await writeFile(resolve(output, 'playthrough-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
}
