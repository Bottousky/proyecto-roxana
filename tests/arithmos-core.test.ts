import assert from 'node:assert/strict';
import { CHAPTERS } from '../src/experiences/arithmos/chapters.ts';
import { boardIssue, cells, evaluate, initialBoard, matchesChapter, transform } from '../src/experiences/arithmos/core.ts';
import { freshSave, readSave, SAVE_KEY, writeSave } from '../src/experiences/arithmos/save.ts';
import type { Action, Board, Chapter, Piece, Unit } from '../src/experiences/arithmos/types.ts';

const signature = (board: Board) => cells(board).map(u => `${u.id}:${u.matter}`).sort();
function step(board: Board, action: Action): Board {
  const before = JSON.stringify(board);
  const result = transform(board, action);
  assert.equal(JSON.stringify(board), before, 'transforms must not mutate input');
  assert.deepEqual(signature(result.board), signature(board), 'every action must conserve identities and matter');
  assert.equal(boardIssue(result.board), '');
  assert.equal(result.changed, true, result.reason);
  return result.board;
}

for (const chapter of CHAPTERS) {
  const board = initialBoard(chapter);
  assert.equal(boardIssue(board), '', chapter.id);
  assert.ok(matchesChapter(chapter, board));
  assert.equal(evaluate(chapter, board).solved, false, `${chapter.id} must start unsolved`);
  board.pieces[0].units[0].id = 'tampered';
  assert.notEqual(chapter.seeds[0].units[0].id, 'tampered', 'initial boards deep clone seeds');
  assert.equal(evaluate(chapter, board).solved, false);
}

let board = initialBoard(CHAPTERS[0]);
board = step(board, { type: 'reshape', id: board.pieces[0].id, width: 3 });
board = step(board, { type: 'move', id: board.pieces[0].id, x: -1, z: -2 });
assert.equal(evaluate(CHAPTERS[0], board).solved, true);
const solvedLanding = board;
for (let i = 0; i < 4; i++) board = step(board, { type: 'rotate', id: board.pieces[0].id });
assert.deepEqual(board, solvedLanding, 'four rotations preserve both geometry and exact unit locations');
board = step(board, { type: 'reshape', id: board.pieces[0].id, width: 4 });
assert.equal(cells(board).length, 6, 'a partial row must stay visible');
assert.equal(transform(board, { type: 'rotate', id: board.pieces[0].id }).changed, false);

board = initialBoard(CHAPTERS[1]);
board = step(board, { type: 'split', id: board.pieces[0].id, at: 6 });
assert.equal(board.pieces[0].id, CHAPTERS[1].seeds[0].id, 'split retains selected piece identity');
assert.equal(new Set(board.pieces.map(p => p.id)).size, 2);
for (let i = 0; i < 2; i++) {
  board = step(board, { type: 'reshape', id: board.pieces[i].id, width: 3 });
  const zone = CHAPTERS[1].zones[i];
  board = step(board, { type: 'move', id: board.pieces[i].id, x: zone.x, z: zone.z });
}
assert.equal(evaluate(CHAPTERS[1], board).solved, true);
const solvedTwins = board;
board = step(board, { type: 'join', ids: board.pieces.map(p => p.id) });
assert.equal(board.pieces.length, 1);
assert.equal(evaluate(CHAPTERS[1], board).solved, false);

// These construct mathematically distinct states; validators see no solution recipe.
function placeGroups(chapter: Chapter, groups: number[][], widths: number[]): Board {
  const pools: Record<string, Unit[]> = { amber: [], teal: [] };
  chapter.seeds.flatMap(p => p.units).forEach(u => pools[u.matter].push({ ...u }));
  const pieces: Piece[] = [];
  groups.forEach(([amber, teal], i) => {
    const z = chapter.zones[i];
    pieces.push({ id: `test-${i}`, width: widths[i], x: z.x, z: z.z, units: [...pools.amber.splice(0, amber), ...pools.teal.splice(0, teal)] });
  });
  const result = { pieces, nextId: 1 };
  assert.equal(boardIssue(result), '');
  return result;
}

