import { actorDirection, idleActor } from './actor-animation.js';
import { findPath } from './navigation.js';
import { isSegmentClear } from './collision.js';

const has = (state, flag) => Boolean(state.flags?.[flag]);

/** Small authored errands; positions are world X/Z, not animation offsets. */
export function inhabitantPlan(area, object, state = {}) {
  const f = state.flags || {}, final = Boolean(f.beacon_lens);
  const plan = { present: !object.requiresFlag || has(state, object.requiresFlag), stage: 'before',
    stops: [[object.x, object.z]], lookAt: null, rest: 5.5 };
  const set = (stage, stops, lookAt, rest = 5.5) => Object.assign(plan, { stage, stops, lookAt, rest });
  switch (object.id) {
    case 'edda_portal':
      plan.present = !f.workshop;
      set(f.awaken ? 'drawing-the-return' : 'examining-ohm', f.awaken ? [[-3.2, -1.8], [-1.8, -3.4]] : [[-4, 2], [-2.8, .8]], [3.5, 0]); break;
    case 'edda_plaza':
      plan.present = !f.workshop || (final && Boolean(f.epilogue_shared));
      set(final ? 'festival-notes' : 'public-history', final ? [[-4.8, 4.8], [-3.8, 4.4]] : [[-5, 3], [-5.2, 1.3]], [-6.4, -3.9]); break;
    case 'edda_road':
      plan.present = !f.pump;
      set(f.gate ? 'toward-the-castle' : f.bridge_ready ? 'watching-the-latch' : 'comparing-the-posts',
        f.gate ? [[-2.3, -7.5], [-.9, -9]] : f.bridge_ready ? [[-4.5, -3.5], [-3.4, -4.4]] : [[-4.5, 5], [-4.2, 2.4]], f.gate ? [0, -14] : [0, 3.5]); break;
    case 'edda_castle':
      plan.present = !f.irrigation;
      set(f.distribution ? 'copying-the-public-plan' : 'comparing-the-archive', f.distribution ? [[-4.8, -3], [-6.1, -3.5]] : [[-4, 6], [-4.8, 2.2]], [-11, -6]); break;
    case 'edda_lake':
      plan.present = !f.beacon_supply;
      set(f.beacon_link ? 'toward-the-tower' : 'watching-the-markers', f.beacon_link ? [[-3.8, .8], [-2.8, -1]] : [[-5, 6], [-5.8, 3.8]], [8, -3]); break;
    case 'edda_tower':
      set(final ? 'teaching' : f.beacon_network ? 'observing-the-lens' : f.beacon_supply ? 'comparing-services' : 'sketching-the-base',
        final ? [[-4, -10], [-4.2, -9.3]] : f.beacon_network ? [[-3.8, -7], [-4.4, -6.4]] : f.beacon_supply ? [[-3.8, 1], [-4.3, 1.8]] : [[-4, 12], [-3.8, 10.7]], final ? [-4, -12.5] : [0, f.beacon_network ? -12 : f.beacon_supply ? -4 : 4], 7); break;
    case 'marin':
      set(final ? 'bread-for-the-festival' : 'bakery-round', [[object.x, object.z], [-4.8, -5.8]], [-5.15, -10.3], 4.5); break;
    case 'tala_plaza':
      plan.present = !final || Boolean(f.epilogue_shared);
      set(f.epilogue_shared ? 'trying-her-own-question' : 'collecting-questions', [[11.2, 6], [12, 7]], final ? [0, -2] : [11, -7], 4.5); break;
    case 'lumen':
      set(f.workshop ? 'comparing-old-and-new' : 'sorting-parts', f.workshop ? [[-2.7, -2.2], [-3.7, -3.2]] : [[-3.5, 1.5], [-4, -.4]], [3, -3], 7); break;
    case 'vega_spring':
      plan.present = !f.distribution;
      set(f.pump ? 'checking-the-restored-pump' : 'watching-the-level', f.pump ? [[4.6, -1], [5.2, .5]] : [[4, 5], [4.5, 3.7]], f.pump ? [2.5, -5.5] : [-6.5, 2], 6); break;
    case 'consejera':
      set(f.distribution ? 'checking-public-services' : f.castle_ready ? 'witnessing-the-test' : 'guarding-the-seal',
        f.distribution ? [[5.2, -3.2], [5.2, -4.8]] : [[4, 3], [4.6, 1]], [0, -6], 8); break;
    case 'yesca':
      set(f.irrigation ? 'working-a-sustainable-shift' : 'checking-the-forge', f.irrigation ? [[-5.3, .9], [-5.3, 2.3]] : [[-5.5, 5], [-5.7, 3]], [-8, 0], 5); break;
    case 'vega_terraces':
      set(f.irrigation ? 'checking-the-beds' : 'watching-the-last-parcel', f.irrigation ? [[6, 1.8], [6, -1]] : [[5.5, 5], [5.3, 3]], [8, 0], 6); break;
    case 'nereo_lake':
      set(final ? 'resting-by-the-lake' : f.beacon_link ? 'ready-to-go' : 'listening-to-the-water',
        final ? [[3.8, 4.7], [4.1, 6.1]] : f.beacon_link ? [[2.3, -10], [-.5, -11.5]] : [[4, 5], [3.8, 7]], [10, 3], 8); break;
    case 'nereo_tower':
      set(final ? 'recognizing-the-signal' : f.beacon_network ? 'listening-to-the-crown' : f.beacon_supply ? 'checking-the-gallery' : 'listening-to-the-base',
        final ? [[3.6, -10.4], [3.8, -9.2]] : f.beacon_network ? [[3.4, -7], [3.8, -6.2]] : f.beacon_supply ? [[3.4, 1], [3.8, 2]] : [[3.5, 11], [3.6, 9.7]], [0, final ? -12 : f.beacon_network ? -4 : 4], 8); break;
    case 'lumen_epilogue': set('sharing-an-old-lamp', [[-5.5, -11], [-5.1, -10.4]], [-4, -12.5], 8); break;
    case 'tala_epilogue': set(f.epilogue_shared ? 'trying-the-lamp' : 'examining-the-old-repair', [[-4, -12.5], [-3.5, -12.7]], [-4, -10], 8); break;
  }
  return plan;
}

