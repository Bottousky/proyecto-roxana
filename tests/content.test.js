import test from 'node:test';
import assert from 'node:assert/strict';
import { AREAS, CHARACTERS, DIALOGUES, JOURNAL, OHM_CHATTER, PUZZLE_STORY, WORLD_SYSTEMS, evaluateWorld, getObjective, resolveDialogue } from '../src/content.js';

const meets = (state, requirements = []) => requirements.every(flag => state.flags[flag]);
const refresh = state => evaluateWorld(state).forEach(system => { state.flags[system.flag] = system.active; });

test('every staged conversation, character and exit resolves inside the shipped arc', () => {
  const objectIds = new Set();
  const checkDialogue = (id, context) => {
    if (!id) return;
    assert.ok(DIALOGUES[id]?.length, `${context}: missing dialogue ${id}`);
  };
  for (const area of Object.values(AREAS)) {
    checkDialogue(area.entryDialogue, area.id);
    for (const object of [...area.objects, ...area.exits]) {
      assert.ok(!objectIds.has(object.id), `Duplicate object id: ${object.id}`);
      objectIds.add(object.id);
      ['dialogue', 'lockedDialogue', 'afterDialogue'].forEach(key => checkDialogue(object[key], object.id));
      if (object.character) assert.ok(CHARACTERS[object.character], `${object.id}: character`);
      if (object.target) assert.ok(AREAS[object.target], `${object.id}: exit target`);
      if (object.puzzle) assert.ok(PUZZLE_STORY[object.puzzle], `${object.id}: puzzle story`);
      assert.ok(Math.abs(object.x) < area.bounds[0] / 2, `${object.id}: x inside playable bounds`);
      assert.ok(Math.abs(object.z) < area.bounds[1] / 2, `${object.id}: z inside playable bounds`);
    }
  }
  for (const [id, lines] of Object.entries(DIALOGUES)) {
    for (const line of lines) {
      assert.ok(CHARACTERS[line.speaker], `${id}: unknown speaker ${line.speaker}`);
      assert.equal(typeof line.text, 'string', `${id}: spoken text`);
      assert.ok(line.text.length > 0, `${id}: empty spoken line`);
    }
  }
  Object.values(PUZZLE_STORY).forEach(story => Object.values(story).forEach(id => checkDialogue(id, 'puzzle')));
  WORLD_SYSTEMS.forEach(system => checkDialogue(system.dialogue, system.id));
});

test('a fresh visitor can physically reach every required world control and commission all nine benches', () => {
  const state = { flags: {}, area: 'portal', seen: [], secrets: [] };
  const reached = new Set(['portal']);
  const initialized = new Set();
  const solved = new Set();
  const changedControls = new Set();
  const desired = new Map();
  for (const system of WORLD_SYSTEMS) {
    system.requires.forEach(flag => desired.set(flag, true));
    (system.off || []).forEach(flag => desired.set(flag, false));
  }

  for (let pass = 0; pass < 100; pass++) {
    const before = JSON.stringify([state.flags, [...reached], [...solved]]);
    for (const id of reached) {
      const area = AREAS[id];
      if (!initialized.has(id)) {
        for (const [flag, value] of Object.entries(area.initialFlags || {})) {
          if (!(flag in state.flags)) state.flags[flag] = value;
        }
        initialized.add(id);
      }
      refresh(state);
      for (const object of area.objects) {
        if (!meets(state, object.requires)) continue;
        if (object.action?.type === 'toggle') {
          const flag = object.action.flag;
          if (desired.has(flag)) {
            state.flags[flag] = desired.get(flag);
            changedControls.add(flag);
            refresh(state);
          }
        }
        if (object.puzzle) {
          // Electrical correctness is covered by the circuit suite; this checks
          // that the actual world ever permits opening each physical workbench.
          state.flags[object.puzzle] = true;
          solved.add(object.puzzle);
          refresh(state);
        }
      }
      for (const passage of area.exits) if (meets(state, passage.requires)) reached.add(passage.target);
    }
    if (before === JSON.stringify([state.flags, [...reached], [...solved]])) break;
  }

  assert.deepEqual([...reached].sort(), Object.keys(AREAS).sort(), 'Every area can be entered');
  assert.deepEqual([...solved].sort(), Object.keys(PUZZLE_STORY).sort(), 'Every required workbench can be reached');
  assert.equal(state.flags.beacon_lens, true, 'The Lighthouse can be restored');
  assert.ok(changedControls.has('road_bypass'), 'The spatial bypass was actually operated');
  assert.ok(changedControls.has('castle_branch_closed'), 'The damaged branch was actually isolated');
  assert.equal(getObjective(state).object, 'edda_tower', 'The epilogue remains discoverable');

  // Return journeys cannot demand a consumed key or an irreversible choice.
  const backtrack = new Set(['lighthouse']);
  for (let pass = 0; pass < Object.keys(AREAS).length; pass++) {
    for (const id of backtrack) for (const passage of AREAS[id].exits) {
      if (meets(state, passage.requires)) backtrack.add(passage.target);
    }
  }
  assert.deepEqual([...backtrack].sort(), Object.keys(AREAS).sort(), 'The completed kingdom remains explorable');
});

