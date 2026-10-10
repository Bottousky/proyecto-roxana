import test from 'node:test';
import assert from 'node:assert/strict';
import { PUZZLES, initialPuzzleSnapshot, evaluatePuzzle, normalizePuzzleSnapshot } from '../src/game/puzzle-model.js';
import { revealFor, PREDICTIONS, WORDS, WORD_ORDER, wordsKnown, betVerdict } from '../src/game/understanding.js';

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

test('each bet can be lost, is open before touching and is settled by the repair itself', () => {
  for (const [id, guess] of Object.entries(PREDICTIONS)) {
    assert.ok(guess.options.some(o => o.id === guess.answer), `${id}: the right answer is among the options`);
    assert.ok(guess.options.length >= 3, `${id}: more than a yes or no`);
    const start = initialPuzzleSnapshot(id);
    assert.equal(guess.settled(evaluatePuzzle(id, start), start), false, `${id}: nothing is shown before touching`);
    const done = solved(id);
    assert.equal(guess.settled(evaluatePuzzle(id, done), done), true, `${id}: the repair shows the answer`);
    for (const o of guess.options) assert.ok(betVerdict(id, o.id), `${id}: Edda has something to say about «${o.text}»`);
  }
});

test('a bet survives a reload, and a malformed one is dropped', () => {
  const s = initialPuzzleSnapshot('gate'); s.bet = { choice: 'flip', settled: true };
  assert.deepEqual(normalizePuzzleSnapshot('gate', s).bet, { choice: 'flip', settled: true });
  assert.equal(normalizePuzzleSnapshot('gate', { ...s, bet: { choice: '<b>' } }).bet, null);
});
