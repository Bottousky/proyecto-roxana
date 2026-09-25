import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../src/world.js';
import {initialPuzzleSnapshot} from '../src/puzzle-model.js';
import {measureWorld} from '../src/world-circuits.js';
import {buildCollisionWorld} from './helpers/world-fixture.js';

function tick(world){
  world.composer.render=()=>{};
  world.grade??={uniforms:{time:{value:0},restored:{value:0}}};
  World.prototype.update.call(world,.05,world.state,{paused:true});
}
const machine=(world,id)=>world.machines.find(entry=>entry.obj.puzzle===id);
const emission=entry=>entry.receiverMaterials.map(receiver=>receiver.material.emissiveIntensity);

test('Faro receivers remain dark and its supply gear stays still until real current reaches the core',()=>{
  const world=buildCollisionWorld('lighthouse',{flags:{beacon_link:true}});
  try{
    for(const id of ['beacon_supply','beacon_network','beacon_lens'])assert.ok(emission(machine(world,id)).every(value=>value===0));
    const gear=world.animations.find(entry=>entry.receiverId==='beacon_supply_panel');
    const start=gear.obj.rotation.z;tick(world);assert.equal(gear.obj.rotation.z,start);
    world.state.flags.tower_feed=true;tick(world);assert.equal(gear.obj.rotation.z,start);
    world.state.flags.tower_return=true;tick(world);
    assert.ok(measureWorld('lighthouse',world.state,'beacon_supply_panel').current>0);
    assert.notEqual(gear.obj.rotation.z,start);
    assert.ok(emission(machine(world,'beacon_supply')).every(value=>value>0));
    const snapshot=initialPuzzleSnapshot('beacon_supply');world.state.puzzles.beacon_supply=snapshot;snapshot.sourceOn=false;
    const angle=gear.obj.rotation.z;tick(world);assert.equal(gear.obj.rotation.z,angle);
    assert.ok(emission(machine(world,'beacon_supply')).every(value=>value===0));
    const ambient=[];world.root.traverse(object=>{if(object.isPointLight&&object.color.getHexString()==='ffce91')ambient.push(object.intensity);});
    assert.deepEqual(ambient,[12,12],'the two hanging ambient lamps remain unchanged');
  }finally{world.dispose();}
});

test('the lens brightness tracks its loaded power, isolation and protection while shutter and brake remain mechanical',()=>{
  const world=buildCollisionWorld('lighthouse',{flags:{beacon_network:true,tower_lens_free:true}});
  try{
    const lens=machine(world,'beacon_lens'),optic=world.animations.find(entry=>entry.kind==='optic');
    const excessive=emission(lens)[0];assert.ok(excessive>0);
    const snapshot=initialPuzzleSnapshot('beacon_lens');snapshot.values.upper=12;
    snapshot.wires=[['positive','upperA'],['lowerB','negative'],['tap','lensIn'],['lensOut','negative']];
    world.state.puzzles.beacon_lens=snapshot;tick(world);
    const calibrated=emission(lens)[0];assert.ok(calibrated>0&&calibrated<excessive,'18 V direct is brighter than the loaded 9 V setting');
    assert.ok(optic.obj.rotation.y>0,'an electrically powered lens can rotate with its brake released');
    world.state.flags.tower_lens_free=false;world.state.flags.tower_shutter=false;
    const stopped=optic.obj.rotation.y;tick(world);assert.equal(optic.obj.rotation.y,stopped);assert.equal(emission(lens)[0],calibrated);
    snapshot.sourceOn=false;tick(world);assert.equal(emission(lens)[0],0);
    snapshot.sourceOn=true;snapshot.tripped=true;tick(world);assert.equal(emission(lens)[0],0);
  }finally{world.dispose();}
});

test('the crown follows the motor branch and clutch independently of the lit optical branch',()=>{
  const world=buildCollisionWorld('lighthouse',{flags:{beacon_supply:true,beacon_network:true,tower_isolated:true,tower_motor:true}});
  try{
    const snapshot=initialPuzzleSnapshot('beacon_network');snapshot.wires=[['positive','opticIn'],['opticOut','negative']];
    world.state.puzzles.beacon_network=snapshot;
    const crown=world.animations.find(entry=>entry.receiverId==='tower_motor'),angle=crown.obj.rotation.z;tick(world);
    assert.equal(crown.obj.rotation.z,angle);assert.ok(emission(machine(world,'beacon_network')).every(value=>value>0));
    snapshot.wires.push(['positive','bearingIn'],['bearingOut','negative']);tick(world);assert.notEqual(crown.obj.rotation.z,angle);
    world.state.flags.tower_motor=false;const disconnected=crown.obj.rotation.z;tick(world);assert.equal(crown.obj.rotation.z,disconnected);
    assert.ok(emission(machine(world,'beacon_network')).every(value=>value>0));
  }finally{world.dispose();}
});
