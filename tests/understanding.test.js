import test from 'node:test';
import assert from 'node:assert/strict';
import { PUZZLES, initialPuzzleSnapshot, evaluatePuzzle, normalizePuzzleSnapshot } from '../src/puzzle-model.js';
import { revealFor, CONJUROS, ESTIMATES, estimateVerdict, WORDS, WORD_ORDER, wordsKnown } from '../src/understanding.js';

const solved = id => { const s = initialPuzzleSnapshot(id); PUZZLES[id].solve(s); return s; };

test('every bench explains what was behind it, with the numbers of the montage itself', () => {
  for (const id of Object.keys(PUZZLES)) {
    assert.equal(revealFor(id, initialPuzzleSnapshot(id)), null, `${id}: nothing is explained before it works`);
    const reveal = revealFor(id, solved(id)), ids = new Set(PUZZLES[id].components.map(c => c.id));
    assert.ok(reveal, `${id}: a working montage has its explanation`);
    assert.equal(reveal.cards.length, 3, `${id}: three short cards`);
    assert.match(reveal.question, /\?$/, `${id}: it ends on a question to take away`);
    for (const card of reveal.cards) {
      assert.doesNotMatch(card.text + JSON.stringify(card.tags ?? {}), /NaN|undefined|Infinity|null/, `${id}: «${card.title}» has real numbers`);
      assert.ok(card.text.length <= 330, `${id}: «${card.title}» stays short (${card.text.length})`);
      for (const piece of [...(card.spot ?? []), ...Object.keys(card.tags ?? {})]) assert.ok(ids.has(piece), `${id}: ${piece} is on the board`);
      for (const word of card.words ?? []) assert.ok(WORDS[word], `${id}: ${word} is in the glossary`);
    }
  }
});

test('the explanation follows what the player actually built', () => {
  const s = solved('distribution'), text = revealFor('distribution', s).cards.map(c => c.text).join(' ');
  assert.match(text, /6 V para cada una/, 'in series each light had half of the 12 V');
  assert.match(text, /11,9 V/, 'in parallel each one gets the whole push');
  const lens = solved('beacon_lens'); lens.values.upper = 12;
  assert.match(revealFor('beacon_lens', lens).cards[1].text, /bajó a 6 V/, 'loading the divider takes the tap from 9 V to 6 V');
  const pump = revealFor('pump', solved('pump')).cards[2].text;
  assert.match(pump, /Sumá lo que se quedaban los tres empalmes y la bomba: 11,9 V, casi los 12 V de la fuente/, 'the drops add up to the source');
});

test('the glossary is earned bench by bench, and every word comes from one', () => {
  for (const key of WORD_ORDER) assert.ok(PUZZLES[WORDS[key].from], `${key} belongs to a bench`);
  assert.deepEqual(wordsKnown({ flags: {} }), []);
  assert.deepEqual(wordsKnown({ flags: { awaken: true } }), ['carga', 'circuito', 'corriente']);
  assert.ok(wordsKnown({ flags: { awaken: true, gate: true } }).includes('resistencia'));
});

test("each keeper's conjuro is put to the test by the repair itself, never before", () => {
  const voices = new Set(['LUMEN', 'EDDA', 'VEGA', 'IVARA', 'YESCA', 'NEREO']);
  for (const [id, spell] of Object.entries(CONJUROS)) {
    assert.ok(voices.has(spell.who), `${id}: said by one of the heirs`);
    assert.ok(spell.words && spell.copper && spell.heir, `${id}: the words, who they come from and what the copper answers`);
    const start = initialPuzzleSnapshot(id);
    assert.equal(spell.settled(evaluatePuzzle(id, start), start), false, `${id}: untested before anything is touched`);
    const done = solved(id);
    assert.equal(spell.settled(evaluatePuzzle(id, done), done), true, `${id}: the repair answers it`);
  }
});

test('a tested conjuro is remembered across a reload, and old bets are forgotten', () => {
  const s = { ...initialPuzzleSnapshot('gate'), conjuro: true, bet: { choice: 'flip', settled: true } };
  const loaded = normalizePuzzleSnapshot('gate', s);
  assert.equal(loaded.conjuro, true);
  assert.equal(loaded.bet, undefined);
  assert.equal(normalizePuzzleSnapshot('gate', { ...s, conjuro: 'yes' }).conjuro, false);
});

test("Nereo's expected marks are answered by the same model: half the push at an even divider, four times the current at a quarter of the brake", () => {
  const net = solved('beacon_network'), ratio = ESTIMATES.beacon_network.measured(evaluatePuzzle('beacon_network', net), net);
  assert.ok(ESTIMATES.beacon_network.close(4, ratio), `the optic takes four times the signal's current (${ratio})`);
  assert.equal(ESTIMATES.beacon_network.measured(evaluatePuzzle('beacon_network', initialPuzzleSnapshot('beacon_network')), initialPuzzleSnapshot('beacon_network')), null, 'nothing to read while the voices are in a row');
  const lens = initialPuzzleSnapshot('beacon_lens'), share = ESTIMATES.beacon_lens.measured(null, lens, { tapUnloaded: { volts: 9 } });
  assert.ok(ESTIMATES.beacon_lens.close(.5, share));
  assert.match(estimateVerdict('beacon_lens', 'half', share), /^Anotado: esperábamos «la mitad» y marcó 9 V de 18 V/);
  assert.match(estimateVerdict('beacon_network', 'double', ratio), /Lo anoto igual/);
  for (const [id, book] of Object.entries(ESTIMATES)) assert.equal(book.who, id === 'drawer' ? 'LUMEN' : 'NEREO', `${id}: asked by the keeper who needs the mark`);
});

test('a written mark survives a reload with what was read', () => {
  const s = { ...initialPuzzleSnapshot('beacon_lens'), estimate: { choice: 'half', settled: true, measured: .5 } };
  assert.deepEqual(normalizePuzzleSnapshot('beacon_lens', s).estimate, { choice: 'half', settled: true, measured: .5 });
  assert.equal(normalizePuzzleSnapshot('beacon_lens', { ...s, estimate: { choice: 'x<' } }).estimate, null);
});