const balance = CHAPTERS[2];
for (const widths of [[4, 3], [3, 4], [4, 4]]) assert.equal(evaluate(balance, placeGroups(balance, [[8, 0], [8, 0]], widths)).solved, true, 'balance admits incomplete rows and differing silhouettes');
assert.equal(evaluate(balance, placeGroups(balance, [[7, 0], [9, 0]], [4, 3])).solved, false);
const sails = CHAPTERS[3];
for (const widths of [[1, 2, 4], [4, 1, 2], [2, 2, 2]]) assert.equal(evaluate(sails, placeGroups(sails, [[4, 0], [4, 0], [4, 0]], widths)).solved, true, 'sails admit all rectangular factorizations');
assert.equal(evaluate(sails, placeGroups(sails, [[4, 0], [4, 0], [4, 0]], [3, 2, 2])).solved, false, 'partial rows leak wind');
const tiledSails = placeGroups(sails, [[4, 0], [4, 0], [4, 0]], [2, 2, 2]);
tiledSails.pieces = cells(tiledSails).map(c => ({ id: `single-${c.id}`, units: [{ id: c.id, matter: c.matter }], width: 1, x: c.x, z: c.z }));
assert.equal(evaluate(sails, tiledSails).solved, true, 'a complete 2×2 cloth assembled from individual units catches wind');
const scatteredSails: Board = { nextId: 1, pieces: tiledSails.pieces.map((p, i) => {
  const zone = sails.zones[Math.floor(i / 4)];
  return { ...p, x: zone.x + i % 2 * 3, z: zone.z + Math.floor(i % 4 / 2) * 3 };
}) };
assert.equal(boardIssue(scatteredSails), '');
assert.equal(evaluate(sails, scatteredSails).solved, false, 'four separate corner scraps per mast do not form a complete cloth');
assert.ok(evaluate(sails, scatteredSails).zones.every(z => !z.satisfied));
const gardens = CHAPTERS[4];
for (const groups of [[[2, 4], [4, 8]], [[3, 6], [3, 6]], [[4, 8], [2, 4]]]) assert.equal(evaluate(gardens, placeGroups(gardens, groups, [4, 4])).solved, true, 'gardens accept proportional unequal totals');
assert.equal(evaluate(gardens, placeGroups(gardens, [[4, 5], [2, 7]], [3, 3])).solved, false, 'equal totals alone do not preserve ratio');
const flight = CHAPTERS[5];
for (const groups of [[[2, 4], [4, 8], [2, 4]], [[3, 6], [2, 4], [3, 6]]]) assert.equal(evaluate(flight, placeGroups(flight, groups, [4, 4, 4])).solved, true, 'transfer accepts both valid outer balance families');
const asymmetry = evaluate(flight, placeGroups(flight, [[2, 4], [3, 6], [3, 6]], [4, 4, 4]));
assert.equal(asymmetry.solved, false);
assert.match(asymmetry.message, /inclina/);

board = initialBoard(gardens);
const blocked = transform(board, { type: 'move', id: board.pieces[0].id, x: board.pieces[1].x, z: board.pieces[1].z });
assert.equal(blocked.changed, false);
assert.equal(blocked.board, board);
assert.match(blocked.reason, /mismo lugar/);
for (const action of [
  { type: 'move', id: board.pieces[0].id, x: -13, z: 0 },
  { type: 'move', id: board.pieces[0].id, x: 0.5, z: 0 },
  { type: 'reshape', id: board.pieces[0].id, width: 0 },
  { type: 'reshape', id: board.pieces[0].id, width: 2.5 },
  { type: 'split', id: board.pieces[0].id, at: 0 },
  { type: 'split', id: board.pieces[0].id, at: 6 },
] as Action[]) assert.equal(transform(board, action).changed, false);

// Long, deterministic exploratory sessions stress conservation, collision and id generation.
let randomState = 12345;
const random = (n: number) => { randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0; return randomState % n; };
board = initialBoard(flight);
for (let i = 0; i < 500; i++) {
  const p = board.pieces[random(board.pieces.length)];
  const actions: Action[] = [
    { type: 'move', id: p.id, x: random(25) - 12, z: random(16) - 7 },
    { type: 'reshape', id: p.id, width: 1 + random(p.units.length) },
    { type: 'rotate', id: p.id },
    { type: 'split', id: p.id, at: random(p.units.length) },
    { type: 'join', ids: [p.id, board.pieces[random(board.pieces.length)].id] },
  ];
  const before = JSON.stringify(board), result = transform(board, actions[random(actions.length)]);
  assert.equal(JSON.stringify(board), before);
  assert.deepEqual(signature(result.board), signature(board));
  assert.equal(boardIssue(result.board), '');
  board = result.board;
}

const data = new Map<string, string>();
const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } } as Storage;
const save = freshSave();
save.boards[0] = solvedLanding; save.boards[1] = solvedTwins;
save.chapter = 5; save.restored = CHAPTERS.map(c => c.id); save.muted = true;
assert.equal(writeSave(save, storage), true);
let loaded = readSave(storage);
assert.equal(loaded.chapter, 2);
assert.deepEqual(loaded.restored, ['landing', 'twins']);
assert.equal(loaded.muted, true);
loaded.boards[0].pieces[0].units[0].matter = 'teal';
data.set(SAVE_KEY, JSON.stringify(loaded));
loaded = readSave(storage);
assert.equal(loaded.chapter, 0, 'corrupt first chapter cannot softlock progression');
assert.deepEqual(loaded.boards[0], initialBoard(CHAPTERS[0]));
assert.deepEqual(loaded.restored, []);
for (const corrupt of ['{', 'null', '[]', '{"version":99}', '{"version":1,"boards":[{"pieces":[null],"nextId":1}]}']) {
  data.set(SAVE_KEY, corrupt);
  assert.deepEqual(readSave(storage), freshSave());
}
const unavailable = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); } } as unknown as Storage;
assert.deepEqual(readSave(unavailable), freshSave());
assert.equal(writeSave(save, unavailable), false);
console.log('Arithmos: invariants, alternate solutions, transfer and corrupt-save recovery passed.');
