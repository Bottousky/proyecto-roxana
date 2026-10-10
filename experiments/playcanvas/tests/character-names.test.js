import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS, DIALOGUES, learnNames, withIntroductions, speakerLabel, personLabel, personalize, playerName, knownFromSeen} from '../src/game/content.js';
import {freshState, validateState} from '../src/game/state.js';

// Play a conversation the way the dialogue box does: names learned line by line.
function play(id, state) {
  const lines = withIntroductions(DIALOGUES[id], state);
  return lines.map((line, i) => { learnNames(lines, i, state); return [speakerLabel(line.speaker, state).name, personalize(line.text, state)]; });
}

test('nobody is named in the dialogue box before saying their name', () => {
  const state = {...freshState(), playerName: 'Manuel'};
  const arrival = play('portal_arrival', state);
  assert.equal(arrival[1][0], '???');
  const introduced = arrival.findIndex(([, text]) => /Soy Edda/.test(text));
  assert.ok(introduced > 1);
  assert.ok(arrival.slice(0, introduced).every(([name]) => name !== 'Edda'));
  assert.equal(arrival[introduced][0], 'Edda');
  const ohm = play('awaken_complete', state);
  assert.equal(ohm[0][0], '???');
  assert.equal(ohm.find(([, text]) => /Soy Ohm/.test(text))[0], 'Ohm');
});

test('hearsay about someone absent does not introduce them', () => {
  const state = {...freshState(), playerName: 'Manuel'};
  play('portal_arrival', state); play('awaken_complete', state);
  assert.ok(!state.known.includes('lumen'), 'Edda talks about Lumen, but he is not there');
  const workshop = play('workshop_arrival', state);
  assert.equal(workshop[0][0], '???');
  assert.ok(state.known.includes('lumen'));
});

test('every character with a name is introduced in the conversations that first show them', () => {
  const firsts = {edda: 'portal_arrival', ohm: 'awaken_complete', lumen: 'workshop_arrival', marin: 'marin_before', vega: 'spring_arrival',
    consejera: 'castle_arrival', yesca: 'terraces_arrival', nereo: 'lake_arrival', tala: 'tala_workshop'};
  for (const [id, dialogue] of Object.entries(firsts)) {
    const state = {...freshState(), playerName: 'Manuel'};
    play(dialogue, state);
    assert.ok(state.known.includes(id), `${CHARACTERS[id].name} should be known after ${dialogue}`);
  }
});

test('place names that contain Ohm do not introduce him', () => {
  const state = freshState();
  learnNames([{speaker: 'ohm', text: 'La Plaza de Ohm y la Puerta de Ohm.'}], 0, state);
  assert.deepEqual(state.known, []);
});

test('the player is called by the name of the Instituto register, never «Vos» when there is one', () => {
  const state = {...freshState(), playerName: 'Manuel'};
  assert.equal(playerName(state), 'Manuel');
  assert.equal(speakerLabel('player', state).name, 'Manuel');
  assert.match(play('portal_arrival', state).map(([, t]) => t).join(' '), /Manuel/);
  assert.ok(!Object.values(DIALOGUES).flat().some(line => /\{(?!nombre\})/.test(line.text)), 'only {nombre} is a placeholder');
});

test('unknown people keep a description in the world and on the map', () => {
  const state = freshState();
  assert.equal(personLabel({character: 'lumen', label: 'Maese Lumen'}, state), 'El dueño del taller');
  state.known.push('lumen');
  assert.equal(personLabel({character: 'lumen', label: 'Maese Lumen'}, state), 'Maese Lumen');
});

test('saves keep who was met and the name; older saves work it out from what they saw', () => {
  const saved = validateState({...freshState(), known: ['edda', 7], playerName: '  Ana  '});
  assert.deepEqual(saved.known, ['edda']);
  assert.equal(saved.playerName, 'Ana');
  const old = {...freshState(), seen: ['portal_arrival', 'awaken_complete', 'workshop_arrival']};
  delete old.known;
  const loaded = validateState(old);
  assert.equal(loaded.known, null);
  assert.deepEqual(knownFromSeen(loaded).sort(), ['edda', 'lumen', 'ohm']);
});
