import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { AREAS } from '../src/content.js';
import { KINGDOM, EXTERIORS, toKingdom } from '../src/kingdom-geography.js';

// The module imports its stylesheet; Node only needs the logic.
const source = (await readFile(new URL('../src/kingdom-map.js', import.meta.url), 'utf8'))
  .replace("import './kingdom-map.css';", '')
  .replace(/'\.\/([a-z-]+)\.js'/g, (_, name) => JSON.stringify(pathToFileURL(resolve(`src/${name}.js`)).href));
const { KINGDOM_MAP, mapPoint, kingdomMapMarks, journeyRoute, renderKingdomMap } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const fresh = (over = {}) => ({ area: 'portal', position: AREAS.portal.spawn, visited: ['portal'], secrets: [], flags: {}, seen: [], ...over });
const inside = ([x, y]) => x >= 0 && y >= 0 && x <= KINGDOM_MAP.width && y <= KINGDOM_MAP.height;

test('the map image and the game agree on where the kingdom is', async () => {
  for (const root of ['public', 'experiments/playcanvas/public']) {
    const meta = JSON.parse(await readFile(new URL(`../${root}/assets/map/kingdom-map.json`, import.meta.url), 'utf8'));
    for (const key of ['pxPerMetre', 'x0', 'z0', 'width', 'height']) assert.equal(meta[key], KINGDOM_MAP[key], `${root}: ${key}`);
  }
});

test('every place, with its whole ground, and every bench lies on the map', () => {
  for (const id of EXTERIORS) {
    const [w, d] = AREAS[id].bounds, { x, z } = KINGDOM[id];
    for (const corner of [[x - w / 2, z - d / 2], [x + w / 2, z + d / 2]]) assert.ok(inside(mapPoint(corner)), `${id} corner ${corner}`);
    for (const object of AREAS[id].objects || []) if (object.puzzle) assert.ok(inside(mapPoint(toKingdom(id, [object.x, object.z]))), `${id}/${object.id}`);
  }
});

test('a new journey: the traveller at the Portal, the next step marked, every place named, only the Portal walked', () => {
  const state = fresh(), { marks, visited } = kingdomMapMarks(state, { position: AREAS.portal.spawn });
  const player = marks.find(m => m.kind === 'player');
  assert.deepEqual(player.at, toKingdom('portal', AREAS.portal.spawn));
  assert.ok(marks.some(m => m.kind === 'objective'));
  assert.deepEqual([...visited], ['portal']);
  for (const id of EXTERIORS) assert.ok(marks.some(m => m.kind === 'place' && m.area === id && m.label === AREAS[id].name), `${id} is named`);
  assert.ok(marks.filter(m => m.kind === 'place' && m.known).every(m => m.area === 'portal'));
  assert.ok(marks.filter(m => m.kind === 'bench').every(m => KINGDOM.portal && Math.abs(m.at[1] - KINGDOM.portal.z) < 20), 'benches only of walked places');
  const html = renderKingdomMap(state, { position: AREAS.portal.spawn });
  assert.match(html, /data-area="portal"[^>]*disabled/);
  assert.doesNotMatch(html, /data-area="plaza"/, 'no travel to a place not yet walked');
  assert.doesNotMatch(html, /¿…\?/);
});

test('the golden route walks the passages from the traveller to the objective', () => {
  const state = fresh({ area: 'plaza', position: [0, 0], visited: ['portal', 'plaza'], flags: { awaken: true, workshop: true } });
  const here = toKingdom('plaza', [0, 0]), goal = { area: 'road', at: [KINGDOM.road.x, KINGDOM.road.z] };
  const route = journeyRoute(state, here, goal);
  assert.deepEqual(route[0], here); assert.deepEqual(route.at(-1), goal.at);
  assert.ok(route.length > 10, 'it follows the road, not a straight line');
  for (let i = 1; i < route.length - 1; i++) assert.ok(Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]) < 40, `step ${i} stays on the road`);
});

test('restored benches and found memories show as such; the workshop interior stands at its building', () => {
  const state = fresh({ area: 'workshop', position: [0, 0], visited: ['portal', 'plaza', 'workshop'], flags: { awaken: true }, secrets: ['portal_seed'] });
  const { marks } = kingdomMapMarks(state, { position: [0, 0] });
  assert.ok(marks.some(m => m.kind === 'bench' && m.restored));
  assert.ok(marks.some(m => m.kind === 'memory'));
  assert.deepEqual(marks.find(m => m.kind === 'player').at, [KINGDOM.workshop.x, KINGDOM.workshop.z]);
  const travel = renderKingdomMap({ ...state, area: 'plaza', position: [0, 0] }, { position: [0, 0] });
  assert.match(travel, /data-area="workshop"/, 'the workshop interior stays reachable from the travel list');
});
