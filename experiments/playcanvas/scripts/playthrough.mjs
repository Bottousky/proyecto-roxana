/**
 * Real-input Arc I gauntlet. Run with the development server on port 4190:
 *   node scripts/playthrough.mjs
 * ROUTE=adversarial takes a different journey through the same arc: a locked exit tried early,
 * a wrong wire undone and a bench abandoned, reloads mid-bench, mid-scene and mid-journey,
 * interfaces opened and closed in a row, wrong dials, a physical walk back from the Castillo to
 * the Plaza and forward again, and the inhabitants spoken to again after the ending.
 * Uses fresh browser storage. Reads the development inspection surface only to
 * observe positions and state; every game change is a keyboard or DOM click.
 */
import { chromium } from 'playwright';
import { chromePath, gpuArgs } from './chrome.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const output = resolve(process.env.PLAYTHROUGH_OUTPUT || 'output/playcanvas-playthrough');
await mkdir(output, { recursive: true });
const ROUTE = process.env.ROUTE || 'main', adversarial = ROUTE === 'adversarial';
const report = { route: ROUTE, startedAt: new Date().toISOString(), inputPolicy: 'UI input only; read-only game inspection for navigation and assertions', stages: [], measurements: [], errors: [], dialogue: [], completed: false };
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();
page.setDefaultTimeout(12000);
await page.routeWebSocket('**', socket => socket.close());
// Every spoken line, across reloads, so the report can show what the game actually narrated.
await page.exposeFunction('__recordLine', text => { if (report.dialogue.at(-1) !== text) report.dialogue.push(text); });
await page.addInitScript(() => addEventListener('DOMContentLoaded', () => {
  const node = document.querySelector('#dialogue-announcement');
  if (node) new MutationObserver(() => node.textContent && window.__recordLine(node.textContent)).observe(node, { childList: true, characterData: true, subtree: true });
}));
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
  const where = await inspect();
  report.stages.push({ event: 'screenshot', file, area: where?.area, position: where?.position });
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
    const object = world.getInteractions().find(o => o.id === id);
    return { object, path: object ? world.planInteraction(object) : null, bounds: [...world.bounds], obstacles: world.obstacles.map(o => ({ x: o.x, z: o.z, w: o.w, d: o.d })) };
  }, id);
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

