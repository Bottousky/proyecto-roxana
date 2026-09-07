import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, electricalState, transition, readSave } from './circuit.js';
test('a switch cannot drive current through a broken return', () => {
  const state = transition(initialState(), 'switch');
  assert.equal(electricalState(state).current, 0);
  assert.equal(state.awakened, false);
});
test('the replacement belongs to the world and cannot be installed without obtaining it', () => {
  assert.equal(transition(initialState(), 'repair').returnRepaired, false);
});
test('closing the whole path wakes Ohm; opening it removes current without deleting knowledge', () => {
  let state = initialState();
  for (const action of ['lumen', 'repair', 'switch', 'verify']) state = transition(state, action);
  assert.equal(electricalState(state).current, 0.5);
  assert.equal(state.verified, true);
  state = transition(state, 'switch');
  assert.equal(electricalState(state).current, 0);
  assert.equal(state.awakened, true);
  assert.equal(transition(state, 'cross').crossed, false);
});
test('progress works when the player closes the switch before repairing the return', () => {
  let state = initialState();
  for (const action of ['switch', 'lumen', 'repair']) state = transition(state, action);
  assert.equal(state.awakened, true);
  assert.equal(electricalState(state).closed, true);
});
test('corrupt and foreign saves recover to a playable initial state', () => {
  assert.deepEqual(readSave('{'), initialState());
  assert.deepEqual(readSave('{"version":4}'), initialState());
  assert.deepEqual(readSave('{"version":1,"player":[null,5]}').player, [-6, 7]);
});
