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
import {renderJournalPrint} from '../src/game/journal.js';

const repaired = (id, bet) => { const s = initialPuzzleSnapshot(id); PUZZLES[id].solve(s); s.completed = true; s.bet = bet ?? null; return s; };

test('a repaired bench leaves its circuit drawn twice, what Ohm saw, the bet and the Instituto words', () => {
  const state = {...freshState(), playerName: 'Manuel', flags: {awaken: true, workshop: true}, puzzles: {workshop: repaired('workshop', {choice: 't1', settled: true})}};
  const html = renderJournal(state, {selected: 'diagnosis', puzzles: PUZZLES, evidenceFor: getBenchEvidence});
  assert.match(html, /Así estaba/); assert.match(html, /Así lo dejé/);
  assert.match(html, /Lo que hay detrás/); assert.match(html, /Por dentro, cobre/);
  assert.match(html, /Mi apuesta/); assert.match(html, /dj-bet is-wrong/); assert.match(html, /«El tramo 1»/);
  assert.match(html, /Conductor y aislante/);
  const unfinished = {...state, flags: {awaken: true}, puzzles: {workshop: initialPuzzleSnapshot('workshop')}};
  assert.doesNotMatch(renderJournal(unfinished, {selected: 'experiment:workshop', puzzles: PUZZLES, evidenceFor: getBenchEvidence}), /Lo que hay detrás/, 'nothing is explained before it works');
});

test('the glossary page grows with the benches, and the book prints with a cover in the traveller’s name', () => {
  const state = {...freshState(), playerName: 'Manuel', known: ['edda', 'ohm'], flags: {awaken: true, gate: true}};
  const html = renderJournal(state, {selected: 'words'});
  assert.match(html, /Palabras del oficio/); assert.match(html, /Resistencia/); assert.match(html, /ohmio \(Ω\)/);
  assert.doesNotMatch(html, /Divisor de tensión/, 'a word not yet earned stays out');
  const book = renderJournalPrint(state, {puzzles: PUZZLES, evidenceFor: getBenchEvidence});
  assert.match(book, /Bitácora de Manuel/);
  assert.equal((book.match(/class="dj-page /g) || []).length % 2, 0, 'every notebook page prints as a pair');
  assert.match(book, /id="dj-rough-print"/);
});