// Walking is done like a player with a keyboard: arrow keys held toward the next waypoint.
const heldKeys = new Set();
async function steer(from, to, run) {
  const dx = to[0] - from[0], dz = to[1] - from[1], scale = Math.max(Math.abs(dx), Math.abs(dz), 0.001), want = new Set();
  if (Math.abs(dx) > scale * 0.4) want.add(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
  if (Math.abs(dz) > scale * 0.4) want.add(dz > 0 ? 'ArrowDown' : 'ArrowUp');
  if (run) want.add('Shift');
  for (const key of [...heldKeys]) if (!want.has(key)) { await page.keyboard.up(key); heldKeys.delete(key); }
  for (const key of want) if (!heldKeys.has(key)) { await page.keyboard.down(key); heldKeys.add(key); }
}
async function releaseKeys() { for (const key of [...heldKeys]) await page.keyboard.up(key); heldKeys.clear(); }

async function walkTo(id) {
  stage = `walk:${id}`;
  await settle({ stable: 160 });
  const geometry = await worldGeometry(id);
  assert.ok(geometry.object, `${id} exists in the current physical area`);
  let goal = geometry.path?.at(-1) || [geometry.object.x, geometry.object.z];
  let info = await inspect();
  // A crossing walks the traveller onto the new ground by itself; wait for it like a player would.
  for (const until = Date.now() + 8000; info.target && Date.now() < until; info = await inspect()) await page.waitForTimeout(100);
  const startingArea = info.area;
  let path = geometry.path?.length ? geometry.path : [goal];
  let waypoint = 0, lastProgress = Date.now(), best = distance(info.position, goal), replans = 0;
  const started = Date.now();
  while (Date.now() - started < 65000) {
    info = await inspect();
    assert.equal(info.area, startingArea, `Walking toward ${id} must remain in its authored area`);
    if (info.mode !== 'world') { await releaseKeys(); await settle({ stable: 180 }); continue; }
    if (info.nearby === id || await page.evaluate(id => {const w=window.__ohmdal.world;return w.canInteractWith(w.getInteractions().find(o=>o.id===id));},id)) { await releaseKeys(); return geometry.object; }
    if (distance(info.position, goal) < best - 0.12) { best = distance(info.position, goal); lastProgress = Date.now(); }
    while (waypoint < path.length - 1 && distance(info.position, path[waypoint]) < 0.6) waypoint++;
    const target = path[waypoint];
    await steer(info.position, target, distance(info.position, target) > 2);
    if (Date.now() - lastProgress > 6500) {
      if (++replans > 3) throw new Error(`Movement blocked approaching ${id}: ${JSON.stringify({ position: info.position, goal, nearby: info.nearby, obstacles: geometry.obstacles })}`);
      // A player caught in a corner steps back the way they came before trying again.
      await releaseKeys(); await keyboardNudge(target, info.position); await keyboardNudge(target, info.position);
      // …and sidesteps, alternating sides, as someone would around a post.
      const side = replans % 2 ? 1 : -1, dx = target[0] - info.position[0], dz = target[1] - info.position[1];
      for (let i = 0; i < 3; i++) await keyboardNudge(info.position, [info.position[0] - dz * side, info.position[1] + dx * side]);
      const fresh = await worldGeometry(id); path = fresh.path?.length ? fresh.path : [goal]; goal = path.at(-1); waypoint = 0; lastProgress = Date.now();
      log('navigation-replan', { id, position: info.position });
    }
    await page.waitForTimeout(60);
  }
  await releaseKeys();
  throw new Error(`Walking timed out for ${id}: ${JSON.stringify(await inspect())}`);
}

// Step closer until this, and not a neighbouring object, is what E would use.
async function approach(id, object) {
  for (const until = Date.now() + 2500; (await inspect()).nearby !== id && Date.now() < until;) {
    const info = await inspect(); await steer(info.position, [object.x, object.z], false); await page.waitForTimeout(60);
  }
  await releaseKeys();
}

async function interact(id, { settleAfter = true } = {}) {
  const object = await walkTo(id);
  stage = `interact:${id}`;
  await approach(id, object);
  if((await inspect()).nearby===id) await page.keyboard.press('e');
  else {const p=await page.evaluate(id=>{const w=window.__ohmdal.world,o=w.getInteractions().find(o=>o.id===id),p=w.getScreenPosition(o),r=w.canvas.getBoundingClientRect();return {x:p.x+r.left,y:p.y+r.top};},id);await page.mouse.click(p.x,p.y);}
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
  await approach(id, object);
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
  await page.waitForFunction(target => window.__ohmdal.state.area === target, target, {timeout:25000});
  await settle({stable:1400});
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

// ── Adversarial route ────────────────────────────────────────────────────────────────
async function wrongDials(id, settings) {
  if (!(await inspect()).puzzle.state.sourceOn) await page.locator('[data-action="power"]').click();
  for (const values of settings) {
    for (const [key, value] of Object.entries(values)) await knob(key, value);
    const info = await inspect();
    assert.equal(info.puzzle.result.solved, false, `${id}: ${JSON.stringify(values)} is not the repair`);
    log('wrong-dials', { id, values, tripped: info.puzzle.state.tripped });
    if (info.puzzle.state.tripped) await page.locator('[data-action="rearm"]').click();
  }
  await screenshot(`${id}-wrong-dials`);
}
const activeFlags = flags => Object.keys(flags).filter(key => flags[key]).sort();
async function reloadAndContinue(label) {
  stage = `reload:${label}`;
  const before = await inspect();
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('#continue').click();
  await settle({ stable: 1400 });
  const after = await inspect();
  assert.equal(after.area, before.area, `${label}: reload returns to the same place`);
  for (const flag of activeFlags(before.flags)) assert.ok(after.flags[flag], `${label}: «${flag}» survives the reload`);
  assert.ok(distance(before.position, after.position) < 2, `${label}: reload keeps the traveller where they stood (${before.position} → ${after.position})`);
  log('reload', { label, area: after.area, position: after.position });
}
async function lockedExit(id) {
  const before = (await inspect()).area;
  await interact(id);
  const after = await inspect();
  assert.equal(after.area, before, `${id} stays closed before its story is ready`);
  assert.equal(after.mode, 'world', `${id}: the locked passage gives control back`);
  log('locked-exit', { id });
}
async function interfacesRoundTrip() {
  stage = 'interfaces';
  for (const key of ['j', 'Escape', 'm', 'Escape', 'h', 'Escape', 'Escape', 'Escape', 'j', 'm', 'Escape']) { await page.keyboard.press(key); await page.waitForTimeout(220); }
  if ((await inspect()).mode !== 'world') await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  const start = await inspect();
  assert.equal(start.mode, 'world', 'Opening and closing interfaces in a row returns to the world');
  for (const key of ['ArrowLeft', 'ArrowDown']) { await page.keyboard.down(key); await page.waitForTimeout(450); await page.keyboard.up(key); }
  const moved = await inspect();
  assert.ok(distance(start.position, moved.position) > .4, 'Movement still responds after the interfaces');
  log('interfaces-round-trip', { from: start.position, to: moved.position });
}
async function wrongWireThenAbandon() {
  await interact('ohm_pedestal');
  stage = 'adversarial:awaken';
  assert.equal((await inspect()).mode, 'puzzle');
  await wire('heartOut', 'positive');
  assert.equal((await inspect()).puzzle.result.solved, false, 'Both ends of the heart on one terminal do not wake Ohm');
  await screenshot('awaken-wrong-wire');
  await removeWire('heartOut', 'positive');
  await page.locator('.wb-close[data-action="close"]').first().click();
  await settle();
  assert.equal(Boolean((await inspect()).flags.awaken), false, 'Leaving an unfinished bench does not commission it');
  log('bench-abandoned', { id: 'awaken' });
}
async function walkBackAndForth() {
  for (const [exit, area] of [['castle_to_spring', 'spring'], ['spring_to_road', 'road'], ['road_to_plaza', 'plaza']]) await travel(exit, area);
  await interact('marin');
  for (const [exit, area] of [['plaza_to_road', 'road'], ['road_to_spring', 'spring'], ['spring_to_castle', 'castle']]) await travel(exit, area);
  log('walked-back-and-forth', { from: 'castle', to: 'plaza' });
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
    // Continuity would pass all three joints; the loss shows only as a difference while the pump works.
    await measure('voltage', 'positive', 'negative');
    await measure('voltage', 'pumpIn', 'pumpOut');
    await measure('voltage', 'e1a', 'e1b');
    await measure('voltage', 'e2a', 'e2b');
    assert.equal((await inspect()).puzzle.state.proofs.foundLoss, true, 'Vega saw where the pressure is lost');
    log('proof', { id, proof: 'foundLoss' });
  }
  if (id === 'awaken') assert.equal(await page.locator('[data-action="mode"]').count(), 0, 'The first encounter does not introduce instrument modes');
  if (id !== 'awaken' && info.puzzle.state.sourceOn && !info.puzzle.state.tripped) await page.locator('[data-action="power"]').click();
  if (id === 'workshop') {
    // Section by section: two have a path, one does not.
    assert.doesNotMatch(await measure('continuity', 's1a', 's1b'), /ABIERTO/, 'The first cloth section is whole');
    assert.match(await measure('continuity', 's2a', 's2b'), /ABIERTO/, 'Continuity exposes the concealed break');
    assert.equal((await inspect()).puzzle.state.proofs.foundBreak, true, 'Lumen saw where the break is');
    log('proof', { id, proof: 'foundBreak' });
    await screenshot('workshop-continuity-open');
    if (adversarial) {
      await page.locator('.wb-close[data-action="close"]').first().click();
      await settle();
      assert.equal(Boolean((await inspect()).flags.workshop), false, 'Leaving the workshop bench does not commission it');
      await reloadAndContinue('workshop-bench-abandoned');
      await interact(objectId);
      assert.equal((await inspect()).puzzle.state.proofs.foundBreak, true, 'Lumen still remembers where the break was');
      if ((await inspect()).puzzle.state.sourceOn) await page.locator('[data-action="power"]').click();
      log('bench-resumed', { id });
    }
  }
  switch (id) {
    case 'awaken': await wire('heartOut', 'negative'); break;
    case 'workshop': await wire('s2a', 's2b'); break;
    case 'gate':
      await removeWire('trimB', 'latchOut'); await removeWire('latchIn', 'negative');
      await wire('trimB', 'latchIn'); await wire('latchOut', 'negative');
      if (adversarial) {
        await page.locator('[data-action="power"]').click();
        for (const value of [0, 20]) { await knob('brake', value); assert.equal((await inspect()).puzzle.result.solved, false, `brake ${value} Ω is not the firm push`); }
        await screenshot('gate-wrong-brake');
      }
      await knob('brake', 8); break;
    case 'pump': await wire('e2a', 'e2b'); break;
    case 'distribution':
      assert.equal((await inspect()).puzzle.state.switches.archive,false,'The archive was isolated in the courtyard');
      await removeWire('clinicOut', 'kitchenIn');
      await wire('clinicOut', 'negative'); await wire('positive', 'kitchenIn'); break;
    case 'irrigation':
      if (adversarial) await wrongDials(id, [{ warmth: 0, flow: 0, forge: 0 }, { warmth: 24, flow: 24, forge: 18 }]);
      await knob('warmth', 12); await knob('flow', 12); await knob('forge', 6); break;
    case 'beacon_supply': await wire('positive', 'lineBa'); await wire('lineBb', 'ballastA');
      if (adversarial) await wrongDials(id, [{ ballast: 0 }, { ballast: 5 }]);
      await knob('ballast', 1); break;
    case 'beacon_network':
      await removeWire('opticOut', 'bearingIn'); await removeWire('bearingOut', 'signalIn');
      await wire('opticOut', 'negative'); await wire('positive', 'bearingIn');
      await wire('bearingOut', 'negative'); await wire('positive', 'signalIn'); break;
    case 'beacon_lens':
      // Nereo's comparison, first half: the tap with the lens elsewhere.
      if (!(await inspect()).puzzle.state.sourceOn) await page.locator('[data-action="power"]').click();
      await measure('voltage', 'tap', 'negative');
      await page.locator('[data-action="power"]').click(); await setMode('wire');
      await removeWire('positive', 'lensIn'); await wire('tap', 'lensIn');
      if (adversarial) await wrongDials(id, [{ upper: 6 }, { upper: 36 }]);
      await knob('upper', 12); break;
    default: throw new Error(`No UI repair sequence for ${id}`);
  }
  info = await inspect();
  if (info.puzzle.state.tripped) await page.locator('[data-action="rearm"]').click();
  else if (!info.puzzle.state.sourceOn) await page.locator('[data-action="power"]').click();
  if (id === 'distribution') {
    // Ivara's request: show the infirmary lit while the kitchen is isolated, then reopen it.
    await page.locator('.wb-proof').waitFor({ state: 'visible' });
    if (adversarial) assert.equal(await page.locator('.wb-success:not(.wb-proof) [data-action="commission"]').count(), 0, 'Nothing can be commissioned before Ivara sees the infirmary alone');
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
  if (adversarial && ['awaken', 'gate', 'beacon_lens'].includes(id)) {
    await page.waitForFunction(() => window.__ohmdal?.mode === 'cinematic', {}, { timeout: 6000 });
    await page.waitForTimeout(1500);
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#continue').click();
    log('reload-during-scene', { id });
  }
  await settle({ timeout: 40000 });
  assert.equal((await inspect()).flags[id], true, `${id}: putting in service persists the repair`);
  log('commissioned', { id });
}

try {
  await page.goto(process.env.GAME_URL || 'http://127.0.0.1:4190/', { waitUntil: 'networkidle' });
  await page.locator('#title-settings').click();
  await page.locator('#text-speed').check();
  await page.locator('#resume-option').click();
  await screenshot('title');
  await page.locator('#new-game').click();
  await settle({ stable: 1600 });
  await screenshot('portal-arrival');
  if (adversarial) { await lockedExit('portal_to_plaza'); await wrongWireThenAbandon(); await reloadAndContinue('portal-after-abandoned-bench'); }
  await solvePanel('ohm_pedestal', 'awaken');
  await interact('portal_seed');
  await travel('portal_to_plaza', 'plaza');
  await interact('marin');
  if (adversarial) await interfacesRoundTrip();
  await interact('plaza_bell');
  await travel('plaza_to_workshop', 'workshop');
  await interact('lumen');
  assert.equal((await inspect()).flags.workshop_feed, true, 'Lumen closes his own left latch'); await fieldToggle('workshop_return', true);
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
  // The closing line may only claim what the bench trace shows: here the brake was turned.
  assert.ok(report.dialogue.some(line => line.includes('al ajustar la rueda')), 'The gate closing line reports the brake that was turned');
  assert.ok(!report.dialogue.some(line => line.includes('La rueda quedó como estaba')), 'No line claims an untouched brake');
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
  if (adversarial) await walkBackAndForth();
  await travel('castle_to_terraces', 'terraces');
  await interact('yesca');
  await operate('forge_limited', true); await operate('irrigation_open', true);
  await solvePanel('irrigation_panel', 'irrigation');
  await interact('terraces_secret');
  await travel('terraces_to_lake', 'lake');
  if (adversarial) await reloadAndContinue('lake-arrival');
  await interact('nereo_lake');
  assert.ok((await inspect()).flags.lake_cable && (await inspect()).flags.lake_return, 'Nereo makes the dock joins');
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
  if (adversarial) {
    const heard = report.dialogue.length;
    await interact('edda_tower');
    assert.ok(report.dialogue.length > heard, 'Edda still answers after the ending and a reload');
    assert.equal((await inspect()).mode, 'world');
  }
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
  const saved=await page.evaluate(()=>localStorage.getItem('ohmdal.playcanvas.arc1.v1')).catch(()=>null);if(saved)await writeFile(resolve(output,'verified-save.json'),saved);
  report.finishedAt = new Date().toISOString();
  await writeFile(resolve(output, 'playthrough-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
}
