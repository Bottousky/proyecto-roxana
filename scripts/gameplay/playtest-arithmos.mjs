import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const url = process.env.ARITHMOS_URL || 'http://127.0.0.1:5197/arithmos/';
const out = 'output/arithmos-playtest';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const evidence = [];
const state = () => page.evaluate(() => window.__arithmos.state);
const button = command => page.locator(`[data-do="${command}"]`).filter({ visible: true });
const press = key => page.keyboard.press(key);
async function select(id) {
  for (let i = 0; i < 30; i++) {
    if ((await state()).selected === id) return;
    await press('c');
  }
  throw new Error(`Cannot select ${id}`);
}
async function reshape(id, width) {
  await select(id);
  let p = (await state()).board.pieces.find(p => p.id === id);
  for (let i = 0; p.width !== width && i < 30; i++) {
    await button(p.width < width ? 'widen' : 'narrow').click();
    p = (await state()).board.pieces.find(p => p.id === id);
  }
  assert.equal(p.width, width, `reshape ${id}`);
}
async function split(id, at) {
  await select(id);
  const before = (await state()).board.pieces.map(p => p.id);
  await button('cut').click();
  await page.locator(`[data-cell="${at}"]`).click();
  assert.equal((await state()).board.pieces.length, before.length, 'marking a cut does not transform matter');
  await button('cut-apply').click();
  const after = (await state()).board.pieces;
  assert.equal(after.length, before.length + 1, 'split keeps both pieces');
  return after.find(p => !before.includes(p.id)).id;
}
async function move(id, x, z, drag = false) {
  await select(id);
  let p = (await state()).board.pieces.find(p => p.id === id);
  if (drag) {
    await page.waitForTimeout(250);
    const points = await page.evaluate(({ sx, sz, x, z }) => ({ from: window.__arithmos.project(sx, sz), to: window.__arithmos.project(x, z) }), { sx: p.x, sz: p.z, x, z });
    await page.mouse.move(points.from.x, points.from.y);
    await page.mouse.down();
    await page.mouse.move(points.to.x, points.to.y, { steps: 12 });
    await page.mouse.up();
    p = (await state()).board.pieces.find(p => p.id === id);
    assert.equal(p.x, x, 'pointer drag x'); assert.equal(p.z, z, 'pointer drag z');
    return;
  }
  // Route around other physical pieces. A blocked straight path is informative
  // gameplay, not an application error; no domain writes or solution injection.
  const board = (await state()).board;
  const occupied = new Set(board.pieces.filter(q => q.id !== id).flatMap(q => q.units.map((_, i) => `${q.x + i % q.width},${q.z + Math.floor(i / q.width)}`)));
  const valid = (px, pz) => p.units.every((_, i) => {
    const cx = px + i % p.width, cz = pz + Math.floor(i / p.width);
    return cx >= -12 && cx <= 12 && cz >= -7 && cz <= 8 && !occupied.has(`${cx},${cz}`);
  });
  const queue = [{ x: p.x, z: p.z, keys: [] }], seen = new Set([`${p.x},${p.z}`]);
  let route;
  while (queue.length) {
    const node = queue.shift();
    if (node.x === x && node.z === z) { route = node.keys; break; }
    for (const [dx, dz, key] of [[0,-1,'ArrowUp'],[-1,0,'ArrowLeft'],[1,0,'ArrowRight'],[0,1,'ArrowDown']]) {
      const nx = node.x + dx, nz = node.z + dz, hash = `${nx},${nz}`;
      if (!seen.has(hash) && valid(nx,nz)) { seen.add(hash); queue.push({ x:nx, z:nz, keys:[...node.keys,key] }); }
    }
  }
  assert.ok(route, `reachable translation for ${id}`);
  for (const key of route) {
    await press(key);
    const next = (await state()).board.pieces.find(p => p.id === id);
    if (next.x === p.x && next.z === p.z) throw new Error(`Blocked UI move ${id} ${p.x},${p.z} to ${x},${z}`);
    p = next;
  }
  assert.equal(p.x, x); assert.equal(p.z, z);
}
async function capture(label) {
  await button('deselect').click().catch(() => {});
  await button('quiet').click().catch(() => {});
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${label}.png` });
  evidence.push({ label, ...(await state()) });
  console.log(label);
}
async function next() {
  assert.equal((await state()).evaluation.solved, true);
  await button('next').click();
  await button('quiet').click().catch(() => {});
}

try {
  await page.goto(url);
  await page.waitForFunction(() => Boolean(window.__arithmos));
  await page.screenshot({ path: `${out}/00-title.png` });
  await button('start').click();
  await button('quiet').click();
  await button('journal').click();
  assert.equal(await page.locator('.ari-entry').count(), 0, 'no formalization before action');
  await page.locator('dialog [data-do="close"]').last().click();
  await move('landing-cloth', -1, -2, true);
  assert.equal((await state()).evaluation.solved, false, 'same quantity wrong shape does not cover');
  await capture('01-informative-gap');
  await reshape('landing-cloth', 3);
  assert.equal((await state()).evaluation.solved, true);
  await capture('02-bridge-restored');
  await press('z');
  assert.equal((await state()).evaluation.solved, false);
  await press('y');
  assert.equal((await state()).evaluation.solved, true);
  await page.reload(); await page.waitForFunction(() => Boolean(window.__arithmos));
  await button('start').click();
  assert.equal((await state()).restored.length, 1, 'restoration survives reload');
  await next();
  let second = await split('twins-cloth', 6);
  await reshape('twins-cloth', 3); await move('twins-cloth', -6, -2);
  await reshape(second, 3); await move(second, 3, -2);
  await capture('03-two-shores'); await next();
  second = await split('balance-cargo', 8);
  await move('balance-cargo', -7, -3);
  await move(second, 3, -3);
  await capture('04-balanced-lock'); await next();
  second = await split('sail-cloth', 4);
  let third = await split(second, 4);
  await move('sail-cloth', -8, -4); await reshape('sail-cloth', 1);
  await move(second, -2, -4); await reshape(second, 2);
  await move(third, 4, -4);
  await capture('05-three-equivalent-sails'); await next();
  const amberEast = await split('garden-light', 2);
  await move('garden-light', -6, -3);
  await reshape(amberEast, 4); await move(amberEast, 2, -3);
  const tealEast = await split('garden-water', 4);
  await reshape('garden-water', 2); await move('garden-water', -6, -2);
  await move(tealEast, 2, -2);
  await capture('06-proportion-at-two-scales'); await next();
  const amberRest = await split('flight-light', 2);
  const amberRight = await split(amberRest, 4);
  await move('flight-light', -9, -4);
  await move(amberRest, -3, -4);
  await move(amberRight, 3, -4);
  const tealRest = await split('flight-water', 4);
  const tealRight = await split(tealRest, 8);
  await reshape('flight-water', 2); await move('flight-water', -9, -3);
  await move(tealRest, -3, -3);
  await reshape(tealRight, 2); await move(tealRight, 3, -3);
  await capture('07-city-flight-transfer');
  assert.deepEqual((await state()).evaluation.zones.map(z => z.count), [6, 12, 6]);
  await button('next').click();
  await page.screenshot({ path: `${out}/08-ending.png` });
  await page.locator('dialog [data-do="journal"]').click();
  assert.equal(await page.locator('.ari-entry').count(), 6);
  await page.locator('dialog [data-do="close"]').last().click();
  await page.reload(); await page.waitForFunction(() => Boolean(window.__arithmos));
  await button('start').click();
  assert.equal((await state()).restored.length, 6, 'entire city restoration persists');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/09-restored-city-after-reload.png` });
  await button('menu').click(); await page.locator('dialog [data-do="leave"]').click();
  await page.waitForURL('**/#aulas');
  await page.locator('#school3d-rooms-toggle').click();
  await page.locator('#school3d-room-list [data-room="matematica"]').click();
  await page.locator('#school3d-action').filter({ hasText: 'Viajar a Arithmos' }).click();
  await page.waitForURL('**/src/experiences/arithmos/');
  await page.waitForFunction(() => Boolean(window.__arithmos));
  await button('start').click();
  assert.equal((await state()).restored.length, 6, 'Institute re-entry preserves the completed city');
  assert.equal(errors.length, 0, errors.join('\n'));
  await writeFile(`${out}/evidence.json`, JSON.stringify({ url, errors, evidence, result: 'PASS' }, null, 2));
  console.log('PASS: real UI end-to-end, failure, recovery, save, return and re-entry.');
} catch (error) {
  await page.screenshot({ path: `${out}/failure.png` }).catch(() => {});
  await writeFile(`${out}/evidence.json`, JSON.stringify({ url, errors, evidence, result: 'FAIL', error: String(error), state: await state().catch(() => null) }, null, 2));
  console.error(error); process.exitCode = 1;
} finally { await browser.close(); }
