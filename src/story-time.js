// A day advances with the journey, never with a timer or a return journey.
export const JOURNEY_PHASES = Object.freeze([
  {id:'morning', label:'Mañana', day:1, symbol:'☀', sky:'#91abb4', fog:'#9aafb0', sun:'#ffe5b3', intensity:3.3, ambient:1.65, lamps:0},
  {id:'afternoon', label:'Tarde', day:1, symbol:'☀', sky:'#99aaa9', fog:'#a8b1a4', sun:'#ffdb9b', intensity:2.9, ambient:1.5, lamps:0},
  {id:'sunset', label:'Atardecer', day:1, symbol:'◒', sky:'#a08d95', fog:'#aa9996', sun:'#ffb67d', intensity:1.85, ambient:1.18, lamps:.5},
  {id:'dusk', label:'Crepúsculo', day:1, symbol:'◔', sky:'#596e8d', fog:'#6c7c97', sun:'#bec9eb', intensity:1.05, ambient:1.05, lamps:.9},
  {id:'night', label:'Noche', day:1, symbol:'☾', sky:'#23374e', fog:'#344d66', sun:'#94b9e7', intensity:.78, ambient:1.08, lamps:1},
  {id:'next-morning', label:'Nueva mañana', day:2, symbol:'☀', sky:'#9db5bc', fog:'#a1b7b4', sun:'#ffe6b5', intensity:3.15, ambient:1.65, lamps:0},
]);

export function inferredTime(state={}) {
  const f=state.flags||{}, visited=new Set([state.area,...(state.visited||[])]);
  if(f.epilogue_shared||state.activeDialogue?.id==='lighthouse_epilogue')return 5;
  if(visited.has('lighthouse')||f.beacon_supply||f.beacon_network||f.beacon_lens)return 4;
  if(visited.has('lake')||f.beacon_link)return 3;
  if(visited.has('terraces')||f.irrigation)return 2;
  if(visited.has('spring')||visited.has('castle')||f.pump||f.distribution)return 1;
  return 0;
}
export function normalizeJourneyTime(value,state={}) {
  const saved=Number.isInteger(value?.phase)&&value.phase>=0&&value.phase<JOURNEY_PHASES.length?value.phase:0;
  return {phase:Math.max(saved,inferredTime(state))};
}
export function advanceJourneyTime(state,{epilogue=false}={}) {
  state.journeyTime=normalizeJourneyTime(state.journeyTime,state);
  if(epilogue&&state.flags?.beacon_lens)state.journeyTime.phase=5;
  return JOURNEY_PHASES[state.journeyTime.phase];
}
export function journeyPhase(state={}) {return JOURNEY_PHASES[state.journeyTime?.phase]||JOURNEY_PHASES[inferredTime(state)];}
