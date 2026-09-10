// Save the narrative hand-off as data, never as a callback or elapsed time.
// Old saves do not acquire scenes merely because their mechanisms are repaired.
export const RESTORATION_SCENES = Object.freeze({
  awaken: Object.freeze({area:'portal',dialogue:'awaken_complete'}),
  workshop: Object.freeze({area:'workshop',dialogue:'workshop_complete'}),
  gate: Object.freeze({area:'road',dialogue:'gate_complete'}),
  pump: Object.freeze({area:'spring',dialogue:'pump_complete'}),
  irrigation: Object.freeze({area:'terraces',dialogue:'irrigation_complete'}),
  beacon_network: Object.freeze({area:'lighthouse',dialogue:'beacon_network_complete'}),
  beacon_lens: Object.freeze({area:'lighthouse',dialogue:'beacon_lens_complete'}),
});

const marker = id => `cinematic:${id}`;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Validate the activeCinematic field of an imported or resumed save. */
export function validatePendingCinematic(data, state) {
  if(!record(data)||typeof data.id!=='string'||!Object.hasOwn(RESTORATION_SCENES,data.id))return null;
  const scene=RESTORATION_SCENES[data.id];
  if(state?.area!==scene.area||state.flags?.[data.id]!==true)return null;
  if(Array.isArray(state.seen)&&state.seen.includes(marker(data.id)))return null;
  return {id:data.id};
}

/** Call after recording the repaired mechanism, before the same save write. */
export function prepareCinematic(state,id) {
  const pending=validatePendingCinematic({id},state);
  if(!pending)return false;
  const current=validatePendingCinematic(state.activeCinematic,state);
  if(current&&current.id!==id)return false;
  state.activeCinematic=pending;
  return true;
}

/**
 * Natural completion, reduced motion and skip use the same transition.
 * Persist once after this returns, before rendering the continuation dialogue.
 * Calling it twice must not reset an already advancing conversation.
 */
export function recordCinematicComplete(state) {
  const pending=validatePendingCinematic(state.activeCinematic,state);
  if(!pending)return null;
  const {id}=pending;
  const dialogue=RESTORATION_SCENES[id].dialogue;
  state.seen=Array.isArray(state.seen)?[...state.seen,marker(id)]:[marker(id)];
  state.activeCinematic=null;
  state.activeDialogue={id:dialogue,index:0};
  if(id==='beacon_lens'){
    state.flags.finale_seen=true;
    // Remains pending through the final conversation and its ending card.
    state.endingPending=true;
  }
  return dialogue;
}

/** Both the ending card's button and its Escape/close path use this. */
export function recordEndingDismissed(state) {
  state.endingPending=false;
}
