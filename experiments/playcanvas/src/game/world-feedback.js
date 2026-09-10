import { measureWorld } from './world-circuits.js';
import { PUZZLES } from './puzzle-model.js';

const RECEIVERS={beacon_supply_panel:['beacon_supply','core'],beacon_network_panel:['beacon_network','optic'],tower_motor:['beacon_network','bearing'],beacon_lens_panel:['beacon_lens','lens']};

/** Receiver brightness and movement follow the same saved branch as the meter. */
export function readReceiverFeedback(area,state,id){
  const binding=RECEIVERS[id],reading=measureWorld(area,state,id);
  if(!binding||!reading)return {level:0,moving:false};
  const goal=PUZZLES[binding[0]].components.find(component=>component.id===binding[1]).goal;
  const nominalPower=(goal.minVoltage+goal.maxVoltage)/2*(goal.minCurrent+goal.maxCurrent)/2;
  const power=reading.sourceAvailable&&!reading.overloaded?Math.abs((reading.voltage||0)*(reading.current||0)):0;
  const level=Math.min(2,power/nominalPower);
  const ready=id==='beacon_lens_panel'?(state.flags?.tower_lens_free??state.flags?.beacon_lens):reading.mechanicalReady!==false;
  return {level,moving:level>1e-7&&Boolean(ready)};
}

// These handles move water, shafts or shutters. They are not electrical contacts.
const MECHANICAL_CONTROLS = new Set([
  'spring_sluice', 'spring_coupling', 'irrigation_open',
  'tower_motor', 'tower_shutter', 'tower_lens_free',
]);

export function isMechanicalControl(object) {
  return MECHANICAL_CONTROLS.has(object?.action?.flag || object?.flag || object?.id);
}

/** The rendered conductor and Ohm's field meter observe the same DC network. */
export function readControlFeedback(area, state, object) {
  const mechanical = isMechanicalControl(object);
  const engaged = Boolean(state.flags?.[object.action?.flag || object.flag]);
  const reading = measureWorld(area, state, object.id);
  const current = mechanical ? 0 : Number.isFinite(reading?.current) ? reading.current : 0;
  return {
    mechanical, engaged, current,
    flowing: !mechanical && Boolean(reading?.sourceAvailable) && !reading?.overloaded && Math.abs(current) > 1e-7,
    overloaded: !mechanical && Boolean(reading?.overloaded),
    voltage: reading?.voltage ?? null,
  };
}

/** Only values used by the field models can change feedback without a new flag. */
export function worldFeedbackSignature(area, state) {
  return JSON.stringify([state.flags || {}, ...(area.objects || []).filter(object => object.puzzle).map(object => {
    const puzzle=state.puzzles?.[object.puzzle];
    return puzzle ? [puzzle.values,puzzle.wires,puzzle.switches,puzzle.sourceOn,puzzle.tripped] : null;
  })]);
}