test('closing every control cannot solve the Calzada or the damaged Castle branch', () => {
  const flags = { workshop: true, road_send: true, road_return: true, road_bypass: true, castle_service: true, castle_branch_closed: true };
  const state = { flags };
  refresh(state);
  assert.equal(flags.bridge_ready, false, 'A closed bypass prevents commissioning the gate');
  assert.equal(flags.castle_ready, false, 'A connected damaged branch prevents commissioning distribution');
  flags.road_bypass = false;
  flags.castle_branch_closed = false;
  refresh(state);
  assert.equal(flags.bridge_ready, true, 'Opening the bypass restores the intended load path');
  assert.equal(flags.castle_ready, true, 'Isolating only the damaged branch permits the healthy service');
  flags.road_return = false;
  refresh(state);
  assert.equal(flags.bridge_ready, false, 'Opening the return still interrupts the route before commissioning');
  flags.road_return = true;
  refresh(state);
  assert.equal(flags.bridge_ready, true, 'An unsuccessful experiment can always be reversed');
});

test('commissioned systems remain stable across recomputation and save reload', () => {
  const state = { flags: Object.fromEntries(WORLD_SYSTEMS.map(system => [system.latch, true])) };
  const restored = JSON.parse(JSON.stringify(state));
  assert.ok(evaluateWorld(restored).every(system => system.active), 'Commissioning latches each restored mechanism');
  const before = JSON.stringify(restored);
  evaluateWorld(restored);
  assert.equal(JSON.stringify(restored), before, 'Derived-state evaluation does not mutate a caller save');
});

test('the finished arc changes local conversations and preserves optional discovery', () => {
  const before = resolveDialogue('marin_after', { flags: {} });
  const after = resolveDialogue('marin_after', { flags: { beacon_lens: true } });
  assert.notDeepEqual(after, before, 'The baker reacts to the restored Faro');
  assert.ok(after.some(line => line.text.includes('Faro')), 'His response names the observed outcome');
  assert.ok(JOURNAL.some(entry => entry.requires.includes('beacon_lens')), 'The final understanding is documented');
  const secrets = Object.values(AREAS).flatMap(area => area.objects.filter(object => object.secret));
  assert.equal(new Set(secrets.map(object => object.secret)).size, 9, 'Each area has its own optional environmental story');
  const chatterIds = new Set();
  for (const area of Object.keys(AREAS)) {
    assert.ok(OHM_CHATTER[area]?.length >= 2, `${area}: travel has companion observations`);
    for (const thought of OHM_CHATTER[area]) {
      assert.ok(!chatterIds.has(thought.id), `Chatter can be tracked once by id: ${thought.id}`);
      chatterIds.add(thought.id);
      assert.ok(thought.text.length < 220, `${thought.id}: readable as a short walking aside`);
    }
  }
});

test('a newcomer receives observations before optional electrical formalization', () => {
  const firstEncounter = ['portal_arrival', 'edda_portal', 'awaken_arrival', 'awaken_complete', 'workshop_arrival', 'lumen_before', 'workshop_ready', 'workshop_arrival_puzzle'];
  const technicalPrerequisites = /\b(?:voltios?|amperios?|ohmios?|polaridad|resistencia|nodos?|seccionadores?|carga|retorno|tensión|corriente)\b|V\s*=\s*I/iu;
  for (const id of firstEncounter) {
    assert.ok(!technicalPrerequisites.test(DIALOGUES[id].map(line => line.text).join(' ')), `${id}: does not require electrical vocabulary before the first experiments`);
  }
  assert.ok(firstEncounter.some(id => DIALOGUES[id].some(line => line.speaker === 'player')), 'The newcomer can ask and take part in the investigation');
  for (const entry of JOURNAL) {
    assert.ok(entry.text.length < 280, `${entry.id}: the visible memory stays brief`);
    if (entry.explanation) {
      assert.ok(entry.requires.length > 0, `${entry.id}: theory follows a world experience`);
      assert.ok(entry.explanation.length > entry.text.length, `${entry.id}: optional formalization has room to explain`);
    }
  }
  assert.equal(JOURNAL.find(entry => entry.id === 'arrival').explanation, undefined, 'The blank journal does not front-load a lesson');
});
