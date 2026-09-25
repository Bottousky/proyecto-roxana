import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCollisionWorld } from './helpers/world-fixture.js';
import { measureWorld } from '../src/world-circuits.js';
import { AREAS } from '../src/content.js';

test('a closed feed with an open return never renders fictitious current', () => {
  const world=buildCollisionWorld('workshop',{flags:{workshop_feed:true}});
  try {
    const feed=world.conductors.find(wire=>wire.obj.id==='workshop_feed');
    assert.equal(measureWorld('workshop',world.state,'workshop_feed').voltage,6);
    assert.equal(feed.active,false);
    assert.equal(feed.particle.visible,false);
    world.state.flags.workshop_return=true;world.updateFlags(world.state);
    assert.equal(feed.active,true,'The real pilot branch now draws current even before the lamp is repaired');
    assert.equal(feed.current,measureWorld('workshop',world.state,'workshop_feed').current);
    assert.equal(measureWorld('workshop',world.state,'workbench').current,0);
  } finally {world.dispose();}
});

test('the tripped road protection removes every current particle while the contacts stay closed',()=>{
  const world=buildCollisionWorld('road',{flags:{workshop:true,road_send:true,road_return:true,road_bypass:true}});
  try {
    assert.equal(measureWorld('road',world.state,'road_bypass').overloaded,true);
    for(const wire of world.conductors){assert.equal(wire.active,false);assert.equal(wire.particle.visible,false);assert.equal(wire.current,0);}
    assert.equal(world.levers.find(lever=>lever.obj.id==='road_send').active,true,'Handle position still shows the closed contact');
    world.state.flags.road_bypass=false;world.updateFlags(world.state);
    const send=world.conductors.find(wire=>wire.obj.id==='road_send'),back=world.conductors.find(wire=>wire.obj.id==='road_return');
    assert.equal(send.active,true);assert.equal(back.active,true);
    assert.ok(Math.abs(send.current-back.current)<1e-8,'Supply and return represent the same conserved current');
    assert.equal(world.conductors.find(wire=>wire.obj.id==='road_bypass').active,false);
  }finally{world.dispose();}
});

test('water and shaft controls keep their mechanical feedback without inventing electrical conductors',()=>{
  const world=buildCollisionWorld('spring',{flags:{spring_sluice:true}});
  try{
    assert.equal(world.springWaterworks.group.userData.flowing,true);
    assert.equal(world.springWaterworks.group.userData.coupled,false);
    assert.equal(measureWorld('spring',world.state,'spring_sluice').sourceAvailable,false);
    assert.equal(world.conductors.length,0);
    for(const lever of world.levers){assert.equal(lever.feedback.mechanical,true);assert.equal(lever.indicator.material.emissiveIntensity,0);}
    world.state.flags.spring_coupling=true;world.updateFlags(world.state);
    assert.equal(measureWorld('spring',world.state,'spring_sluice').sourceAvailable,true);
    assert.equal(world.springWaterworks.group.userData.coupled,true);
    assert.equal(world.conductors.length,0,'The generator may supply electricity; the water handle does not become an electrical wire');
  }finally{world.dispose();}
});

test('optical shutters and drive couplings do not masquerade as electrical contacts',()=>{
  const world=buildCollisionWorld('lighthouse',{flags:{beacon_supply:true,tower_motor:true,tower_shutter:true,tower_lens_free:true}});
  try{
    for(const id of ['tower_motor','tower_shutter','tower_lens_free']){
      assert.equal(world.conductors.some(wire=>wire.obj.id===id),false);
      assert.equal(world.levers.find(lever=>lever.obj.id===id).feedback.mechanical,true);
    }
    assert.equal(world.conductors.some(wire=>wire.obj.id==='tower_feed'),true);
    assert.equal(world.conductors.some(wire=>wire.obj.id==='tower_return'),true);
  }finally{world.dispose();}
});

test('the monumental gate raises its leaf while lowering counterweights and keeps the open state on return',()=>{
  const world=buildCollisionWorld('road');
  try{
    const gate=world.gateway,weight=gate.weights[0],closed=weight.position.y;
    assert.equal(gate.leaf.position.y,0);
    assert.equal(world.canStand(0,-10.24),false);
    for(const progress of [.25,.5,.75,1]){
      gate.setPose(progress,true);
      assert.ok(Math.abs(gate.leaf.position.y-progress*5.8)<1e-10);
      assert.ok(Math.abs(weight.position.y-(closed-progress*5))<1e-10);
    }
    world.state.flags.gate=true;world.updateFlags(world.state);
    assert.equal(world.canStand(0,-10.24),true);
    world.loadArea(AREAS.plaza,world.state);
    assert.equal(world.gateway,null,'Loading another area releases the old gateway controller');
  }finally{world.dispose();}
  const returned=buildCollisionWorld('road',{flags:{gate:true}});
  try{assert.equal(returned.gateway.progress,1);assert.equal(returned.canStand(0,-10.24),true);}finally{returned.dispose();}
});
