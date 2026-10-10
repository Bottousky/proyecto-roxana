import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState} from '../src/game/state.js';
import {renderJournal, journalPages, journalStamp} from '../src/game/journal.js';

test('each page is stamped with the moment of the story it was written in', () => {
  const pages = journalPages({...freshState(), flags: {awaken: true, workshop: true, gate: true, pump: true, distribution: true, irrigation: true, beacon_link: true, beacon_supply: true}});
  const stamp = id => journalStamp(pages.find(p => p.id === id));
  assert.equal(stamp('arrival'), 'Día 1 · Mañana');
  assert.equal(stamp('source_load'), 'Día 1 · Tarde');
  assert.equal(stamp('power'), 'Día 1 · Atardecer');
  assert.equal(stamp('tower_source'), 'Día 1 · Noche');
});

test('the people page lists only those who introduced themselves, with the traveller as owner', () => {
  const state = {...freshState(), playerName: 'Manuel', known: ['edda', 'ohm']};
  const html = renderJournal(state, {selected: 'people'});
  assert.match(html, /Gente que conocí/);
  assert.match(html, /<strong>Edda<\/strong>/);
  assert.doesNotMatch(html, /Maese Lumen|Nereo<\/strong>/);
  assert.match(html, /de Manuel/);
  assert.doesNotMatch(renderJournal({...freshState()}), /data-journal-page="people"/, 'no people page before meeting anyone');
});

test('the Monte Quieto page borrows no bench: no trials or sketch of the lens', () => {
  const state = {...freshState(), flags: {beacon_lens: true}, puzzles: {beacon_lens: {wires: [['positive', 'upperA']], evidence: []}}};
  const page = journalPages(state).find(p => p.id === 'quiet_mount');
  assert.equal(page.puzzle, null);
  const html = renderJournal(state, {selected: 'quiet_mount', evidenceFor: () => [{kind: 'measurement', text: 'lente'}]});
  assert.doesNotMatch(html, /Croquis de las conexiones|>lente</);
});

import {PUZZLES, initialPuzzleSnapshot} from '../src/game/puzzle-model.js';
import {getBenchEvidence} from '../src/game/bench-evidence.js';
import {journalSheets} from '../src/game/journal.js';

const repaired = (id, tested = true) => { const s = initialPuzzleSnapshot(id); PUZZLES[id].solve(s); s.completed = true; s.conjuro = tested; return s; };

test('a repaired bench leaves its circuit drawn twice, the inherited conjuro and what the copper said, what Ohm saw and the Instituto words', () => {
  const state = {...freshState(), playerName: 'Manuel', flags: {awaken: true, workshop: true}, puzzles: {workshop: repaired('workshop')}};
  const html = renderJournal(state, {selected: 'diagnosis', puzzles: PUZZLES, evidenceFor: getBenchEvidence});
  assert.match(html, /Así estaba/); assert.match(html, /Así lo dejé/);
  assert.match(html, /Lo que hay detrás/); assert.match(html, /Por dentro, cobre/);
  assert.match(html, /El conjuro/); assert.match(html, /Paño seco, tres vueltas al contacto/); assert.match(html, /Lo que dijo el cobre:/);
  assert.doesNotMatch(html, /apuest/i);
  assert.match(html, /Conductor y aislante/);
  const unfinished = {...state, flags: {awaken: true}, puzzles: {workshop: initialPuzzleSnapshot('workshop')}};
  assert.doesNotMatch(renderJournal(unfinished, {selected: 'experiment:workshop', puzzles: PUZZLES, evidenceFor: getBenchEvidence}), /Lo que hay detrás/, 'nothing is explained before it works');
});

test('the glossary page grows with the benches, and the book is handed to paper page by page', () => {
  const state = {...freshState(), playerName: 'Manuel', known: ['edda', 'ohm'], flags: {awaken: true, gate: true}};
  const html = renderJournal(state, {selected: 'words'});
  assert.match(html, /Palabras del oficio/); assert.match(html, /Resistencia/); assert.match(html, /ohmio \(Ω\)/);
  assert.doesNotMatch(html, /Divisor de tensión/, 'a word not yet earned stays out');
  const book = journalSheets(state, {puzzles: PUZZLES, evidenceFor: getBenchEvidence});
  assert.equal(book.owner, 'Manuel', 'the cover carries the traveller’s name');
  assert.equal(book.sections.length % 2, 0, 'every notebook page goes to paper with its facing page');
  assert.ok(book.sections.every(html => /^<section class="dj-page dj-(left|right)/.test(html) && html.includes('dj-page-body')));
  assert.ok(book.sections.some(html => /Palabras del oficio/.test(html)));
});

test("the keeper's sum is written in the Bitácora as an addition, only with readings the player took", () => {
  const s = repaired('pump');
  const html = page => renderJournal({...freshState(), flags: {awaken: true, workshop: true, gate: true, pump: true}, puzzles: {pump: page}}, {selected: 'source_load', puzzles: PUZZLES, evidenceFor: getBenchEvidence});
  assert.doesNotMatch(html(s), /dj-tally/, 'a sum closed without readings (an old save) is not invented');
  s.tally = {closed: true, readings: {joint1: .08, joint2: 7.06, joint3: .08, pump: 4.71}};
  const page = html(s);
  assert.match(page, /La cuenta de la vuelta/); assert.match(page, /anotada por Vega/);
  assert.match(page, /11,93 V/, 'the total is the sum of the numbers as written'); assert.match(page, /La fuente empuja 12 V/);
});
