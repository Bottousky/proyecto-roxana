import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioDirector,spatialMix} from '../src/audio.js';
import {describeWorldAudio} from '../src/world-audio.js';
import {initialPuzzleSnapshot} from '../src/puzzle-model.js';
import {measureWorld} from '../src/world-circuits.js';

const scene=(id,flags={})=>describeWorldAudio({area:{id},state:{flags},bounds:[32,32],player:{position:{x:0,z:0}}});
test('spatial sound follows distance, side and finite physical values',()=>{
  assert.deepEqual(spatialMix({x:0,z:0},{x:0,z:0,intensity:1,range:10}),{gain:1,pan:0});
  assert.equal(spatialMix({x:0,z:0},{x:15,z:0,intensity:1,range:10}).gain,0);
  assert.ok(spatialMix({x:0,z:0},{x:-3,z:0,intensity:1,range:10}).pan<0);
  assert.deepEqual(spatialMix({x:NaN,z:0},{x:0,z:0,intensity:1}),{gain:0,pan:0});
});
test('silent mechanisms stay silent and restored water changes the actual area emitters',()=>{
  assert.equal(scene('plaza').emitters.length,0);
  assert.ok(scene('plaza',{pump:true}).emitters.some(e=>e.kind==='fountain'));
  assert.equal(scene('spring').emitters.some(e=>e.kind==='wheel'),false);
  assert.ok(scene('spring',{spring_sluice:true}).emitters.some(e=>e.kind==='wheel'));
  assert.equal(scene('spring',{spring_sluice:true}).emitters.some(e=>e.kind==='pump'),false);
  assert.ok(scene('spring',{pump:true}).emitters.some(e=>e.kind==='pump'));
  assert.equal(scene('workshop').emitters.some(e=>e.id==='bench'),false);
  assert.ok(scene('workshop',{workshop:true}).emitters.some(e=>e.id==='bench'));
});
test('spatial loops are reused and released when their source or area disappears',()=>{
  const director=new AudioDirector();director.context={currentTime:1};director.noiseBuffer={};
  let created=0,stopped=0,disconnected=0;
  const param=()=>({setTargetAtTime(){}});
  director._spatialVoice=kind=>{created++;const source={disconnect(){disconnected++;},stop(){stopped++;this.onended?.();}};return{kind,sources:[source],nodes:[],gain:{gain:param()},stereo:{pan:param()}};};
  const audible={area:'spring',listener:{x:0,z:0},emitters:[{id:'wheel',kind:'wheel',x:2,z:0,intensity:1}]};
  director.updateWorld(audible);director.updateWorld(audible);assert.equal(created,1);
  director.updateWorld({...audible,emitters:[]});assert.equal(director.spatialVoices.size,0);assert.equal(stopped,1);assert.equal(disconnected,1);
  director.updateWorld(audible);director.setArea('lake');assert.equal(director.spatialVoices.size,0);assert.equal(stopped,2);
});

test('Faro restoration milestones do not keep disconnected receivers audible',()=>{
  const state={flags:{beacon_link:true,tower_feed:true,tower_return:true,beacon_supply:true,beacon_network:true,tower_isolated:true,tower_motor:true},puzzles:{}};
  const world={area:{id:'lighthouse'},state,bounds:[32,42],player:{position:{x:0,z:-4}}};
  const sounds=()=>describeWorldAudio(world).emitters.map(emitter=>emitter.id);
  assert.ok(sounds().includes('generator'));assert.ok(sounds().includes('crown'));
  const supply=initialPuzzleSnapshot('beacon_supply');supply.sourceOn=false;state.puzzles.beacon_supply=supply;
  const network=initialPuzzleSnapshot('beacon_network');network.wires=[['positive','opticIn'],['opticOut','negative']];state.puzzles.beacon_network=network;
  assert.equal(sounds().includes('generator'),false,'an isolated source has no electrical hum');
  assert.equal(sounds().includes('crown'),false,'the optical branch cannot make an unpowered motor audible');
  assert.ok(sounds().includes('shore'),'ambient water is independent of receiver power');
  supply.sourceOn=true;network.wires.push(['positive','bearingIn'],['bearingOut','negative']);
  assert.ok(sounds().includes('generator'));assert.ok(sounds().includes('crown'));
  network.tripped=true;assert.equal(sounds().includes('crown'),false,'tripped protection removes the motor hum');
});

for(const installation of [
  {area:'road',emitter:'gate',probe:'gate_panel',puzzle:'gate',flags:{workshop:true,gate:true,road_send:true,road_return:true,road_bypass:false},breaks:[{road_return:false},{road_send:false},{road_bypass:true}]},
  {area:'castle',emitter:'services',probe:'castle_service',puzzle:'distribution',flags:{pump:true,distribution:true,castle_service:true,castle_branch_closed:false},breaks:[{castle_service:false},{castle_branch_closed:true}]},
  {area:'lake',emitter:'beacons',probe:'lake_cable',flags:{irrigation:true,beacon_link:true,beacon_supply:true,lake_cable:true,lake_return:true},breaks:[{lake_return:false},{lake_cable:false},{irrigation:false}]},
])test(`${installation.area} electrical ambience follows live closures and protection after restoration`,()=>{
  const state={flags:{...installation.flags},puzzles:{}},world={area:{id:installation.area},state,bounds:[32,32],player:{position:{x:0,z:0}}};
  const sounds=()=>describeWorldAudio(world).emitters;
  const ambient=sounds().filter(emitter=>emitter.kind!=='electrical');
  const audible=()=>sounds().some(emitter=>emitter.id===installation.emitter);
  assert.ok(measureWorld(installation.area,state,installation.probe).current>0);
  assert.ok(audible(),'the working installation is audible');
  const assertSilent=()=>{
    const reading=measureWorld(installation.area,state,installation.probe);
    assert.equal(reading.current,0,'the real field or saved circuit is no longer conducting');
    assert.equal(audible(),false,'a restoration milestone cannot sustain the electrical sound');
    assert.deepEqual(sounds().filter(emitter=>emitter.kind!=='electrical'),ambient,'water and mechanical ambience stay independent');
  };
  for(const changes of installation.breaks){
    state.flags={...installation.flags,...changes};assertSilent();
    state.flags={...installation.flags};assert.ok(audible(),'closing the real path restores its sound');
  }
  if(installation.puzzle){
    const snapshot=initialPuzzleSnapshot(installation.puzzle);state.puzzles[installation.puzzle]=snapshot;
    snapshot.sourceOn=false;assertSilent();
    snapshot.sourceOn=true;snapshot.tripped=true;assertSilent();
    snapshot.tripped=false;assert.ok(audible(),'restoring the saved supply and protection restores its sound');
  }
});

test('every installation answers its restoration with its own sound', async ()=>{
  const {PUZZLES}=await import('../src/puzzle-model.js');
  const director=new AudioDirector(),played=[];
  Object.assign(director,{context:{state:'running',currentTime:1},muted:false,disposed:false,effects:{},_tone:()=>played.push('tone'),_noise:()=>played.push('noise'),finale:()=>played.push('finale')});
  for(const id of Object.keys(PUZZLES)){played.length=0;assert.equal(director.playRestoration(id),true,`${id} has an authored restoration sound`);assert.ok(played.length>0,`${id} plays something`);}
});
