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