function safeStop(world, requested, fallback) {
  if (world.canStand(...requested)) return [...requested];
  const nearby = world.nearestWalkable(requested);
  return Math.hypot(nearby[0] - requested[0], nearby[1] - requested[1]) < 1 ? nearby : [...fallback];
}

function face(world, actor, point) {
  const direction = actorDirection(point[0] - actor.g.position.x, point[1] - actor.g.position.z, actor.animation.direction);
  actor.animation = idleActor(direction);
  world.animateActor(actor, 0, 0, 0, { paused: true });
}

function adoptPlan(world, actor, plan, initial = false) {
  const resident = actor.inhabitant, old = resident.plan;
  resident.plan = plan;
  if (old?.stage === plan.stage && old.present === plan.present && !initial) return;
  resident.stops = plan.stops.map(point => safeStop(world, point, [actor.g.position.x, actor.g.position.z]));
  resident.route = []; resident.stop = 0; resident.wait = plan.rest + actor.phase % 2;
  if (initial) {
    actor.g.visible = plan.present;
    const point = resident.stops[0]; actor.g.position.set(point[0], world.groundHeight(...point), point[1]);
  } else if (!plan.present) {
    // Depart through an actual area exit. A return visit then omits the resident.
    const exit = [...world.area.exits].sort((a, b) => a.z - b.z)[0];
    resident.stops = [safeStop(world, [exit.x, exit.z], [actor.g.position.x, actor.g.position.z])];
    resident.wait = 0;
  } else {
    if (!actor.g.visible) {
      const entry = safeStop(world, [world.area.spawn[0] - 1.5 - actor.phase % 1, world.area.spawn[1]], world.area.spawn);
      actor.g.position.set(entry[0], world.groundHeight(...entry), entry[1]);
    }
    actor.g.visible = true; resident.wait = 0;
  }
  if (plan.lookAt) face(world, actor, plan.lookAt);
}

export function initializeInhabitants(world) {
  world.inhabitantConversation = null;
  for (const actor of world.actors || []) {
    const object = actor.g.userData.interaction;
    if (actor.g === world.player || !object?.character) continue;
    actor.ambient = false;
    actor.inhabitant = { id: object.id, object, plan: null, route: [], stops: [], stop: 0, wait: 0 };
    adoptPlan(world, actor, inhabitantPlan(world.area.id, object, world.state), true);
  }
}

