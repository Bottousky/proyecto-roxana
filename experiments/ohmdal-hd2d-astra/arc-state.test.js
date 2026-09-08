import test from 'node:test';
import assert from 'node:assert/strict';
import { initialArc, arcAction, machineReading, restoreArc, accessible, journeyReady } from './arc-state.js';
test('a measured discontinuity must be repaired with the source disconnected',()=>{
  let a=initialArc();a=arcAction(a,'calzada','power');a=arcAction(a,'calzada','probe',1);assert.equal(machineReading(a,'calzada').probeVoltage,12);
  a=arcAction(a,'calzada','repair');assert.equal(a.calzada.repaired,false);a=arcAction(a,'calzada','power');a=arcAction(a,'calzada','repair');a=arcAction(a,'calzada','power');assert.equal(machineReading(a,'calzada').current,1);
});
test('parallel distribution preserves healthy branches while containing a short circuit',()=>{
  let a=initialArc();a=arcAction(a,'castillo','topology');a=arcAction(a,'castillo','power');assert.equal(a.castillo.tripped,true);
  a=arcAction(a,'castillo','branch',2);a=arcAction(a,'castillo','reset');a=arcAction(a,'castillo','power');assert.equal(machineReading(a,'castillo').ready,true);assert.deepEqual(machineReading(a,'castillo').currents,[1,.5,0]);
});
test('heat cannot be validated by denying the other community its water',()=>{
  let a=initialArc();a=arcAction(a,'forja','power');assert.equal(a.forja.tripped,true);
  a=arcAction(a,'forja','coil',1);a=arcAction(a,'forja','reset');a=arcAction(a,'forja','power');assert.equal(machineReading(a,'forja').power,48);assert.equal(machineReading(a,'forja').ready,true);
  a=arcAction(a,'forja','pump');assert.equal(machineReading(a,'forja').ready,false);
});
test('a conducting wire can still lose enough voltage to fail under load',()=>{
  let a=initialArc();a=arcAction(a,'terrazas','cable',1);a=arcAction(a,'terrazas','polarity');a=arcAction(a,'terrazas','power');assert.equal(machineReading(a,'terrazas').voltage,9);assert.equal(machineReading(a,'terrazas').ready,false);
  a=arcAction(a,'terrazas','power');a=arcAction(a,'terrazas','cable',2);a=arcAction(a,'terrazas','power');assert.ok(machineReading(a,'terrazas').voltage>11);assert.equal(machineReading(a,'terrazas').ready,true);
});
test('the lighthouse requires both a stable lamp supply and an aligned lens',()=>{
  let a=initialArc();a=arcAction(a,'faro','power');assert.equal(a.faro.tripped,true);a=arcAction(a,'faro','coil',2);a=arcAction(a,'faro','reset');a=arcAction(a,'faro','power');assert.equal(machineReading(a,'faro').voltage,12);assert.equal(machineReading(a,'faro').ready,false);a=arcAction(a,'faro','focus',62);assert.equal(machineReading(a,'faro').ready,true);
});
test('invalid controls and out-of-order saves cannot bypass the journey',()=>{
  const a=initialArc();assert.deepEqual(arcAction(a,'terrazas','cable',99),a);assert.equal(accessible(a,'faro'),false);
  const restored=restoreArc({...a,region:'faro',complete:true,faro:{...a.faro,verified:true,focus:999}},true);assert.equal(restored.region,'plaza');assert.equal(restored.complete,false);assert.equal(restored.faro.focus,100);
});
test('the handoff needs functioning repairs, not just historical completion flags',()=>{
  let a=initialArc();
  const actions={calzada:[['probe',1],['repair'],['power']],castillo:[['topology'],['branch',2],['power']],forja:[['coil',1],['power']],terrazas:[['cable',2],['polarity'],['power']],faro:[['coil',2],['focus',62],['power']]};
  for(const [region,steps]of Object.entries(actions)){for(const [action,value]of steps)a=arcAction(a,region,action,value);a=arcAction(a,region,'verify');}
  assert.equal(journeyReady(a),true);a=arcAction(a,'calzada','power');assert.equal(a.calzada.verified,true);assert.equal(journeyReady(a),false);
});