function walkErrand(world, actor, dt) {
  const resident = actor.inhabitant, p = actor.g.position;
  if (resident.wait > 0) { resident.wait = Math.max(0, resident.wait - dt); return; }
  const destination = resident.stops[resident.stop];
  if (!destination) return;
  if (Math.hypot(destination[0] - p.x, destination[1] - p.z) < .12) {
    if (!resident.plan.present) { actor.g.visible = false; return; }
    resident.stop = (resident.stop + 1) % resident.stops.length;
    resident.route = []; resident.wait = resident.plan.rest + actor.phase % 2;
    if (resident.plan.lookAt) face(world, actor, resident.plan.lookAt);
    return;
  }
  if (!resident.route.length) resident.route = findPath([p.x, p.z], destination, world.bounds, world.obstacles, { radius: .34, isWalkable: (x, z) => world.walkableLand(x, z) });
  while (resident.route.length && Math.hypot(resident.route[0][0] - p.x, resident.route[0][1] - p.z) < .08) resident.route.shift();
  if (!resident.route.length) { resident.wait = 2; return; }
  const target = resident.route[0], dx = target[0] - p.x, dz = target[1] - p.z, distance = Math.hypot(dx, dz);
  const step = Math.min(distance, Math.max(0, dt) * 1.2), next = [p.x + dx / distance * step, p.z + dz / distance * step];
  if (isSegmentClear([p.x, p.z], next, world.bounds, world.obstacles, { radius: .34, isWalkable: (x, z) => world.walkableLand(x, z) })) p.set(next[0], world.groundHeight(...next), next[1]);
  else { resident.route = []; resident.wait = 1; }
}

/** Update only human NPCs; World still owns the player and Ohm's following. */
export function updateInhabitants(world, dt, state, { paused = false, reducedMotion = false } = {}) {
  for (const actor of world.actors || []) {
    if (actor.g === world.player) continue;
    const x = actor.g.position.x, z = actor.g.position.z;
    if (actor.inhabitant) {
      adoptPlan(world, actor, inhabitantPlan(world.area.id, actor.inhabitant.object, state));
      // Reduced motion omits the departure walk, while preserving story presence.
      if(reducedMotion&&!paused&&!world.inhabitantConversation&&!actor.inhabitant.plan.present)actor.g.visible=false;
      if (actor.g.visible && !paused && !reducedMotion && !world.inhabitantConversation) walkErrand(world, actor, dt);
    } else if (actor.ambient && !paused && !reducedMotion) world.moveAmbientActor(actor, dt);
    world.animateActor(actor, actor.g.position.x - x, actor.g.position.z - z, dt, { paused, reducedMotion });
  }
}

/** Runtime coordinates keep both prompts and click targets attached to people. */
export function getInhabitantInteractions(world, state = world.state) {
  const interactions = (world.actors || []).filter(actor => actor.inhabitant && actor.g.visible).map(actor => ({
    ...actor.inhabitant.object, x: actor.g.position.x, z: actor.g.position.z,
    inhabitant: true, activity: actor.inhabitant.plan.stage,
  }));
  if (world.ohm?.visible && has(state, 'awaken')) interactions.push({
    id: 'ohm_companion', kind: 'npc', character: 'ohm', label: 'Hablar con Ohm', dialogue: 'ohm_companion',
    x: world.ohm.position.x, z: world.ohm.position.z, inhabitant: true, interactionPriority: -1, radius: 2,
  });
  return interactions;
}

function conversationActor(world, target) {
  return (world.actors || []).filter(actor => actor.g !== world.player && actor.g.visible && (actor.inhabitant?.id === target || actor.name === target))
    .sort((a, b) => a.g.position.distanceToSquared(world.player.position) - b.g.position.distanceToSquared(world.player.position))[0];
}

export function beginInhabitantConversation(world, target) {
  world.inhabitantConversation = { target: typeof target === 'string' ? target : target?.id };
  faceInhabitantSpeaker(world, world.inhabitantConversation.target);
}

export function faceInhabitantSpeaker(world, speaker) {
  if (!speaker || speaker === 'narrator' || speaker === 'player') return;
  const playerActor = world.actors?.find(actor => actor.g === world.player), player = world.player.position;
  if (speaker === 'ohm' || speaker === 'ohm_companion') {
    if (!world.ohm?.visible) return;
    const p = world.ohm.position;
    world.ohm.userData.direction = actorDirection(player.x - p.x, player.z - p.z, world.ohm.userData.direction || 0);
    const sprite = world.ohm.userData.ohmSprite;
    if (sprite && world.ohmFrames) sprite.material.map = world.ohmFrames[world.ohm.userData.direction][0];
    if (playerActor) face(world, playerActor, [p.x, p.z]);
    return;
  }
  const actor = conversationActor(world, speaker);
  if (!actor) return;
  face(world, actor, [player.x, player.z]);
  if (playerActor) face(world, playerActor, [actor.g.position.x, actor.g.position.z]);
}

export function endInhabitantConversation(world) {
  world.inhabitantConversation = null;
  for (const actor of world.actors || []) if (actor.inhabitant) actor.inhabitant.wait = Math.max(actor.inhabitant.wait, 2);
}
